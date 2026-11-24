# PRD: Builder Self-Signup & Project Submission

**Author:** Anushka · **Date:** 2026-11-18 · **Status:** Draft, Solution Review (Stage 4). Instant publish decided

---

## 1. Hypothesis

We believe replacing the "ADD YOUR PROJECT" Google Form with an in-site signup, project submission and live preview flow will let community members submit projects without an admin creating their account first. We measure it by the share of new projects that arrive via self-serve (target: >80% within 60 days) and by the admin hours spent per submission (target: ~0 for account setup).

## 2. Problem

**Who:** Cohort members and AI community builders who want their project on the MyAI Community home page.

**How it works today (from the code):**
- The nav "ADD YOUR PROJECT" link goes to an external Google Form (`McShared.tsx:67`, uncommitted change). Submissions land outside the product.
- An admin must create the builder's username and password in `/cohort-admin/dashboard` (`POST /cohort-admin/project-users`) and assign the project (`project_user_permissions`).
- A builder can only edit a project an admin already created (`/project-user/projects/:id`). Title, category and sections stay admin-only. There is no endpoint to create a project.
- The builder cannot see how the card will look on the home page. `ProjectEditor` has a preview, but it uses the older `ProjectPublicView`. The live page uses `project-page-template.html` in an iframe.

**Impact:** Every submission needs manual admin work, and builders wait for credentials. `[NEED: submissions/month and average admin turnaround, from the Google Form responses]`

**If we don't fix it:** The admin stays the bottleneck, and submission volume is capped by admin availability.

## 3. Strategic Fit

- Reuses what exists (project-user auth, editor, asset upload, public template) instead of adding a new system. Most of the work is "let a user create an account and a project" rather than building an editor.
- **Decision (made): instant publish, but not onto the home page.** A submitted project goes live in the public "show all" listing immediately, with no admin approval step. Only the admin decides which projects are featured on the home page sections (Top 10, Awards, Cohort); see Solution. The upside is zero wait for builders and zero admin work per submission, which is the point of the feature. The trade-off is that spam or low-quality content can appear on a public, branded page, so V1 relies on after-the-fact moderation: the admin can unpublish or delete any project in one click, and signup is rate-limited (see Risks).

## 4. Solution

### User flow
1. **Nav → ADD YOUR PROJECT** goes to `/signup`, an in-site page that replaces the Google Form link. If the builder is already signed in it goes straight to `/my-projects`.
2. **Sign up:** username, email and password (min 8 characters, confirm field), in the same card style as `ProjectUserLogin`. On success the builder is logged in and sent to the editor. **Login is unchanged:** the existing `/project-login` page and `POST /project-user/login` (username *or* email, plus password) keep working exactly as before for both new and admin-created accounts. The signup page only links to it ("Already have an account? Sign in"), and no login code changes.
3. **Create project:** `/project-editor/new` has the same fields the admin used before: title, category, builder name, LinkedIn, description, thumbnail/banner, builder photo, video link, workflow/doc/hosted links, what you learned, what's included, and per-field visibility. It saves as a `draft` owned by the builder.
4. **Live preview:** a side-by-side panel (tab on mobile) renders the **real** public template (`project-page-template.html` with the draft injected as `window.PROJECT`) plus the **project card** exactly as it will appear in the show-all grid (the same card the home page uses if an admin features it). It updates as the builder types. The existing `ProjectDetailPage` injection logic is reused for this.
5. **Publish:** "Publish" sets status to `published` immediately, after the required-field check. The project appears in the **show-all page** (`/all-projects/cohorts`, "See More" on home) and on its public `/project/:id` page right away. It does **not** appear in the home page sections until an admin assigns it to one. Builders can save as `draft` first; drafts are private. `/my-projects` shows Draft or Live for each project.
6. **Manage:** builders see all their projects on `/my-projects` (list view even when there is one project, replacing today's auto-redirect) and can add more, edit, or unpublish.

### Where projects appear
| Place | Who gets in | Order |
|---|---|---|
| Home page sections (Top 10, Awards, Cohort) | Only projects an admin assigned to a section | Admin rank (unchanged) |
| Show-all page (`/all-projects/cohorts`) | **Every published project**, self-submitted or admin-created, with or without a section | **Newest upload first** (`created_at` descending) |
- Today the show-all page only lists projects that have a cohort section (`AllProjectsPage.tsx`). It changes to list all published projects, with the cohort filter tabs kept for projects that have one. Projects without a cohort show under "ALL" only. The search box keeps working.
- Self-submitted projects get no section on creation, so they can never reach the home page without an admin action.
- Awards and Cohort 9/10 show-all pages stay curated and rank-ordered.

### Layout and theme
- Pages use the community theme tokens and fonts in `CohortProjects.css` and `McShared` (`Nav`, `btn`, `btn-pill`), not the plain Tailwind gray cards the editor uses today.
- Responsive: the form and preview sit in two columns at ≥1024px and stack with a Form/Preview toggle below that. The preview has a desktop/mobile width switch. Touch targets are ≥44px and inputs are 16px so iOS does not zoom.

### Backend (what changes, not how)
- New `POST /project-user/signup`, rate-limited, with unique email *and* username, returning a token like login does.
- New `POST /project-user/projects` creates a project owned by the user. It inserts the `project_user_permissions` row automatically.
- The editable-field whitelist widens to include title, category and builder name. Status, sections, awards and rank remain admin-only.
- `GET /cohort-projects` already returns published projects newest first; the show-all page just stops filtering them down to those with sections and sorts by `created_at` desc.
- The existing `PATCH /project-user/projects/:id/publish` is reused, plus a new unpublish. The public list endpoint keeps returning `published` only.
- The admin dashboard gets a "Recently self-published" filter (newest first, builder email shown) with one-click Unpublish / Delete, a quick way to add a project to a home section, and the option to disable a builder account.

### Ownership rule (requirement)
A builder can view, edit, publish, unpublish or upload assets for **only the projects they created** (or that an admin explicitly assigned to them). This is enforced on the server for every project endpoint, not just hidden in the UI.
- Creating a project records the creator in `project_user_permissions`. The existing permission check on `GET/PUT/PATCH /project-user/projects/:id` stays the single source of truth, and the new create/unpublish endpoints use it too.
- A builder who requests another builder's project (by guessing the id in `/project-editor/:id`) gets 403 and is redirected to `/my-projects`. A project that does not exist gets 404.
- `/my-projects` lists only the user's own projects. Public pages stay read-only for everyone else.
- Builders cannot change who owns a project or edit admin-only fields (sections, awards, rank).
- **Admin curation is unchanged.** The cohort admin can still assign any project (including self-submitted ones) to Top 10, Awards (with award name) and cohort sections, set rank, edit any field, change status, and reassign or delete, using the existing `/cohort-admin` dashboard and `project_section_assignments`. Self-submitted projects show up in the admin project list like any other.
- Test: user A creates a project, user B tries to GET, PUT, publish and unpublish it, and every call must return 403.

### Edge cases
| Case | Behavior |
|---|---|
| Email or username already exists | Inline error on the field, with a "Sign in instead" link |
| Builder opens someone else's project URL | 403 from the API, UI redirects to `/my-projects` |
| Existing admin-created users | Unchanged. They keep logging in and see their assigned projects |
| Submit with missing required fields | Block with per-field errors. Required: title, builder name, description, one of video/hosted link |
| Image too large or broken | Reuse `compressImage`; show a retry state; cards fall back to initials (already handled in `Avatar`) |
| Token expired mid-edit | Autosave the draft locally and prompt re-login without losing the form |
| Builder edits a live project | Changes go live immediately (consistent with instant publish) |
| Abuse or spam signups | Rate limit by IP, honeypot field, links must be http(s), text length caps. Admin unpublish/delete as the backstop |

## 5. Non-Goals (V1)

- **Not** building email verification, password reset or social login in V1. Password reset is the first V2 item, because without it a forgotten password means an admin reset.
- **Not** letting builders choose home sections (Top 10, Awards, Cohort). Those stay admin-curated.
- **Not** building an approval queue or moderation tooling in V1. Revisit if spam exceeds the guardrail below.
- **Not** letting self-submitted projects appear on the home page sections automatically. That stays an admin decision.
- **Not** adding comments, likes by builders, or analytics dashboards for builders.
- **Not** removing the cohort-admin flow. Admins can still create accounts and projects.
- **Not** migrating the old Google Form responses. `[NEED: confirm]`

## 6. Success Metrics

| Metric | Type | Baseline | Target | Timeframe |
|---|---|---|---|---|
| Share of new projects via self-serve | Primary | 0% | >80% | 60 days |
| Signup → draft created | Secondary | n/a | >60% | 30 days |
| Draft → submitted | Secondary | n/a | >50% | 30 days |
| Submit → live time | Secondary | `[NEED: current form → live time]` | Instant | at launch |

**Guardrails:** spam or admin-removed projects <10% of self-published projects (if breached, add an approval queue); home page load time does not regress (`[NEED: baseline p95]`); no new auth errors on existing project-user login.

**Analytics events:** `signup_started`, `signup_completed`, `project_created`, `preview_viewed`, `project_published`, `project_unpublished_by_admin`.

## 7. Rollout Plan

1. Replace the Google Form link in the nav with `/signup`. The form is removed from the site, with no fallback link.
2. Internal test with 3 to 5 cohort members, then open to everyone.
3. **Go/no-go:** zero data-loss bugs in the editor, and an admin can unpublish a project in under 1 minute.
4. **Rollback:** point the nav link back to the Google Form URL (kept in git history). New tables/columns are additive, so no data migration is needed to roll back.

## 8. Risks & Technical Notes

- **Auth tokens are in-memory (8h TTL, `projectUserTokens.ts`).** Signups open to the public mean a server restart or a second instance logs everyone out. Recommend moving to signed JWTs or a DB-backed session table before launch. `[NEED: confirm backend runs as a single instance on Azure]`
- `project_users.email` has no UNIQUE constraint today, only `username` does. Add one (clean up duplicates first).
- Open signup plus a public asset upload endpoint needs size/type checks, per-user quotas and rate limits.
- **Instant publish risk:** a bad project is visible until an admin notices. Mitigation: the admin "recently self-published" view, and optionally a notification on each new publish `[NEED: email or Slack?]`.

## 9. Open Questions

| # | Question | Owner | By |
|---|---|---|---|
| 1 | ~~Moderated or instant publish~~ Decided: **instant publish** | Anushka | done |
| 2 | Who can sign up? Decided: **anyone** | Anushka | done |
| 3 | Admin notification on publish? Decided: **none**; admin uses the dashboard list | Anushka | done |
| 4 | Projects per builder? Decided: **many**, no cap | Anushka | done |
| 5 | Email verification in V1? Decided: **no** | Anushka | done |
| 6 | Google Form? Decided: **remove it**, no fallback and no import of old responses | Anushka | done |
| 7 | Baseline numbers (submissions/month, admin turnaround) for metrics | Anushka | optional, does not block build |

---

### Stage checklist (Solution Review)
- [x] Edge cases identified
- [x] Rollout and rollback plan
- [ ] Cross-functional needs: admin unpublish/delete UX is defined only at a high level, and there is no legal/ToS text for user-submitted content yet
- [x] Analytics events defined
- [x] Risks documented (auth token store, email uniqueness, spam)
- [ ] Baselines for metrics (marked `[NEED]`)
