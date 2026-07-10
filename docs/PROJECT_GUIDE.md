# Flowdeck — Project Guide

Everything we've built, why we built it that way, and how to run it.
Read this first when returning to the project after a break.

---

## Table of Contents

1. [What Flowdeck is](#1-what-flowdeck-is)
2. [Tech stack & why](#2-tech-stack--why)
3. [Repository layout](#3-repository-layout)
4. [Quick start (returning to the project)](#4-quick-start-returning-to-the-project)
5. [Docker: Postgres + Redis](#5-docker-postgres--redis)
6. [Prisma: setup, concepts, and every command](#6-prisma-setup-concepts-and-every-command)
7. [NestJS concepts you need to know](#7-nestjs-concepts-you-need-to-know)
8. [Feature: Authentication](#8-feature-authentication)
9. [Feature: Organizations & multi-tenancy](#9-feature-organizations--multi-tenancy)
10. [Feature: Invitations (in progress)](#10-feature-invitations-in-progress)
11. [Postman from scratch](#11-postman-from-scratch)
12. [Git workflow](#12-git-workflow)
13. [Troubleshooting](#13-troubleshooting)
14. [Command cheat sheet](#14-command-cheat-sheet)

---

## 1. What Flowdeck is

A **multi-tenant project-management SaaS** (Jira/Linear-style). Organizations own projects,
projects own boards, boards own tasks. Built to demonstrate senior-level full-stack + DevOps.

**Multi-tenant** means: many independent organizations share one database and one running app,
but **can never see each other's data**. Enforcing that isolation is the hardest and most
valuable part of the project.

Full requirements: [REQUIREMENTS.md](./REQUIREMENTS.md)

---

## 2. Tech stack & why

| Layer | Choice | Why this and not the alternative |
|---|---|---|
| Package manager | **pnpm** | Disk-efficient, blocks "phantom dependencies", and has first-class **workspaces** — which we need to share types between frontend and backend. |
| Repo structure | **Monorepo** | `apps/web` and `apps/api` share TypeScript types. Two separate repos would mean copy-pasting types that silently drift apart. |
| Backend | **NestJS** | Enforces modular architecture (modules/controllers/services + dependency injection). Scales to large teams. |
| Frontend | **Next.js (App Router)** | SSR/React Server Components, folder-based routing. |
| Database | **PostgreSQL** | Our data is deeply relational (org → membership → user). Postgres gives foreign keys, transactions, JSONB, full-text search, and Row-Level Security. MongoDB would be the wrong tool here. |
| ORM | **Prisma** | Type-safe client generated from the schema; excellent migrations. |
| Cache / queues / pubsub | **Redis** | One tool, three roles: caching, Socket.IO scaling, BullMQ job broker. |
| Styling | **Tailwind + shadcn/ui** | Modern, customizable. Do **not** mix with MUI — two styling systems = bloat + specificity wars. |

---

## 3. Repository layout

```
flowdeck/
├── apps/
│   ├── api/                    # NestJS backend  (port 3001)
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # single source of truth for the DB
│   │   │   └── migrations/     # version history of the DB (COMMIT THESE)
│   │   ├── prisma.config.ts    # Prisma 7 config (loads .env, points to schema)
│   │   ├── .env                # real secrets  (GIT-IGNORED)
│   │   ├── .env.example        # template      (committed)
│   │   └── src/
│   │       ├── main.ts             # bootstrap: CORS, ValidationPipe, port
│   │       ├── app.module.ts       # root module — every module must be imported here
│   │       ├── generated/prisma/   # Prisma-generated client (GIT-IGNORED, rebuildable)
│   │       ├── prisma/             # PrismaModule + PrismaService
│   │       ├── users/              # UsersModule + UsersService
│   │       ├── auth/               # auth feature (see §8)
│   │       ├── organizations/      # orgs + tenant guard (see §9)
│   │       └── invitations/        # invites (see §10)
│   └── web/                    # Next.js frontend (port 3000)
├── packages/                   # (future) shared types between web & api
├── postman/                    # importable API collection + environment
├── docs/
├── docker-compose.yml          # Postgres + Redis
├── pnpm-workspace.yaml         # declares apps/* and packages/* as projects
└── package.json                # root: scripts only, marked "private"
```

**Key rule:** all application source lives in `src/`. The `prisma/` folder holds only
`schema.prisma` and `migrations/` — never `.ts` source files.

---

## 4. Quick start (returning to the project)

```bash
cd ~/Desktop/flowdeck

# 1. Make sure Docker Desktop is RUNNING, then start the database + cache
pnpm db:up                  # = docker compose up -d
docker compose ps           # both should be "Up (healthy)"

# 2. Install deps (only if package.json changed)
pnpm install

# 3. Make sure the DB schema is current + client is generated
cd apps/api
npx prisma migrate deploy   # apply any migrations not yet applied
npx prisma generate         # regenerate the typed client

# 4. Run the backend (from the repo root)
cd ../..
pnpm dev:api                # http://localhost:3001

# 5. Run the frontend (separate terminal)
pnpm dev:web                # http://localhost:3000
```

**Ports:** web `3000` · api `3001` · Postgres `5433` (host) · Redis `6379`

> Postgres is on **5433**, not the usual 5432, because a **native PostgreSQL 18 install**
> on this Windows machine already occupies 5432. See §13.

---

## 5. Docker: Postgres + Redis

We run the database and cache in **containers** instead of installing them on Windows.
Benefits: nothing pollutes your OS, the environment is identical across your machine / CI /
production, and it's one command to start.

### `docker-compose.yml` — what each part means

```yaml
name: flowdeck              # pins the Compose "project name" (see gotcha below)

services:
  postgres:
    image: postgres:16-alpine     # pinned version (never use :latest) + tiny Linux base
    container_name: flowdeck-postgres
    restart: unless-stopped       # auto-restart on crash/reboot
    environment:                  # creates the user/password/database on first boot
      POSTGRES_USER: flowdeck
      POSTGRES_PASSWORD: flowdeck
      POSTGRES_DB: flowdeck
    ports:
      - "5433:5432"               # HOST:CONTAINER — reach it at localhost:5433
    volumes:
      - postgres_data:/var/lib/postgresql/data   # data survives container deletion
    healthcheck:                  # Docker knows when Postgres is truly ready
      test: ["CMD-SHELL", "pg_isready -U flowdeck"]

volumes:
  postgres_data:                  # named volumes must be declared here
  redis_data:
```

### Volumes — the one concept to understand

A **container is disposable** — delete it and everything inside is gone. A **volume** is
storage that lives *outside* the container. `postgres_data:/var/lib/postgresql/data` means
*"whatever Postgres writes to that folder, actually store it in the `postgres_data` volume."*

Result: `docker compose down` then `up` → **your data is still there.**
Only `docker compose down -v` (the `-v`!) deletes volumes and wipes data.

### Gotcha we hit: the Compose project name

Compose names its "project" after the **folder** it runs in. We renamed the folder
`project` → `flowdeck`, which orphaned the old containers/volumes and caused a
"container name already in use" error. Fixed by pinning `name: flowdeck` at the top of
`docker-compose.yml`, so the project identity no longer depends on the folder name.

### Commands

```bash
pnpm db:up        # docker compose up -d      (start in background)
pnpm db:down      # docker compose down       (stop; DATA IS KEPT)
pnpm db:logs      # docker compose logs -f    (follow logs)
docker compose ps # status + health

docker compose down -v        # ⚠️ stop AND DELETE volumes (wipes the database)
```

Connect to Postgres directly:
```bash
docker exec flowdeck-postgres psql -U flowdeck -d flowdeck -c 'SELECT * FROM "User";'
```
- `docker exec flowdeck-postgres` → run a command inside that container
- `psql -U flowdeck -d flowdeck` → the Postgres client, as user `flowdeck`, on db `flowdeck`
- `-c 'SQL'` → run one SQL command and exit
- Double quotes around `"User"` because Postgres lowercases unquoted names, and Prisma
  created the table with a capital `U`.

---

## 6. Prisma: setup, concepts, and every command

### The mental model

```
schema.prisma          →  prisma migrate dev  →  SQL migration file + real DB tables
(what you WANT)                                       │
                       →  prisma generate     →  src/generated/prisma  (typed client)
                                                      │
                                              your code: prisma.user.findMany()
```

- **`schema.prisma`** — you write this. Single source of truth for your data model.
- **Migrations** — version control for the database structure. Committed to git.
- **Generated client** — machine-written TypeScript that gives you type-safe queries.
  **Never edit it. Never commit it** (it's git-ignored and rebuildable).

### Our Prisma 7 setup (important — v7 changed a lot)

`apps/api/prisma/schema.prisma`:
```prisma
generator client {
  provider     = "prisma-client"
  output       = "../src/generated/prisma"  // MUST be inside src/ so it compiles with the app
  moduleFormat = "cjs"                      // NestJS is CommonJS; without this you get
  runtime      = "nodejs"                   // "exports is not defined in ES module scope"
}

datasource db {
  provider = "postgresql"
}
```

`apps/api/prisma.config.ts` — Prisma 7 reads the DB url from here (not from the schema):
```ts
import "dotenv/config";                       // loads apps/api/.env
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env["DATABASE_URL"] },
});
```

**Prisma 7 uses driver adapters.** The client no longer takes a URL string — it needs a real
Postgres driver. That's why `PrismaService` looks like this:

```ts
// src/prisma/prisma.service.ts
@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    super({ adapter });   // super() = call the parent PrismaClient's constructor
  }
}
```
(Package: `@prisma/adapter-pg`. Note it takes `connectionString`, not `url`.)

`PrismaModule` is marked `@Global()` so `PrismaService` can be injected anywhere without
importing the module everywhere.

### Every Prisma command we use

| Command | What it does | When |
|---|---|---|
| `npx prisma migrate dev --name <name>` | Diffs schema vs DB → **creates** a migration file, applies it, regenerates client | **Development**, every time you change `schema.prisma` |
| `npx prisma migrate deploy` | **Applies** existing migration files only (never creates) | Production / CI / after cloning |
| `npx prisma generate` | Regenerates the typed client from the schema | After a schema change, or when types look stale |
| `npx prisma validate` | Checks the schema for errors | Before migrating, if unsure |
| `npx prisma format` | Auto-formats/aligns `schema.prisma` | Anytime |
| `npx prisma studio` | Opens a GUI at `localhost:5555` to browse/edit data | Inspecting data |
| `npx prisma migrate status` | Shows applied vs pending migrations | Checking DB state |
| `npx prisma migrate reset` | ⚠️ **Wipes the DB** and replays all migrations | Dev only, for a clean slate |

**The workflow, always:**
```
edit schema.prisma  →  npx prisma migrate dev --name describe_change
                    →  (if types look wrong) npx prisma generate
                    →  (in VS Code) Ctrl+Shift+P → "TypeScript: Restart TS Server"
                    →  git commit schema.prisma + the new migrations/ folder
```

### Golden rules
- **Always commit migration files** — they're the DB's history. Other machines/CI replay them.
- **Never edit an applied migration.** Need a change? Write a *new* migration.
- **`migrate reset` destroys data** — dev only.

### Our migration history
```
20260607170055_init                 → User, Organization, Membership, Role enum
20260614064248_add_refresh_token    → User.hashedRefreshToken
20260708115624_add_invitations      → Invitation model + InvitationStatus enum
```

### Key schema concepts we used

```prisma
model Membership {
  id   String @id @default(uuid())
  role Role   @default(MEMBER)

  userId String
  user   User @relation(fields: [userId], references: [id], onDelete: Cascade)

  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  @@unique([userId, organizationId])   // a user can't join the same org twice
  @@index([organizationId])            // fast "all members of org X" queries
}
```

- **Why a `Membership` table instead of a `role` column on `User`?** Because a user can be
  `OWNER` of one org and `VIEWER` of another. The role belongs to the *relationship*, not to
  the user. Many-to-many **with extra data** → explicit join table.
- **`@relation(fields: [userId], references: [id])`** — `userId` is the real foreign-key
  column; `user` is a navigation property (not a column) letting you write `membership.user`.
- **`onDelete: Cascade`** — delete the user → their memberships are auto-deleted (no orphans).
- **`@@unique([userId, organizationId])`** — composite uniqueness, enforced by the database.
  It also gives Prisma a compound lookup key: `where: { userId_organizationId: {...} }`.

### `select` vs `include` (a security habit)

```ts
this.prisma.membership.findMany({
  where: { organizationId },
  include: { user: { select: { id: true, email: true, name: true } } },
});
```
- **`include`** → also fetch the related record.
- **`select`** → return **only** these fields.

Without the `select`, `include: { user: true }` returns **`passwordHash` and
`hashedRefreshToken` in the API response.** Always `select` safe fields on `User`.

---

## 7. NestJS concepts you need to know

### The building blocks

| Thing | Decorator | Job | Goes in `@Module` under |
|---|---|---|---|
| **Module** | `@Module()` | A feature box that groups related code | — |
| **Controller** | `@Controller()` | Handles HTTP routes (`@Get`, `@Post`) | `controllers` |
| **Service** | `@Injectable()` | Business logic, DB access | `providers` |
| **Guard** | `@Injectable()` + `implements CanActivate` | "Is this request allowed?" | `providers` (or used via `@UseGuards`) |
| **Strategy** | `@Injectable()` + `PassportStrategy` | One way of authenticating | `providers` |

> ⚠️ **Common mistake we hit twice:** a strategy/service put in `controllers` instead of
> `providers`. Rule: `@Controller` → `controllers`. Everything else `@Injectable` → `providers`.

> ⚠️ **The other mistake we hit twice:** creating a module's files but forgetting to add it to
> `app.module.ts`'s `imports`. Result: **404** on all its routes. A module only exists once
> something imports it, ultimately reaching `AppModule`.

### Dependency Injection (DI)

You **declare** what you need; Nest **provides** it. You never write `new SomeService()`.

```ts
constructor(private readonly prisma: PrismaService) {}
```
This one line does three things:
1. Tells Nest "inject a `PrismaService` here."
2. `private readonly` is a **TypeScript parameter-property shorthand** — it *creates* the
   property `this.prisma` and assigns the injected value.
3. `readonly` prevents reassignment.

Equivalent long form:
```ts
private readonly prisma: PrismaService;
constructor(prisma: PrismaService) { this.prisma = prisma; }
```

So `this.prisma` **is** a property of the class — created by the constructor.

For another module's service to be injectable, the owning module must `exports:` it, and the
consuming module must `imports:` it. `@Global()` (like `PrismaModule`) skips that requirement.

### The two meanings of "import" (this confuses everyone)

| | What it is | Removed by `@Global()` / `isGlobal`? |
|---|---|---|
| `import { X } from 'y'` (top of file) | TypeScript: "what is this symbol?" | ❌ **Never** — always required |
| `X` in a `@Module({ imports: [...] })` | NestJS DI: "wire this module in" | ✅ Yes |

`isGlobal: true` on `ConfigModule` means you don't add `ConfigModule` to every module's
`imports` array — but you **still** need the TypeScript `import` line to reference
`ConfigService`.

### Decorators

Functions attached with `@` that add metadata/behavior. Four kinds:

| Kind | Example |
|---|---|
| Class | `@Controller()`, `@Module()`, `@Injectable()` |
| Method | `@Get()`, `@Post()`, `@UseGuards()`, `@HttpCode()` |
| Property | `@IsEmail()`, `@MinLength()` (in DTOs) |
| Parameter | `@Body()`, `@Param()`, `@CurrentUser()` |

**Parameter decorators tell Nest what value to put in a parameter.** Controller methods are
called *by Nest*, not by you, so each parameter needs a source:
```ts
me(@CurrentUser() user: AuthUser) {}
//  └ decorator: the SOURCE (request.user)
//                └ name: yours to choose
//                      └ type: TypeScript safety
```
It's **one** parameter, not two things.

**When to create your own:**
- `createParamDecorator` — you keep extracting the same thing from requests (`@CurrentUser`).
- `SetMetadata` — you need to *tag* routes for a guard to read later (`@Roles('OWNER')`).

### DTOs + the global ValidationPipe

A **DTO** (Data Transfer Object) is a class describing the shape of an incoming request body,
with validation rules as decorators:
```ts
export class RegisterDto {
  @IsEmail()    email: string;
  @MinLength(8) password: string;
}
```

In `main.ts` we register the pipe **globally**, so it runs on every route:
```ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,             // strip fields not in the DTO
  forbidNonWhitelisted: true,  // 400 if unknown fields are sent
  transform: true,             // convert JSON → DTO instance, coerce types
}));
```
- A **pipe** runs *before* the controller: it validates/transforms. Invalid → automatic
  **400**, controller never runs.
- **`whitelist`** prevents **mass-assignment attacks** — a client can't sneak in
  `{ "isAdmin": true }` hoping you save it.

### Exceptions → HTTP status codes

Just `throw`; Nest maps it:

| Throw | Response |
|---|---|
| `ConflictException` | 409 |
| `UnauthorizedException` | 401 |
| `ForbiddenException` | 403 |
| `NotFoundException` | 404 |
| `BadRequestException` | 400 |

No manual `res.status(...)`.

### Guards vs Strategies

| | Strategy | Guard |
|---|---|---|
| What | the **logic** of authenticating (where's the credential, is it valid, who is the user) | the **trigger** that runs a strategy on a route |
| Defined | once, in `providers` | applied per-route: `@UseGuards(X)` |
| Ours | `JwtStrategy` (`'jwt'`), `JwtRefreshStrategy` (`'jwt-refresh'`) | `JwtAuthGuard`, `JwtRefreshGuard`, `OrgRolesGuard` |

**Create one strategy per authentication method.** We have two because access tokens and
refresh tokens use different secrets and different validation rules.

A strategy always answers two questions:
1. `super({...})` — *where* is the credential and *how* do I verify it?
2. `validate()` — it's authentic; *who* is this user? → whatever you return becomes
   **`request.user`**.

**Guard execution order:** global → controller-level → method-level. That's why
`JwtAuthGuard` (controller) runs before `OrgRolesGuard` (method) and `request.user` is
already set.

---

## 8. Feature: Authentication

Files: `src/auth/`, `src/users/`

### Why two modules?
- **`UsersModule`** — users *as data* (create, find by email/id). Knows nothing about passwords or tokens.
- **`AuthModule`** — *authenticating* (hash, verify, issue tokens). **Uses** `UsersService`.

Separation of concerns: later features need `UsersService` without caring about auth.

### Password hashing (bcrypt)
```ts
const passwordHash = await bcrypt.hash(dto.password, 12);      // store this
const ok = await bcrypt.compare(dto.password, user.passwordHash); // verify
```
- Hashing is **one-way** — you can never decrypt the stored hash. You re-hash the attempt and compare.
- `12` = salt rounds (work factor). Deliberately slow → brute-forcing stolen hashes is impractical.

### Two tokens, and why

| Token | TTL | Sent on | Purpose |
|---|---|---|---|
| **Access** | 15 min | every protected request | proves who you are |
| **Refresh** | 7 days | only `POST /auth/refresh` | mints a new access token without re-login |

Short access token = small damage window if stolen. Refresh token = user isn't logged out
every 15 minutes. **Different secrets** (`JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET`) keep the
two token types cryptographically distinct — an access token can't be replayed as a refresh token.

### Refresh rotation + server-side revocation
We store **bcrypt(refreshToken)** in `User.hashedRefreshToken`:
- Every `/auth/refresh` issues a **new** refresh token and overwrites the stored hash →
  the old one is dead (**rotation**).
- `/auth/logout` sets it to `null` → refresh stops working (**revocation**).
- We store a *hash*, never the raw token — a DB leak doesn't hand out usable sessions.

### Endpoints
| Method | Route | Auth | Returns |
|---|---|---|---|
| POST | `/auth/register` | none | 201 + `{accessToken, refreshToken, user}` |
| POST | `/auth/login` | none | 200 + `{accessToken, refreshToken, user}` |
| GET | `/auth/me` | access token | current user |
| POST | `/auth/refresh` | **refresh** token | 200 + new token pair |
| POST | `/auth/logout` | access token | 200, clears stored refresh hash |

### Security details worth knowing
- Login returns the **same** `401 "Invalid credentials"` whether the email doesn't exist *or*
  the password is wrong. Different messages would leak which emails are registered
  (**user enumeration**).
- `@HttpCode(HttpStatus.OK)` on login: `POST` defaults to **201 Created**, but login creates
  nothing → **200 OK** is the correct semantic.
- JWT payload is minimal: `{ sub: userId, email }`. `sub` is the JWT standard for "subject".
  JWTs are **readable by anyone** who holds them (just not forgeable) — never put secrets in them.
- `config.getOrThrow('JWT_ACCESS_SECRET')` instead of `.get()`: the app **refuses to start**
  if the secret is missing (fail-fast) instead of silently running with `undefined`.

---

## 9. Feature: Organizations & multi-tenancy

Files: `src/organizations/`

### Creating an org uses a transaction

Creating an organization must **also** create the OWNER membership. If the second write failed,
you'd have an org nobody can access. So both happen atomically:

```ts
return this.prisma.$transaction(async (tx) => {
  const organization = await tx.organization.create({ data: { name, slug } });
  await tx.membership.create({
    data: { userId, organizationId: organization.id, role: 'OWNER' },
  });
  return organization;
});
```

- `$transaction(async (tx) => {...})` — all operations using **`tx`** commit together, or all
  roll back if anything throws.
- ⚠️ **Inside the callback, always use `tx`**, never `this.prisma` — the latter would run
  *outside* the transaction and wouldn't roll back.

**When to reach for a transaction:** any time multiple writes must stay consistent with each other.

### Tenant isolation — the security core

The naive version is broken:
```ts
@Get(':id/members')
findMembers(@Param('id') id: string) { ... }   // ❌ any logged-in user can read ANY org
```
Being **logged in is not enough**. You must verify the user **belongs to that org**. This class
of bug is **"Broken Access Control" — #1 on the OWASP Top 10.**

### `OrgRolesGuard` — one guard, two jobs

```ts
const membership = await this.prisma.membership.findUnique({
  where: { userId_organizationId: { userId: request.user.id, organizationId } },
});
if (!membership) throw new ForbiddenException('Not a member');   // 1. tenant isolation

const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
  ctx.getHandler(), ctx.getClass(),
]);
if (requiredRoles?.length && !requiredRoles.includes(membership.role)) {
  throw new ForbiddenException('Insufficient role');             // 2. RBAC
}
```

1. **Tenant isolation** — no `Membership` row linking user↔org → **403**.
2. **RBAC** — if the route is tagged `@Roles('OWNER','ADMIN')` and your role isn't in the list → **403**.

`Reflector` reads metadata that `@Roles()` attached via `SetMetadata`. `getAllAndOverride`
checks the method first, then the controller.

**Typing the request** (this is what caused our ESLint "unsafe any" errors):
```ts
interface OrgRequest extends Request {
  user: AuthUser;
  membership?: MembershipModel;
}
const request = ctx.switchToHttp().getRequest<OrgRequest>();  // ← the generic kills the `any`
```

### Endpoints
| Method | Route | Guard | Notes |
|---|---|---|---|
| POST | `/organizations` | `JwtAuthGuard` | creator becomes OWNER (transaction) |
| GET | `/organizations` | `JwtAuthGuard` | orgs I'm a member of |
| GET | `/organizations/:id/members` | + `OrgRolesGuard` | 403 if not a member |

`where: { memberships: { some: { userId } } }` is a **relation filter** — "orgs where *some*
membership belongs to me." Prisma writes the JOIN for you.

### The proof it works
User A creates Org X → A can list its members (200). User B (not a member) requests the same
URL → **403**. That 403 *is* multi-tenancy.

---

## 10. Feature: Invitations (in progress)

Files: `src/invitations/`

### Why a separate `Invitation` table (not just a Membership)?
An invitation is a **pending intent** — the person hasn't agreed yet, may not even have an
account, and the inviter can revoke it. A `Membership` means "confirmed member."
Different states → different tables.

### The model
```prisma
model Invitation {
  id        String           @id @default(uuid())
  email     String           // invite by EMAIL — they may not be a user yet
  role      Role             @default(MEMBER)  // role they get on accept
  token     String           @unique @default(uuid())  // secret, unguessable
  status    InvitationStatus @default(PENDING)         // PENDING | ACCEPTED | REVOKED
  expiresAt DateTime         // invites expire (7 days)

  organizationId String
  organization   Organization @relation(..., onDelete: Cascade)
  invitedById    String
  invitedBy      User         @relation(...)   // audit trail: who invited

  @@index([organizationId])
  @@index([email])
}
```

### The RBAC payoff
```ts
@Post()
@UseGuards(OrgRolesGuard)
@Roles('OWNER', 'ADMIN')      // ← a plain MEMBER cannot invite people
create(@Param('id') organizationId: string, @CurrentUser() user: AuthUser, @Body() dto) {}
```
Route: `POST /organizations/:id/invitations`

### Status
- ✅ Schema + migration
- ✅ `InvitationsService.create()` (checks: already a member? already a pending invite? sets 7-day expiry)
- 🚧 **Next:** controller + module + register in `AppModule`
- 🚧 **Then:** `accept` flow — validate token, check not expired/accepted, then a **transaction**:
  create `Membership` + mark invitation `ACCEPTED`.

---

## 11. Postman from scratch

We use Postman to call the API without a frontend. Two files already exist in `postman/` —
**import those** and you're done in 30 seconds. The manual walkthrough below explains what
they contain, so you can build collections yourself.

### Fastest path: import what we have
1. Postman → **Import** → drag in both files from `flowdeck/postman/`:
   - `flowdeck.postman_collection.json`
   - `flowdeck.postman_environment.json`
2. Top-right **environment dropdown** → select **"Flowdeck Local"**.
3. Run **Auth → Login**, then **Organizations → Create organization**. Tokens and `orgId`
   are captured automatically.

### Building it yourself (concepts)

**Step 1 — Create an Environment.** (left sidebar → *Environments* → **+**)
Name it `Flowdeck Local`. Add variables:

| Variable | Initial value | Why |
|---|---|---|
| `baseUrl` | `http://localhost:3001` | change once to point at prod |
| `accessToken` | *(empty)* | filled automatically by scripts |
| `refreshToken` | *(empty)* | filled automatically |
| `orgId` | *(empty)* | filled automatically |

Use them anywhere with `{{variableName}}`. **Select the environment** in the top-right
dropdown or `{{baseUrl}}` will be blank.

**Step 2 — Create a Collection.** (*Collections* → **+**) Name it `Flowdeck API`.
A collection = a folder of related requests, with shared settings.

**Step 3 — Set collection-level auth** (the big time-saver).
Collection → **⋯ → Edit → Authorization** tab:
- Type: **Bearer Token**
- Token: `{{accessToken}}`

Now **every request inherits** the `Authorization: Bearer <token>` header. You never add it
manually. Override it per-request where needed:
- `Register` / `Login` → Authorization type **No Auth** (you're not logged in yet)
- `Refresh` → **Bearer Token** = `{{refreshToken}}` (refresh uses the *refresh* token)

**Step 4 — Add folders** inside the collection: `Auth`, `Organizations`.
(Right-click collection → *Add folder*.) Folders group requests — that's the "folder instead of
separate requests" structure you wanted.

**Step 5 — Add requests.** For each: method, URL, headers, body.

Example — `Auth / Login`:
- Method: **POST**, URL: `{{baseUrl}}/auth/login`
- **Body** tab → **raw** → select **JSON** from the dropdown:
  ```json
  { "email": "test@flowdeck.dev", "password": "secret123" }
  ```
- (Content-Type is set automatically when you choose JSON.)

Example — `Organizations / List org members`:
- Method: **GET**, URL: `{{baseUrl}}/organizations/{{orgId}}/members`
- No body. Auth inherited from the collection.

**Step 6 — Auto-save tokens (no copy-pasting!).**
On the `Login` request → **Scripts** tab (older versions: **Tests**) → *Post-response*:
```js
const res = pm.response.json();
if (res.accessToken)  pm.environment.set('accessToken',  res.accessToken);
if (res.refreshToken) pm.environment.set('refreshToken', res.refreshToken);
```
Now hitting **Login** stores both tokens into the environment, and every other request
picks them up via `{{accessToken}}`. Do the same on `Register` and `Refresh`.

On `Create organization`, capture the new org id:
```js
const res = pm.response.json();
if (res.id) pm.environment.set('orgId', res.id);
```

**Step 7 — The daily flow.**
```
Login  →  Create organization  →  List org members
(tokens saved)   (orgId saved)      (just hit Send)
```

**Testing multi-tenancy:** log in as User B (their tokens overwrite the environment), then
hit *List org members* with A's saved `orgId` → expect **403**.

> Commit the `postman/` folder to git. A shared collection is a real professional signal, and
> it contains no secrets (tokens are filled at runtime, not stored in the file).

---

## 12. Git workflow

Feature-branch flow:

```bash
git checkout main && git pull
git checkout -b feature/<name>        # one branch per feature

# ... work, committing as you go ...
git add -A
git commit -m "feat(scope): what changed"

git push -u origin feature/<name>     # first push sets upstream
# → open a PR on GitHub (base: main ← compare: feature/<name>), review, merge

git checkout main && git pull         # sync local main
```

**Conventional Commits** (`type(scope): description`):
`feat:` new feature · `fix:` bug fix · `chore:` tooling/setup · `docs:` documentation ·
`refactor:` restructure without behavior change

Merged so far:
- PR #1 — `feature/auth` → main
- current branch: `feature/organizations` (orgs + tenant guard + invitations)

---

## 13. Troubleshooting

### `ECONNREFUSED` from Prisma
**Docker isn't running.** Start Docker Desktop, then `pnpm db:up`. Check `docker compose ps`.
(Enable *Settings → General → Start Docker Desktop when you sign in* to avoid this.)

### `Authentication failed for user 'flowdeck'`
A **native PostgreSQL 18** is installed on this machine and listens on IPv4 `0.0.0.0:5432`,
while Docker published on IPv6 `:::5432`. On Windows `localhost` resolves to IPv4 first, so
Prisma hit the *wrong* Postgres. **Fixed** by mapping our container to host port **5433**
(`"5433:5432"`) and using `localhost:5433` in `DATABASE_URL`.

Symptom of "wrong server answering": credentials work *inside* the container
(`docker exec ... psql`) but fail from the host, and a **wrong password gives the same error
as the right one**.

### `Property 'x' does not exist` / "Unsafe assignment of an error typed value"
The **generated Prisma client is stale**. Run:
```bash
npx prisma generate
```
Then in VS Code: `Ctrl+Shift+P` → **TypeScript: Restart TS Server**.

> **The compiler is the source of truth, not the editor.** If `npx tsc --noEmit` and
> `npx eslint <file>` exit 0, your code is fine and VS Code is showing cached diagnostics.

### `exports is not defined in ES module scope`
Prisma 7 generated an ESM client while NestJS runs CommonJS. Fixed with
`moduleFormat = "cjs"` in the `generator` block, then `prisma generate`.

### `PrismaClient needs to be constructed with valid PrismaClientOptions`
Prisma 7 requires a **driver adapter**: `new PrismaPg({ connectionString })` passed to
`super({ adapter })`. It no longer accepts `datasourceUrl` or `datasources`.

### `EADDRINUSE: address already in use :::3001`
An old API process is still running. Find and kill it:
```powershell
Get-NetTCPConnection -LocalPort 3001 -State Listen | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force }
```

### `Container name "/flowdeck-postgres" is already in use`
Old containers from a previous Compose *project name* (we renamed the folder). Fixed by
pinning `name: flowdeck` in `docker-compose.yml`. To clean up:
```bash
docker rm -f flowdeck-postgres flowdeck-redis
docker compose up -d
```

### `ERR_PNPM_IGNORED_BUILDS`
pnpm blocks dependency build scripts by default (supply-chain safety). Approve them in
`pnpm-workspace.yaml`:
```yaml
allowBuilds:
  "@nestjs/core": true
  "@prisma/engines": true
  prisma: true
  sharp: true
  unrs-resolver: true
```

### `ECONNRESET` during `pnpm install`
Flaky network, **not** a pnpm bug — pnpm retries and usually succeeds. To make installs more
reliable, `.npmrc` at the repo root:
```ini
fetch-retries=5
fetch-timeout=300000
network-concurrency=4
```

### 404 on a route you just wrote
The module isn't registered in `app.module.ts`'s `imports`. (Or the method sits outside the
controller class, or the strategy is in `controllers` instead of `providers`.)

---

## 14. Command cheat sheet

```bash
# --- daily ---
pnpm db:up                     # start Postgres + Redis (Docker Desktop must be running)
pnpm dev:api                   # NestJS on :3001
pnpm dev:web                   # Next.js on :3000
docker compose ps              # container health

# --- installing packages (monorepo!) ---
pnpm --filter api add <pkg>        # backend runtime dep
pnpm --filter api add -D <pkg>     # backend dev dep
pnpm --filter web add <pkg>        # frontend dep
pnpm add -D -w <pkg>               # repo-wide tool (root)

# --- prisma (run inside apps/api) ---
npx prisma migrate dev --name <name>   # after changing schema.prisma
npx prisma migrate deploy              # apply pending migrations (prod/CI/after clone)
npx prisma generate                    # regenerate typed client
npx prisma studio                      # GUI at localhost:5555
npx prisma format                      # tidy the schema
npx prisma migrate status              # what's applied/pending

# --- verifying code (source of truth) ---
npx tsc --noEmit -p tsconfig.json      # real type errors
npx eslint src/**/*.ts                 # real lint errors
pnpm build                             # nest build

# --- database poke ---
docker exec flowdeck-postgres psql -U flowdeck -d flowdeck -c 'SELECT * FROM "User";'
docker exec flowdeck-postgres psql -U flowdeck -d flowdeck -c '\dt'      # list tables
docker exec flowdeck-postgres psql -U flowdeck -d flowdeck -c '\d "User"' # describe table
```

### Environment variables (`apps/api/.env`)
```bash
PORT=3001
WEB_ORIGIN=http://localhost:3000
DATABASE_URL=postgresql://flowdeck:flowdeck@localhost:5433/flowdeck?schema=public
JWT_ACCESS_SECRET=<long random>
JWT_REFRESH_SECRET=<different long random>
```
`.env` is **git-ignored**; `.env.example` (same keys, dummy values) **is committed** so anyone
cloning knows what to set.

---

## Where we left off

**Branch:** `feature/organizations`

**Done:** monorepo · Docker (Postgres 5433 + Redis) · Prisma 7 + adapter · auth (register,
login, me, refresh w/ rotation, logout) · organizations (create w/ transaction, list, members)
· `OrgRolesGuard` (tenant isolation + RBAC) · invitations schema + service.

**Next:**
1. `InvitationsController` + `InvitationsModule` + register in `AppModule`
2. Test `POST /organizations/:id/invitations` → 201 as OWNER, 403 as MEMBER
3. Build the **accept** flow (transaction: create Membership + mark invitation ACCEPTED)
4. Merge `feature/organizations` → `main` via PR
5. Then: Projects → Boards → Tasks, then real-time (Socket.IO + Redis), then DevOps (CI/CD, monitoring)
