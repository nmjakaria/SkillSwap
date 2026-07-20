# SkillSwap

SkillSwap is a peer-to-peer skill exchange platform where users trade knowledge instead of money. Members list skills they can teach, discover skills they want to learn, and connect with each other directly. The platform uses the Google Gemini API to help users write detailed, high-quality skill listings, and an embeddings-based recommendation engine (cosine similarity over Gemini text embeddings) to surface personalized suggestions and related skills — removing the guesswork from finding the right learning partner.

---

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Known Limitations and Roadmap](#known-limitations-and-roadmap)
- [License](#license)

---

## Key Features

- **Browse, search, and filter skills** -- full-text search, category filtering, and sort options (newest / most viewed), all synced to URL query params for shareable, bookmarkable results
- **AI-assisted skill listing creation** -- Gemini-generated full descriptions with a configurable length toggle (short / medium / long) and a one-click Regenerate option; the generated text is editable before publishing
- **AI-powered recommendations** -- personalized skill suggestions on /recommendations driven by embedding similarity between the user's bio/interests and listed skills
- **Related skills matching** -- each skill detail page surfaces similar listings via cosine similarity over stored embeddings
- **User profiles with bio and interests** -- editable profile fields that power the recommendation engine; interests entered as removable tag chips
- **Manage-your-own-skills dashboard** -- view and delete your own listings with optimistic cache updates and confirmation dialogs
- **JWT-based authentication via BetterAuth** -- email/password sign-up and sign-in; protected routes enforced at the middleware layer

---

## Tech Stack

### Frontend (skillswap-web)

| Technology | Version | Role |
|---|---|---|
| Next.js (App Router) | 16.2.10 | Framework, routing, SSR |
| React | 19.2.4 | UI rendering |
| TypeScript | ^5 | Type safety |
| Tailwind CSS | ^4 | Utility-first styling |
| Shadcn/ui + Radix UI | latest | Accessible component primitives |
| TanStack Query | ^5.101.2 | Server state, caching, mutations |
| React Hook Form | ^7.82.0 | Form state management |
| Zod | ^4.4.3 | Schema validation |
| BetterAuth | ^1.6.23 | Authentication (JWT plugin) |
| Sonner | ^2.0.7 | Toast notifications |
| Lucide React | ^1.25.0 | Icons |

### Backend (skillswap-api)

| Technology | Role |
|---|---|
| Express + TypeScript | HTTP server, routing |
| MongoDB / Mongoose | Primary data store |
| Google Gemini API | Chat completions (description generation) + text embeddings (recommendations / related skills) |
| jose | JWKS-based JWT verification |
| BetterAuth (JWKS endpoint) | Issues and signs JWTs consumed by the backend |

---

## Architecture Overview

Authentication is handled entirely by BetterAuth running inside the Next.js application. When a user signs in, BetterAuth issues a short-lived JWT via its JWT plugin and stores the session in MongoDB. On every API call, the frontend apiClient wrapper retrieves the current token via authClient.token() and attaches it as a Bearer header. The Express backend never shares a secret with the frontend; instead it fetches BetterAuth's public JWKS endpoint (served at BETTER_AUTH_URL/api/auth/jwks) and uses jose to verify the token's signature. This keeps the two applications decoupled -- the backend trusts the JWT issuer, not a shared string.

---

## Getting Started

### Prerequisites

- **Node.js** >= 20 (LTS recommended)
- **MongoDB Atlas** account (a free M0 cluster is sufficient)
- **Google Gemini API key** (obtain from Google AI Studio: https://aistudio.google.com/)

---

### Backend Setup

Clone the backend repository and install dependencies:

```bash
cd skillswap-api
npm install
```

Required environment variables (.env):

```env
PORT=4000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
MONGODB_DB_NAME=skillswap_db
BETTER_AUTH_URL=http://localhost:3000
GEMINI_API_KEY=your_gemini_api_key_here
```

Run in development mode:

```bash
npm run dev
```

The API server starts on http://localhost:4000 by default.

---

### Frontend Setup

```bash
cd skillswap-web
npm install
```

Required environment variables (.env.local):

```env
NEXT_PUBLIC_API_URL=http://localhost:4000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<dbname>?retryWrites=true&w=majority
MONGODB_DB_NAME=skillswap_db
BETTER_AUTH_SECRET=your_random_secret_here_min_32_chars
BETTER_AUTH_URL=http://localhost:3000
```

Run in development mode:

```bash
npm run dev
```

The Next.js app starts on http://localhost:3000.

---

## Project Structure

This repository contains the **frontend** application. The backend lives in a separate skillswap-api repository.

```
skillswap-web/
├── app/
│   ├── about/                   # /about -- mission and team page
│   ├── api/
│   │   └── auth/[...all]/       # BetterAuth catch-all handler
│   ├── contact/                 # /contact -- mailto-based contact form
│   ├── explore/                 # /explore -- search, filter, paginate skills
│   ├── login/                   # /login -- sign in form
│   ├── profile/                 # /profile -- bio and interests (protected)
│   ├── recommendations/         # /recommendations -- AI-matched skills (protected)
│   ├── register/                # /register -- sign up form
│   ├── skills/
│   │   ├── [id]/                # /skills/:id -- skill detail and related skills
│   │   ├── add/                 # /skills/add -- create a new skill (protected)
│   │   └── manage/              # /skills/manage -- your listings dashboard (protected)
│   ├── globals.css              # Tailwind base + design tokens
│   ├── layout.tsx               # Root layout (Navbar, Footer, Providers)
│   └── page.tsx                 # / -- landing page with hero image carousel
├── components/
│   ├── ui/                      # Shadcn/ui generated components
│   ├── footer.tsx               # Site-wide footer (4-column layout)
│   ├── navbar.tsx               # Site-wide navigation bar
│   ├── providers.tsx            # TanStack Query + Theme providers
│   └── skill-card.tsx           # Shared skill card + SkillCardSkeleton
├── lib/
│   ├── api-client.ts            # Typed fetch wrapper with JWT injection
│   ├── auth-client.ts           # BetterAuth browser client
│   ├── auth.ts                  # BetterAuth server config (MongoDB adapter)
│   └── utils.ts                 # Utility helpers
├── middleware.ts                # Route protection (session cookie check)
├── next.config.ts
├── package.json
└── tsconfig.json
```

---

## API Overview

All endpoints are served by the Express backend at NEXT_PUBLIC_API_URL (default: http://localhost:4000). Protected endpoints require a valid Authorization: Bearer <jwt> header.

### Skills

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/skills | Public | List skills with optional search, category, sort, page params. Returns { items, total, page, totalPages }. |
| GET | /api/skills/mine | Required | Fetch all skills owned by the authenticated user. |
| GET | /api/skills/:id | Public | Fetch a single skill by ID. |
| GET | /api/skills/:id/related | Public | Fetch related skills via embedding similarity. Returns { items }. |
| POST | /api/skills | Required | Create a new skill listing. |
| PATCH | /api/skills/:id | Required | Update an existing skill (owner only). |
| DELETE | /api/skills/:id | Required | Delete a skill listing (owner only). |

### AI

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/ai/generate-description | Required | Generate a full description and tags using Gemini. Accepts { title, shortDescription, category, length }. Returns { fullDescription, tags }. |

### Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/users/me | Required | Fetch the authenticated user's profile. |
| PATCH | /api/users/me | Required | Update the authenticated user's bio and/or interests. |

### Recommendations

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/recommendations | Required | Return personalized skill recommendations. Returns { items }, or { note } if the user profile is incomplete. |

---

## Known Limitations and Roadmap

The following are intentional v1 scope decisions -- features not yet implemented rather than missing by oversight:

- **OAuth / social login not yet implemented** -- authentication is currently email and password only; Google/GitHub OAuth is planned for a future iteration
- **Reviews and ratings system not yet implemented** -- users cannot currently rate or review their exchange partners
- **Skill exchange negotiation workflow not yet implemented** -- the Contact page opens the user's email client as a temporary measure; a built-in messaging or session-booking flow is on the roadmap
- **Privacy Policy and Terms of Service pages not yet implemented** -- footer links are present but point to # pending legal copy
- **Image upload not yet implemented** -- skill images are optional URL strings; direct file upload to a storage provider is planned

---

## License

License TBD.