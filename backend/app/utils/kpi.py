from datetime import datetime, timedelta

from .. import models


def determine_completion_status(task: models.Task) -> models.KpiOutcomeEnum:
    """Decide ON_TIME vs LATE for a task being marked completed right now."""
    now = datetime.utcnow()

    if task.end_time:
        # Compare against the end_time on the task's creation date.
        try:
            hour, minute = map(int, task.end_time.split(":"))
            deadline = task.created_at.replace(hour=hour, minute=minute, second=0, microsecond=0)
        except (ValueError, AttributeError):
            deadline = task.created_at + timedelta(hours=24)
    else:
        deadline = task.created_at + timedelta(hours=24)

    return models.KpiOutcomeEnum.ON_TIME if now <= deadline else models.KpiOutcomeEnum.LATE


def log_task_completion(db, task: models.Task) -> None:
    """Call this the moment a task is marked COMPLETED."""
    outcome = determine_completion_status(task)
    record = models.KpiRecord(
        employee_id=task.assigned_to_id,
        task_title=task.title,
        outcome=outcome,
        task_created_at=task.created_at,
    )
    db.add(record)


def log_task_missed(db, task: models.Task) -> None:
    """Call this right before deleting an expired task that was never completed."""
    record = models.KpiRecord(
        employee_id=task.assigned_to_id,
        task_title=task.title,
        outcome=models.KpiOutcomeEnum.MISSED,
        task_created_at=task.created_at,
    )
    db.add(record)