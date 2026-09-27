
## What & why

<!-- Short description of the change and the reason for it -->

## How was it tested?

- [ ] Locally
- [ ] On staging (after merge to `develop`)

## Security checklist

- [ ] New/changed **admin** server actions call `await requireAdmin()`
- [ ] All user input is validated with a **Zod** schema on the server
- [ ] No secrets in code, logs, error messages, or `NEXT_PUBLIC_*` variables
- [ ] New third-party script/image/API origins are added to the **CSP** in `next.config.ts`
- [ ] DB migrations are **backward compatible** with the currently deployed code
- [ ] Money logic: amounts stay in **pesewas** and are verified server-side with Paystack
- [ ] New dependencies are necessary, maintained, and licence-compatible

## Screenshots (UI changes)
