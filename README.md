# SANAÉRA — Luxury Indian Fashion Platform

> **SANAÉRA — For Every Version of You.**

A modern full-stack luxury fashion platform inspired by India's textile heritage, craftsmanship, and contemporary editorial design.

Built with **Next.js 15, React 19, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Auth.js, Cloudinary, and Razorpay-ready architecture**, SANAÉRA combines an immersive luxury storefront with a role-based administration system and customer account experience.

![SANAÉRA Preview](https://placehold.co/1200x650/1A0905/E3DFCE?text=SANA%C3%89RA+Luxury+Fashion+Platform)

---

## ✦ Why SANAÉRA?

SANAÉRA is designed as more than a fashion storefront.

The project explores how a traditional Indian luxury brand could translate its identity into a modern digital commerce experience — from editorial storytelling and artisan narratives to product management, customer accounts, inventory, authentication, and administrative operations.

### The vision

**Indian heritage × Modern luxury × Technology**

The platform is designed around:

- 🪡 Indian handloom & artisan craftsmanship
- ✦ Editorial luxury aesthetics
- 🛍️ Modern e-commerce architecture
- 🔐 Secure authentication & role-based access
- 📊 Business-oriented admin analytics
- ☁️ Cloud-based media management
- 📦 Product & inventory operations
- 💳 Payment-ready commerce architecture

---

# ✨ Features

## Customer Experience

### Luxury Homepage

A fully responsive editorial homepage featuring:

- Animated preloader
- Gold-thread scroll indicator
- Luxury hero section
- Floating particles
- Editorial marquee
- Featured collections
- Shop-by-state experience
- Artisan storytelling
- Best sellers
- Sustainability section
- Fashion gallery
- Newsletter subscription
- Responsive navigation

### Product Experience

- Dynamic product routes
- Product variants
- Color swatches
- Product imagery architecture
- Product information sections
- Responsive product layouts
- Related product architecture

### Customer Account

Authenticated customers have access to:

- Dashboard
- Orders
- Wishlist
- Cart
- Addresses
- Payment methods
- Profile
- Security settings
- Notifications
- Account preferences

Guest-cart merging is also supported when a guest user authenticates.

---

# 🔐 Authentication & Security

SANAÉRA uses **Auth.js** for authentication and supports:

- Email/password authentication
- Google OAuth
- OTP email verification
- Forgot password
- Password reset
- Protected routes
- Session management
- Role-based authorization

### Role-based access control

The platform separates responsibilities using dedicated roles:

| Role | Responsibility |
|---|---|
| `SUPER_ADMIN` | Full platform access |
| `ADMIN` | Administrative operations |
| `PRODUCT_MANAGER` | Products & inventory |
| `ORDER_MANAGER` | Orders & fulfillment |
| `CUSTOMER_SUPPORT` | Customer operations |

This allows the system to model a real-world e-commerce organization rather than giving every administrator unrestricted access.

---

# 🛠️ Admin Dashboard

A dedicated `/admin` application provides operational management for the platform.

### Dashboard

- Business analytics
- Order metrics
- Product metrics
- Customer statistics
- Inventory insights

### Product Management

- Create products
- Edit products
- Product variants
- Image uploads
- Pricing
- Inventory management
- Product categorization

### Commerce Management

- Orders
- Customers
- Categories
- Collections
- Coupons
- Reviews
- Inventory

### Administration

- Admin management
- Role management
- Audit logs
- Permission-aware navigation

The admin architecture is designed to scale into additional modules such as returns, reporting, banners, and homepage content management.

---

# ☁️ Cloudinary Integration

Product and profile media are designed around **Cloudinary** for cloud-based image management.

Implemented functionality includes:

- Product image uploads
- Product media management
- Customer avatar uploads
- Cloud-hosted assets

This avoids treating local filesystem storage as the source of truth for production media.

---

# 🗄️ Database Architecture

The backend is built around:

**PostgreSQL + Prisma ORM**

The database layer supports entities for areas such as:

- Users
- Accounts
- Sessions
- Products
- Product variants
- Categories
- Collections
- Orders
- Customers
- Addresses
- Wishlist
- Cart
- Coupons
- Reviews
- Inventory
- Admin roles
- Audit logs

Prisma provides type-safe database access while keeping the domain model maintainable as the platform grows.

---

# 🧱 Tech Stack

## Frontend

- **Next.js 15**
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **GSAP**
- **next/font**

## Backend

- **Next.js App Router**
- **Auth.js**
- **Prisma ORM**
- **PostgreSQL**

## Infrastructure & Services

- **Cloudinary** — image/media management
- **Nodemailer** — transactional email architecture
- **Vercel Cron** — scheduled jobs
- **Razorpay** — payment integration architecture

## Development

- Git
- GitHub
- ESLint
- TypeScript
- Prisma Migrations

---

# 🏗️ Architecture

```text
SANAÉRA
│
├── Customer Storefront
│   ├── Homepage
│   ├── Collections
│   ├── Product Pages
│   ├── New Arrivals
│   ├── Heritage
│   ├── Jewelry
│   └── Artisan Stories
│
├── Customer Account
│   ├── Dashboard
│   ├── Orders
│   ├── Wishlist
│   ├── Cart
│   ├── Addresses
│   ├── Payments
│   ├── Profile
│   ├── Security
│   └── Notifications
│
├── Admin Platform
│   ├── Analytics
│   ├── Products
│   ├── Categories
│   ├── Collections
│   ├── Orders
│   ├── Customers
│   ├── Inventory
│   ├── Coupons
│   ├── Reviews
│   ├── Admins & Roles
│   └── Audit Logs
│
└── Backend
    ├── Auth.js
    ├── Prisma
    ├── PostgreSQL
    ├── Cloudinary
    ├── Nodemailer
    ├── Vercel Cron
    └── Razorpay-ready architecture
```

---

# 📁 Project Structure

```text
sanaera/
│
├── app/
│   ├── account/
│   ├── admin/
│   ├── collections/
│   ├── heritage/
│   ├── jewelry/
│   ├── new-arrivals/
│   ├── artisan-stories/
│   ├── product/
│   │   └── [slug]/
│   ├── page.tsx
│   └── layout.tsx
│
├── components/
│   ├── Header.tsx
│   ├── ProductCard.tsx
│   ├── Preloader.tsx
│   ├── ScrollIndicator.tsx
│   ├── StateScroller.tsx
│   ├── Gallery.tsx
│   ├── Newsletter.tsx
│   ├── Button.tsx
│   └── Eyebrow.tsx
│
├── lib/
│   ├── prisma.ts
│   ├── products.ts
│   └── ...
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── public/
│
├── ARCHITECTURE.md
├── .env.example
├── package.json
└── README.md
```

---

# 🎨 Design System

SANAÉRA's visual language is intentionally inspired by Indian luxury fashion houses and editorial fashion magazines.

### Typography

| Purpose | Font |
|---|---|
| Display | Cormorant Garamond |
| Labels | Marcellus SC |
| Body | Jost |

### Core Palette

| Color | Hex |
|---|---|
| Powder Blue | `#94B1C8` |
| Cream | `#E3DFCE` |
| Burgundy | `#4C050C` |
| Deep Espresso | `#1A0905` |

The design emphasizes:

**Whitespace · Typography · Texture · Motion · Editorial composition**

---

# 🚀 Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/sanaera.git

cd sanaera
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure environment variables

```bash
cp .env.example .env
```

Configure at minimum:

```env
DATABASE_URL=
DIRECT_URL=
AUTH_SECRET=
```

Additional environment variables are required for Google OAuth, Cloudinary, email, and payment functionality.

---

## 4. Initialize the database

```bash
npx prisma migrate dev --name init
```

## 5. Seed development data

```bash
npm run db:seed
```

## 6. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🔑 Development Admin

The development seed creates an administrative account:

```text
Email: admin@sanaera.com
Password: ChangeMe!123
```

> ⚠️ **Development credentials only. Change the password immediately when deploying anywhere outside local development.**

---

# 📊 Implementation Status

SANAÉRA is being developed incrementally as a production-style commerce platform.

| Area | Status |
|---|:---:|
| Luxury Homepage | ✅ |
| Responsive Navigation | ✅ |
| Product Detail Pages | ✅ |
| PostgreSQL Schema | ✅ |
| Prisma ORM | ✅ |
| Database Seed | ✅ |
| Auth.js Authentication | ✅ |
| Google OAuth | ✅ |
| OTP Verification | ✅ |
| Password Reset | ✅ |
| Customer Dashboard | ✅ |
| Wishlist | ✅ |
| Cart Architecture | ✅ |
| Guest Cart Merge | ✅ |
| Admin Dashboard | ✅ |
| RBAC | ✅ |
| Product Management | ✅ |
| Inventory Management | ✅ |
| Cloudinary Uploads | ✅ |
| Avatar Uploads | ✅ |
| Low-stock Cron Job | ✅ |
| Audit Logs | ✅ |
| Public DB Product Migration | 🚧 |
| Checkout | 🚧 |
| Razorpay Payments | 🚧 |
| Returns Management | 🚧 |
| Advanced Reports | 🚧 |
| Homepage CMS | 🚧 |
| AI Stylist | 🔮 |
| Virtual Draping | 🔮 |
| Live Shopping | 🔮 |
| Multi-currency | 🔮 |

---

# 🧭 Roadmap

### Phase 1 — Foundation
- [x] PostgreSQL
- [x] Prisma schema
- [x] Database migrations
- [x] Seed system
- [x] Environment configuration

### Phase 2 — Authentication
- [x] Auth.js
- [x] Email/password
- [x] Google OAuth
- [x] OTP verification
- [x] Password reset
- [x] Protected routes

### Phase 3 — Customer Platform
- [x] Account dashboard
- [x] Orders
- [x] Wishlist
- [x] Cart
- [x] Addresses
- [x] Payment methods
- [x] Profile
- [x] Security
- [x] Notifications

### Phase 4 — Administration
- [x] Admin dashboard
- [x] RBAC
- [x] Product management
- [x] Order management
- [x] Customer management
- [x] Inventory
- [x] Coupons
- [x] Reviews
- [x] Audit logs

### Phase 5 — Media & Operations
- [x] Cloudinary
- [x] Product image management
- [x] Avatar uploads
- [x] Low-stock automation
- [x] Vercel Cron

### Phase 6 — Commerce
- [ ] Database-powered storefront
- [ ] Production cart
- [ ] Checkout
- [ ] Razorpay
- [ ] Order fulfillment
- [ ] Returns
- [ ] Invoices

### Phase 7 — Intelligent Fashion Experience
- [ ] AI stylist
- [ ] Personalized recommendations
- [ ] Virtual draping
- [ ] Size recommendation
- [ ] Multi-currency
- [ ] Live shopping

---

# 🧠 Engineering Decisions

### Why Next.js?

Next.js provides the foundation for both the storefront and application layer, allowing the project to combine:

- Server Components
- Dynamic routing
- Server-side operations
- API/backend functionality
- Image optimization
- Production deployment

### Why Prisma?

Prisma provides a strongly typed database layer and makes the evolving commerce domain easier to maintain.

### Why PostgreSQL?

The relational nature of products, variants, customers, orders, inventory, payments, and roles makes PostgreSQL a natural fit for this platform.

### Why RBAC?

A real commerce operation should not give every employee access to every part of the system.

SANAÉRA therefore models access around business responsibilities rather than a simple `isAdmin` boolean.

### Why Cloudinary?

Fashion platforms are media-heavy. Cloudinary provides a scalable foundation for handling product photography, transformations, and user-uploaded images.

---

# ⚡ Performance & UX

The storefront focuses heavily on perceived performance and visual experience.

Current implementation includes:

- Responsive layouts
- Next.js font optimization
- Component reuse
- Motion-based reveal animations
- Lightweight SVG decorative elements
- Mobile navigation
- Dynamic routing
- Image-ready architecture

The visual system intentionally avoids excessive UI clutter and prioritizes typography, whitespace, motion, and storytelling.

---

# 🧪 Development Notes

This repository is currently a **development scaffold / portfolio project** and has not been presented as a fully production-deployed commerce business.

The frontend currently uses placeholder CSS gradients and line-art in several locations where campaign photography would eventually be used.

The public storefront also currently reads product information from a mock product layer while the database-backed product system is being finalized.

This distinction is intentional: the architecture is being developed incrementally rather than hiding unfinished functionality behind misleading claims.

---

# 🔮 Future Possibilities

SANAÉRA is intentionally designed with room for more advanced commerce features.

Potential future integrations include:

```text
AI Stylist
     ↓
Customer Preferences
     ↓
Recommendation Engine
     ↓
Personalized Collections
     ↓
Virtual Draping
     ↓
Size Recommendation
     ↓
Checkout
     ↓
Razorpay
     ↓
Order Management
     ↓
Customer Analytics
```

The long-term goal is to evolve SANAÉRA from a traditional e-commerce interface into an **intelligent digital fashion experience**.

---

# 📸 Screenshots

> Add your strongest screenshots here before making the repository public.

Recommended showcase:

1. Homepage hero
2. Featured collection
3. Product detail page
4. Customer dashboard
5. Admin dashboard
6. Product management
7. Mobile experience

Example:

```md
![Homepage](./screenshots/homepage.png)

![Product Page](./screenshots/product-page.png)

![Admin Dashboard](./screenshots/admin-dashboard.png)
```

---

# 👩‍💻 About the Project

SANAÉRA was created as a portfolio project to explore the intersection of:

**Frontend Engineering · Full-Stack Development · E-Commerce · UI/UX · Business Systems · Indian Fashion**

Rather than building another generic CRUD application, the project focuses on building a complete product ecosystem with both a customer-facing experience and the operational infrastructure required behind it.

---

# 📌 Disclaimer

SANAÉRA is a personal development / portfolio project.

Product imagery, brand concepts, and visual direction are used for demonstration purposes and do not represent an active commercial inventory unless explicitly stated.

---

# 📄 License

This project is currently intended for portfolio and educational purposes.

All rights reserved unless otherwise specified.
