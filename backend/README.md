# Tickets Backend (Node + Express + Prisma)

API para sistema Help Desk con autenticación JWT, refresh token en cookie httpOnly y roles `ADMIN`, `AGENT`, `CLIENT`.

## Requisitos

- Node.js 20+
- PostgreSQL 14+

## Setup local

1) Instalar dependencias:

```bash
npm install
```

2) Crear archivo de entorno:

```bash
cp .env.example .env
```

3) Configurar `DATABASE_URL` y secrets JWT en `.env`.

4) Aplicar migraciones y generar cliente Prisma:

```bash
npm run db:migrate
npm run db:generate
```

5) (Opcional) Sembrar datos demo:

```bash
npm run db:seed
```

6) Ejecutar en desarrollo:

```bash
npm run dev
```

## Variables de entorno

Variables mínimas:

- `NODE_ENV` (`development|test|production`)
- `PORT` (por defecto `4000`)
- `DATABASE_URL`
- `JWT_ACCESS_SECRET` (mínimo 32 chars)
- `JWT_REFRESH_SECRET` (mínimo 32 chars)
- `JWT_ACCESS_EXPIRES_IN` (ej. `15m`)
- `JWT_REFRESH_EXPIRES_IN` (ej. `7d`)
- `BCRYPT_ROUNDS` (ej. `12`)
- `CORS_ORIGIN` (por defecto `http://localhost:5180`)
- `RATE_LIMIT_WINDOW_MS` (por defecto `900000`)
- `RATE_LIMIT_MAX` (por defecto `100`)
- `RATE_LIMIT_ENABLED` (`true|false`, por defecto `false` en `development` y `true` en otros entornos)
- `TRUST_PROXY` (`true|false|n`, para despliegues detrás de proxy/reverse proxy)
- `LOGIN_MAX_ATTEMPTS` (por defecto `5`, intentos fallidos antes de bloqueo)
- `LOGIN_LOCK_MINUTES` (por defecto `15`, minutos de bloqueo temporal)

## Controles de seguridad implementados

- `helmet` + CORS restringido por `CORS_ORIGIN`
- Cookies de refresh con `httpOnly`, `sameSite=strict`, `secure` en producción
- Rate limiting global + auth (`RATE_LIMIT_ENABLED` configurable)
- Protección anti-fuerza-bruta en login por `email + IP`
- Registro de eventos de seguridad de autenticación (login success/failure, refresh failure)
- `x-powered-by` deshabilitado y `trust proxy` configurable

## Scripts

- `npm run dev`: servidor en modo desarrollo
- `npm run build`: compila TypeScript
- `npm start`: ejecuta build (`dist/server.js`)
- `npm test`: pruebas unitarias + integración con Jest
- `npm run db:migrate`: crea/aplica migraciones Prisma
- `npm run db:seed`: datos demo
- `npm run db:studio`: Prisma Studio

## Health checks

- `GET /health`: estado básico del proceso
- `GET /health/ready`: readiness del servicio + prueba de base de datos

## Endpoints API

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

### Users (admin)
- `GET /api/users`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

### Dashboard
- `GET /api/dashboard/stats`
- `GET /api/dashboard/agent-stats`
