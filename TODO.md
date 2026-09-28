# Remaining work

## 1. Must do before launch

### Setup

- [ ] **Copy this project somewhere permanent.** It currently lives in a temporary session folder that gets deleted.
- [ ] Run `git init` and make a first commit. `.env` is already gitignored.
- [ ] Create the real services and fill in `.env` (see `.env.example`):
  - [ ] PostgreSQL on Neon or Supabase → `DATABASE_URL`
  - [X] `AUTH_SECRET` → run `openssl rand -base64 32`
  - [X] `ADMIN_EMAIL` / `ADMIN_PASSWORD` (at least 10 characters)
  - [ ] Paystack account and NGO verification → `PAYSTACK_SECRET_KEY` (start with `sk_test_…`)
  - [ ] Cloudinary account → `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
- [ ] Run `npm run db:deploy`, then `npm run db:seed`.
- [ ] If npm 12 skipped install scripts (you'll see a warning), run `npm install-scripts approve @prisma/engines esbuild`.

### Test (not yet tested)

- [ ] **Admin login form** at `/admin/login`: correct password, wrong password, sign out.
- [ ] **Paystack payment** with the test key: MoMo and card. Check the donation shows as "Success" in `/admin/donations`.
- [ ] **Paystack webhook**:
  - Locally it needs a public URL, e.g. `ngrok http 3000`.
  - Set `https://<url>/api/paystack/webhook` in Paystack → Settings → API Keys & Webhooks.
  - Pay, close the tab before confirming, and check the donation still becomes "Success".
- [ ] **Cloudinary uploads**: upload gallery photos (several at once), set a home's photo, then delete a photo.
- [ ] **CSV export** with filters on the donations page.
- [ ] The admin pages on a phone.

### Replace placeholder content

- [ ] `src/config/site.ts`:
  - MoMo numbers, bank details, phone, email, address, WhatsApp
  - `foundedYear` and social links
  - `impactHints` (what each amount pays for)
- [X] `src/features/landing/components/about-section.tsx`: the founding story and mission copy.
- [ ] Hero and About photos: swap each `<PhotoPlaceholder>` for `<Image>` in `hero-section.tsx` and `about-section.tsx`.
- [ ] Sample homes and outreach from the seed: edit or delete them in `/admin`.

### Go live

- [ ] Deploy on Vercel: import the repo and add all env vars. The `vercel-build` script runs the migrations.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real domain and connect the domain.
- [ ] Switch Paystack to live keys and update the webhook URL to the live domain.

## 2. Completed & Nice to have

- [X] Rate-limit login attempts: Distributed PostgreSQL rate limiter (`RateLimit` model + memory fallback) protecting `/admin/login`.
- [X] Admin Settings & Change Password: Created `/admin/settings` page and `changePassword` action with bcrypt hashing.
- [ ] Email alerts for new donations, messages and volunteers (e.g. Resend).
- [X] Scheduled job that marks old `PENDING` donations as `ABANDONED`: Created `/api/cron/cleanup-donations` + `vercel.json` cron config.
- [ ] Monthly recurring donations (Paystack Plans).
- [X] SEO: `sitemap.ts`, `robots.ts`, dynamic Open Graph social card image generator (`opengraph-image.tsx`).
- [X] Automated tests: 25 comprehensive test suites covering auth, security, state transitions, idempotency, and schemas.
- [X] Error pages (`error.tsx`): Built public error boundary and admin dashboard error boundary.

## Notes

- `prisma migrate dev` needs a database that allows creating a second, temporary database. Neon and Supabase both do; I only hit this limit with the embedded test database.
- All amounts are stored in **pesewas** (GH₵ 1 = 100). Use `formatCedis()` when displaying them.
- Every admin server action must call `requireAdmin()`. The proxy alone doesn't protect them.
