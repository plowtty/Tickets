# Tickets Help Desk Platform

📗 Versión en español: [`README.md`](./README.md)

A full-stack Help Desk ticket management platform designed for internal support operations, with role-based access control, operational metrics, and a strong focus on security best practices.

> This project is portfolio-oriented: it includes modular architecture, integration tests, authentication hardening, and operational documentation.

---

## 1) What problem does this project solve?

It manages incidents end-to-end, from creation to closure:

- A client creates tickets with priority and description.
- An agent/admin can assign tickets, comment, and change status.
- The system keeps change traceability (history).
- The dashboard exposes real-time operational metrics.

### Roles and permissions

- **`ADMIN`**
  - Full access to tickets, users, and dashboard.
  - Can assign tickets, change user roles, and delete tickets.
- **`AGENT`**
  - Manages tickets assigned to them or created by them.
  - Can comment and update status according to business rules.
- **`CLIENT`**
  - Creates tickets and views their own tickets.
  - Limited permissions for updating/managing resources.

---

## 2) Tech stack

### Backend

- `Node.js` + `Express`
- `TypeScript`
- `Prisma ORM` + `PostgreSQL`
- `JWT` (access token + refresh token in `httpOnly` cookie)
- `Zod` (input and env var validation)
- `Jest` + `Supertest` (unit + integration)

### Frontend

- `React` + `Vite`
- `TypeScript`
- `Zustand` (global state)
- `Axios` (HTTP client + interceptors)
- `Tailwind CSS` + token-based theming (`light/dark`)

### Security in place

- `helmet` for secure headers
- restricted `cors`
- global + auth `express-rate-limit`
- login brute-force protection by `email + IP`
- authentication security event logging

---

## 3) Repository architecture

```text
tickets/
├─ backend/                  # REST API + business logic + Prisma + tests
│  ├─ prisma/                # schema, migrations, seed
│  ├─ src/
│  │  ├─ config/             # env, db, rate limit
│  │  ├─ controllers/        # HTTP layer
│  │  ├─ middleware/         # auth, validation, errors, logging
│  │  ├─ routes/             # endpoint definitions
│  │  ├─ services/           # business rules
│  │  ├─ schemas/            # Zod validations
│  │  └─ utils/              # jwt, logger, helpers
│  └─ tests/                 # unit + integration
└─ frontend/                 # React app
   ├─ src/
   │  ├─ components/         # reusable UI
   │  ├─ pages/              # main views
   │  ├─ hooks/              # reusable logic
   │  ├─ services/           # API client
   │  ├─ store/              # Zustand stores
   │  ├─ i18n/               # translations
   │  └─ utils/              # labels, formatters, helpers
   └─ public/
```

### Backend layer flow

`Route -> Middleware -> Controller -> Service -> Prisma`

- Controllers stay thin.
- Business logic lives in `services`.
- Input is validated through `schemas` + `validate` middleware.

---

## 4) Quick local setup

### Requirements

- `Node.js 20+`
- `PostgreSQL 14+`

### 4.1 Backend

```bash
cd backend
npm install
cp .env.example .env
```

Configure at least the following in `backend/.env`:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

Then run:

```bash
npm run db:migrate
npm run db:generate
npm run db:seed
npm run dev
```

API available at `http://localhost:4000`.

### 4.2 Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

Frontend available at `http://localhost:5180`.

---

## 5) Environment variables

### Backend (`backend/.env`)

Base configuration:

- `NODE_ENV=development`
- `PORT=4000`
- `TRUST_PROXY=false`
- `DATABASE_URL=postgresql://...`
- `JWT_ACCESS_SECRET=...`
- `JWT_REFRESH_SECRET=...`
- `JWT_ACCESS_EXPIRES_IN=15m`
- `JWT_REFRESH_EXPIRES_IN=7d`
- `BCRYPT_ROUNDS=12`
- `CORS_ORIGIN=http://localhost:5180`

Rate limiting and login hardening:

- `RATE_LIMIT_WINDOW_MS=900000`
- `RATE_LIMIT_MAX=100`
- `RATE_LIMIT_ENABLED=true|false`
- `LOGIN_MAX_ATTEMPTS=5`
- `LOGIN_LOCK_MINUTES=15`

### Frontend (`frontend/.env`)

- `VITE_API_URL=http://localhost:4000/api`

---

## 6) Main scripts

### Backend (`backend/package.json`)

- `npm run dev`: starts API with `tsx watch`
- `npm run build`: compiles TypeScript
- `npm run start`: runs build from `dist`
- `npm test`: runs Jest in-band
- `npm run test:coverage`: coverage report
- `npm run db:migrate`: Prisma migrations
- `npm run db:generate`: generates Prisma Client
- `npm run db:seed`: inserts demo data
- `npm run db:studio`: opens Prisma Studio

### Frontend (`frontend/package.json`)

- `npm run dev`: Vite dev server
- `npm run build`: type-check + production build
- `npm run preview`: preview production build

---

## 7) Implemented security controls (portfolio-ready)

Active controls in backend:

- **Security headers:** `helmet`.
- **Fingerprint reduction:** `x-powered-by` disabled.
- **Restricted CORS:** controlled by `CORS_ORIGIN`.
- **Hardened auth:** short-lived JWT + refresh token in `httpOnly` cookie.
- **Configurable rate limiting:** global and auth toggles by environment.
- **Login brute-force protection:** temporary lockout for repeated failures by `email + IP`.
- **Basic audit trail:** `login success`, `login failed`, `refresh failed` logs.
- **Configurable `trust proxy`:** ready for reverse proxy/load balancer setups.

> Integration tests include lockout behavior and role-based permission scenarios.

---

## 8) Main endpoints

### Health

- `GET /health`
- `GET /health/ready`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Tickets

- `GET /api/tickets`
- `POST /api/tickets`
- `GET /api/tickets/:id`
- `PATCH /api/tickets/:id`
- `PATCH /api/tickets/:id/status`
- `PATCH /api/tickets/:id/assign`
- `DELETE /api/tickets/:id`

### Comments

- `GET /api/tickets/:ticketId/comments`
- `POST /api/tickets/:ticketId/comments`
- `DELETE /api/tickets/:ticketId/comments/:commentId`

### Users / Dashboard

- `GET /api/users` *(admin)*
- `PATCH /api/users/:id` *(admin)*
- `DELETE /api/users/:id` *(admin)*
- `GET /api/dashboard/stats`
- `GET /api/dashboard/agent-stats`

---

## 9) Quality and testing

### Backend tests

Includes unit and integration coverage for:

- authentication (`login`, `me`, `refresh`)
- role-based authorization on tickets
- permission edge cases (`assign`, `status`, comments)
- login hardening (failed-attempt lockout)

Run:

```bash
cd backend
npm test
```

### Frontend build

```bash
cd frontend
npm run build
```

---

## 10) Demo credentials (seed)

- `admin@helpdesk.com` / `Password123`
- `alice@helpdesk.com` / `Password123`
- `bob@helpdesk.com` / `Password123`
- `carlos@client.com` / `Password123`
- `diana@client.com` / `Password123`

---

## 11) Troubleshooting

- **Frontend cannot connect to backend**
  - Verify `VITE_API_URL` in `frontend/.env`.
- **Login/refresh fails**
  - Clear browser `localStorage` and sign in again.
- **Prisma fails on startup**
  - Ensure PostgreSQL is running and `DATABASE_URL` is correct.
- **Login is blocked by security controls**
  - Tune `LOGIN_MAX_ATTEMPTS` / `LOGIN_LOCK_MINUTES` for development or wait for `Retry-After`.
- **Running behind a proxy**
  - Set `TRUST_PROXY=true` (or the required hop count).

---

## 12) Suggested roadmap

- Persistent security audit logging in DB (`security_events`)
- 2FA for `ADMIN` accounts
- Explicit CSP + nonce for critical scripts
- CI/CD quality gates (`build`, `test`, `coverage`, `lint`)
- Docker Compose for a fully local stack

---

## 13) License

Academic/portfolio use. Adjust licensing based on your publication strategy.
