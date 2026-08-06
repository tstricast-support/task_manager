# backend/gen_vapid.py

import base64
from py_vapid import Vapid02
from cryptography.hazmat.primitives import serialization

v = Vapid02()
v.generate_keys()

# Raw private key (32 bytes)
private_raw = v.private_key.private_numbers().private_value.to_bytes(32, "big")

private_b64url = base64.urlsafe_b64encode(
    private_raw
).rstrip(b"=").decode()


# Public key for browser subscription
public_raw = v.public_key.public_bytes(
    encoding=serialization.Encoding.X962,
    format=serialization.PublicFormat.UncompressedPoint,
)

public_b64url = base64.urlsafe_b64encode(
    public_raw
).rstrip(b"=").decode()


print("=== Add these to .env ===")
print()
print(f"VAPID_PUBLIC_KEY={public_b64url}")
print()
print(f"VAPID_PRIVATE_KEY={private_b64url}")