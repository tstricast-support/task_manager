from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..dependencies import get_current_user

router = APIRouter(prefix="/push", tags=["Push"])


@router.post("/subscribe", status_code=201)
def subscribe(
    sub_in: schemas.PushSubscriptionIn,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Save (or update) this device's push subscription for the current user."""
    existing = db.query(models.PushSubscription).filter(
        models.PushSubscription.endpoint == sub_in.endpoint
    ).first()

    if existing:
        existing.user_id = current_user.id
        existing.p256dh = sub_in.keys["p256dh"]
        existing.auth = sub_in.keys["auth"]
    else:
        db.add(models.PushSubscription(
            user_id=current_user.id,
            endpoint=sub_in.endpoint,
            p256dh=sub_in.keys["p256dh"],
            auth=sub_in.keys["auth"],
        ))
    db.commit()
    return {"status": "subscribed"}


@router.get("/vapid-public-key")
def get_vapid_public_key():
    import os
    return {"key": os.getenv("VAPID_PUBLIC_KEY", "")}