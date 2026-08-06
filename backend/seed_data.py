"""
Bootstraps the database with an admin account (and, for local dev only,
a demo employee account).

Local dev usage:
    python seed_data.py

Production usage (e.g. on Railway):
    Set ADMIN_EMPLOYEE_ID, ADMIN_PASSWORD, ADMIN_EMAIL, ADMIN_FULL_NAME as
    service variables, then run once via:
        railway run python seed_data.py
    The script is idempotent - re-running it will skip existing users
    rather than overwrite them, so it's safe to run on every deploy.
"""
import os

from app.auth import get_password_hash
from app.database import Base, SessionLocal, engine
from app.models import RoleEnum, User

Base.metadata.create_all(bind=engine)
db = SessionLocal()


def create_user(employee_id: str, full_name: str, email: str, password: str, role: RoleEnum):
    existing = db.query(User).filter(User.employee_id == employee_id).first()
    if existing:
        print(f"[skip] {employee_id} already exists")
        return
    user = User(
        employee_id=employee_id,
        full_name=full_name,
        email=email,
        password_hash=get_password_hash(password),
        role=role,
    )
    db.add(user)
    db.commit()
    print(f"[created] {role.value} {employee_id}")


if __name__ == "__main__":
    admin_employee_id = os.getenv("ADMIN_EMPLOYEE_ID")
    admin_password = os.getenv("ADMIN_PASSWORD")

    if admin_employee_id and admin_password:
        # Production path: credentials come from Railway service variables,
        # never from source code.
        create_user(
            employee_id=admin_employee_id,
            full_name=os.getenv("ADMIN_FULL_NAME", "System Admin"),
            email=os.getenv("ADMIN_EMAIL", "admin@company.com"),
            password=admin_password,
            role=RoleEnum.ADMIN,
        )
    else:
        # Local dev fallback: convenience demo accounts.
        print("[info] ADMIN_EMPLOYEE_ID/ADMIN_PASSWORD not set - seeding local demo accounts")
        # create_user("ADM001", "Alice Admin", "hr@company.com", "adminpass123", RoleEnum.ADMIN)
        # create_user("EMP101", "Bob Employee", "hr@company.com", "employeepass123", RoleEnum.EMPLOYEE) 

    db.close()
