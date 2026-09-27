
# CI/CD & Security Guide

How code gets from a laptop to **staging** and **production**, and the security rules enforced at every step.

```
feature/*  ──PR──►  develop  ──auto──►  STAGING   (sk_test_ keys, staging DB)
                       │
                       └──PR──►  prod  ──approval──►  PRODUCTION   (sk_live_ keys, prod DB)
```

| Workflow                         | Trigger                                                         | What it does                                                                                            |
| -------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `.github/workflows/ci.yml`     | Every PR to`develop`/`prod`, and reused by deploy           | Secret scan, dependency review,`npm audit`, security rules, lint, typecheck, migration check, build   |
| `.github/workflows/codeql.yml` | Push, PR, weekly                                                | Static security analysis (CodeQL`security-extended`)                                                  |
| `.github/workflows/deploy.yml` | Push to`develop` → staging · push to `prod` → production | Re-runs CI, applies DB migrations, verifies env, builds, deploys to Vercel, runs smoke & security tests |

---

## 1. One-time setup

Do these in order. Each step is required; skipping one weakens the chain.

### 1.1 Hosting: two separate Vercel projects

Separate projects mean staging can **never** read production secrets.

1. Create **`lovers-heart-foundation-staging`** and **`lovers-heart-foundation-production`** in Vercel. Import the repo, then **disconnect Git** (Settings → Git). Only GitHub Actions deploys, and `vercel.json` also disables Git deployments.
2. In **each** project → Settings → Environment Variables (Production scope), add:

   | Variable                 | Staging                                  | Production                                      |
   | ------------------------ | ---------------------------------------- | ----------------------------------------------- |
   | `APP_ENV`              | `staging`                              | `production`                                  |
   | `DATABASE_URL`         | staging DB URL, with`?sslmode=require` | prod DB URL, with`?sslmode=require`           |
   | `AUTH_SECRET`          | `openssl rand -base64 32`              | **different** `openssl rand -base64 32` |
   | `PAYSTACK_SECRET_KEY`  | `sk_test_…`                           | `sk_live_…`                                  |
   | `CLOUDINARY_*`         | staging sub-account or folder            | production                                      |
   | `NEXT_PUBLIC_SITE_URL` | `https://staging.<domain>`             | `https://<domain>`                            |

   The pipeline **refuses to deploy** if `APP_ENV` doesn't match the target, if production isn't using `sk_live_`, if staging *is* using `sk_live_`, if TLS isn't enforced on the DB, or if a secret sits in a `NEXT_PUBLIC_*` variable.
3. Mark every secret as **Sensitive** in Vercel (it can't be read back).
4. Settings → Deployment Protection: turn on **Vercel Authentication** for the *staging* project, so only your team can open it.
5. Assign domains: `staging.<domain>` → staging project, `<domain>` → production project.
6. Create a Vercel **access token** scoped to your team (Account → Tokens) with an expiry (e.g. 90 days). Note the **Org ID** and each **Project ID** (Project → Settings → General).

### 1.2 Databases: two separate PostgreSQL databases

In Neon (or Supabase), create one database for **staging** and one for **production**. Never share them.

- Create a dedicated DB role for the app with access to that database only.
- Enable automated backups / point-in-time restore on production.

### 1.3 Paystack

- Staging uses the **Test** keys and production the **Live** keys.
- Webhook URL: in Test mode set `https://staging.<domain>/api/paystack/webhook`; in Live mode set `https://<domain>/api/paystack/webhook`.
- Turn on 2FA for every Paystack team member, and give staff the lowest role they need.

### 1.4 GitHub Environments (Settings → Environments)

Create **`staging`** and **`production`**:

| Setting             | staging          | production                                             |
| ------------------- | ---------------- | ------------------------------------------------------ |
| Deployment branches | `develop` only | `prod` only                                          |
| Required reviewers  | none             | **1–2 maintainers** (not the person who merged) |
| Prevent self-review | –               | ✅                                                     |
| Wait timer          | –               | optional, e.g. 5 min                                   |

Add these **environment secrets** to each (values differ per environment):

| Secret                | Purpose                                                               |
| --------------------- | --------------------------------------------------------------------- |
| `VERCEL_TOKEN`      | Deploys via the Vercel CLI                                            |
| `VERCEL_ORG_ID`     | Vercel team ID                                                        |
| `VERCEL_PROJECT_ID` | That environment's Vercel project                                     |
| `DATABASE_URL`      | Used**only** to run `prisma migrate deploy` before the deploy |

And one **environment variable** (not secret): `SITE_URL` (`https://staging.<domain>` / `https://<domain>`), used by the smoke tests.

> Never add these as *repository* secrets. Environment secrets are only released to jobs that pass that environment's branch and approval rules.

### 1.5 Branch rulesets (Settings → Rules → Rulesets)

Create a ruleset targeting **`prod`** and **`develop`**:

- ✅ Restrict deletions · ✅ Block force pushes · ✅ Require linear history
- ✅ Require a pull request before merging
  - Required approvals: **1** (`develop`) / **2 if possible** (`prod`)
  - ✅ Dismiss stale approvals when new commits are pushed
  - ✅ Require review from **Code Owners** (see `.github/CODEOWNERS`; replace `@OWNER`)
  - ✅ Require conversation resolution
- ✅ Require status checks to pass (set it to require branches to be up to date). Add:
  `Secret scan`, `Dependency review`, `npm audit`, `Lint · Types · Security rules · Build`, `Analyze (javascript-typescript)`
- ✅ Require signed commits (recommended)
- Bypass list: **empty**. Admins follow the rules too.

### 1.6 Repository security settings (Settings → Code security)

- ✅ Dependency graph · ✅ Dependabot alerts · ✅ Dependabot security updates
- ✅ Secret scanning · ✅ **Push protection** (blocks commits that contain secrets)
- ✅ Code scanning (CodeQL runs from the workflow)
- ✅ Private vulnerability reporting (see `SECURITY.md`)

### 1.7 GitHub Actions settings (Settings → Actions → General)

- Actions permissions: **Allow select actions** → allow GitHub-authored actions plus:
  `step-security/harden-runner@*`, `trufflesecurity/trufflehog@*`
- Workflow permissions: **Read repository contents** (default token is read-only)
- ❌ Uncheck "Allow GitHub Actions to create and approve pull requests"
- Fork pull request workflows: **Require approval for all outside collaborators**

### 1.8 Accounts

- Require **2FA** for the GitHub org, Vercel team, Neon, Paystack and Cloudinary.
- Give each person the minimum role they need, and remove people promptly when they leave.

---

## 2. Day-to-day workflow

1. Branch from `develop`: `git switch -c feature/short-name develop`
2. Push and open a PR into **`develop`**. CI runs; fix anything red, and fill in the PR security checklist.
3. After approval, **squash-merge**. That deploys to **staging** automatically.
4. Test on `https://staging.<domain>`, including a Paystack test payment.
5. Open a PR **`develop` → `prod`**. After approval and merge, the production deploy **waits for a reviewer** in the Actions tab. Approve it, then watch the smoke tests.

**Hotfix:** branch from `prod`, PR into `prod`, then merge `prod` back into `develop`.

---

## 3. What each stage enforces

### 3.1 Pipeline

| Control                                                                | Where          | Blocks on                                                                                       |
| ---------------------------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------------------- |
| Least-privilege`GITHUB_TOKEN` (`contents: read`)                   | all workflows  | –                                                                                              |
| Actions pinned to full commit SHAs (Dependabot keeps them fresh)       | all workflows  | tampered action tags                                                                            |
| `harden-runner` egress auditing                                      | all jobs       | shows unexpected network calls (switch to`egress-policy: block` once the allow-list is known) |
| `persist-credentials: false` on checkout                             | all jobs       | token reuse by later steps                                                                      |
| `npm_config_ignore_scripts=true`                                     | CI & deploy    | malicious install scripts                                                                       |
| TruffleHog secret scan                                                 | CI             | verified or unknown secrets in history                                                          |
| Dependency review                                                      | PRs            | new high-severity CVEs, GPL/AGPL licences                                                       |
| `npm audit --omit=dev --audit-level=high` + `npm audit signatures` | CI             | vulnerable or unsigned production deps                                                          |
| CodeQL`security-extended`                                            | push/PR/weekly | XSS, injection, SSRF, etc.                                                                      |
| `scripts/security-check.mjs`                                         | CI             | project rules in §4                                                                            |
| `prisma migrate diff --exit-code`                                    | CI             | schema changed without a migration                                                              |
| Environment secrets + required reviewers                               | deploy         | unapproved or unauthorized production deploys                                                   |
| "Production only from`prod`" guard                                   | deploy         | deploys from other refs                                                                         |
| `scripts/verify-deploy-env.mjs`                                      | deploy         | wrong project, test keys in prod, live keys in staging, no DB TLS, secrets in`NEXT_PUBLIC_*`  |
| `scripts/smoke-test.mjs`                                             | deploy         | missing security headers, unprotected admin/export, unsigned webhook accepted                   |
| Pinned Vercel CLI version                                              | deploy         | surprise CLI changes                                                                            |
| `.vercel` removed after deploy                                       | deploy         | leftover credentials on the runner                                                              |

### 3.2 Application (in the code)

| Control                                                                                 | File                                                                     |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Env validated at startup; live Paystack key only in production                          | `src/lib/env.ts`, `src/instrumentation.ts`                           |
| Security headers: CSP, HSTS, X-Frame-Options, nosniff, Referrer/Permissions-Policy      | `next.config.ts`                                                       |
| `no-store` + `noindex` on `/admin` and `/api`                                   | `next.config.ts`                                                       |
| Admin gate on routes (middleware)**and** in every admin action/page (`requireAdmin`) | `src/middleware.ts`, `src/features/auth/lib/session.ts`                   |
| HttpOnly, Secure, SameSite=Lax signed session cookie (HS256, 7 days)                    | `src/features/auth/lib/session.ts`                                     |
| bcrypt (cost 12) password hashes; constant-time-ish login                               | `src/features/auth/actions.ts`, `prisma/seed.ts`                     |
| Zod validation on every server input                                                    | `src/features/*/schemas.ts`                                            |
| Payment amount set server-side; verified with Paystack (amount + currency)              | `src/features/donations/actions.ts`, `service.ts`                    |
| Webhook HMAC-SHA512 signature check (timing-safe) and re-verification                   | `src/features/donations/lib/paystack.ts`, `app/api/paystack/webhook` |
| Signed direct-to-Cloudinary uploads (admin-only signature)                              | `src/features/media/`                                                  |
| CSV export guarded by session, and escaped against formula injection                    | `app/api/admin/donations/export`                                       |
| Honeypot on public forms                                                                | `messages`, `volunteers` features                                    |
| Server Actions origin check (built into Next.js) and 1 MB body limit                    | `next.config.ts`                                                       |

---

## 4. Secure coding rules (enforced by `npm run security:check`)

CI fails if any of these are broken:

1. **Every server action in `features/*/actions.ts` calls `await requireAdmin()`**, except the public allow-list in `scripts/security-check.mjs` (`login`, `logout`, `startDonation`, `confirmDonation`, `cancelDonation`, `sendMessage`, `signUpVolunteer`). Adding to that list needs a code-owner review.
2. `actions.ts` files start with `"use server"` and export only `async function`s.
3. `queries.ts`, `service.ts`, `lib/db.ts`, `lib/env.ts`, `paystack.ts`, `cloudinary.ts` and `session.ts` import `"server-only"`.
4. Client components (`"use client"`) never import server modules (db, queries, service, paystack, cloudinary, session).
5. No `dangerouslySetInnerHTML`, `eval`, `new Function`, `$queryRawUnsafe` / `$executeRawUnsafe`, or logging of `process.env`.
6. No `NEXT_PUBLIC_*` variable whose name looks like a secret.
7. No `.env*` file is committed (only `.env.example`).

Also required, checked in review via the PR template:

- Validate **all** input on the server with Zod, even when the form already validates in the browser.
- Never trust amounts, IDs or roles sent by the browser.
- Keep money in **pesewas**.
- Error messages shown to users must not include stack traces or secrets. Log details on the server only.
- New third-party origins must be added to the CSP and tested on staging.
- Migrations must be **expand → migrate → contract**: add the new column, deploy, backfill, and only drop old columns in a *later* release. Migrations run before the new code goes live.

Run locally before pushing:

```bash
npm run security:check && npm run lint && npm run typecheck && npm run audit:prod
```

---

## 5. Operations

**Rollback:** in Vercel → project → Deployments → pick the previous deployment → *Instant Rollback*. Or from the CLI:

```bash
vercel rollback --token "$VERCEL_TOKEN"
```

Database migrations are **not** rolled back automatically. Write a new forward migration instead.

**Secret rotation** (every 90 days, and immediately if exposed):

| Secret                    | How                                                                                            |
| ------------------------- | ---------------------------------------------------------------------------------------------- |
| `AUTH_SECRET`           | New value in Vercel, then redeploy. This signs everyone out.                                   |
| `PAYSTACK_SECRET_KEY`   | Paystack → Settings → API Keys →*Generate new*, update Vercel, redeploy                   |
| `CLOUDINARY_API_SECRET` | Cloudinary → Settings → API Keys → new key, update Vercel, delete the old key               |
| `DATABASE_URL` password | Reset the role password in Neon, then update Vercel**and** the GitHub environment secret |
| `VERCEL_TOKEN`          | Create a new token, update both GitHub environments, delete the old one                        |

**If a secret leaks:** rotate it first, then investigate. Check Paystack transactions, Vercel logs and the GitHub audit log. Remove it from git history if it was committed, and record what happened.

**Monitoring:**

- Check the GitHub **Security** tab (Dependabot, CodeQL, secret scanning) weekly.
- Merge Dependabot PRs after CI passes.
- Review the Vercel logs for 4xx/5xx spikes on `/admin/login` and `/api/paystack/webhook`.

---

## 6. Known gaps / next steps

- **Login rate limiting** is not implemented yet. Add it (e.g. Upstash Ratelimit) before launch.
- The CSP allows `'unsafe-inline'` scripts, which Next.js needs without nonces. For a stricter policy, generate a nonce in `src/middleware.ts`. That makes pages dynamic, which costs more compute.
- `harden-runner` is in `audit` mode. After a few runs, copy the observed endpoints into an allow-list and switch to `egress-policy: block`.
- The Paystack CSP origins are based on Paystack's public docs. Confirm the checkout popup works on **staging** before launch.
