# Deployment readiness

This application can be deployed as a **WhatsApp-assisted storefront** after the checklist below. It is **not an online-checkout store yet**: cart/order requests are sent to WhatsApp, and the Razorpay/payment/order lifecycle described in the architecture plan is not implemented.

## Blockers to resolve first

- **Rotate previously exposed credentials.** An earlier version of `.env.example` contained live-looking database, Auth.js, and Cloudinary values. The template now contains blanks, but any real credential that was committed, pushed, copied, or shared must be rotated at its provider. Removing a value from the current file does not remove it from Git history. Keep `.env` private and never paste its contents into chat or commit it.
- Verify that the WhatsApp number in `lib/whatsapp.ts` is the correct business number and is monitored.
- Supply and review real product copy, photos, prices, stock, shipping information, and business claims. Sample catalog items are skipped by default when seeding; upload/import the real catalog before launch.
- Decide whether the first release is WhatsApp-only or must accept online payment. For online payment, complete checkout, tax/shipping calculation, inventory reservation, payment verification/webhooks, order emails, cancellation/refund handling, and failure recovery first. Do not enable or advertise Razorpay checkout until these are implemented and tested.
- Provide approved Privacy, Terms, Shipping, and Returns policies. Their legal/business content cannot safely be inferred from the code. Footer links to unsupported placeholder services were removed.

## Vercel setup

1. Import the repository and set Vercel's **Root Directory** to the nested `sanaera-nextjs` app folder (the folder containing `package.json`). Keep the standard Next.js build command. The `prebuild` check validates production environment configuration in Vercel builds.
2. Create production and preview environment variables in Vercel. Required values are: `DATABASE_URL` (pooled PostgreSQL runtime URL), `DIRECT_URL` (direct PostgreSQL URL for Prisma migrations), `AUTH_SECRET` (at least 32 characters), `NEXT_PUBLIC_APP_URL` (the canonical HTTPS URL), `CRON_SECRET`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, and `EMAIL_FROM`.
3. Set Google OAuth variables only if Google sign-in will be offered, and add the production callback URL to the Google OAuth configuration. Razorpay variables are not required for the currently implemented WhatsApp flow.
4. Run `npm run check:deploy` in a trusted environment with the production variables set. It reports missing variable names only; it never prints secret values. Vercel runs the same validation automatically before its build.
5. Apply migrations to the intended production database with `npm run db:deploy` from a trusted shell that has production `DATABASE_URL` and `DIRECT_URL`. Do not run `prisma migrate dev` against production.
6. Provision the first administrator deliberately. Set `SEED_ADMIN_EMAIL` and a unique `SEED_ADMIN_PASSWORD` of at least 16 characters in the trusted seeding environment, set `NODE_ENV=production`, and run `npm run db:seed` only after verifying the database target. Production seed execution fails without those admin values and skips sample products. `SEED_DEMO_PRODUCTS=true` is for disposable development databases only.
7. Confirm Vercel Cron is enabled on the chosen plan and that `CRON_SECRET` is configured. The low-stock job intentionally returns an error if its secret is missing.
8. After deployment, test registration/email verification, login/logout, admin permissions, product publishing and images, contact submission/inbox, newsletter subscription/settings, search, WhatsApp links, mobile layout, and the scheduled job. Do not test real customer payments because checkout is not implemented.

## Current implementation boundary

Implemented for the launch candidate: database-aware published catalog, guest cart and wishlist UI, account/auth flows, product/inventory admin, contact form and admin inbox, newsletter persistence/listing, image uploads, low-stock cron, and WhatsApp-assisted ordering. The public product-creation API is disabled; catalog writes must use the permission-checked admin flow. Production builds fail closed rather than showing sample products when the database is unavailable.

Still not implemented or not launch-complete: online checkout/payments, the returns workflow, banner and homepage editors, analytics reports/CSV, newsletter confirmation/unsubscribe campaign workflow, legal policy content, and a full WCAG audit. Links to the unimplemented admin sections have been removed so they do not lead to 404 pages. The current accessibility work (skip navigation, dialog focus handling, reduced-motion handling, labels and focus indicators) is a foundation, not a certification; complete keyboard, screen-reader, zoom, contrast, and mobile testing before claiming WCAG conformance.
