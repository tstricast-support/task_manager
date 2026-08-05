# backend/gen_vapid.py
import base64
from py_vapid import Vapid02

v = Vapid02()
v.generate_keys()

private_pem = v.private_pem().decode()
raw_public = v.public_key.public_bytes(
    encoding=__import__("cryptography.hazmat.primitives.serialization", fromlist=["Encoding"]).Encoding.X962,
    format=__import__("cryptography.hazmat.primitives.serialization", fromlist=["PublicFormat"]).PublicFormat.UncompressedPoint,
)
public_b64url = base64.urlsafe_b64encode(raw_public).rstrip(b"=").decode()

print("=== Add these to your .env ===")
print(f"VAPID_PUBLIC_KEY={public_b64url}")
print("VAPID_PRIVATE_KEY_PEM_BELOW (paste into .env as one line, replace real newlines with \\n):")
print(private_pem)