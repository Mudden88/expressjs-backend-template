# Backend Template (Express + TypeScript + PostgreSQL)

This backend is a template for web applications using Node.js, Express, TypeScript, and PostgreSQL. It includes user authentication (JWT, cookies), registration, login/logout, and profile endpoints. The backend is ready to serve a built frontend (e.g., Angular) from the `Frontend/dist` directory.

## Features

- Express.js server with TypeScript
- PostgreSQL connection using `pg`
- User registration and login with hashed passwords (bcrypt)
- JWT authentication (stored in HTTP-only cookies)
- CORS and JSON body parsing
- API routes under `/api/v1`
- Serves static frontend files for production (Angular/Vite/React, etc.)
- Example middleware for authentication

## Folder Structure

```
Backend/
  src/
    index.ts         # Main server file
    db/db.ts         # Database connection and init
    middleware/auth/ # Auth middleware
  .env               # Environment variables
  package.json       # NPM scripts and dependencies
  tsconfig.json      # TypeScript config
```

## Setup Instructions

### 1. Prerequisites

- Node.js (v18+ recommended)
- npm
- PostgreSQL (local or Docker)

### 2. Clone and Install

```bash
cd Backend
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in `Backend/`:

```
PORT=3000
DB_USER=dbuser
DB_HOST=dbhost
DB_DATABASE=database
DB_PASSWORD=dbpassword
DB_PORT=dbport
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

Adjust values as needed for your setup.

### 4. Database Setup

- Ensure PostgreSQL is running and accessible.
- Create the database and user table as needed (see `initDb` in `src/db/db.ts`).

### 5. Build and Run

#### Development (auto-reload with nodemon):

```bash
npm run dev
```

#### Production:

```bash
npm run build
npm start
```

### 6. API Endpoints

- `POST /api/v1/register_account` — Register new user
- `POST /api/v1/login` — Login, returns JWT in cookie
- `GET  /api/v1/logout` — Logout (requires auth)
- `GET  /api/v1/profile` — Get current user (requires auth)

### 7. Serving Frontend

- Build your frontend (e.g., Angular) to `Frontend/dist/frontend/browser`.
- The backend will serve static files from this directory in production.

## Notes

- All sensitive routes require a valid JWT in the `access_token` cookie.
- Update `JWT_SECRET` in `.env` for production use.
- Adjust CORS settings as needed for your frontend.

---

This template is intended as a starting point for fullstack web apps. Extend as needed for your project!
