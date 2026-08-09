# SANAÉRA — Backend Architecture & Roadmap

This tracks the phased build described in the project brief. Phase 1 (this
commit) is the foundation everything else sits on. Nothing below Phase 1 is
implemented yet — this file is the plan, not a changelog.

## Phase 1 — Foundation (done)

- `prisma/schema.prisma` — full normalized schema: auth (User/Account/Session/
  VerificationToken), RBAC (Role/Permission/RolePermission), catalog (Category/
  Collection/Product/ProductVariant/ProductImage/Inventory), cart/wishlist/
  recently-viewed, orders/payments/coupons/returns, reviews (+ replies/reports),
  marketing/content (Banner/HomepageSection/NewsletterSubscriber/
  ContactMessage), notifications, and AuditLog.
- `.env.example` — every credential the later phases need, documented.
- `lib/prisma.ts` — Prisma client singleton (hot-reload safe).
- `prisma/seed.ts` — roles + permissions, a super-admin account, categories,
  collections, and a handful of real products with variants + inventory.
- `package.json` — all backend dependencies pinned (Auth.js, bcrypt, zod,
  Cloudinary, Razorpay, Nodemailer, react-hook-form, @react-pdf/renderer for
  invoices, recharts for admin analytics charts).

**To actually run this phase:**
```bash
cp .env.example .env        # fill in a real Postgres URL at minimum
npm install
npx prisma migrate dev --name init
npm run db:seed
```

## Phase 2 — Auth.js (done)

- `lib/auth.ts` — Auth.js v5 config: Credentials provider (bcrypt-checked,
  rate-limited), Google provider, Prisma adapter, JWT sessions. "Remember me"
  is implemented via a custom `effectiveExp` claim checked in the `session`
  callback, since Auth.js's `session.maxAge` is a single static ceiling (30
  days) and can't vary per sign-in — unchecking "remember me" gives an
  effective 1-day session even though the cookie itself lives longer.
- `lib/password.ts` — bcrypt hash/verify (cost factor 12).
- `lib/otp.ts` — generates 6-digit OTP codes and long reset tokens, both
  backed by the `VerificationToken` table; tokens are single-use (deleted on
  any consumption attempt, valid or not) and old tokens for the same
  identifier+type are invalidated when a new one is requested.
- `lib/email.ts` — Nodemailer sender for welcome / OTP / password-reset /
  password-changed emails, with minimal shared brand-styled HTML.
- `lib/validations/auth.ts` — Zod schemas for every auth form.
- `lib/rate-limit.ts` — Upstash-backed sliding-window limiter for login, OTP
  requests, and password reset; **no-ops (allows everything) if
  `UPSTASH_REDIS_REST_URL`/`TOKEN` aren't set** — configure these before
  production.
- `app/(auth)/actions.ts` — Server Actions: register, request/verify OTP,
  forgot/reset password, change password. All return a generic message on
  the forgot-password and OTP-resend paths regardless of whether the email
  exists, to avoid account enumeration.
- `app/(auth)/{login,register,verify-email,forgot-password,reset-password}` —
  pages + matching client form components in `components/auth/`.
- `middleware.ts` — gates `/account/*` behind a session (redirects to
  `/login?callbackUrl=...`). `/admin` protection is added in Phase 4.
- `types/next-auth.d.ts` — augments Session/User/JWT with `id` and `role`.

**Known gaps / things to verify once you can actually run this:**
- I couldn't `npm install` or run this against a real database or SMTP
  server here, so treat it as reviewed-but-untested — run `npx prisma
  validate`, then walk through register → OTP email → verify → login by
  hand once your `.env` is filled in.
- Change-password is implemented as a Server Action (`changePasswordAction`)
  but has no page yet — it'll get a home in `/account/security` in Phase 3.
- Header's Wishlist/Bag links now point at `/account/wishlist` and
  `/account/cart`, which don't exist until Phase 3 — they'll 404 (after
  passing the login gate) until then.
- The Google provider assumes `emailVerified` should be trusted from Google;
  double-check that's the policy you want (vs. re-verifying via OTP too).

## Phase 3 — Customer dashboard & APIs (done)

- `/account` — sidebar layout (Dashboard, Orders, Wishlist, Cart, Addresses,
  Payment Methods, Profile, Notifications, Security, Settings), gated by
  `middleware.ts` from Phase 2.
- Every page is a Server Component reading straight from Prisma — no
  round-trip through the app's own API for the initial render. The REST
  route handlers under `app/api/{cart,wishlist,addresses,orders,
  notifications}/` exist for **client-side interactions** (quantity steppers,
  remove buttons, the address form) and for whatever else ends up calling
  them (mobile app, future product-page "Add to Bag" wiring, etc).
- **Every route handler scopes its query to the session's `user.id`** —
  never `where: { id }` alone. Cross-user access returns 404, not 403, so an
  id can't be used to confirm another user's data exists (see
  `lib/api-auth.ts` and the ownership checks in each handler).
- Guest cart: `lib/guest-session.ts` sets an httpOnly `guest_session_id`
  cookie; `lib/cart.ts` supports carts keyed by either `userId` or
  `guestSessionId`; `lib/merge-guest-data.ts` folds a guest cart into the
  user's cart (quantities combine) the moment `/account` loads after login,
  then clears the cookie. Wishlist has no guest-side table by design (the
  brief calls for localStorage-based guest wishlists) — merging that is a
  client-side job: replay the localStorage list against `POST /api/wishlist`
  once a session exists.
- Inventory-aware cart: adding/updating a line item is clamped to
  `Inventory.availableStock` so the cart can't silently promise more stock
  than exists.
- Change-password (built in Phase 2) now has a home at `/account/security`;
  Google-only accounts see an explanatory message instead of the form.

**Known gaps, called out rather than glossed over:**
- The product detail page (`ProductInfo.tsx`) still renders from the static
  `lib/products.ts` mock array, whose slugs/ids don't match the handful of
  products the Phase 1 seed script created. So there's no "Add to Bag"
  button wired to `POST /api/cart` yet — wiring that up needs the product
  page to read from the database first, which is a Phase 5 task (product
  management is when the mock array gets fully retired).
- Checkout is intentionally a disabled button on `/account/cart` — that's
  Phase 6.
- Profile picture upload is a note, not a file input yet — needs
  Cloudinary's signed-upload flow from Phase 5.
- `WishlistItem`'s uniqueness constraint includes a nullable `variantId`;
  Postgres treats `NULL` as distinct in unique constraints, so two wishlist
  rows for the same product with no variant chosen wouldn't be deduplicated.
  Minor edge case, worth a `@@unique` re-think if variant-less wishlisting
  turns out to be common.
- Still no live DB to run this against here — same caveat as every phase so
  far. Test the actual flows (login → guest cart merge → address CRUD →
  wishlist add/remove) by hand once `.env` is real.

## Phase 4 — Admin dashboard & RBAC

Split into two steps given its size — this section covers **4a (done)**;
4b is the remaining lighter sections, listed at the end.

### Phase 4a — RBAC foundation + core admin sections (done)

**Access control — the part that has to be airtight:**
- `lib/rbac.ts` — `PERMISSIONS`, `ROLE_PERMISSIONS` (the actual source of
  truth for what each role can do), `ADMIN_TIER_ROLES`, and
  `ADMIN_ROUTE_PERMISSIONS` (maps an `/admin/*` prefix to the permission
  required to view it).
- `lib/auth.config.ts` / `lib/auth.ts` — deliberately split in two.
  `auth.config.ts` has zero Prisma/bcrypt/provider imports, so it's Edge-
  Runtime-safe; `middleware.ts` builds a NextAuth instance from *only* that
  file to decode the session cookie without ever touching the database from
  the Edge Runtime. `auth.ts` (Node.js-only, imported by Server
  Components/Route Handlers) has the real providers, the Prisma adapter, and
  embeds the role's permission list into the JWT on every request from the
  `ROLE_PERMISSIONS` constant — so a role's permissions update immediately
  without forcing re-login, without a DB round-trip in middleware.
- `middleware.ts` — unauthenticated → `/login?callbackUrl=...`;
  authenticated-but-`CUSTOMER` → `/403`; wrong-permission-for-this-section →
  `/403`. This is a UX convenience, not the actual security boundary.
- `lib/require-admin.ts` — `requirePermission()` / `requireAdminTier()`,
  called at the top of **every** admin Server Component and Server Action.
  This is the real boundary: even if middleware had a bug or got bypassed,
  every mutation still checks permissions itself before touching Prisma.
- `app/403/page.tsx`, `app/robots.ts` (disallows `/admin`), `app/sitemap.ts`
  (never lists `/admin` or `/account` — the more common way people actually
  discover URLs, so this matters more than robots.txt).
- `lib/audit-log.ts` — `writeAuditLog()`, called from every mutating admin
  Server Action seen so far (order status/tracking, review moderation, role
  changes, coupon/category/collection/inventory edits, product publish/
  delete). Captures actor, action, entity, a metadata diff, and IP.

**Sections built:**
- **Dashboard/Analytics** (`/admin`) — today/7-day/30-day sales, orders by
  status, customer segment counts, low-stock list, recent orders.
- **Orders** (`/admin/orders`) — list + status update; detail page with
  tracking-number editing.
- **Products** (`/admin/products`) — list with stock/status/flags,
  publish/unpublish, delete. **Create/edit forms with variants and
  Cloudinary image upload are Phase 5**, not here — this page says so
  on-screen rather than shipping a half-working form.
- **Categories** / **Collections** — inline manager components (add/delete).
- **Customers** (`/admin/customers`) — searchable list + detail (orders,
  lifetime spend, segment, addresses).
- **Inventory** (`/admin/inventory`) — stock levels with inline quick-edit,
  low-stock highlighted.
- **Coupons** (`/admin/coupons`) — inline create/toggle/delete, usage-limit
  and expiry fields.
- **Reviews** (`/admin/reviews`) — pending queue with approve/reject; the
  product's cached `avgRating`/`reviewCount` recompute from the full
  approved set on every moderation action, so they can't drift.
- **Payments** / **Shipping** — read-only-ish views over `Order`/`Payment`
  data; full Razorpay refund actions arrive with Phase 6.
- **Admins & Roles** (`/admin/admins`) — grant/change admin-tier roles by
  email, plus a read-only permission matrix. Deliberately read-only for the
  matrix itself: permissions live in `lib/rbac.ts`, in code and code review,
  not editable at runtime from the UI — an admin panel that could grant
  itself more admin panel is exactly the kind of privilege-escalation
  surface worth not building.
- **Audit Logs** (`/admin/audit-logs`) — filterable by entity type,
  read-only by design.

**Known gaps:**
- The sidebar nav (`app/admin/layout.tsx`) already links to `/admin/banners`,
  `/admin/homepage`, `/admin/returns`, and `/admin/reports` — those 404 until
  Phase 4b (next) builds them. The permission-based nav filtering already
  works correctly for them (a `CUSTOMER_SUPPORT` admin won't even see the
  Banners link, for instance); it's just the pages themselves that are
  pending.
- Same as every phase: no live DB here, so this is reviewed-but-untested —
  in particular, walk through "demote yourself" and "wrong-permission page
  access" by hand once you can run it, since auth-adjacent logic is exactly
  where a subtle bug is most expensive.

### Phase 4b — remaining admin sections (not built yet)

- **Returns** (`/admin/returns`) — approve/reject/receive/refund flow over
  `ReturnRequest`, tied back into `Payment.refundedAmount`.
- **Banners** (`/admin/banners`) — CRUD over the `Banner` model.
- **Homepage Editor** (`/admin/homepage`) — CRUD over `HomepageSection`'s
  free-form `Json` field; realistically a structured-per-section-key editor
  rather than a raw JSON textarea.
- **Reports** (`/admin/reports`) — likely a superset of the dashboard's
  analytics with CSV export, rather than new data.
- Two more mentioned in the brief that don't have nav entries yet either:
  **Contact Us message management** (over `ContactMessage`) and
  **Newsletter subscription management** (over `NewsletterSubscriber`) — small
  list-and-status-update pages, similar shape to Reviews.

## Phase 5 — Product & inventory management (done)

- `lib/cloudinary.ts` — server SDK config, `signUpload()` (short-lived,
  folder-scoped signature), `deleteCloudinaryImage()` (best-effort cleanup;
  a failed Cloudinary delete never blocks or rolls back a DB mutation — see
  the comment on why).
- `app/api/uploads/sign/route.ts` — the only place a signature gets issued.
  Checks the caller's permission for the requested folder
  (`product:write` for `products`, `category:write` for `categories`, etc.)
  *before* signing — `avatars` is the one folder any logged-in user can sign
  into, scoped to `sanaera/avatars/{their own user id}` so nobody can sign a
  request that overwrites someone else's asset. The browser then uploads
  directly to Cloudinary with that signature — our server never touches the
  image bytes.
- `components/CloudinaryUploader.tsx` — shared (not admin-only, since
  avatars use it too) client uploader: gets a signature, posts straight to
  Cloudinary, hands back `{ url, publicId }`.
- `lib/validations/product.ts` — the product schema, including nested
  variant and image arrays, plus a `slugify()` helper.
- `app/admin/products/actions.ts` — `createProductAction` /
  `updateProductAction` now do the real work: create/update the product row,
  diff the submitted image list against what's stored (deleting removed
  ones from both the DB *and* Cloudinary), diff variants the same way
  (each new/kept variant gets its `Inventory` row kept in sync). All wrapped
  in a `$transaction` for the DB writes; Cloudinary cleanup happens after,
  since it's an external call that can't participate in the DB transaction.
- `components/admin/ProductForm.tsx` — the actual create/edit form: basic
  info, pricing, status + merchandising flags, multi-image upload with
  remove, repeatable variant rows (size/color/SKU/price override/stock),
  SEO fields. Used by both `/admin/products/new` and
  `/admin/products/[id]/edit`.
- **Low-stock alerts**: `app/api/cron/low-stock-check/route.ts`, scheduled
  daily via `vercel.json`'s `crons` config, protected by `CRON_SECRET`
  (Vercel auto-sends `Authorization: Bearer $CRON_SECRET` on cron requests
  once that env var is set). Emails every Super Admin and Product Manager
  with the list of variants at or below threshold. The admin dashboard
  already surfaced this list visually (built in Phase 4a); this is the
  "someone gets emailed even if they're not looking at the dashboard" half.
- **Closed a Phase 3 gap while the infra was right there**: `/account/profile`
  now has a real avatar uploader (`components/account/AvatarUploader.tsx` +
  `updateAvatarAction`), using the same signed-upload flow, `avatars` folder.

**Known gaps:**
- **The public storefront (`app/page.tsx`, `app/product/[slug]/page.tsx`,
  `/new-arrivals`, `/collections`, `/jewelry`, etc.) still renders from the
  static `lib/products.ts` mock array — it has NOT been migrated to read
  from the database in this phase.** That's a deliberate scope cut, not an
  oversight: doing it properly means reworking `ProductGallery`/
  `ProductInfo`/`ProductCard` from decorative CSS-gradient placeholders to
  real Cloudinary `<img>` tags, rewiring size/color pickers to real
  `ProductVariant` rows, and wiring "Add to Bag"/wishlist buttons to the
  real `/api/cart` and `/api/wishlist` routes from Phase 3 — which is close
  enough to a "storefront data layer" phase of its own that it deserves its
  own pass rather than a rushed edit here. It also naturally overlaps with
  Phase 6 (checkout needs real `productId`/`variantId` anyway). Proposing
  this as the next thing to tackle, either as its own step or folded into
  the start of Phase 6.
- No Cloudinary cleanup for *replaced* avatars — the old image just sits in
  Cloudinary unused (namespaced under the user's own folder, so at least it
  doesn't leak across users). Fine for now; a periodic cleanup job would
  close this properly.
- Same as always: no live DB/Cloudinary account here, so this is reviewed-
  but-untested. Product create/edit in particular has enough moving parts
  (transaction + external API calls + nested array diffing) that it's worth
  testing by hand: create a product with 2 images and 2 variants, edit it to
  remove one image and one variant, confirm both actually vanish from
  Cloudinary and the DB.

## Phase 6 — Cart, checkout, coupons, Razorpay

- Checkout Server Action: validates cart against live inventory, applies
  coupon rules (`minPurchase`, `usageLimit`, `perUserLimit`), computes GST +
  shipping, creates a `PENDING` Order + a Razorpay order, returns the
  Razorpay order id to the client for the checkout widget.
- `app/api/webhooks/razorpay/route.ts` verifies the webhook signature,
  updates `Payment.status`, and flips the `Order.status` accordingly — the
  source of truth for "did this payment actually succeed" is always the
  webhook, never the client redirect.

## Phase 7 — Emails, reviews, returns, recovery, invoices, analytics

- Nodemailer templates: welcome, verify-email, password-reset, order-
  confirmation, shipping-update, delivery-confirmation, refund-confirmation,
  newsletter, **abandoned-cart** (a scheduled job flags carts with
  `lastActivityAt` > 2h ago and `reminderSentAt IS NULL`).
- Reviews: verified-purchase gate, moderation queue (`ReviewStatus.PENDING`
  until an admin with `review:moderate` approves), replies, likes, abuse
  reports.
- Returns: customer-initiated `ReturnRequest`, admin approve/reject/receive/
  refund flow, tied back into `Payment.refundedAmount`.
- `@react-pdf/renderer` invoice generation, streamed from
  `app/api/orders/[id]/invoice/route.ts`.
- Admin analytics: daily/weekly/monthly sales via grouped Prisma queries,
  charted with `recharts`.
- Customer segmentation (`User.customerSegment`): recomputed after each
  order — first order → `NEW`, 2nd+ → `REPEAT`, lifetime spend over a
  threshold → `VIP`.

## Security notes that apply across every phase

- Passwords: bcrypt, cost factor 10+, never logged, never returned by any API.
- All Server Actions and Route Handlers validate input with Zod before
  touching Prisma — no raw `req.json()` passed to a query.
- Prisma's query builder parameterizes everything, so standard usage is not
  vulnerable to SQL injection; the risk to actively guard against is string-
  concatenated `$queryRaw`, which this project avoids.
- CSRF: Auth.js handles CSRF tokens for its own routes; Server Actions get
  Next.js's built-in CSRF protection (origin checking) for free.
- Rate limiting: sensitive routes (login, OTP request, password reset,
  checkout) get an Upstash Redis token-bucket check in Phase 2/6.
- Cookies: `httpOnly`, `secure` (in production), `sameSite: "lax"` — set via
  Auth.js's session cookie config, not manually.
