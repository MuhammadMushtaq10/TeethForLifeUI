# CLAUDE.md

## Project Overview
A website + WhatsApp appointment reminder system for dental clinics in Karachi, Pakistan. This repository currently contains **only the frontend** (a React/Vite SPA for the "Teeth For Life" clinic). The backend the UI talks to is not in this repo and has not been built yet; the WhatsApp reminder agent is also not started.

## Business Context
- Clients: Dental clinics in Karachi
- Product 1: Clinic website (one-time fee)
- Product 2: WhatsApp appointment reminder agent (monthly retainer)
- Status: Website 60-70% complete, WhatsApp agent not started

## Tech Stack

### Frontend
- **Framework:** React 18 (function components + hooks) on Vite 5, JSX (no TypeScript)
- **Styling:** Tailwind CSS 3 with a custom theme (`primary` `#00A6FF`, `accent` `#FF6B6B`, custom text colors) and four reusable component classes in [src/index.css](src/index.css) (`btn-primary`, `btn-outline`, `card`, `input-field`)
- **Key libraries:**
  - `react-router-dom` v6 — routing (public pages + admin section)
  - `@reduxjs/toolkit` + `react-redux` — only used for admin auth (token in `localStorage`)
  - `react-hook-form` — all forms (booking, contact, admin login, add appointment)
  - `axios` — HTTP client with JWT interceptor in [src/api/client.js](src/api/client.js)
  - `react-hot-toast` — toast notifications (admin pages only)
- **Dev command:** `npm run dev` (Vite on port 5173, proxies `/api` → `http://localhost:3000`)
- **Build command:** `npm run build` (outputs to `dist/`); preview with `npm run preview`

### Backend
- **Framework:** **Not in this repo.** The frontend assumes a backend at `http://localhost:3000` (per the Vite proxy in [vite.config.js:9-13](vite.config.js#L9-L13)) speaking JSON over REST, with JWT bearer tokens for admin endpoints. Nothing about the backend is checked in — no server folder, no schema, no migrations, no `.env.example`. Based on the API surface and response shapes the UI consumes, a Node/Express + SQL (PostgreSQL or similar — patient `created_at`, integer `id`, `price_pkr` numeric, ENUM-like status strings) implementation is the natural fit, but that decision has not been made in code.
- **Database:** Not implemented. Schema below is **inferred from frontend usage**, not from any migration file.
- **Key libraries:** N/A — needs to be picked. A reasonable starter: `express`, `pg` or `prisma`, `jsonwebtoken`, `bcrypt`, `zod` for validation, `node-cron` (for WhatsApp reminders), `twilio` (WhatsApp).
- **Dev command:** N/A — backend does not exist yet.

## Folder Structure
```
Teeth-for-life_UI/
├── index.html                 # Vite entry, mounts #root
├── package.json               # name: teeth-for-life-frontend, v1.0.0
├── postcss.config.js          # tailwind + autoprefixer
├── tailwind.config.js         # custom color theme
├── vite.config.js             # /api proxy to localhost:3000
├── .gitignore                 # node_modules, dist, .env*
├── public/
│   └── images/                # 9 service/clinic images (.jfif + 1 .png)
│       ├── braces.jfif, clinic-interior.png, extraction.jfif,
│       ├── general-checkup.jfif, implant.jfif, kids-dentistry.jfif,
│       ├── root-canal.jfif, scaling.jfif, teeth-whitening.jfif
│       # MISSING (referenced but absent): hero-dental.jpg, doctor.jpg, tooth.svg
└── src/
    ├── main.jsx               # Renders <App> wrapped in Provider/Router/LanguageProvider
    ├── App.jsx                # Route table (public + admin)
    ├── index.css              # Tailwind directives + 4 component classes
    ├── api/
    │   └── client.js          # Axios instance, JWT interceptor, 401 redirect
    ├── components/
    │   ├── Navbar.jsx         # Hides itself on /admin routes
    │   ├── Footer.jsx         # Hardcoded address, phone, hours, social = "#"
    │   ├── WhatsAppButton.jsx # Floating button → wa.me/923158565662
    │   ├── ProtectedRoute.jsx # Redirects to /admin/login if no token
    │   └── AppointmentModal.jsx # Admin "Add Appointment" modal
    ├── context/
    │   └── LanguageContext.jsx # EN/UR translations + RTL toggle
    ├── hooks/
    │   └── useAuth.js         # Wraps Redux auth state
    ├── pages/
    │   ├── Home.jsx           # Hero + services + why + doctor + testimonials + map + CTA
    │   ├── Services.jsx       # Expandable service cards with hardcoded procedure steps
    │   ├── BookAppointment.jsx # Public 1-step booking form (~20KB, well-built)
    │   ├── About.jsx          # Story + doctor profile + team + certifications
    │   ├── Contact.jsx        # Contact form (SUBMITS TO NOTHING — see TODO)
    │   └── admin/
    │       ├── Login.jsx
    │       ├── Dashboard.jsx     # Stats + upcoming appointments table
    │       ├── Appointments.jsx  # List, filter, status change, CSV export
    │       └── Patients.jsx      # List + search
    └── store/
        ├── index.js           # Redux store (auth reducer only)
        └── slices/
            └── authSlice.js   # loginAdmin thunk, logout, token in localStorage
```

## Environment Variables
This is the entire list. `.env.example` does **not** exist — create one.

| Variable | Where used | Description |
|---|---|---|
| `VITE_API_URL` | [src/api/client.js:3](src/api/client.js#L3) | Backend base URL. Optional in dev (Vite proxies `/api` → `localhost:3000`); required in production builds, e.g. `https://api.teethforlife.pk`. |

**Backend variables needed once it's built** (none exist yet, listed here for planning):
- `DATABASE_URL` — Postgres connection string
- `JWT_SECRET` — for signing admin tokens
- `JWT_EXPIRES_IN` — e.g. `7d`
- `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` — seed credentials
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM` — WhatsApp agent
- `CLINIC_TIMEZONE` — e.g. `Asia/Karachi` for scheduling
- `PORT` — server port (defaults to 3000 to match the Vite proxy)

## API Endpoints
**None of these are implemented yet** — they are inferred from frontend calls. Public endpoints take no auth; `/api/admin/*` endpoints expect `Authorization: Bearer <jwt>`.

| Method | Path | Used by | Purpose / expected response shape |
|---|---|---|---|
| `GET` | `/api/services` | Home, Services, BookAppointment, AppointmentModal | Return `[{ id, name, description, duration_minutes, price_pkr }]` |
| `GET` | `/api/availability?date=YYYY-MM-DD` | BookAppointment, AppointmentModal | Return available time slots for the date as `["09:00", "09:30", ...]` (array of strings). Clinic closed Sunday. |
| `POST` | `/api/appointments/book` | BookAppointment | Public booking. Body: `{ service_id, appointment_date, appointment_time, full_name, phone, email?, notes? }`. Returns `{ phone, appointment: { service, date, time } }`. |
| `POST` | `/api/admin/login` | authSlice | Body: `{ email, password }`. Returns `{ token }`. |
| `GET` | `/api/admin/dashboard` | admin/Dashboard | Returns `{ todayCount, weekCount, totalPatients, noShowRate, upcoming: [...] }` |
| `GET` | `/api/admin/appointments?date=&status=&search=` | admin/Appointments | Returns `[{ id, patient_name, patient_phone, service_name, appointment_date, appointment_time, status, source, notes }]` |
| `PATCH` | `/api/admin/appointments/:id` | admin/Appointments | Body: `{ status }`. Update status only. |
| `POST` | `/api/admin/appointments` | AppointmentModal | Admin-created appointment. Body: `{ full_name, phone, email?, service_id, appointment_date, appointment_time, notes?, date_of_birth? }` (`date_of_birth` only when new patient). |
| `GET` | `/api/admin/appointments/export?from=&to=` | admin/Appointments | Returns CSV blob (`Content-Type: text/csv`). |
| `GET` | `/api/admin/patients?search=` | admin/Patients | Returns `[{ id, full_name, phone, email, date_of_birth, created_at }]` |

**Not implemented anywhere (gap to fix):**
- `POST /api/contact` — Contact form currently submits to nothing; see [Contact.jsx:10-14](src/pages/Contact.jsx#L10-L14)

## Database Schema
**No migrations or schema files exist.** This is inferred from API response shapes and form payloads:

- **`services`**
  - `id` (PK), `name` (string, unique — used as image key in frontend!), `description` (text), `duration_minutes` (int), `price_pkr` (numeric)
  - Seed data must include the 8 names hardcoded in [src/pages/Home.jsx:6-15](src/pages/Home.jsx#L6-L15) for images and [src/pages/Services.jsx:17-42](src/pages/Services.jsx#L17-L42) for procedure steps: General Checkup, Teeth Cleaning, Teeth Whitening, Root Canal, Dental Implant, Braces Consultation, Kids Dentistry, Tooth Extraction.

- **`patients`**
  - `id` (PK), `full_name`, `phone` (Pakistani format `^(\+92|0)[0-9]{10}$`), `email` (nullable), `date_of_birth` (nullable), `created_at`
  - `phone` is the natural key for de-duping repeat patients.

- **`appointments`**
  - `id` (PK), `patient_id` (FK → patients), `service_id` (FK → services), `appointment_date` (date), `appointment_time` (time string `HH:MM`), `status` ENUM (`PENDING`, `CONFIRMED`, `CANCELLED`, `NO_SHOW`, `COMPLETED`), `source` ENUM (`ONLINE`, `MANUAL`/walk-in — frontend only checks for `'ONLINE'` styling), `notes` (text, nullable), `created_at`
  - Composite uniqueness on (`appointment_date`, `appointment_time`) is the simplest way to enforce availability.

- **`admin_users`**
  - `id` (PK), `email`, `password_hash`, `created_at` (single-tenant for now — one admin per clinic)

## What Is Complete
- Public site routing and layout (Navbar with EN/UR toggle, sticky header, Footer, floating WhatsApp button)
- Bilingual EN/UR translation system with RTL switching ([src/context/LanguageContext.jsx](src/context/LanguageContext.jsx)) — wired across all public pages
- **Home page**: hero, services preview (data-driven), why-choose-us, doctor section, testimonials, Google Maps embed, CTA
- **Services page**: expandable cards with per-service procedure steps and deep-link to booking
- **Book Appointment**: full form with service preselect via `?service=`, date picker with Sunday block, dynamic time-slot grid, validation, Pakistani phone regex, success state
- **About page**: story, doctor profile, team grid, certifications, mission banner
- **Contact page** *(UI only — see TODO)*: contact cards, form with validation, hours, embedded map
- **Admin section**:
  - Login with Redux thunk + JWT in `localStorage` + auto-redirect on 401
  - Protected routes via [src/components/ProtectedRoute.jsx](src/components/ProtectedRoute.jsx)
  - Dashboard with stat cards + upcoming appointments table
  - Appointments page with date/status filters, search, inline status edit, CSV export, "Add" modal
  - Patients page with search
- Tailwind theme + reusable component classes; responsive across breakpoints; SVG icons inline (no icon-library dependency)
- Vite dev proxy for `/api` to a local backend

## What Is Incomplete / TODO
**Backend (the big one):**
- The entire backend at `http://localhost:3000` does not exist. Every API endpoint listed above needs implementation, plus migrations and a seed for the 8 services.
- Auth: no admin user seeded; no password reset; no token refresh; tokens persisted in `localStorage` (XSS risk — acceptable for v1 but document the trade-off).

**Frontend bugs / gaps:**
- **Contact form does not actually submit anywhere.** [Contact.jsx:10-14](src/pages/Contact.jsx#L10-L14) — `onSubmit` just toggles a success banner. Needs to POST to a new `/api/contact` endpoint or send via email/WhatsApp.
- **Missing images** referenced in code:
  - `/images/hero-dental.jpg` ([Home.jsx:145](src/pages/Home.jsx#L145)) — hidden via `onError` so it silently disappears in the hero
  - `/images/doctor.jpg` (Home.jsx and About.jsx) — same silent fallback
  - `/tooth.svg` favicon ([index.html:5](index.html#L5)) — referenced but not present in `public/`
- **Stale/dead links:** social media icons in Footer (`href="#"`), Privacy Policy and Terms of Service in Footer (`href="#"`)
- **Google Maps embed coordinates** ([Home.jsx:375](src/pages/Home.jsx#L375), [Contact.jsx:184](src/pages/Contact.jsx#L184)) appear to be placeholder/generic — verify they point to the actual clinic
- **Inconsistent clinic hours wording**: Footer says "Monday – Saturday", BookAppointment sidebar lists Mon-Fri and Saturday separately, Contact lists each day. Pick one and make it data-driven (or at least consistent).
- **Hardcoded content that should be data-driven** (per the brief — these are fine to ship hardcoded but flag for the client):
  - Testimonials ([Home.jsx:56-60](src/pages/Home.jsx#L56-L60))
  - Doctor bio, stats (15+/10K+/5K+), team list, certifications ([About.jsx](src/pages/About.jsx))
  - `serviceImages` and `serviceDetails` maps keyed by service **name string** — fragile; if the backend renames a service, the image and step list silently disappear. Better: store `image_url` and `steps` (JSON) on the `services` table.
- **No `.env.example`** at the root
- **No tests** (no Vitest/Jest setup)
- **No error boundary** — a thrown render error blanks the app
- **5 npm vulnerabilities** (4 moderate, 1 high) reported on install — run `npm audit fix` and review
- Admin section has no pagination on Appointments/Patients lists; will struggle past a few hundred rows
- Admin "Add Appointment" modal POSTs to `/api/admin/appointments` but the AppointmentModal does not yet expose a way to mark `source: MANUAL` — backend should default it based on the route

**WhatsApp reminder agent:** not started (see next section).

## WhatsApp Agent Plan
- Not built yet
- Stack to use: Twilio WhatsApp API + Node.js cron job
- Reminder flow: booking saved → 24hr reminder → 2hr reminder
- Needs: /api/appointments endpoint, Twilio setup, scheduler

Concrete next steps when starting it:
1. Add `twilio` + `node-cron` to backend deps; load `TWILIO_*` env vars.
2. Cron tick every ~5 minutes: find appointments where `status = 'CONFIRMED'` and the appointment time is ~24h or ~2h from now, that have not yet been notified at that tier.
3. Add `appointment_reminders` table or two boolean columns (`reminder_24h_sent_at`, `reminder_2h_sent_at`) on `appointments` to make the cron idempotent.
4. Templates: a 24h "we look forward to seeing you tomorrow at HH:MM" and a 2h "your appointment is in 2 hours". Localize to EN/UR based on a `preferred_lang` field on `patients` (add it).
5. Handle inbound replies via a Twilio webhook to let patients confirm/cancel (CONFIRM → status `CONFIRMED`, CANCEL → status `CANCELLED`).

## How To Run Locally

**Frontend (this repo):**
```powershell
npm install
npm run dev          # http://localhost:5173
```
The dev server proxies `/api/*` to `http://localhost:3000`, so without a backend running every API call will fail and the UI will show empty states (Home/Services lists empty, booking can't submit, admin login can't authenticate).

**Backend:** does not exist yet. To make the UI functional end-to-end, build a server on `http://localhost:3000` that implements the endpoints in the **API Endpoints** table above, or temporarily mock them.

**Build for production:**
```powershell
$env:VITE_API_URL = "https://api.example.com"
npm run build        # outputs to dist/
npm run preview      # local preview of the production build
```

## Key Files
- [package.json](package.json) — deps and scripts. No `lint` or `test` scripts defined.
- [vite.config.js](vite.config.js) — Vite + React plugin; **`/api` → `http://localhost:3000` proxy is the contract for the missing backend**
- [tailwind.config.js](tailwind.config.js) — custom color tokens (`primary`, `accent`, `text-main`, `text-muted`)
- [src/index.css](src/index.css) — Tailwind directives + the 4 reusable component classes
- [src/main.jsx](src/main.jsx) — Provider chain order: Redux → Router → Language → App
- [src/App.jsx](src/App.jsx) — single route table; admin routes wrapped in `<ProtectedRoute>`
- [src/api/client.js](src/api/client.js) — axios instance, JWT attach, **automatic redirect to `/admin/login` on 401** (only for `/admin/*` paths)
- [src/store/slices/authSlice.js](src/store/slices/authSlice.js) — only Redux slice; holds the JWT
- [src/context/LanguageContext.jsx](src/context/LanguageContext.jsx) — EN/UR translation dictionary + `dir="rtl"` swap. **All user-facing strings should live here.**
- [src/pages/BookAppointment.jsx](src/pages/BookAppointment.jsx) — the most complex page; reference for form patterns
- [src/components/AppointmentModal.jsx](src/components/AppointmentModal.jsx) — reused by both admin Dashboard and Appointments

## Code Conventions
- **JSX, no TypeScript.** All files `.jsx`. Function components only; no class components.
- **One default export per file.** Page/component name matches the filename (PascalCase).
- **File layout:** `pages/` for top-level routes, `components/` for shared UI, `context/` for React context providers, `hooks/` for custom hooks (camelCase, `useXxx`), `store/slices/` for Redux slices (`xxxSlice.js`).
- **API calls** always go through the shared `client` in [src/api/client.js](src/api/client.js) — never `fetch` directly, never raw `axios`. Always handle errors in `.catch` (often silenced with `() => {}` for read endpoints; toast on writes).
- **Forms** use `react-hook-form` with `register('field')` + `formState.errors`. Validation lives in the `register` call. Pakistani phone regex `^(\+92|0)[0-9]{10}$` is reused — DRY it up if added a third time.
- **i18n:** any new string visible to end users should go through `useLang()` → `t('key')`. Both `en` and `ur` keys must be added to [LanguageContext.jsx](src/context/LanguageContext.jsx). Admin pages are English-only (intentional).
- **Styling:** Tailwind utility classes inline. For repeated patterns use the four `@layer components` classes (`btn-primary`, `btn-outline`, `card`, `input-field`). Custom colors via the theme tokens (`bg-primary`, `text-accent`, `bg-primary-light`); never hex literals in JSX.
- **Icons:** inline SVG (Heroicons-style paths) — no icon-library dependency. Copy an existing one rather than introducing `react-icons`.
- **Auth state:** read via `useAuth()` (wraps the Redux selector); never read `localStorage.token` directly in components.
- **API field naming:** snake_case in payloads and responses (`full_name`, `appointment_date`, `service_id`) to match what the (future) backend will use.
- **Status/source values are UPPERCASE strings** (`PENDING`, `CONFIRMED`, `ONLINE`) — keep this when implementing the backend.
