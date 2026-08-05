from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from .. import models


def delete_expired_tasks(db: Session) -> int:
    """Delete any task older than 24 hours."""
    cutoff = datetime.utcnow() - timedelta(hours=24)
    expired = db.query(models.Task).filter(models.Task.created_at < cutoff).all()
    count = len(expired)
    for task in expired:
        db.delete(task)
    if count:
        db.commit()
    return count