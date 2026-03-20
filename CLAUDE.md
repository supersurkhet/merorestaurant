# merorestaurant

Restaurant ecosystem for Surkhet, Nepal — QR WiFi, menu, orders, payments, admin.

## Project Structure
Turborepo monorepo:
- `apps/web` — SvelteKit landing page & customer web app (Cloudflare Workers)
- `apps/desktop` — Tauri + SvelteKit admin desktop app
- `apps/mobile` — Expo React Native customer mobile app
- `packages/utils` — Shared TypeScript utilities, types, validation
- `packages/ui` — Shared shadcn-svelte components (web + desktop)
- `packages/config` — Shared tsconfig
- `convex/` — Convex schema & functions (shared backend)

## Commands
```bash
bun run dev          # Start all apps via turbo
bun run build        # Build all apps
bun run lint         # Lint all apps
bun run check        # Type-check all apps
bun run test         # Run all tests
turbo dev --filter=web       # Dev just web
turbo dev --filter=desktop   # Dev just desktop
turbo dev --filter=mobile    # Dev just mobile
```

## Stack
- **Frontend (Web/Desktop)**: SvelteKit 2, Svelte 5, shadcn-svelte, Tailwind v4
- **Frontend (Mobile)**: Expo, React Native, NativeWind
- **Desktop**: Tauri v2
- **Database**: Convex (real-time, serverless)
- **Auth**: WorkOS AuthKit
- **Payments**: Khalti, eSewa, Fonepay via @nabwin/paisa
- **i18n**: @inlang/paraglide-js (English + Nepali)
- **Icons**: Lucide
- **Hosting**: Cloudflare Workers
- **Package Manager**: bun
- **Monorepo**: Turborepo
- **Quality**: Biome (lint/format), Vitest (unit), Playwright (e2e)

## Conventions
- TypeScript strict mode
- Format with Biome (tabs, single quotes)
- Svelte components in `src/lib/components/`
- Use shadcn-svelte components as base
- Lucide for icons
- Convex for database (schema in `convex/schema.ts`)
- WorkOS for authentication
- Prices stored in paisa (smallest unit), display with `formatPrice()`
- Nepali translations: every user-facing string needs `nameNe` field
- Domain: restaurant.surkhet.app
