# MeroRestaurant (मेरो रेस्टुरेन्ट)

A complete restaurant ecosystem for Surkhet, Nepal — QR WiFi, digital menu, real-time ordering, multi-provider payments, and admin kitchen display.

**Domain**: [restaurant.surkhet.app](https://restaurant.surkhet.app)

## Features

### Customer-facing (Web + Mobile)
- **QR WiFi Auto-connect** — Scan table QR → get live WiFi credentials from Convex → auto-connect (QR never goes stale)
- **Digital Menu** — Browse categories, filter, search. Nepali + English bilingual. Veg/spicy/popular badges
- **Order Placement** — Add to cart → customize → place order with 13% VAT calculation
- **Real-time Tracking** — Live order status: placed → confirmed → preparing → ready → served
- **Payments** — Khalti, eSewa, Fonepay via [@nabwin/paisa](https://github.com/nabwin/paisa), plus cash option

### Admin (Desktop)
- **Kitchen Display** — Real-time order queue with urgency indicators, sound notifications, one-click status advancement
- **Table Management** — Visual floor plan, drag-and-drop, QR code generation per table
- **Menu CRUD** — Add/edit/delete items and categories with image upload
- **Staff RBAC** — Owner, Manager, Chef, Waiter, Cashier roles via WorkOS
- **Fonepay QR** — Generate payment QR codes for counter payments
- **Analytics** — Daily revenue, popular items, order volume, payment breakdown

### Cross-cutting
- **i18n** — English + Nepali (नेपाली) on every screen
- **Dark Mode** — System-aware + manual toggle everywhere
- **Real-time** — Convex subscriptions keep all clients in sync instantly

## Architecture

```
┌─────────────┐  ┌─────────────┐  ┌─────────────────┐
│   Web App   │  │ Mobile App  │  │  Desktop Admin   │
│  SvelteKit  │  │    Expo     │  │ Tauri+SvelteKit  │
│  CF Workers │  │ React Native│  │    macOS/Win     │
└──────┬──────┘  └──────┬──────┘  └───────┬─────────┘
       │                │                  │
       └────────────────┼──────────────────┘
                        │
                 ┌──────▼──────┐
                 │   Convex    │
                 │  Real-time  │
                 │   Backend   │
                 └──────┬──────┘
                        │
              ┌─────────┼─────────┐
              │         │         │
         ┌────▼───┐ ┌───▼────┐ ┌─▼──────┐
         │ WorkOS │ │ Khalti │ │ eSewa  │
         │  Auth  │ │ eSewa  │ │Fonepay │
         └────────┘ │Fonepay │ └────────┘
                    └────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Web Frontend** | SvelteKit 2, Svelte 5, shadcn-svelte, Tailwind v4 |
| **Mobile** | Expo, React Native, Zustand |
| **Desktop** | Tauri v2, SvelteKit, adapter-static |
| **Backend** | Convex (real-time serverless) |
| **Auth** | WorkOS AuthKit |
| **Payments** | @nabwin/paisa (Khalti, eSewa, Fonepay) |
| **i18n** | Custom store-based (en + ne) |
| **Icons** | Lucide |
| **Hosting** | Cloudflare Workers (web) |
| **Monorepo** | Turborepo + bun workspaces |
| **Quality** | Biome (lint/format), TypeScript strict |

## Project Structure

```
merorestaurant/
├── apps/
│   ├── web/           # SvelteKit customer web app (CF Workers)
│   ├── mobile/        # Expo React Native customer app
│   └── desktop/       # Tauri admin desktop app
├── convex/            # Convex backend (schema, functions, seed)
├── packages/
│   ├── utils/         # Shared types, constants, validation
│   ├── ui/            # Shared UI components
│   └── config/        # Shared tsconfig
├── .github/workflows/ # CI/CD
├── turbo.json
└── package.json
```

## Setup

### Prerequisites
- [bun](https://bun.sh) (package manager)
- [Convex](https://convex.dev) account
- [WorkOS](https://workos.com) account (for admin auth)
- Rust toolchain (for Tauri desktop builds)

### Install & Run

```bash
# Clone
git clone https://github.com/supersurkhet/merorestaurant.git
cd merorestaurant

# Install dependencies
bun install

# Set up Convex
npx convex dev  # Creates project, generates types

# Set up environment
cp .env.example .env.local
# Edit .env.local with your Convex URL, WorkOS keys

# Seed the database
npx convex run seed:seedDatabase

# Run all apps
bun run dev

# Or run individually
turbo dev --filter=web       # Web at localhost:5173
turbo dev --filter=desktop   # Desktop (Tauri)
turbo dev --filter=mobile    # Mobile (Expo)
```

### Environment Variables

```env
# Convex
CONVEX_DEPLOYMENT=your-deployment
PUBLIC_CONVEX_URL=https://your-project.convex.cloud

# WorkOS (admin auth)
WORKOS_API_KEY=sk_...
WORKOS_CLIENT_ID=client_...

# Payments (optional, for production)
KHALTI_SECRET_KEY=...
ESEWA_MERCHANT_CODE=...
FONEPAY_MERCHANT_ID=...
```

## Convex Schema

10 tables: `restaurants`, `categories`, `menuItems`, `orders`, `orderItems`, `tables`, `wifiConfigs`, `payments`, `staff`, `notifications`

See [`convex/schema.ts`](convex/schema.ts) for full schema with indexes.

## Scripts

```bash
bun run dev        # Start all apps via Turborepo
bun run build      # Build all apps
bun run lint       # Lint with Biome
bun run check      # TypeScript type check
```

## Deployment

- **Web**: Cloudflare Workers via `wrangler deploy`
- **Desktop**: Tauri builds via `bun tauri build`
- **Mobile**: EAS builds via `eas build`

## License

Private — supersurkhet/merorestaurant
