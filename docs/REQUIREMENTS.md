# TeamFlow — Requirements & Tech Specification

> A multi-tenant project management & team collaboration platform (Jira/Linear-style).
> Built to demonstrate **senior-level** full-stack + DevOps capability.

---

## 1. Project Goal

Build a production-grade, multi-tenant SaaS where organizations manage projects,
boards, and tasks with **real-time collaboration**, **role-based access control**,
**background jobs**, **observability**, and a **full CI/CD + containerized deployment**.

**CV / Seniority signals this project proves:**
- Multi-tenant architecture with tenant isolation (PostgreSQL Row-Level Security)
- Real-time systems at scale (WebSockets + Redis pub/sub adapter)
- RBAC with guards & policies (org / admin / member / viewer)
- Asynchronous processing (BullMQ job queues)
- Caching, rate limiting, idempotency
- Observability (structured logs, metrics, tracing, health checks)
- Testing pyramid (unit + integration + e2e)
- DevOps: Docker, docker-compose, CI/CD, IaC, monitoring

---

## 2. Tech Stack (Decisions + Rationale)

### Core
| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | **Next.js 15 (App Router, TypeScript)** | SSR/RSC, routing, modern React |
| Backend | **NestJS (TypeScript)** | Modular, DI, enterprise-grade structure |
| Database | **PostgreSQL** | Relational integrity, transactions, RLS, JSONB |
| ORM | **Prisma** | Type-safe, great migrations, fast DX |
| Cache / PubSub / Queue broker | **Redis** | Caching, socket scaling, BullMQ backend |
| Real-time | **Socket.IO** (+ `@socket.io/redis-adapter`) | Rooms, presence, horizontal scaling |
| Background jobs | **BullMQ** | Email, notifications, exports, cleanup |

### Frontend libraries
| Purpose | Library |
|---------|---------|
| Styling | **Tailwind CSS** |
| Component primitives | **shadcn/ui** (Radix UI under the hood) |
| Server state / data fetching | **TanStack Query (React Query)** |
| Client state | **Zustand** (light global state) |
| Forms + validation | **React Hook Form** + **Zod** |
| Drag & drop (boards) | **@dnd-kit** |
| Real-time client | **socket.io-client** |
| Charts (admin analytics) | **Recharts** |
| Icons | **lucide-react** |
| Dates | **date-fns** |
| HTTP client | **Axios** (with interceptors) |

### Backend libraries
| Purpose | Library |
|---------|---------|
| Validation | **class-validator** + **class-transformer** (or **Zod** via pipe) |
| Auth | **@nestjs/passport**, **passport-jwt**, **bcrypt** |
| Config | **@nestjs/config** + Zod-validated env schema |
| ORM | **Prisma** + `@prisma/client` |
| WebSockets | **@nestjs/websockets**, **@nestjs/platform-socket.io** |
| Queues | **@nestjs/bullmq**, **bullmq** |
| Caching | **@nestjs/cache-manager**, **cache-manager-redis-store** |
| Rate limiting | **@nestjs/throttler** |
| API docs | **@nestjs/swagger** (OpenAPI) |
| Logging | **nestjs-pino** (structured JSON logs) |
| Email | **nodemailer** (+ MJML or React Email templates) |
| File storage | **AWS S3 SDK** (or MinIO locally) with presigned URLs |
| Scheduling | **@nestjs/schedule** (cron jobs) |

### Testing
| Type | Tooling |
|------|---------|
| Unit / integration (backend) | **Jest** + **@nestjs/testing** |
| API e2e (backend) | **Supertest** |
| Frontend unit/component | **Vitest** + **React Testing Library** |
| E2E (full app) | **Playwright** |
| Test DB | **Testcontainers** (real Postgres in Docker) |

### DevOps / Infrastructure
| Purpose | Tooling |
|---------|---------|
| Containers | **Docker** + multi-stage builds |
| Local orchestration | **docker-compose** (api, web, postgres, redis, minio) |
| CI/CD | **GitHub Actions** (lint, test, build, push image, deploy) |
| Registry | **GitHub Container Registry (GHCR)** |
| Reverse proxy | **Nginx** (or Traefik) |
| Orchestration (advanced) | **Kubernetes** (optional stretch — Helm charts) |
| Infrastructure as Code | **Terraform** (optional stretch) |
| Monitoring | **Prometheus** + **Grafana** |
| Error tracking | **Sentry** |
| Logs aggregation (stretch) | **Loki** or **ELK** |

### Tooling / DX
| Purpose | Tool |
|---------|------|
| Monorepo (optional) | **pnpm workspaces** (or **Turborepo**) |
| Linting | **ESLint** |
| Formatting | **Prettier** |
| Git hooks | **Husky** + **lint-staged** |
| Commit convention | **Commitlint** (Conventional Commits) |
| Package manager | **pnpm** |

---

## 3. Domain Model (high level)

```
Organization (tenant)
 ├── Membership (User ↔ Organization, with Role)
 ├── Project
 │    └── Board
 │         └── Column (e.g. Todo / In Progress / Done)
 │              └── Task
 │                   ├── Comment
 │                   ├── Attachment
 │                   ├── Assignee(s)
 │                   └── Label(s)
 ├── Invitation
 ├── Notification
 └── AuditLog

User (global identity, can belong to many orgs)
```

**Roles:** `OWNER`, `ADMIN`, `MEMBER`, `VIEWER` (scoped per organization).

---

## 4. Functional Requirements

### 4.1 Authentication & Accounts
- [ ] Email/password sign-up & login (JWT access + refresh tokens)
- [ ] Refresh token rotation, logout (token revocation)
- [ ] Password reset via email
- [ ] Email verification
- [ ] (Stretch) OAuth login (Google/GitHub)

### 4.2 Organizations (Multi-tenancy)
- [ ] Create organization (user becomes OWNER)
- [ ] Invite members by email (with role)
- [ ] Accept/decline invitations
- [ ] Switch active organization
- [ ] Manage member roles / remove members
- [ ] Tenant data isolation enforced (every query scoped to org)

### 4.3 Projects & Boards
- [ ] CRUD projects within an organization
- [ ] CRUD boards within a project
- [ ] CRUD columns; reorder columns
- [ ] Project members & permissions

### 4.4 Tasks
- [ ] CRUD tasks
- [ ] Drag & drop tasks across columns / reorder
- [ ] Assign users, set priority, due date, labels
- [ ] Comments with @mentions
- [ ] File attachments (S3 presigned upload)
- [ ] Activity history per task

### 4.5 Real-time (WebSockets)
- [ ] Live board updates (task moved/created/edited broadcast to room)
- [ ] User presence (who's viewing a board)
- [ ] Live typing/cursor indicators (stretch)
- [ ] Real-time notifications

### 4.6 Notifications
- [ ] In-app notifications (assigned, mentioned, invited)
- [ ] Email notifications (async via BullMQ)
- [ ] Mark read / read-all

### 4.7 Admin Dashboard
- [ ] Org-level admin: members, projects, usage stats
- [ ] Analytics: tasks created over time, completion rate, active users (charts)
- [ ] Audit log viewer
- [ ] (Platform super-admin stretch): manage all orgs, system metrics

### 4.8 Search & Filtering
- [ ] Filter tasks (assignee, label, priority, status, due date)
- [ ] Full-text search across tasks (Postgres full-text)

---

## 5. Non-Functional Requirements

- **Security:** RBAC guards, RLS tenant isolation, rate limiting, input validation,
  password hashing (bcrypt), helmet headers, CORS policy, no secrets in code.
- **Performance:** Redis caching for hot reads, pagination on all lists, DB indexes,
  N+1 query avoidance.
- **Reliability:** Idempotent endpoints where needed, retry logic on jobs, graceful
  shutdown, health/readiness endpoints.
- **Scalability:** Stateless API (scale horizontally), Redis socket adapter, queue workers
  scale independently.
- **Observability:** Structured JSON logs (request id correlation), Prometheus metrics,
  Sentry error tracking, OpenTelemetry tracing (stretch).
- **Maintainability:** Modular NestJS structure, DTOs, consistent error handling,
  OpenAPI docs, >70% test coverage on core modules.

---

## 6. Architecture Overview

```
                 ┌─────────────┐
   Browser ────► │  Next.js    │ (SSR/RSC + client)
                 └──────┬──────┘
                        │ REST + WebSocket
                 ┌──────▼──────┐        ┌──────────────┐
                 │   NestJS    │◄──────►│   Redis      │ (cache, pubsub, queue)
                 │   API       │        └──────────────┘
                 └──┬───────┬──┘               ▲
                    │       │                  │
            ┌───────▼──┐ ┌──▼──────────┐  ┌────┴───────┐
            │ Postgres │ │ BullMQ      │  │ Socket.IO  │
            │  (RLS)   │ │ Workers     │  │ Gateway    │
            └──────────┘ └─────────────┘  └────────────┘
                    │
            ┌───────▼──┐
            │  S3/MinIO│ (attachments)
            └──────────┘
```

---

## 7. MVP Scope (Weeks 1–6) vs Later

### MVP (must-have for the 4–6 week build)
Auth (login/register/refresh) · Organizations + invites · Projects · Boards/Columns ·
Tasks CRUD + drag-drop · Real-time board updates · In-app notifications · Basic admin
dashboard · RBAC · Dockerized + docker-compose · CI pipeline (lint+test+build) · Deploy.

### Phase 2 (after MVP)
Email notifications · File attachments · Full-text search · Analytics charts · Audit log ·
Password reset/email verify · Sentry + Prometheus/Grafana.

### Phase 3 (stretch / advanced senior flex)
OAuth · Kubernetes + Helm · Terraform IaC · OpenTelemetry tracing · Loki logs ·
Platform super-admin · Live cursors.

---

## 8. Repository Structure (planned)

```
teamflow/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   └── shared/       # shared types / zod schemas (optional)
├── docker/
│   ├── docker-compose.yml
│   └── Dockerfile.*
├── .github/workflows/  # CI/CD
└── docs/
    └── REQUIREMENTS.md
```
