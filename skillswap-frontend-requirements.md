# SkillSwap — Frontend Requirements (Next.js, for Antigravity IDE)

Scope: `/apps/web` only. The backend (Express + MongoDB) is already built and running at `http://localhost:4000` — this document describes the frontend that talks to it. Place this file at the root of the frontend project so Antigravity can reference it throughout the build.

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14+ (App Router), TypeScript |
| Styling | Tailwind CSS, Shadcn/ui |
| Data fetching | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| Auth | BetterAuth — email/password, JWT plugin enabled |
| Icons | lucide-react (comes with Shadcn) |

No demo/auto-fill login. Real registration only.

---

## 2. How Auth Connects to the Backend

BetterAuth runs **inside this Next.js app** (its route handler lives at `app/api/auth/[...all]/route.ts`) and needs its own persistence — it uses a MongoDB adapter, so it talks to MongoDB directly for storing accounts/sessions. This is a **separate concern from the Express backend's own MongoDB models** — BetterAuth owns identity (email, password hash, sessions); the Express `User` model (already built) owns app-specific profile fields (bio, interests, embedding) and is linked by `authId`.

Flow:
1. User registers/logs in through BetterAuth's client hooks in this app.
2. BetterAuth's JWT plugin mints a signed JWT for the session.
3. Every request this frontend makes to the Express API attaches that JWT as `Authorization: Bearer <token>`.
4. Express verifies it against this app's JWKS endpoint (`/api/auth/jwks`) — already implemented on the backend, nothing more needed there.

**Practical implication for the API client:** every authenticated fetch needs to pull the current session's JWT and attach it. Build one shared `apiClient` (Section 6) that does this in one place rather than repeating it per-request.

---

## 3. Environment Variables

Create these in **`.env.local`** (not `.env`) — Next.js's default `.gitignore` excludes `.env.local` automatically, which `.env` may not be:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
MONGODB_URI=<Atlas connection string, no db name in the path — see note below>
MONGODB_DB_NAME=skillswap_bd
BETTER_AUTH_SECRET=<random 32+ char string>
BETTER_AUTH_URL=http://localhost:3000
```

Same pattern as the backend: `MONGODB_URI` connects to the cluster, `MONGODB_DB_NAME` tells BetterAuth's MongoDB adapter which database to use — pass it as the `dbName` option when initializing the adapter (mirrors `connectDB` in the Express backend). Don't embed the db name in the URI path itself.

`BETTER_AUTH_URL` **must match** what's configured as `FRONTEND_URL` on the Express backend — it's the same value the backend derives its JWKS URL and JWT issuer from.

---

## 4. Design System

- **Primary colors:** `#2A9D8F` (teal, primary actions), `#E76F51` (coral, accents/CTAs), `#F4A261` (warm yellow, highlights), neutral background `#F8F9FA`
- Define these as Tailwind theme colors (`tailwind.config.ts`) and/or CSS variables so Shadcn components pick them up consistently — don't hardcode hex values in components.
- **Cards:** identical width/height within a grid, `border-radius: 12px`, consistent shadow and padding across all card types (skill cards, testimonial cards, etc.)
- **Grid:** 4 columns desktop, 2 tablet, 1 mobile — applies to Explore results and Featured Skills
- All interactive elements need visible hover/focus states
- Skeleton loaders (Shadcn `Skeleton`) on every data-fetching view — never a blank screen while loading
- Toast notifications (Shadcn `Sonner`) for mutation success/failure (create skill, delete skill, update profile)

---

## 5. Routes

### Public
| Route | Purpose |
|---|---|
| `/` | Landing page |
| `/explore` | Browse/search/filter skills |
| `/skills/[id]` | Skill detail |
| `/login` | Login |
| `/register` | Register |
| `/about` | Static |
| `/contact` | Static form |

### Protected (redirect to `/login` if no session)
| Route | Purpose |
|---|---|
| `/skills/add` | Create skill (AI-assisted) |
| `/skills/manage` | List/delete own skills |
| `/profile` | Edit bio/interests |
| `/recommendations` | AI-suggested skills |

Use a layout-level or middleware-level session check for the protected group — don't duplicate the check inside every page component.

---

## 6. API Client & Data Layer

Build one central client, e.g. `lib/api-client.ts`:

- Base URL from `NEXT_PUBLIC_API_URL`
- Automatically attaches `Authorization: Bearer <jwt>` from the current BetterAuth session on every call (pull the token via BetterAuth's client-side session hook)
- Typed request/response helpers per resource (skills, users, recommendations)
- Wrap all data fetching in TanStack Query hooks (`useQuery`/`useMutation`) — one hooks file per resource is fine, e.g. `hooks/use-skills.ts`, `hooks/use-recommendations.ts`
- Set up a single `QueryClientProvider` at the root layout

### Backend endpoints available (already built)

```
GET    /api/skills?search=&category=&sort=&page=
GET    /api/skills/:id
GET    /api/skills/:id/related
GET    /api/skills/mine              (protected)
POST   /api/skills                   (protected)
DELETE /api/skills/:id               (protected)

POST   /api/ai/generate-description  (protected) → { title, shortDescription, category, length } → { fullDescription, tags }

GET    /api/recommendations          (protected)

GET    /api/users/me                 (protected)
PATCH  /api/users/me                 (protected) → { bio?, interests? }
```

`Skill` fields returned: `title, shortDescription, fullDescription, category, level, availability, imageUrl, tags, ownerId, views, createdAt, _id`.
`User` fields returned: `name, email, bio, interests, _id`.

---

## 7. Pages — Functional Requirements

### 7.1 Landing (`/`)
- Sticky navbar: 3 links logged out (`Home`, `Explore`, `Login`), 5 logged in (`Home`, `Explore`, `Add Skill`, `My Skills`, `Profile`)
- Hero (static, no carousel) with headline + CTA button → `/explore`
- **How It Works** — 3 steps, static content
- **Categories** — static grid: Programming, Design, Languages, Cooking, Music, Business, Fitness, Other. Each links to `/explore?category=X`
- **Featured Skills** — `GET /api/skills?sort=popular&page=1`, show top 4
- **FAQ** — Shadcn `Accordion`, static content
- Footer — real internal links only (About, Contact, Explore) — no placeholder social icons unless real URLs exist

### 7.2 Explore (`/explore`)
- Search input, debounced (~400ms), synced to a `search` query param
- Category filter dropdown, synced to `category` query param
- Sort select: Newest / Most Viewed, synced to `sort` query param
- Pagination, 10 per page, synced to `page` query param
- Keep filters in the URL (not just component state) so results are shareable/bookmarkable and survive a refresh
- Card: image (fallback if `imageUrl` missing), title, short description, category badge, level badge, "View Details" → `/skills/[id]`
- Skeleton grid while loading; empty state if zero results

### 7.3 Skill Detail (`/skills/[id]`)
- `GET /api/skills/:id` (also increments view count server-side — no extra call needed)
- Image, title, category, level, availability badges
- Full (AI-generated) description
- Owner name (from populated/embedded owner info — confirm what the backend returns; if it's just `ownerId`, this page may need a small follow-up endpoint or population added to the backend — flag this back if the current `GET /api/skills/:id` doesn't include owner details)
- **Related Skills**: `GET /api/skills/:id/related`, render as a card row (reuse the Explore card component)

### 7.4 Login / Register
- React Hook Form + Zod validation
- Register: name, email, password, confirm password (client-side match check)
- Login: email, password
- Inline field errors, not just a toast
- On success, redirect to `/explore`
- No demo login button

### 7.5 Add Skill (`/skills/add`) — protected
- Fields: Title, Short description, Category (select from the same static category list as Explore), Skill Level (select), Availability (text), Image URL (optional)
- **"Generate Description"** button:
  - Calls `POST /api/ai/generate-description` with `{ title, shortDescription, category, length }`
  - `length` toggle: short / medium / long (segmented control or select)
  - Shows the generated `fullDescription` in an editable textarea (user can hand-edit before saving) and the suggested `tags` as removable chips
  - **"Regenerate"** button re-calls the same endpoint
  - Disable Submit until a description has been generated at least once
- On submit: `POST /api/skills` with all fields including the (possibly edited) `fullDescription` and `tags`
- Loading state on the generate button distinct from the submit button — user should be able to tell which action is in flight

### 7.6 Manage Skills (`/skills/manage`) — protected
- `GET /api/skills/mine`
- Table or card grid: title, category, views, **View** (→ detail page), **Delete** (confirm dialog before calling `DELETE /api/skills/:id`)
- Optimistic removal or refetch after delete — either is fine, but the UI must update without a manual refresh

### 7.7 Profile (`/profile`) — protected
- `GET /api/users/me` on load
- Editable: bio (textarea), interests (tag input — add/remove strings)
- Save button → `PATCH /api/users/me`
- Note for the user near the interests field: "Adding interests helps power your recommendations" (ties into how the backend computes `profileEmbedding` from bio + interests)

### 7.8 Recommendations (`/recommendations`) — protected
- `GET /api/recommendations`
- If the response includes a `note` field (backend returns this when the user has no `profileEmbedding` yet, i.e. hasn't filled in bio/interests), show it as an empty-state prompt linking to `/profile` instead of an empty grid
- Otherwise render results in the same card grid as Explore

### 7.9 About / Contact
- Static content pages, consistent with the rest of the design system
- Contact: simple form (name, email, message) — no backend endpoint exists for this yet, so either (a) make it a `mailto:` link for v1, or (b) flag that a `POST /api/contact` endpoint needs to be added to the backend if a real submission flow is wanted. Default to (a) unless told otherwise.

---

## 8. Non-Functional Requirements

- Fully responsive, mobile-first Tailwind — no fixed-width assumptions anywhere
- All forms: client-side Zod validation with inline error messages, not just disabled submit buttons
- No placeholder/lorem-ipsum text in shipped UI — static copy (FAQ, About, How It Works) should be real, considered content; everything else is user- or AI-generated
- Handle loading, empty, and error states explicitly on every data-driven page — not just the happy path

---

## 9. Explicitly Out of Scope (v1)

Matches the backend's scope — don't build UI for these:
- Google OAuth login
- Reviews & ratings
- Full exchange negotiation workflow (propose/accept/complete)
- AI chat assistant widget
- Multi-image upload
- Newsletter signup, testimonials, statistics section on landing page

---

## 10. Open Question to Resolve Early

`GET /api/skills/:id` currently returns the skill document with `ownerId` as a raw ID, not a populated owner object. The detail page (§7.3) wants to show the owner's name. Either:
- Have the backend `.populate('ownerId', 'name bio')` on that route, or
- Add a small `GET /api/users/:id` public endpoint

Confirm which before building §7.3 so the detail page isn't built against data that doesn't exist yet.
