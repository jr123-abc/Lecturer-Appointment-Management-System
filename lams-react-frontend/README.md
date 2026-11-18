# Lecturer Appointment Management System – React Frontend

A React + Vite frontend starter for the LAMS project. It includes Student, Lecturer and Administrator views.

## Requirements
- Node.js (LTS version)
- npm
- Visual Studio Code (recommended)
- Spring Boot backend (when connecting to the real database)

## Run the frontend in demo mode

1. Extract this ZIP file.
2. Open the extracted `lams-react-frontend` folder in VS Code.
3. Open Terminal → New Terminal.
4. Run:

```bash
npm install
npm run dev
```

5. Open the URL printed in the terminal, usually `http://localhost:5173`.

### Demo accounts

All demo accounts use password `demo123`.

| Role | Email |
|---|---|
| Student | student@lams.lk |
| Lecturer | lecturer@lams.lk |
| Administrator | admin@lams.lk |

Demo data is stored in browser localStorage. It is for frontend demonstration only, not production authentication or secure storage.

To reset demo data, open browser DevTools → Application → Local Storage and delete `lams_demo_data`, then refresh.

## Connect to Spring Boot

1. Copy `.env.example` to `.env`.
2. Set:

```env
VITE_USE_API=true
VITE_API_BASE_URL=http://localhost:8080/api
```

3. Restart the Vite development server.

The API calls currently expected by `src/api.js` are:
- `POST /auth/login`
- `GET /dashboard/overview`
- `POST /appointments`
- `PATCH /appointments/{id}/status`
- `POST /availability-slots`
- `PATCH /notifications/{id}/read`
- `PATCH /users/me`

These are integration placeholders. Your Spring Boot backend must implement matching endpoints and response formats, or you must adapt `src/api.js` to the endpoints your team actually creates. Configure CORS in Spring Boot to allow the Vite origin (`http://localhost:5173`).

## Important project notes

- React does not connect directly to MySQL. React calls Spring Boot REST APIs; Spring Boot accesses MySQL.
- The demo login is not secure and must not be used in a deployed/real system.
- The sample data and IDs are demonstration data. Replace them with backend responses.
- Group appointments, recurrence generation, email verification, password reset, admin CRUD, audit logs, and attendance need further implementation and backend support.
- Never store real passwords, verification tokens, or secrets in frontend source code.
- Implement role checks and booking-capacity/concurrency rules on the backend, not only in React.
