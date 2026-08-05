# Employee Task Management System

FastAPI backend with `employee_id`-based JWT auth, role-based access
(ADMIN / EMPLOYEE), and real-time WebSocket task-assignment notifications.

## 1. Setup

```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # then edit JWT_SECRET_KEY
```

## 2. Seed demo users

```bash
python seed_data.py
```

Creates:
| employee_id | role     | password         |
|-------------|----------|------------------|
| ADM001      | ADMIN    | adminpass123     |
| EMP101      | EMPLOYEE | employeepass123  |

## 3. Run the server

```bash
uvicorn app.main:app --reload
```

Interactive docs: http://127.0.0.1:8000/docs

## 4. Try it end-to-end

**Login (OAuth2 password flow — note `username` = employee_id):**
```bash
curl -X POST http://127.0.0.1:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=EMP101&password=employeepass123"
```
Returns `{"access_token": "...", "token_type": "bearer"}`.

**Get my tasks:**
```bash
curl http://127.0.0.1:8000/tasks/me \
  -H "Authorization: Bearer <EMPLOYEE_TOKEN>"
```

**Employee creates own task:**
```bash
curl -X POST http://127.0.0.1:8000/tasks \
  -H "Authorization: Bearer <EMPLOYEE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Write weekly report", "description": "Due Friday"}'
```

**Admin lists employees + task counts:**
```bash
curl http://127.0.0.1:8000/admin/employees \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Admin views one employee's tasks:**
```bash
curl http://127.0.0.1:8000/admin/employees/EMP101/tasks \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

**Admin assigns a task (triggers WebSocket push to EMP101):**
```bash
curl -X POST http://127.0.0.1:8000/admin/assign-task \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"employee_id": "EMP101", "title": "Prepare Q3 deck", "description": "For Monday sync"}'
```

**WebSocket (connect as EMP101 first, then run the assign-task call above
in another terminal to see the push arrive):**
```bash
# using websocat, wscat, or any WS client
wscat -c "ws://127.0.0.1:8000/ws/EMP101?token=<EMPLOYEE_TOKEN>"
```
On assignment you'll receive:
```json
{"type": "TASK_ASSIGNED", "task": {"id": 2, "title": "Prepare Q3 deck", "...": "..."}}
```

## Notes on design choices

- **Login by `employee_id`, not email**: `OAuth2PasswordRequestForm`'s
  `username` field is repurposed to carry the employee_id, since email is
  intentionally non-unique in this system.
- **No public `/auth/register`**: accounts are provisioned by an admin
  (here, via `seed_data.py`). Add an admin-only `POST /admin/employees`
  route if you want in-app account creation.
- **WebSocket auth**: `/ws/{employee_id}` requires `?token=<jwt>` and
  rejects the connection if the token's `sub` doesn't match the path's
  `employee_id`, so employees can't listen on each other's channel.
- **SQLite by default, PostgreSQL via `DATABASE_URL`**: swap the env var,
  install `psycopg2-binary` (already in requirements.txt), no code changes
  needed.
- **Migrations**: `Base.metadata.create_all()` is fine for development;
  for production, introduce Alembic.
