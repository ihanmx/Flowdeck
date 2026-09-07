# Flowdeck — Figma Make Design Brief

> Paste this whole document into Figma Make as the design prompt.
> App is bilingual (English LTR + Arabic RTL). Deliver every screen in **desktop (1440px)** and **mobile (390px)** frames, in **both light and dark mode**.

---

## 1) PRODUCT

Flowdeck is a **multi-tenant project-management SaaS** (like Jira/Linear): organizations own
projects → boards → columns → tasks, with real-time collaboration, role-based access, and
invitations. The design must feel **modern, calm, focused, and professional** — a productivity
tool people stare at all day. Priorities: clarity, generous whitespace, strong hierarchy, zero
clutter. Reference feel: Linear + Notion + Height (clean, fast, confident — NOT playful/childish).

---

## 2) LOGO (design two versions)

Design a custom logo for **"Flowdeck"**. Concept: the name = **Flow** (movement) + **Deck**
(a deck of cards / a kanban board). Create an abstract mark of **three rounded vertical bars
(kanban columns)** of slightly varying heights, with a **subtle diagonal "flow" line or a small
card gliding across them left-to-right**, suggesting a task moving across a board. Keep it
geometric, minimal, and scalable to a 24px favicon.

- **Wordmark:** "Flowdeck" set in Sora SemiBold, tight letter-spacing, capital F.
- **Version A (for light backgrounds):** teal gradient mark + slate-900 wordmark.
- **Version B (for dark backgrounds):** teal/mint mark + white wordmark.
- Also provide an **icon-only** version (just the mark) for the favicon and collapsed sidebar.

---

## 3) TYPOGRAPHY (all free — Google Fonts, bilingual)

- **Display / Headings (Latin):** **Sora** — geometric, modern, distinctive; gives the brand identity.
- **Body & UI text (Latin):** **Inter** — the productivity-app standard; superb legibility at small sizes.
- **Arabic (headings + body):** **IBM Plex Sans Arabic** (fallback: **Cairo**) — pairs cleanly with Inter/Sora, same modern tone; used whenever the UI is in Arabic.
- **Monospace (task IDs, timestamps, code-like data):** **IBM Plex Mono**.

**Type scale (use consistently):** Display 40/48 · H1 32 · H2 24 · H3 20 · Body-lg 16 · Body 14 · Caption 12.
Line-height 1.4–1.6 for text; headings tighter (1.1). Uppercase labels get +0.08em letter-spacing.

---

## 4) COLOR PALETTE (fits a calm, focused productivity tool)

**Brand accent = Teal** (evokes *flow*, progress, and calm focus — not aggressive). Used for
primary actions, active states, links, focus rings.

### Brand / Primary (Teal)
- primary-400 `#2DD4BF` (light accents, dark-mode primary)
- primary-500 `#14B8A6` (main brand)
- primary-600 `#0D9488` (hover / pressed)
- primary-tint `#F0FDFA` (light hover backgrounds)

### Neutrals — LIGHT MODE (cool grays, slight blue bias)
- app background `#F6F8FB`
- surface / cards `#FFFFFF`
- border / divider `#E5EAF1`
- text-strong `#0F172A`
- text `#334155`
- text-muted `#6B7A90`

### Neutrals — DARK MODE (deep navy-slate, not pure black)
- app background `#0B1120`
- surface / cards `#131C2E`
- surface-raised `#1B2740`
- border / divider `#26324A`
- text-strong `#F1F5F9`
- text `#C7D2E1`
- text-muted `#8296B4`

### Semantic (status)
- success / Done `#22C55E`
- warning `#F59E0B`
- danger / destructive `#EF4444`
- info `#3B82F6`

### Task priority chips
- Low `#6B7A90` (gray) · Medium `#3B82F6` (blue) · High `#F59E0B` (amber) · Urgent `#EF4444` (red)

### Role badges
- OWNER = teal · ADMIN = violet `#8B5CF6` · MEMBER = blue `#3B82F6` · VIEWER = gray `#6B7A90`

> Both themes must be fully designed (not an auto-invert): keep contrast AA-legible, and keep
> teal working as the accent on both the light and the dark ground.

---

## 5) DESIGN SYSTEM (keep everything consistent)

- **Spacing:** 8px base grid. Scale: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64. Generous whitespace; never cramped.
- **Corner radius:** 8px inputs/buttons, 12px cards, 16px modals, full for pills/avatars.
- **Elevation:** soft, low-spread shadows in light mode; in dark mode use lighter surfaces instead of heavy shadows.
- **Layout:** 12-column grid, 1440px desktop container with 24–32px gutters; comfortable max content width.
- **Components to define once and reuse:** buttons (primary/secondary/ghost/destructive), inputs, dropdowns, checkboxes, toggles, cards, task cards, badges/chips, avatars + avatar stacks, tabs, breadcrumbs, modals, side-drawers, toasts/notifications, empty states, skeleton loaders, tooltips.
- **Icons:** a single consistent line-icon set (e.g. Lucide), 20–24px.

---

## 6) GLOBAL UI REQUIREMENTS (must appear on every app screen)

- **Top bar** contains: workspace/organization switcher (left), global search, a **notifications bell**, a **theme toggle button (sun/moon)** for light⇄dark, a **language toggle button (EN / ع)** for English⇄Arabic, and the user avatar menu.
- **Theme toggle** must visibly switch the whole UI between the light and dark palettes above.
- **Language toggle** must switch copy between English and Arabic **and mirror the entire layout to RTL** when Arabic is active (sidebar flips to the right, text right-aligned, icons/chevrons mirrored). Show at least the Board and Dashboard screens in an Arabic RTL variant.
- **Left sidebar** (collapsible): org logo, nav (Dashboard, Projects, Boards, Members, Notifications, Settings), collapse control.
- Fully **responsive**: on mobile the sidebar becomes a bottom nav or hamburger drawer; the kanban board scrolls horizontally by column.

---

## 7) SCREENS / PAGES (deliver each in desktop + mobile, light + dark)

**A. Landing / Marketing page** — hero with the logo, a one-line value prop ("Where teams move work forward"), a product screenshot/mockup, feature highlights (multi-tenant, real-time, roles), CTA buttons (Sign up / Log in). Include a hero illustration (see §8).

**B. Sign up** — email, password, name; social-proof strip; link to login. Clean centered card.

**C. Log in** — email, password, "forgot password" link, primary CTA.

**D. Forgot / Reset password** — request-reset screen + set-new-password screen.

**E. Onboarding — Create organization** — org name input, live slug preview, "you'll be the Owner" note, illustration.

**F. Accept invitation** — shows org name + who invited you + the role you'll get, Accept/Decline buttons. Also an expired/invalid-invite state.

**G. Dashboard / Home** — overview after login: cards for "My organizations", recent activity feed, quick stats (open tasks, due soon), and shortcuts to recent boards.

**H. Organization overview** — projects grid/list, member avatars, activity, and a small analytics row (tasks created over time as a line chart, completion rate as a donut, active members).

**I. Projects list** — searchable/filterable list of projects in the org; "New project" (visible only to Owner/Admin); empty state.

**J. Project → Boards list** — boards inside a project; create board.

**K. Board view (THE CORE SCREEN — make it the best)** — a kanban board: horizontal columns (To do / In progress / Done, customizable), **draggable task cards** showing title, priority chip, assignee avatar, due date, label tags, and a comment count. Column headers show task counts and an "add task" affordance. Show a **live-presence element** (stacked avatars of who's viewing) and a subtle "moved just now" real-time indicator. Include drag-in-progress and drop-target states.

**L. Task detail (side drawer + full-page mobile)** — title, rich description, assignee picker, priority selector, due date, labels, a comments thread with @mentions, and an activity/history log. Include the edit and delete affordances (delete restricted by role).

**M. Members & roles** — table of members with avatar, name, email, role dropdown (Owner/Admin/Member/Viewer), remove action; an "Invite member" button opening a modal (email + role). Pending invitations section.

**N. Notifications** — dropdown panel + full page: assigned-to-you, mentions, invitations, with read/unread states and "mark all read".

**O. Settings** — tabs: Profile, Organization (name, danger-zone delete), Appearance (theme + language controls duplicated here), Members shortcut.

**P. Admin analytics** — richer charts: tasks over time, completion rate, per-member workload, active users. Clean dashboard cards with KPI tiles.

**Q. System states** — 404 page, generic error page, and empty states for: no organizations, no projects, no boards, empty column, no notifications. Each empty state gets a small illustration + a clear primary action.

---

## 8) ILLUSTRATIONS (modern, minimal, on-brand)

Use a **light line + soft teal-gradient** illustration style (think Storyset/Humaaans-clean,
geometric, not cartoonish). Place illustrations at:
- Landing hero — an abstract kanban board with cards flowing between columns.
- Onboarding "create organization" — a team/workspace motif.
- Accept-invitation — an envelope/handshake motif.
- Empty states — a friendly, minimal spot illustration per state (empty board, no projects, all caught up on notifications).
- 404 / error — a lost-card / broken-column motif.
Keep them subtle and consistent; they should support, not dominate.

---

## 9) DELIVERABLES CHECKLIST

- [ ] Logo: light version, dark version, icon-only (favicon).
- [ ] Full color styles (light + dark) and text styles saved as reusable styles/variables.
- [ ] Reusable component library (§5).
- [ ] Every screen in §7 as **Desktop 1440** and **Mobile 390** frames.
- [ ] Light **and** dark mode for each key screen.
- [ ] At least Dashboard + Board shown in **Arabic RTL**.
- [ ] Working **theme toggle** and **language toggle** in the top bar.
- [ ] Consistent 8px spacing, aligned margins, and clear typographic hierarchy throughout.
