import os
from pywebpush import webpush, WebPushException

VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY", "").replace("\\n", "\n")
VAPID_CLAIM_EMAIL = os.getenv("VAPID_CLAIM_EMAIL", "mailto:admin@example.com")

print(repr(VAPID_PRIVATE_KEY))
print(type(VAPID_PRIVATE_KEY))

def send_push(subscription, title: str, body: str) -> bool:
    """Send one push notification. Returns False (and doesn't raise) if the
    subscription is dead/expired, so callers can clean it up."""
    try:
        webpush(
            subscription_info={
                "endpoint": subscription.endpoint,
                "keys": {"p256dh": subscription.p256dh, "auth": subscription.auth},
            },
            data=f'{{"title": "{title}", "body": "{body}"}}',
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims={"sub": VAPID_CLAIM_EMAIL},
        )
        return True
    except WebPushException:
        return False