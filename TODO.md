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
- [ ] `src/features/landing/components/about-section.tsx`: the founding story (the highlighted `[Placeholder]` text).
- [ ] Hero and About photos: swap each `<PhotoPlaceholder>` for `<Image>` in `hero-section.tsx` and `about-section.tsx`.
- [ ] Sample homes and outreach from the seed: edit or delete them in `/admin`.

### Go live

- [ ] Deploy on Vercel: import the repo and add all env vars. The `vercel-build` script runs the migrations.
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the real domain and connect the domain.
- [ ] Switch Paystack to live keys and update the webhook URL to the live domain.

## 2. Nice to have (not built)

- [ ] Rate-limit login attempts (e.g. Upstash Ratelimit).
- [ ] Admin user management and a change-password page. Right now the only admin comes from the seed.
- [ ] Email alerts for new donations, messages and volunteers (e.g. Resend).
- [ ] A scheduled job that marks old `PENDING` donations as `ABANDONED` (e.g. a Vercel Cron hitting an API route).
- [ ] Monthly recurring donations (Paystack Plans).
- [ ] SEO: `sitemap.ts`, `robots.ts`, an Open Graph image.
- [ ] Automated tests: Vitest for the schemas and Paystack signature check, Playwright for donate and admin flows.
- [ ] Error pages (`error.tsx`) for the site and admin sections.

## Notes

- `prisma migrate dev` needs a database that allows creating a second, temporary database. Neon and Supabase both do; I only hit this limit with the embedded test database.
- All amounts are stored in **pesewas** (GH₵ 1 = 100). Use `formatCedis()` when displaying them.
- Every admin server action must call `requireAdmin()`. The proxy alone doesn't protect them.
