from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func ,extract
from sqlalchemy.orm import Session
from .. import auth as auth_utils
from datetime import datetime
from .. import models, schemas
from ..database import get_db
from ..dependencies import require_admin
from ..websocket_manager import manager
from ..utils.cleanup import delete_expired_tasks
from ..utils.push import send_push


router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/employees", response_model=List[schemas.EmployeeWithTaskCount])
def list_employees(
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """List all employees along with how many tasks are assigned to each."""
    delete_expired_tasks(db)
    rows = (
        db.query(models.User, func.count(models.Task.id).label("task_count"))
        .outerjoin(models.Task, models.Task.assigned_to_id == models.User.id)
        .filter(models.User.role == models.RoleEnum.EMPLOYEE)
        .group_by(models.User.id)
        .all()
    )

    result = []
    for user, task_count in rows:
        payload = schemas.UserOut.model_validate(user).model_dump()
        payload["task_count"] = task_count
        result.append(schemas.EmployeeWithTaskCount(**payload))
    return result


@router.get("/employees/{employee_id}/tasks", response_model=List[schemas.TaskOut])
def get_employee_tasks(
    employee_id: str,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """View every task belonging to a specific employee profile."""

    delete_expired_tasks(db)
    employee = (
        db.query(models.User).filter(models.User.employee_id == employee_id).first()
    )
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    return (
        db.query(models.Task)
        .filter(models.Task.assigned_to_id == employee.id)
        .order_by(models.Task.created_at.desc())
        .all()
    )


@router.post("/assign-task", response_model=schemas.TaskOut, status_code=201)
async def assign_task(
    task_in: schemas.AdminTaskAssign,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """
    Create a task and assign it to a specific employee.
    Notify the employee over WebSocket and Push Notification.
    """

    employee = (
        db.query(models.User)
        .filter(models.User.employee_id == task_in.employee_id)
        .first()
    )

    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    task = models.Task(
        title=task_in.title,
        description=task_in.description,
        start_time=task_in.start_time,
        end_time=task_in.end_time,
        assigned_to_id=employee.id,
        created_by_id=admin.id,
    )

    db.add(task)
    db.commit()
    db.refresh(task)

    task_payload = schemas.TaskOut.model_validate(task).model_dump()

    # WebSocket notification
    await manager.send_personal_message(
        employee.employee_id,
        {
            "type": "TASK_ASSIGNED",
            "task": task_payload,
        },
    )

    # Push notifications
    subscriptions = (
        db.query(models.PushSubscription)
        .filter(models.PushSubscription.user_id == employee.id)
        .all()
    )

    for sub in subscriptions:
        ok = send_push(sub, "New task assigned", task.title)
        if not ok:
            db.delete(sub)

    db.commit()

    return task


@router.post("/employees", response_model=schemas.UserOut, status_code=201)
def create_employee(
    employee_in: schemas.EmployeeCreate,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin creates a new user account (employee or admin)."""
    existing = (
        db.query(models.User)
        .filter(models.User.employee_id == employee_in.employee_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=409, detail="That employee ID is already taken")

    user = models.User(
        employee_id=employee_in.employee_id,
        full_name=employee_in.full_name,
        email=employee_in.email,
        password_hash=auth_utils.get_password_hash(employee_in.password),
        role=employee_in.role,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.delete("/tasks/{task_id}", status_code=204)
def delete_any_task(
    task_id: int,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin can delete any task, regardless of who it's assigned to."""
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return None



@router.post("/employees/{employee_id}/kpi-notes", response_model=schemas.KpiRecordOut, status_code=201)
def add_kpi_note(
    employee_id: str,
    note_in: schemas.KpiNoteCreate,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Admin logs a manual KPI note for one employee on a specific date."""
    employee = db.query(models.User).filter(models.User.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    record = models.KpiRecord(
        employee_id=employee.id,
        created_by_id=admin.id,
        entry_date=note_in.entry_date,
        outcome=note_in.outcome,
        note=note_in.note,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/employees/{employee_id}/kpi-monthly", response_model=schemas.EmployeeMonthlyKpi)
def get_employee_monthly_kpi(
    employee_id: str,
    year: int,
    month: int,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Monthly on-time percentage for one employee, for salary review."""
    employee = db.query(models.User).filter(models.User.employee_id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    records = (
        db.query(models.KpiRecord)
        .filter(
            models.KpiRecord.employee_id == employee.id,
            extract("year", models.KpiRecord.entry_date) == year,
            extract("month", models.KpiRecord.entry_date) == month,
        )
        .order_by(models.KpiRecord.entry_date)
        .all()
    )

    total = len(records)
    on_time = sum(1 for r in records if r.outcome == models.KpiOutcomeEnum.ON_TIME)
    late = sum(1 for r in records if r.outcome != models.KpiOutcomeEnum.ON_TIME)
    percentage = round((on_time / total) * 100, 1) if total else 0.0

    return schemas.EmployeeMonthlyKpi(
        employee_id=employee.employee_id,
        full_name=employee.full_name,
        year=year,
        month=month,
        total_days=total,
        on_time_days=on_time,
        late_days=late,
        on_time_percentage=percentage,
        records=records,
    )


@router.get("/kpi-monthly", response_model=List[schemas.EmployeeMonthlyKpi])
def get_all_monthly_kpi(
    year: int,
    month: int,
    admin: models.User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Monthly on-time percentage for every employee - team-wide review."""
    employees = db.query(models.User).filter(models.User.role == models.RoleEnum.EMPLOYEE).all()

    result = []
    for emp in employees:
        records = (
            db.query(models.KpiRecord)
            .filter(
                models.KpiRecord.employee_id == emp.id,
                extract("year", models.KpiRecord.entry_date) == year,
                extract("month", models.KpiRecord.entry_date) == month,
            )
            .order_by(models.KpiRecord.entry_date)
            .all()
        )
        total = len(records)
        on_time = sum(1 for r in records if r.outcome == models.KpiOutcomeEnum.ON_TIME)
        late = sum(1 for r in records if r.outcome != models.KpiOutcomeEnum.ON_TIME)
        percentage = round((on_time / total) * 100, 1) if total else 0.0

        result.append(schemas.EmployeeMonthlyKpi(
            employee_id=emp.employee_id,
            full_name=emp.full_name,
            year=year,
            month=month,
            total_days=total,
            on_time_days=on_time,
            late_days=late,
            on_time_percentage=percentage,
            records=records,
        ))
    return result