from datetime import datetime, date as date_type
from typing import List ,Optional

from pydantic import BaseModel, ConfigDict

from .models import RoleEnum, TaskStatusEnum,KpiOutcomeEnum, DepartmentEnum   


# ---------- Auth ----------

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- User ----------

class UserBase(BaseModel):
    employee_id: str
    full_name: str
    email: str
    role: RoleEnum
    department: DepartmentEnum          


class EmployeeCreate(BaseModel):
    employee_id: str
    full_name: str
    email: str
    password: str
    role: RoleEnum = RoleEnum.EMPLOYEE
    department: DepartmentEnum = DepartmentEnum.OTHERS

class EmployeeUpdate(BaseModel):        
    full_name: Optional[str] = None
    email: Optional[str] = None
    role: Optional[RoleEnum] = None
    department: Optional[DepartmentEnum] = None


class UserOut(UserBase):
    model_config = ConfigDict(from_attributes=True)
    id: int


class EmployeeWithTaskCount(UserOut):
    task_count: int


# ---------- Task ----------

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None


class TaskCreate(TaskBase):
    """Used by an employee creating a task for themselves."""
    pass


class AdminTaskAssign(TaskBase):
    """Used by an admin assigning a task to a specific employee."""
    employee_id: str


class TaskStatusUpdate(BaseModel):
    status: TaskStatusEnum


class TaskOut(TaskBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    status: TaskStatusEnum
    assigned_to_id: int
    created_by_id: int
    created_at: datetime

class KpiNoteCreate(BaseModel):
    entry_date: date_type          # e.g. "2026-08-05"
    outcome: KpiOutcomeEnum        # ON_TIME or LATE (MISSED reserved for no-show tasks)
    note: Optional[str] = None


class KpiRecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    entry_date: date_type
    outcome: KpiOutcomeEnum
    note: Optional[str] = None
    resolved_at: datetime


class EmployeeMonthlyKpi(BaseModel):
    employee_id: str
    full_name: str
    year: int
    month: int
    total_days: int
    on_time_days: int
    late_days: int
    on_time_percentage: float
    records: List[KpiRecordOut]

class PushSubscriptionIn(BaseModel):
    endpoint: str
    keys: dict  # {"p256dh": "...", "auth": "..."}
