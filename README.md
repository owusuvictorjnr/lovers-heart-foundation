# Lovers Heart Foundation: Website & Admin

Website for **Lovers Heart Foundation**, a Ghanaian NGO that donates to children's homes every year.
Visitors can donate online (Mobile Money / card via Paystack), browse the gallery, sign up to volunteer
and send messages. Staff manage everything from `/admin`.

## Stack

| Concern    | Choice                                              |
| ---------- | --------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Server Actions), TypeScript |
| Styling    | Tailwind CSS v4                                     |
| Database   | PostgreSQL + Prisma ORM                             |
| Payments   | Paystack (MoMo: MTN, Telecel, AT · cards · bank)  |
| Images     | Cloudinary (direct signed uploads + CDN resizing)   |
| Auth       | Signed JWT session cookie (`jose`) + `bcryptjs` |
| Validation | Zod (shared by forms and server actions)            |

It's a single deployable **monolith**: Next.js serves the pages *and* the backend (server actions + API routes),
so there's no separate API server to host.

## Project structure (feature-first)

```
src/
├── app/                      # Routing only: thin pages that compose features
│   ├── (site)/               #   public website
│   ├── admin/login/          #   admin sign-in
│   ├── admin/(dashboard)/    #   protected admin pages
│   └── api/                  #   Paystack webhook, CSV export
├── features/                 # One folder per business feature
│   ├── auth/                 #   session, login/logout
│   ├── donations/            #   Paystack checkout, verification, admin table
│   ├── gallery/              #   public lightbox gallery + admin uploads
│   ├── homes/                #   children's homes CRUD
│   ├── outreach/             #   yearly outreach timeline CRUD
│   ├── messages/             #   contact form + inbox
│   ├── volunteers/           #   volunteer sign-up + admin list
│   ├── media/                #   shared Cloudinary upload helpers
│   ├── landing/              #   hero, about, impact, header, footer
│   └── admin/                #   dashboard shell, shared admin UI
├── components/ui/            # Generic, feature-agnostic UI primitives
├── config/site.ts            # Contact info, MoMo numbers, donation presets
├── lib/                      # db client, utils, image loader
└── proxy.ts                  # Redirects signed-out users away from /admin
```

Each feature folder follows the same shape:

```
features/<name>/
├── actions.ts      # "use server" mutations (always call requireAdmin() for admin ones)
├── queries.ts      # server-only reads
├── schemas.ts      # Zod schemas (shared client/server)
├── lib/            # feature-specific integrations (e.g. paystack.ts)
└── components/     # UI; admin-only UI lives in components/admin/
```

**Rule of thumb:** `app/` imports from `features/`; features may import from `components/`, `lib/`, `config/`
and (sparingly) other features' public files, but never from `app/`.

## Getting started

```bash
npm install
cp .env.example .env         # then fill in the values
npm run db:migrate              # create tables
npm run db:seed                 # create the admin account + sample content
npm run dev                     # http://localhost:3000  ·  admin at /admin
```

### Environment variables

See `.env.example`. You'll need:

- **DATABASE_URL**: a PostgreSQL connection string (free: [Neon](https://neon.tech) or [Supabase](https://supabase.com)).
- **AUTH_SECRET**: run `openssl rand -base64 32`.
- **ADMIN_EMAIL / ADMIN_PASSWORD**: the first admin login (password ≥ 10 characters).
- **PAYSTACK_SECRET_KEY**: from Paystack → Settings → API Keys (`sk_test_…` for testing).
- **CLOUDINARY_***: from the Cloudinary console dashboard.

## Payments flow

1. Donor fills the form → `startDonation` saves a **PENDING** donation and initialises a Paystack transaction server-side (the amount can't be tampered with).
2. Paystack popup opens (MoMo / card / bank).
3. On success the browser calls `confirmDonation`, which verifies with Paystack's API and marks it **SUCCESS**.
4. As a safety net, Paystack also calls **`/api/paystack/webhook`** (signature-checked), so payments are recorded even if the donor closes the tab.

**Paystack setup:** in the dashboard under Settings → API Keys & Webhooks, set the webhook URL to
`https://<your-domain>/api/paystack/webhook`. Switch to live keys once the business is verified.

## Deployment (≈ free)

- **Vercel** (Hobby) for the app. Add all env vars in Project → Settings → Environment Variables.
- **Neon** or **Supabase** free Postgres.
- **Cloudinary** free tier for images.
- Vercel automatically runs the `vercel-build` script: `prisma generate` → `prisma migrate deploy` → `next build`.

## Scripts

| Script                 | What it does                            |
| ---------------------- | --------------------------------------- |
| `npm run dev`        | Run locally                             |
| `npm run build`      | Production build                        |
| `npm run db:migrate` | Create/apply a migration in development |
| `npm run db:deploy`  | Apply migrations in production          |
| `npm run db:seed`    | Seed admin + sample content             |
| `npm run db:studio`  | Browse the database in Prisma Studio    |
| `npm run typecheck`  | TypeScript check                        |
