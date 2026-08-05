# Task Ledger — Frontend

React (Vite) + Tailwind frontend for the Employee Task Management backend.
Role-based dashboards, JWT auth, and a live WebSocket connection that chimes
when an admin assigns you a task.

## 1. Setup

```bash
npm install
cp .env.example .env
```

Edit `.env` to point at your backend:
```
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_WS_BASE_URL=ws://127.0.0.1:8000
```

## 2. Run

```bash
npm run dev
```

Visit `http://localhost:5173`. Make sure your FastAPI backend is running
(`uvicorn app.main:app --reload`) and its CORS settings allow this origin
(`CORS_ORIGINS=http://localhost:5173` in the backend's `.env`).

## 3. Log in

Use the accounts from `seed_data.py`:
| employee_id | password | role |
|---|---|---|
| ADM001 | adminpass123 | ADMIN → redirected to `/admin` |
| EMP101 | employeepass123 | EMPLOYEE → redirected to `/dashboard` |

## How it maps to the backend

| Frontend | Backend |
|---|---|
| `AuthContext.login()` | `POST /auth/login` (form-urlencoded, `username` = employee_id) |
| `EmployeeDashboard` | `GET /tasks/me`, `POST /tasks`, `PATCH /tasks/{id}/status` |
| `AdminDashboard` | `GET /admin/employees` |
| `AdminEmployeeProfile` | `GET /admin/employees/{id}/tasks`, `POST /admin/assign-task` |
| `WebSocketContext` | `GET /ws/{employee_id}?token=...` |

## Notes on key pieces

- **JWT decoding**: the backend's token payload is `{ sub, role, user_id, exp }`.
  `src/utils/jwt.js` decodes it client-side (no signature verification needed
  here — the backend re-verifies on every request) to drive role-based routing.
- **Axios interceptor** (`src/api/axios.js`): attaches `Authorization: Bearer <token>`
  to every request, and auto-logs-out on a `401` response.
- **WebSocket reconnect**: `WebSocketContext` reconnects automatically after a
  3s delay if the connection drops (server restart, network blip, etc.).
- **Audio autoplay**: browsers block `Audio.play()` until the user interacts
  with the page. The header's "Enable audio" button performs a play/pause
  cycle on click (a real user gesture) to unlock playback for later,
  programmatic chime calls. This preference persists in `localStorage`.
- **Custom chime**: `public/notification.mp3` is a small synthesized two-tone
  chime — replace it with your own file (same filename) any time.

## Production build

```bash
npm run build
```
Outputs static files to `dist/` — deploy to Vercel, Netlify, Railway (as a
static site service), or any static host. Set `VITE_API_BASE_URL` and
`VITE_WS_BASE_URL` (using `https://`/`wss://`) as build-time env vars on
whichever platform you use.
