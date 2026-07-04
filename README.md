# consultprompts.com — Website (v2)

Rewritten frontend: componentized structure, Firebase fully removed,
now talks to the Go **API Gateway** (`auth-service` + future microservices).

Synced with the latest design refresh from the live AI-Studio-hosted site
(new hero copy, marquee ticker, reviews-with-stats layout, hover glow effects,
compression/caching in `server.ts`).

## What changed from v1

- **App.tsx went from 1,573 lines → 20 lines.** It now only holds routing + providers.
- **Firebase removed entirely** (auth + Firestore). Replaced by `src/lib/api.ts`, a typed
  client for the Go API Gateway with automatic token refresh.
- **Auth state is global** via `src/context/AuthContext.tsx` (`useAuth()` hook) instead of
  per-page `onAuthStateChanged` listeners.
- **Signup flow changed**: the backend requires email verification before login, so after
  registering the UI shows "Check your inbox" instead of logging in immediately.
- **Google sign-in removed** for now — OAuth is planned for auth-service v1.1. (The live
  site's `AuthModal` still calls Firebase's Google sign-in; that path isn't ported here
  since there's nothing on the backend to authenticate against yet.)
- **Static content extracted** to `src/data/content.tsx` (reviews, FAQs, packages, process
  steps) so copy changes don't touch component code.
- **Design refresh applied**: new hero (headline "A website your neighbors actually use.",
  CTA buttons scroll to sections instead of opening a form directly), reviews section with
  a stats header (40% avg lift / 4.9 rating / 34 shops) and author cards, hover glow/ring
  effect on process + pricing + review cards, marquee-based ticker (CSS animation, not JS),
  shimmer skeleton on review images while loading, non-blocking font loading in `index.html`,
  gzip compression + long-cache headers for hashed assets in `server.ts`.
- **Fixed a real bug carried over from the original**: review images (`boardwalk.jpeg`,
  `inspire.jpeg`) were referenced without a leading `/`, so they'd never resolve against
  `/public`. Fixed to `/boardwalk.jpeg` etc.

## Structure

```
src/
  App.tsx                    # routing + AuthProvider only
  main.tsx
  index.css
  lib/
    api.ts                   # API client (auth, leads, waitlist) + token storage/refresh
  context/
    AuthContext.tsx          # global auth state, useAuth() hook
  hooks/
    index.ts                 # useBodyScrollLock, useMousePosition
  data/
    content.tsx              # reviews, FAQs, packages, process steps
  components/
    ui/                      # Logo, shared animation variants
    layout/                  # Navbar, MobileMenu, Footer, BackgroundDecor
    modals/                  # AuthModal, MockupModal, AdminPanel, ProfileMenu
    home/                    # Hero, StatsTicker, Process, Pricing, Reviews, FAQ, Contact, FinalCTA, SeoSchema
  pages/
    Home.tsx                 # composition of home sections
    Ebooks.tsx               # ebook waitlist page
```

## Setup

```bash
npm install
cp .env.example .env      # set VITE_API_URL (default http://localhost:8080)
npm run dev
```

The API Gateway (and auth-service behind it) must be running for auth to work —
`docker compose up --build` from the `api-gateway` repo starts the full backend stack.

## Endpoints not yet backed by services

These are wired in the client but their microservices don't exist yet — the UI
handles the resulting errors gracefully:

- `POST /agency/leads`, `GET /agency/leads`, `PATCH /agency/leads/:id/status`
  → **agency-service** (next service to build)
- `POST /products/waitlist`, `GET /products/waitlist/status`, `GET /products/waitlist/count`
  → **products-service**

Once those services exist and the Gateway routes to them, the mockup-request form,
admin panel, and ebook waitlist start working with zero frontend changes.

## Security TODO

- `src/lib/api.ts` stores tokens in localStorage (XSS-vulnerable). Move the refresh
  token to an httpOnly cookie once the backend supports cookie auth — required
  before handling payments.
