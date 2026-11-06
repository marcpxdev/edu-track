# EduTrack — Project Plan

**Source:** `EduTrack_MVP_and_Tech_Stack.md` (requirements) + `ARCHITECTURE.md` (design)

This plan takes the project from preparation through all five MVPs to a portfolio-ready demo. It is written for a solo developer working incrementally. Each phase ends with a demonstrable, testable workflow — never a pile of half-built features.

---

## How to read this plan

- **Phase** = a time-boxed block of work with a clear demo goal.
- **Milestone** = the acceptance criteria that must pass before moving on.
- **Definition of done** = authorization + validation + error states + tests are complete for every feature in the phase (per the doc's scope-control rules).
- **Backlog** = anything postponed goes in `BACKLOG.md` (not in the code).

---

## Phase 0 — Preparation & Foundation (Weeks 1–2)

**Goal:** Repo ready, database designed, dev environment and CI working, skeleton deployed.

### Work items

1. **Repo setup** (done — layout created)
   - Monorepo with `server/` (Express + TypeScript) and `web/` (React + Vite)
   - GitHub repository, `main` branch, branch protection
   - `.gitignore`, `.env.example` for server and web

2. **Database design**
   - Prisma schema in `server/prisma/schema.prisma` (done)
   - 22 entities with `schoolId` tenant scoping, `uuid()` keys, unique constraints
   - Local PostgreSQL for dev; Neon for production/staging

3. **Environment & tooling**
   - `server/.env` and `web/.env` from `.env.example`
   - ESLint + Prettier + TypeScript strict mode
   - Vitest (server) + Vitest (web)
   - GitHub Actions CI: lint → test → build on every PR/push

4. **Skeleton deployment**
   - Deploy Express API to Render Free
   - Deploy React SPA to Vercel Hobby
   - Connect API to Neon database
   - Verify `/health` responds in production

5. **Initial commit & docs**
   - Commit `ARCHITECTURE.md`, `PROJECT_PLAN.md`, `README.md`, repo layout

### Definition of done
- `git push main` triggers CI that passes (lint + tests + build)
- `https://api.render.com/health` returns `{"status":"ok"}`
- `https://frontend.vercel.app` loads the React app
- `PROJECT_PLAN.md` and `ARCHITECTURE.md` committed

---

## Phase 1 — School Setup & Access Control (MVP 1) (Weeks 3–5)

**Goal:** A school administrator can configure a school and securely manage access.

### Week 3 — Authentication core

| Task | Detail |
|------|--------|
| Auth service | Register (create user + school + SCHOOL_ADMIN membership), login, logout, password reset request/confirm |
| Password hashing | Argon2id via `argon2` package |
| Sessions | Cookie-based, HttpOnly, Secure (prod), SameSite=Lax, 7-day expiry |
| Auth middleware | Resolve session from cookie, attach `req.auth` |
| Auth routes | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `POST /auth/password-reset/request`, `POST /auth/password-reset/confirm`, `GET /auth/me` |
| Unit tests | Argon2 hash/verify, session create/expiry, register duplicate email |

### Week 4 — Tenant isolation & RBAC

| Task | Detail |
|------|--------|
| Tenant isolation middleware | Derive `schoolId` from session + `UserSchoolMembership`; reject client-supplied schoolId |
| RBAC middleware | `requireRole("SCHOOL_ADMIN", "PLATFORM_ADMIN", "TEACHER", ...)` |
| Schools module | Get/update school profile (`GET|PATCH /schools/me`) |
| Users module | List school users (`GET /schools/users`), deactivate user (`DELETE /schools/users/:id`) |
| Tenant isolation tests | A user from School A cannot read/update/delete School B records (all CRUD) |

### Week 5 — School admin workflow + deploy

| Task | Detail |
|------|--------|
| Academic year | Create/activate academic year (`POST|PATCH /academic-years`) |
| Frontend | Login page, logout, school profile view, user list (done partially — complete forms + validation) |
| Frontend guards | React Router role guards (SCHOOL_ADMIN vs TEACHER vs STUDENT/PARENT) |
| End-to-end flow | Register school → login as admin → view school profile → add teacher → deactivate teacher |
| Deploy | Render + Vercel + Neon connected; demo accounts seeded |

### Milestone / Acceptance criteria (MVP 1)
- [ ] A school administrator can access only their school's data
- [ ] An administrator can create and deactivate a teacher account
- [ ] A teacher cannot access administrator-only functions
- [ ] A user from School A cannot retrieve School B's records by changing an ID in an API request
- [ ] Tests cover auth, RBAC, and tenant isolation for read/create/update/delete

### Definition of done
Every endpoint has: Zod validation, role authorization, tenant scoping, error handling, and at least one integration test.

---

## Phase 2 — Student & Academic Structure (MVP 2) (Weeks 6–8)

**Goal:** A school can create its academic structure and enroll students.

### Week 6 — Academic structure

| Task | Detail |
|------|--------|
| Grade levels | CRUD (`/grade-levels`) with `levelOrder` |
| Sections | CRUD (`/sections`) tied to grade level; unique `schoolId + gradeLevelId + name` |
| Subjects | CRUD (`/subjects`) with optional code |
| Teachers | Teacher profiles (`/teachers`) linked to user + employeeId |
| Teaching assignments | Assign teacher to subject/section/academic year (`/teaching-assignments`) |

### Week 7 — Students & enrollment

| Task | Detail |
|------|--------|
| Student profiles | CRUD (`/students`) with studentNumber, optional user link |
| Guardians | Guardian profiles + `StudentGuardian` links |
| Enrollments | Enroll student into academic year + section (`/enrollments`); one active enrollment per student per year |
| Enrollment statuses | ACTIVE, TRANSFERRED, GRADUATED, INACTIVE |
| Search/filter/pagination | Student list with pagination |

### Week 8 — Frontend + workflow

| Task | Detail |
|------|--------|
| Frontend | Grade level, section, subject, teacher, student, enrollment pages |
| TanStack Query | Hooks for each resource (useGradeLevels, useStudents, useEnrollments, …) |
| Forms | React Hook Form + Zod schemas shared with backend validation |
| Workflow | Admin creates year → grade levels → sections → subjects → adds teacher → enrolls students |
| Tests | Teacher sees only their assigned classes; admin can enroll a student |

### Milestone / Acceptance criteria (MVP 2)
- [ ] Administrator can create a grade level, section, and subject
- [ ] Administrator can assign a teacher to a class or subject
- [ ] Administrator can enroll a student into a section for an academic year
- [ ] A teacher sees only their assigned classes

---

## Phase 3 — Attendance Management (MVP 3) (Weeks 9–11)

**Goal:** A teacher can record and review attendance for assigned classes.

### Week 9 — Attendance backend

| Task | Detail |
|------|--------|
| Attendance sessions | Create daily session per section (`/attendance/sessions`); unique `schoolId + sectionId + date` |
| Attendance records | Record present/absent/late/excused per enrollment (`/attendance/sessions/:id/records`); one record per student per session |
| Duplicate prevention | Database unique constraint + application check |
| Attendance correction | Authorized user can correct; change is auditable (`AuditLog`) |

### Week 10 — Attendance reports

| Task | Detail |
|------|--------|
| History per student | Attendance record history for a student |
| Class summary | Daily and monthly attendance summaries per class |
| Filters | By date range, section, status |

### Week 11 — Frontend + workflow

| Task | Detail |
|------|--------|
| Frontend | Teacher takes attendance for assigned class; view history; admin views summaries |
| Audit trail | Every attendance change logged with actor, timestamp, before/after |
| Tests | Duplicate session prevented; correction is auditable; cross-school isolation |

### Milestone / Acceptance criteria (MVP 3)
- [ ] Teacher can record attendance for an assigned class
- [ ] System prevents duplicate attendance records for same student + class + date
- [ ] Authorized user can correct attendance; change is auditable
- [ ] Administrator can view attendance summaries

---

## Phase 4 — Grades & Academic Records (MVP 4) (Weeks 12–14)

**Goal:** Teachers submit grades; administrators review academic results.

### Week 12 — Grading backend

| Task | Detail |
|------|--------|
| Grading periods | Quarters/semesters (`/grading-periods`); active period flag |
| Grades | Grade entry per student, subject, grading period (`/grades`); DRAFT/SUBMITTED states |
| Validation | Grade value within configured grading rules (maxValue) |
| Enrollment link | Grade links to enrollment for context |

### Week 13 — Grade workflow

| Task | Detail |
|------|--------|
| Draft/submit | Teacher saves draft, submits when ready |
| Approval | Submitted grades cannot be silently changed without authorization (audit log) |
| Academic history | Student grade history across periods |
| Report card | Printable view: student, academic year, grading period, subjects, grades |

### Week 14 — Frontend + workflow

| Task | Detail |
|------|--------|
| Frontend | Teacher grade entry per class/period; admin grade review; report card page |
| End-to-end | Enroll → attendance → grade → report card |
| Tests | Teacher enters grades only for assigned subjects; validation against rules; submitted grades require authorization to change |

### Milestone / Acceptance criteria (MVP 4)
- [ ] Teacher can enter grades only for assigned subjects/classes
- [ ] System validates grade values against configured grading rules
- [ ] Submitted grades cannot be silently changed without authorization
- [ ] Report card displays correct student, academic year, grading period, subjects

---

## Phase 5 — Dashboards, Reports & Communication (MVP 5) (Weeks 15–16)

**Goal:** Users see relevant academic information and school announcements.

### Week 15 — Dashboards & announcements

| Task | Detail |
|------|--------|
| Admin dashboard | Student counts, enrollment, attendance summaries |
| Teacher dashboard | Assigned classes, attendance tasks, pending grade submissions |
| Student dashboard | Own grades and attendance |
| Parent dashboard | Linked children's permitted information |
| Announcements | School-wide and class-scoped (`/announcements`) |

### Week 16 — Notifications & reports

| Task | Detail |
|------|--------|
| In-app notifications | Read/unread state (`/notifications`) |
| Printable reports | Basic attendance/grade reports downloadable |
| Role-based views | Each role sees appropriate dashboard; students cannot view other students' records; parents only see linked children |

### Milestone / Acceptance criteria (MVP 5)
- [ ] Each role sees an appropriate dashboard
- [ ] Students cannot view another student's academic records
- [ ] Parents can access only children explicitly linked to their account
- [ ] Announcements scoped to school or class

---

## Phase 6 — Documentation, Security Review & Portfolio Polish (Week 17)

**Goal:** Portfolio-ready deliverables complete.

### Work items

| Task | Detail |
|------|--------|
| ERD / database diagram | Document in `docs/ERD.md` |
| API documentation | OpenAPI / Swagger or endpoint reference in `docs/API.md` |
| Architecture diagram | Already in `ARCHITECTURE.md`; keep current |
| README | Problem statement, features, setup instructions, demo accounts |
| `.env.example` | Committed without secrets |
| Seeded synthetic demo data | Demo accounts for each role (admin, teacher, student, parent) |
| Demo video / screenshots | Record the demo scenario from the requirements doc |
| Security review | Check all 16 items in the Security and Privacy Checklist |
| Backup test | Verify database backup and restoration procedure |
| Known limitations | Document free-tier limits, cold starts, demo-data-only policy |

### Milestone
- Public GitHub repo with all portfolio deliverables checked off
- Deployed frontend + API with demo data
- Demo account for each major role working

---

## Dependency map (what blocks what)

```
Phase 0 (repo, DB, CI, deploy)
    │
    ▼
Phase 1 (auth, tenant isolation, RBAC, school admin)
    │  ◀── Nothing in later phases works without this
    ▼
Phase 2 (academic structure, students, enrollment)
    │  ◀── Needs schools + users from Phase 1
    ▼
Phase 3 (attendance)
    │  ◀── Needs sections + enrollments from Phase 2
    ▼
Phase 4 (grades)
    │  ◀── Needs subjects, enrollments, grading periods
    ▼
Phase 5 (dashboards, announcements)
    │  ◀── Needs everything above
    ▼
Phase 6 (docs, security, portfolio)
```

## Scope-control rules (enforced throughout)

1. Finish complete user workflows before adding advanced features.
2. No AI, payments, or native mobile apps in MVP 1.
3. No microservices — modular monolith only.
4. Don't over-engineer reusable components before needed.
5. A feature is not complete until authorization, validation, error states, and tests are included.
6. Keep postponed features in `BACKLOG.md`.

## Risk & mitigation

| Risk | Mitigation |
|------|------------|
| Render free service sleeps / cold starts | Acceptable for portfolio demo; document it |
| Neon free tier quota limits | Keep dev data small; use synthetic data; monitor usage |
| Tenant isolation bug leaks data | Write isolation tests first in Phase 1; test every CRUD op |
| Solo developer burnout | Time-box each phase to 2–3 weeks; ship demos early |
| Prisma schema changes mid-development | Use `prisma migrate dev` locally; plan migrations before changing schema |

## Success criteria (portfolio)

- Public repo with clean commit history
- Live demo: register school → add teacher → enroll student → take attendance → submit grade → view report card
- Each role has a working demo account
- Tenant isolation proven by tests
- Architecture diagram, ERD, API docs present
- `README.md` with setup instructions and `.env.example`

---

## Suggested weekly rhythm (solo developer)

1. Pick one small, demonstrable feature.
2. Define its user story + acceptance criteria.
3. Design/update the database schema.
4. Implement backend endpoint + authorization.
5. Test the API + tenant boundaries.
6. Implement the frontend.
7. Test the complete workflow.
8. Update documentation + commit.

Start with Phase 0 if the repo isn't deployed yet; otherwise continue at Phase 1 (auth module is scaffolded — wire it to Neon and write the register/login tests first).
