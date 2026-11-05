# EduTrack

## MVP Scope, Feature Roadmap, and Technology Stack

**Project type:** Portfolio-grade, multi-tenant web application\
**Development approach:** Solo developer, modular monolith, incremental MVP releases\
**Primary stack:** PERN (PostgreSQL, Express, React, Node.js) with TypeScript\
**Database hosting:** Neon PostgreSQL free tier\
**Deployment target:** Vercel (frontend) + Render (backend)

------------------------------------------------------------------------

# 1. Project Overview

EduTrack is a multi-school student information and academic management system. It helps a school manage its academic year, student enrollment, classes, attendance, grades and academic reports.

**Initial target users:** Small and medium-sized private schools or educational institutions. The system can be adapted for other institutions after the core workflow is validated.

EduTrack should have its own deployment and its own database. It may reuse engineering patterns from other projects, but it should not share tenant data with them.

## Development principles

1.  Finish complete user workflows before adding advanced features.
2.  Use a modular monolith rather than microservices.
3.  Make the web application responsive before considering a native mobile app.
4.  Use synthetic/demo data in public portfolio environments.
5.  Keep the initial infrastructure within free-tier limits where practical.
6.  Treat security, tenant isolation, validation, and backups as foundational requirements, not optional enhancements.

------------------------------------------------------------------------

# 2. Technology Stack

  -----------------------------------------------------------------------
  Layer                   Technology              Purpose
  ----------------------- ----------------------- -----------------------
  Language                TypeScript              Type safety across
                                                  frontend and backend

  Frontend                React + Vite            Web application UI and
                                                  development server

  Styling                 Tailwind CSS            Responsive styling and
                                                  design system

  UI components           shadcn/ui (optional)    Reusable accessible
                                                  interface components

  Routing                 React Router            Client-side page
                                                  navigation

  Server state            TanStack Query          API requests, caching,
                                                  loading and mutation
                                                  states

  Forms                   React Hook Form         Form state and
                                                  submission

  Frontend validation     Zod                     Validate form inputs

  Backend                 Node.js + Express       REST API

  Backend validation      Zod                     Validate request
                                                  bodies, params and
                                                  query strings

  Database                PostgreSQL on Neon      Persistent relational
                                                  data

  ORM                     Prisma                  Schema, migrations and
                                                  database queries

  Authentication          Secure cookie-based     User authentication
                          sessions or
                          access/refresh token
                          design

  Password hashing        Argon2id or bcrypt      Store password hashes,
                                                  never plaintext
                                                  passwords

  API documentation       OpenAPI / Swagger       Document REST endpoints

  Testing                 Vitest + Supertest      Unit and API
                                                  integration tests

  Browser testing         Playwright (later)      End-to-end user
                                                  workflow tests

  Version control         Git + GitHub            Source control and
                                                  collaboration

  CI                      GitHub Actions          Automated linting,
                                                  tests and build checks

  Frontend hosting        Vercel Hobby            Host React frontend

  Backend hosting         Render Free             Host Express API for
                                                  demo use

  Database hosting        Neon Free               Host PostgreSQL

  File storage            Supabase Storage or     Store school documents
                          another suitable free   and logos
                          object-storage provider

  Date handling           date-fns                Date formatting and
                                                  calculations

  Logging                 Pino or structured      Application diagnostics
                          console logging
  -----------------------------------------------------------------------

### Stack implementation notes

-   Use a dedicated Neon project/database for EduTrack.
-   Do not use Render's temporary/free database option as the primary persistent database if its lifecycle does not fit the project.
-   Render free web services may sleep when inactive and can have cold starts.
-   Free storage, bandwidth, compute and database quotas can change. Check current provider limits before deployment.
-   Never commit `.env` files or production secrets to Git.
-   Use separate development and production environment variables.
-   Use a database connection pooler where appropriate for serverless or connection-limited environments.
-   Keep database backups. A free hosting plan is not a backup strategy.
-   Verify current provider terms, quotas, retention and commercial-use conditions before using the project with real institutions.

------------------------------------------------------------------------

# 3. Architecture and Engineering Foundation

Build this foundation first, then implement the EduTrack-specific modules.

## Foundation MVP

  -----------------------------------------------------------------------
  Module                              Required capabilities
  ----------------------------------- -----------------------------------
  Authentication                      Registration or invitation flow,
                                      login, logout, password hashing,
                                      password reset flow

  User management                     Create, view, update, deactivate
                                      users

  Roles and permissions               Role-based access control and
                                      permission checks on the server

  School/tenant management            Create and configure a school

  Tenant isolation                    Ensure every school-owned record is
                                      scoped to the current school

  Audit logs                          Record important actions, actor,
                                      target, timestamp and relevant
                                      changes

  Notifications                       In-app notifications and
                                      read/unread state

  File handling                       Validate file type and size; store
                                      files outside the relational
                                      database

  API foundation                      Consistent routes, validation,
                                      error handling and response formats

  Security                            Secure cookies, CSRF protection
                                      where applicable, rate limiting,
                                      input validation and authorization

  Testing                             Tests for authentication,
                                      permissions and tenant isolation

  Deployment                          Environment configuration, database
                                      migrations and CI build checks
  -----------------------------------------------------------------------

## Multi-tenancy rules

-   Every school-owned EduTrack record must belong to a school.
-   The backend must derive the user's authorized school from the authenticated session or token.
-   Do not trust a school ID supplied by the browser without checking membership and permissions.
-   Add tenant-aware database constraints and indexes.
-   Test that a user from one school cannot read, update or delete another school's records.
-   For the first release, use a single shared PostgreSQL database with a school ID on tenant-owned records. A database-per-tenant design is unnecessary for this portfolio MVP.

## Suggested backend structure

``` text
server/
├── src/
│   ├── config/
│   ├── middleware/
│   ├── modules/
│   │   ├── auth/
│   │   ├── users/
│   │   ├── schools/
│   │   ├── roles/
│   │   ├── notifications/
│   │   └── audit-logs/
│   ├── utils/
│   ├── app.ts
│   └── server.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── tests/
```

The EduTrack domain modules (section 4.5) are added under `modules/`.

------------------------------------------------------------------------

# 4. EduTrack Product Scope

## 4.1 User roles

  -----------------------------------------------------------------------
  Role                                Main responsibilities
  ----------------------------------- -----------------------------------
  Platform administrator              Manage the application and
                                      provision school tenants

  School administrator                Configure school information,
                                      academic years, users and academic
                                      structure

  Teacher                             Access assigned classes, record
                                      attendance and submit grades

  Student                             View their own attendance, grades
                                      and announcements

  Parent/guardian                     View information for linked
                                      children, subject to school
                                      permissions
  -----------------------------------------------------------------------

For the first MVP, prioritize school administrator and teacher workflows. Student and parent portals can be introduced after the core academic workflow works reliably.

## 4.2 EduTrack MVP phases

### MVP 1 --- School setup and access control

**Goal:** A school administrator can configure a school and securely manage access.

Features:

-   School registration or platform-admin provisioning.
-   School profile: name, address, contact information and logo.
-   Login and logout.
-   Secure password hashing.
-   Password reset workflow.
-   User creation and invitation.
-   User activation and deactivation.
-   Role assignment.
-   Role-based route and API authorization.
-   Academic year creation and activation.
-   Tenant isolation between schools.

**Acceptance criteria:**

-   A school administrator can access only their school's data.
-   An administrator can create and deactivate a teacher account.
-   A teacher cannot access administrator-only functions.
-   A user from School A cannot retrieve School B's records by changing an ID in an API request.

### MVP 2 --- Student and academic structure management

**Goal:** A school can create its academic structure and enroll students.

Features:

-   Student profiles.
-   Student identifier or student number.
-   Basic student contact and enrollment information.
-   Grade/year-level management.
-   Section/class management.
-   Subject management.
-   Teacher assignment to subjects or sections.
-   Student enrollment into an academic year and section.
-   Student search, filtering and pagination.
-   Student status: active, transferred, graduated or inactive.
-   Basic student record history.

**Acceptance criteria:**

-   An administrator can create a grade level, section and subject.
-   An administrator can assign a teacher to a class or subject.
-   An administrator can enroll a student into a section for an academic year.
-   A teacher sees only their assigned classes.

### MVP 3 --- Attendance management

**Goal:** A teacher can record and review attendance for assigned classes.

Features:

-   Daily attendance by class or section.
-   Attendance statuses: present, absent, late and excused.
-   Attendance date and recorder.
-   Attendance history per student.
-   Class attendance summary.
-   Attendance correction by authorized users.
-   Audit trail for attendance changes.
-   Daily and monthly attendance reports.

**Acceptance criteria:**

-   A teacher can record attendance for an assigned class.
-   The system prevents accidental duplicate attendance records for the same student and class date.
-   An authorized user can correct attendance, and the change is auditable.
-   An administrator can view attendance summaries.

### MVP 4 --- Grades and academic records

**Goal:** Teachers can submit grades and administrators can review academic results.

Features:

-   Grading periods such as quarters or semesters.
-   Configurable grading scale or calculation rules.
-   Grade entry per student, subject and grading period.
-   Draft and submitted grade states.
-   Grade review or approval by authorized staff.
-   Student academic history.
-   Grade summaries.
-   Printable report cards.
-   Audit history for grade changes.

**Acceptance criteria:**

-   A teacher can enter grades only for assigned subjects/classes.
-   The system validates grade values against the configured grading rules.
-   Submitted grades cannot be silently changed without authorization.
-   A report card displays the correct student, academic year, grading period and subjects.

### MVP 5 --- Dashboards and school communication

**Goal:** Users can see relevant academic information and school announcements.

Features:

-   Administrator dashboard: student counts, enrollment and attendance summaries.
-   Teacher dashboard: assigned classes, attendance tasks and pending grade submissions.
-   Student dashboard: own grades and attendance.
-   Parent/guardian dashboard: linked children's permitted academic information.
-   School announcements.
-   Class-specific announcements.
-   In-app notifications.
-   Printable or downloadable basic reports.

**Acceptance criteria:**

-   Each role sees an appropriate dashboard.
-   Students cannot view another student's academic records.
-   Parents can access only children explicitly linked to their account.
-   Announcements can be scoped to a school or class.

## 4.3 Features for later releases

Do not include these in the first release unless a core workflow depends on them.

### Academic operations

-   Class timetable and scheduling.
-   Teacher workload management.
-   Multiple campuses.
-   Transfer and graduation workflows.
-   Student document management.
-   Configurable report-card templates.
-   Bulk student import from CSV.

### Communication

-   Parent-teacher messaging.
-   Email notifications.
-   Scheduled announcements.
-   More granular notification preferences.

### Advanced features

-   QR-code attendance.
-   Scholarship management.
-   Tuition or payment tracking.
-   Advanced academic performance analytics.
-   At-risk student indicators.
-   Automated report generation.
-   Data export to Excel.
-   Mobile application.

## 4.4 Suggested domain modules

``` text
modules/
├── auth/
├── users/
├── schools/
├── academic-years/
├── grade-levels/
├── sections/
├── subjects/
├── teachers/
├── students/
├── enrollments/
├── attendance/
├── grading-periods/
├── grades/
├── report-cards/
├── announcements/
├── notifications/
└── audit-logs/
```

## 4.5 Data entities (initial planning)

Likely core entities:

-   School
-   User
-   Role
-   Permission
-   UserSchoolMembership
-   AcademicYear
-   GradeLevel
-   Section
-   Subject
-   TeacherProfile
-   StudentProfile
-   GuardianProfile
-   StudentGuardian
-   Enrollment
-   TeachingAssignment
-   AttendanceSession
-   AttendanceRecord
-   GradingPeriod
-   Grade
-   Announcement
-   Notification
-   AuditLog

The final schema should be designed around the chosen school rules. For example, enrollment should connect a student to a particular academic year and section rather than permanently storing a single section on the student profile.

------------------------------------------------------------------------

# 5. Solo Developer Roadmap

  Phase   Work                                                    Estimated effort
  ------- ----------------------------------------------------- ------------------
  0       Requirements, wireframes and database planning                1--2 weeks
  1       Shared foundation and deployment                              2--3 weeks
  2       School and academic structure                                 2--3 weeks
  3       Attendance and grades                                         2--3 weeks
  4       Dashboards, reports and testing                               2--3 weeks
  5       Documentation, security review and portfolio polish           1 week

**Estimated total:** Approximately 10--15 weeks of focused work. If development is part-time, expect a longer calendar duration. These are estimates, not guaranteed delivery dates.

## Recommended weekly workflow

1.  Choose one small, demonstrable feature.
2.  Define its user story and acceptance criteria.
3.  Design or update the database schema.
4.  Implement the backend endpoint and authorization.
5.  Test the API and tenant boundaries.
6.  Implement the frontend.
7.  Test the complete workflow.
8.  Update documentation and commit the finished work.

## Solo developer scope-control rules

-   Do not implement every role's dashboard before the main workflow is complete.
-   Do not add AI, payments or native mobile apps to the first MVP.
-   Do not build microservices.
-   Do not over-engineer a reusable component before it is needed.
-   Do not treat a feature as complete until authorization, validation, error states and tests are included.
-   Keep a `BACKLOG.md` for features intentionally postponed.

------------------------------------------------------------------------

# 6. Free-Tier Deployment Plan

  -----------------------------------------------------------------------
  Component               Suggested provider      Initial use
  ----------------------- ----------------------- -----------------------
  EduTrack frontend       Vercel Hobby            React app

  EduTrack API            Render Free             Express API

  EduTrack database       Neon Free               PostgreSQL

  File storage            Supabase Storage or     Logos and documents
                          another free
                          object-storage service

  Source control          GitHub                  Repository and CI
  -----------------------------------------------------------------------

## Free-tier considerations

-   Free plans have quotas and terms that can change.
-   Render free services can sleep and have cold starts.
-   Database compute, storage and network transfer are limited.
-   Object storage has file-size and bandwidth limits.
-   Vercel Hobby is intended for personal/non-commercial use; check its current terms before commercial use.
-   Do not promise production-grade uptime using free infrastructure.
-   Use synthetic data in public demos.
-   Keep backups independent of the hosting provider.
-   If a real institution adopts the system, reassess privacy, security, retention, availability, support and operating costs before onboarding real data.

------------------------------------------------------------------------

# 7. Security and Privacy Checklist

-   [ ] Passwords are hashed using Argon2id or bcrypt.
-   [ ] Authentication cookies are secure, HttpOnly and appropriately configured.
-   [ ] CSRF protections are applied when using cookie-based authentication.
-   [ ] API endpoints validate all inputs.
-   [ ] Authorization is enforced on the backend.
-   [ ] Tenant isolation is tested for read, create, update and delete operations.
-   [ ] Sensitive information is not placed in URLs or logs.
-   [ ] File uploads validate size, MIME type and actual file content where practical.
-   [ ] Public files do not expose private records.
-   [ ] Rate limiting is enabled for sensitive endpoints.
-   [ ] Secrets are stored in deployment environment variables.
-   [ ] Database backups and restoration are tested.
-   [ ] Audit logs record sensitive administrative changes.
-   [ ] Demo environments use fictional records.
-   [ ] Student personal data is minimized and protected.

Student records require particularly careful access control and privacy practices. Obtain proper authorization before using real records.

------------------------------------------------------------------------

# 8. Portfolio Deliverables

-   [ ] Public GitHub repository.
-   [ ] Clear README with problem statement and features.
-   [ ] Architecture diagram.
-   [ ] ERD/database diagram.
-   [ ] API documentation.
-   [ ] Demo account for each major role.
-   [ ] Seeded synthetic demo data.
-   [ ] Screenshots or short demo video.
-   [ ] Deployed frontend and API.
-   [ ] Setup instructions for local development.
-   [ ] Environment variable example file (`.env.example`) without secrets.
-   [ ] Tests for critical workflows and tenant isolation.
-   [ ] Known limitations and future roadmap.

## Suggested demo scenario

1.  School administrator creates an academic year.
2.  Administrator creates grade levels, sections and subjects.
3.  Administrator adds a teacher and enrolls students.
4.  Teacher records class attendance.
5.  Teacher submits grades.
6.  Student or parent views the report card.

------------------------------------------------------------------------

# 9. Final Recommendation

The first milestone should be small:

1.  Create the React and Express applications.
2.  Connect Prisma to a Neon PostgreSQL database.
3.  Implement authentication.
4.  Implement school tenant isolation.
5.  Add school, user and role management.
6.  Deploy a working skeleton.

Then build student enrollment, attendance and grades incrementally.

A complete, secure and demonstrable workflow is more valuable in a portfolio than a large list of unfinished features.
