# EduTrack

Multi-school student information and academic management system (MVP).

## Overview

EduTrack helps small and medium-sized private schools manage their academic year, student enrollment, classes, attendance, grades, and academic reports.

Built as a **modular monolith** with the PERN stack (PostgreSQL, Express, React, Node.js) + TypeScript.

## Tech stack

| Layer | Technology |
|-------|------------|
| Frontend | React + Vite, TypeScript, Tailwind CSS, shadcn/ui (optional) |
| Routing | React Router |
| Server state | TanStack Query |
| Forms | React Hook Form + Zod |
| Backend | Node.js + Express, TypeScript |
| Database | PostgreSQL on Neon (via Prisma ORM) |
| Auth | Cookie-based sessions, Argon2id password hashing |
| File storage | Supabase Storage |
| Testing | Vitest + Supertest |

## Project layout

```
edu-track/
├── server/          # Express API (Node.js + TypeScript)
├── web/             # React frontend (Vite + TypeScript)
├── prisma/          # Prisma schema + migrations
├── docs/            # ARCHITECTURE.md, ERD.md, API.md
└── .github/workflows/  # CI
```

## Getting started

### Prerequisites
- Node.js 18+
- PostgreSQL (local or Neon)

### 1. Install dependencies

```bash
npm ci
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
cp web/.env.example web/.env
# Fill in DATABASE_URL, SESSION_SECRET, FRONTEND_URL, etc.
```

### 3. Set up the database

```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
cd ..
```

### 4. Run in development

Terminal 1 — API:
```bash
npm run dev:server
```

Terminal 2 — Frontend:
```bash
npm run dev:web
```

API: `http://localhost:3001`
Frontend: `http://localhost:5173`

### 5. Test

```bash
npm test
```

## Architecture

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for the full system design, data model, security & tenant isolation rules, and deployment plan.

## MVP roadmap

- **MVP 1:** School setup & access control (auth, users, roles, tenant isolation)
- **MVP 2:** Student & academic structure (grade levels, sections, subjects, enrollments)
- **MVP 3:** Attendance & grades
- **MVP 4:** Dashboards, reports & testing
- **MVP 5:** Documentation, security review, portfolio polish

## License

MIT