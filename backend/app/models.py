import enum
from datetime import datetime

from sqlalchemy import Column, Integer, String, Enum, ForeignKey, DateTime, Date, Text
from sqlalchemy.orm import relationship

from .database import Base


class RoleEnum(str, enum.Enum):
    ADMIN = "ADMIN"
    EMPLOYEE = "EMPLOYEE"


class TaskStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"

class DepartmentEnum(str, enum.Enum):
    I_LAB = "I_LAB"
    IPHOTO_BOOK = "IPHOTO_BOOK"
    I_LAB_STD = "I_LAB_STD"
    DD_ENGINEERING = "DD_ENGINEERING"
    OTHERS = "OTHERS"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(20), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(120), nullable=False)
    email = Column(String(120), index=True, nullable=False)
    role = Column(Enum(RoleEnum), default=RoleEnum.EMPLOYEE, nullable=False)
    department = Column(Enum(DepartmentEnum), default=DepartmentEnum.OTHERS, nullable=False)

    assigned_tasks = relationship(
        "Task",
        foreign_keys="Task.assigned_to_id",
        back_populates="assignee",
        cascade="all, delete-orphan",
    )
    created_tasks = relationship(
        "Task",
        foreign_keys="Task.created_by_id",
        back_populates="creator",
    )


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(TaskStatusEnum), default=TaskStatusEnum.PENDING, nullable=False)

    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)

    assignee = relationship("User", foreign_keys=[assigned_to_id], back_populates="assigned_tasks")
    creator = relationship("User", foreign_keys=[created_by_id], back_populates="created_tasks")
    start_time = Column(String, nullable=True)  # e.g. "08:00"
    end_time = Column(String, nullable=True)    # e.g. "09:00"

class KpiOutcomeEnum(str, enum.Enum):
    ON_TIME = "ON_TIME"
    LATE = "LATE"
    MISSED = "MISSED"


class KpiRecord(Base):
    """
    One manually-entered performance note per employee per day, written by
    an admin (e.g. 'Jeewan did not complete his task on time - 2026/08/05').
    Used to compute a monthly on-time percentage for salary review.
    """
    __tablename__ = "kpi_records"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    entry_date = Column(Date, nullable=False)   # the day this note is about
    outcome = Column(Enum(KpiOutcomeEnum), nullable=False)
    note = Column(Text, nullable=True)          # e.g. "Missed print job deadline"

    resolved_at = Column(DateTime, default=datetime.utcnow, nullable=False)  # when the note was logged

    employee = relationship("User", foreign_keys=[employee_id])

class PushSubscription(Base):
    __tablename__ = "push_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    endpoint = Column(Text, nullable=False, unique=True)
    p256dh = Column(String(255), nullable=False)
    auth = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    user = relationship("User")