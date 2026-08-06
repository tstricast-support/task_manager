from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user
from ..utils.cleanup import delete_expired_tasks
from typing import List


router = APIRouter(prefix="/tasks", tags=["Tasks"])


@router.get("/me", response_model=List[schemas.TaskOut])
def get_my_tasks(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return every task assigned to the currently authenticated user."""
    delete_expired_tasks(db)
    return (
        db.query(models.Task)
        .filter(models.Task.assigned_to_id == current_user.id)
        .order_by(models.Task.created_at.desc())
        .all()
    )


@router.post("", response_model=schemas.TaskOut, status_code=201)
@router.post("/", response_model=schemas.TaskOut, status_code=201, include_in_schema=False)
def create_own_task(
    task_in: schemas.TaskCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """An employee (or admin) creates a task assigned to themselves."""
    task = models.Task(
        title=task_in.title,
        description=task_in.description,
        start_time=task_in.start_time,
        end_time=task_in.end_time,
        assigned_to_id=current_user.id,
        created_by_id=current_user.id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/{task_id}/status", response_model=schemas.TaskOut)
def update_task_status(
    task_id: int,
    status_in: schemas.TaskStatusUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Owner of the task (or an admin) can update its status."""
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.assigned_to_id != current_user.id and current_user.role != models.RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to update this task")

    task.status = status_in.status
    if status_in.status == models.TaskStatusEnum.COMPLETED and task.completed_at is None:
        task.completed_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_own_task(
    task_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Owner of the task (or an admin) can delete it."""
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if task.assigned_to_id != current_user.id and current_user.role != models.RoleEnum.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized to delete this task")

    db.delete(task)
    db.commit()
    return None