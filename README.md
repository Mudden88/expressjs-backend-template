# Backend Template (Express + TypeScript + PostgreSQL)

A starter backend using Node.js, Express 5, TypeScript, and PostgreSQL. It provides user registration, login/logout, and profile endpoints with JWT authentication stored in HTTP-only cookies.

## Features

- Express 5 server with TypeScript
- PostgreSQL via `pg` (`Pool` for queries, schema bootstrap on startup)
- User registration and login with bcrypt-hashed passwords
- JWT in HTTP-only `access_token` cookie (1h expiry)
- CORS, JSON body parsing, and `cookie-parser`
- Modular layout: `app.ts` for middleware/routes, `index.ts` for startup
- Auth middleware for protected routes
- Shared request types in `src/interface/`

## Folder structure

```
Backend Template/
  src/
    index.ts                          # Loads env, initializes DB, starts server
    app.ts                            # Express app (middleware + routers)
    db/
      db.ts                           # Connection pool and initDb()
      init.sql                        # user_accounts schema (run on startup)
    routes/
      user/
        user.ts                       # Register, login, logout, profile
    middleware/
      auth/
        auth.ts                       # JWT cookie verification
    interface/
      interface.ts                    # AuthRequest, DecodedToken
  .env                                # Environment variables (not committed)
  package.json
  tsconfig.json
```

## Setup

### Prerequisites

- Node.js 18+
- npm
- PostgreSQL (local or Docker)

### Install

```bash
npm install
```

### Environment variables

Create a `.env` file in the project root:

```env
PORT=3000
DB_USER=dbuser
DB_HOST=localhost
DB_DATABASE=your_database
DB_PASSWORD=your_password
DB_PORT=5432
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### Database

1. Create an empty PostgreSQL database matching `DB_DATABASE`.
2. Start the server (`npm run dev` or `npm start`). On startup, `initDb()` connects and runs `src/db/init.sql`, creating the `user_accounts` table if it does not exist.

### Run

**Development (nodemon):**

```bash
npm run dev
```

**Production:**

```bash
npm run build
npm start
```

The compiled app runs from `dist/` (`node dist/index.js`).

## API endpoints

Base path: `/api/v1/user`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/register-account` | No | Register (`username`, `email`, `password`) |
| `POST` | `/login` | No | Login (`username`, `password`); sets `access_token` cookie |
| `POST` | `/logout` | Yes | Clears cookie, sets `is_active = false` |
| `GET` | `/profile` | Yes | Returns JWT payload as `user` |

**Examples:**

- `POST /api/v1/user/register-account`
- `POST /api/v1/user/login`
- `POST /api/v1/user/logout`
- `GET /api/v1/user/profile`

Protected routes require a valid `access_token` HTTP-only cookie (set on login).

### Response shape

Success responses generally use `{ success: true, ... }`. Errors use `{ success: false, error: "..." }` (auth middleware may use `message` for 401).

## Notes

- Set a strong `JWT_SECRET` in production.
- Cookies use `secure: true` when `NODE_ENV=production`.
- CORS is enabled for all origins by default; tighten for your frontend origin in production.
- This template is API-only; add static file serving or a reverse proxy if you need to host a frontend from the same process.

---

MIT — extend as needed for your project.
