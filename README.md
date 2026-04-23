# Tickets Help Desk Platform

📘 English version: [`README.en.md`](./README.en.md)

Plataforma full stack de gestión de tickets tipo Help Desk, diseñada para operaciones internas de soporte con control por roles, métricas de rendimiento y enfoque en buenas prácticas de seguridad.

> Este proyecto está orientado a portfolio técnico: incluye arquitectura modular, pruebas de integración, hardening de autenticación y documentación operativa.

---

## 1) ¿Qué resuelve este proyecto?

Permite administrar incidencias desde su creación hasta su cierre:

- Un cliente crea tickets con prioridad y descripción.
- Un agente/admin puede asignar, comentar y cambiar estado.
- El sistema mantiene trazabilidad de cambios (historial).
- El dashboard expone métricas operativas en tiempo real.

### Roles y permisos

- **`ADMIN`**
	- Acceso completo a tickets, usuarios y dashboard.
	- Puede asignar tickets, cambiar roles de usuarios y eliminar tickets.
- **`AGENT`**
	- Gestiona tickets asignados o creados por él.
	- Puede comentar y actualizar estado según permisos de negocio.
- **`CLIENT`**
	- Crea tickets y consulta sus propios tickets.
	- Permisos limitados para actualizar/gestionar recursos.

---

## 2) Stack tecnológico

### Backend

- `Node.js` + `Express`
- `TypeScript`
- `Prisma ORM` + `PostgreSQL`
- `JWT` (access token + refresh token en cookie `httpOnly`)
- `Zod` (validación de input y env vars)
- `Jest` + `Supertest` (unit + integration)

### Frontend

- `React` + `Vite`
- `TypeScript`
- `Zustand` (estado global)
- `Axios` (cliente HTTP + interceptores)
- `Tailwind CSS` + sistema de tokens (`light/dark`)

### Seguridad aplicada

- `helmet` para headers de seguridad
- `cors` restringido
- `express-rate-limit` global + auth
- protección anti brute-force de login por `email + IP`
- logs de eventos de autenticación

---

## 3) Arquitectura del repositorio

```text
tickets/
├─ backend/                  # API REST + lógica de negocio + Prisma + tests
│  ├─ prisma/                # schema, migrations, seed
│  ├─ src/
│  │  ├─ config/             # env, db, rate limit
│  │  ├─ controllers/        # capa HTTP
│  │  ├─ middleware/         # auth, validación, errores, logging
│  │  ├─ routes/             # definición de endpoints
│  │  ├─ services/           # reglas de negocio
│  │  ├─ schemas/            # validaciones Zod
│  │  └─ utils/              # jwt, logger, helpers
│  └─ tests/                 # unit + integration
└─ frontend/                 # app React
	 ├─ src/
	 │  ├─ components/         # UI reutilizable
	 │  ├─ pages/              # vistas principales
	 │  ├─ hooks/              # lógica reusable
	 │  ├─ services/           # cliente API
	 │  ├─ store/              # Zustand stores
	 │  ├─ i18n/               # traducciones
	 │  └─ utils/              # labels, formatters, helpers
	 └─ public/
```

### Flujo de capas (backend)

`Route -> Middleware -> Controller -> Service -> Prisma`

- Los controladores permanecen delgados.
- La lógica de negocio vive en `services`.
- Validaciones de input con `schemas` + middleware `validate`.

---

## 4) Arranque local rápido

### Requisitos

- `Node.js 20+`
- `PostgreSQL 14+`

### 4.1 Backend

```bash
cd backend
npm install
cp .env.example .env
```

Configura en `backend/.env` al menos:

- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`

Luego ejecuta:

```bash
npm run db:migrate
npm run db:generate
npm run db:seed
npm run dev
```

API disponible en `http://localhost:4000`.

### 4.2 Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
npm run dev
```

Frontend disponible en `http://localhost:5180`.

---

## 5) Variables de entorno

### Backend (`backend/.env`)

Configuración base:

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

Rate limiting y hardening de login:

- `RATE_LIMIT_WINDOW_MS=900000`
- `RATE_LIMIT_MAX=100`
- `RATE_LIMIT_ENABLED=true|false`
- `LOGIN_MAX_ATTEMPTS=5`
- `LOGIN_LOCK_MINUTES=15`

### Frontend (`frontend/.env`)

- `VITE_API_URL=http://localhost:4000/api`

---

## 6) Scripts principales

### Backend (`backend/package.json`)

- `npm run dev`: levanta API con `tsx watch`
- `npm run build`: compila TypeScript
- `npm run start`: ejecuta build en `dist`
- `npm test`: corre Jest en modo serie
- `npm run test:coverage`: cobertura
- `npm run db:migrate`: migraciones Prisma
- `npm run db:generate`: genera Prisma Client
- `npm run db:seed`: inserta datos demo
- `npm run db:studio`: Prisma Studio

### Frontend (`frontend/package.json`)

- `npm run dev`: servidor Vite
- `npm run build`: type-check + build producción
- `npm run preview`: preview del build

---

## 7) Seguridad implementada (para portfolio)

Controles ya activos en el backend:

- **Headers de seguridad:** `helmet`.
- **Fingerprint reduction:** `x-powered-by` deshabilitado.
- **CORS restringido:** origen controlado por `CORS_ORIGIN`.
- **Auth robusta:** JWT corto + refresh en cookie `httpOnly`.
- **Rate limiting configurable:** global y auth con toggles por entorno.
- **Anti brute-force login:** bloqueo temporal por combinación `email + IP` tras múltiples fallos.
- **Auditoría básica:** logs de `login success`, `login failed`, `refresh failed`.
- **`trust proxy` configurable:** listo para reverse proxy/load balancer.

> Se incluyen pruebas de integración para validar bloqueo por intentos fallidos y permisos por rol.

---

## 8) Endpoints principales

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

## 9) Calidad y testing

### Pruebas backend

Incluye tests unitarios e integración para:

- autenticación (`login`, `me`, `refresh`)
- autorización por rol en tickets
- edge cases de permisos (`assign`, `status`, comentarios)
- hardening de login (bloqueo por intentos fallidos)

Ejecución:

```bash
cd backend
npm test
```

### Build frontend

```bash
cd frontend
npm run build
```

---

## 10) Credenciales demo (seed)

- `admin@helpdesk.com` / `Password123`
- `alice@helpdesk.com` / `Password123`
- `bob@helpdesk.com` / `Password123`
- `carlos@client.com` / `Password123`
- `diana@client.com` / `Password123`

---

## 11) Troubleshooting

- **Frontend no conecta al backend**
	- Verifica `VITE_API_URL` en `frontend/.env`.
- **Login/refresh falla**
	- Limpia `localStorage` del navegador y vuelve a iniciar sesión.
- **Prisma falla al iniciar**
	- Verifica PostgreSQL activo y `DATABASE_URL` correcta.
- **Te bloquea login por seguridad**
	- Ajusta `LOGIN_MAX_ATTEMPTS`/`LOGIN_LOCK_MINUTES` en entorno de desarrollo o espera el `Retry-After`.
- **Detrás de proxy**
	- Configura `TRUST_PROXY=true` (o el número de hops requerido).

---

## 12) Roadmap sugerido

- Auditoría persistente en DB (`security_events`)
- 2FA para cuentas `ADMIN`
- CSP explícita y nonce para scripts críticos
- CI/CD con quality gates (`build`, `test`, `coverage`, `lint`)
- Docker Compose para entorno full local

---

## 13) Licencia

Uso académico/portfolio. Ajusta licencia según tu estrategia de publicación.
