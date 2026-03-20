# MeroRestaurant — Full Implementation Plan

## Overview
- **Business Value**: Complete restaurant ecosystem for Surkhet, Nepal — QR WiFi, digital menu, real-time ordering, multi-provider payments, and admin kitchen display. Replaces paper menus, manual order tracking, and static WiFi passwords.
- **Success Metrics**: Menu browsable in < 2s, order placed in < 30s, kitchen sees order in real-time, WiFi QR always current
- **Priority**: High — MVP-first, ship early, iterate
- **Domain**: restaurant.surkhet.app

## Current State Assessment

### Already Scaffolded (UI shells with mock data)
- **Web**: Landing page (hero, features, menu preview, contact, download CTA), menu page, wifi page, about/privacy/terms pages, i18n (en/ne) with store-based system, dark mode, Navbar + Footer
- **Mobile**: Tab navigation (home, menu, orders, profile), auth screens (login/signup), menu browsing with CategoryPill + MenuItemCard + CartFloatingButton, cart page, scan page, order tracking, Zustand cart store
- **Desktop**: Sidebar nav, kitchen display (order queue with filters + urgency), table management, menu CRUD, staff management, WiFi config, Fonepay page, analytics page, custom UI components (button, badge, card, input, textarea, select, switch, dialog), mock data store with CRUD operations, i18n store, theme store
- **Convex**: Full schema defined (restaurants, categories, menuItems, orders, orderItems, tables, wifiConfigs, payments, staff) with indexes
- **Packages**: utils (types, constants, validation), ui (placeholder), config (tsconfig)

### NOT Yet Done (what needs building)
1. **Convex functions** — Zero mutations/queries/actions exist. Everything uses mock data.
2. **Real Convex integration** — All three apps use hardcoded/mock data, not Convex subscriptions
3. **WorkOS auth** — Not wired up in any app. Desktop has auth store stub.
4. **Payments** — No @nabwin/paisa integration. Fonepay page is a shell.
5. **QR → WiFi dynamic flow** — WiFi page uses hardcoded credentials, not Convex
6. **Order placement flow** — Cart exists in mobile but doesn't submit to Convex
7. **Real-time subscriptions** — No Convex reactive queries connected
8. **i18n with Paraglide** — Web uses custom store-based i18n, not @inlang/paraglide-js
9. **Image upload** — No Convex file storage integration
10. **Deployment** — No CF Workers deploy, no Tauri build, no EAS build

---

## Architecture

### Data Flow
```
Customer (Web/Mobile) → Convex mutations → Convex DB
                                          ↓ (real-time subscriptions)
Admin (Desktop) ← Convex queries ← Convex DB
                                          ↓
Kitchen Display ← Convex subscriptions ← orders table (filtered by status)
```

### Auth Flow
```
Staff → WorkOS AuthKit → JWT → Convex auth verification → role-based access
Customers → No auth required (anonymous ordering via table QR)
```

### Payment Flow
```
Customer selects payment → @nabwin/paisa → Khalti/eSewa/Fonepay API → webhook → Convex action → update payment status
```

---

## Task Breakdown

### Phase 1: Convex Backend + Data Layer (3 days)

**Worker: Convex (surface:636)**

All three apps currently use mock data. This phase replaces ALL mock data with real Convex functions.

- [ ] **1.1: Convex restaurant & category functions**
  - Create `convex/restaurants.ts` — `getBySlug` query, `create`/`update` mutations
  - Create `convex/categories.ts` — `listByRestaurant` query (sorted by sortOrder, filtered by isActive), `create`/`update`/`delete` mutations
  - Seed function: `convex/seed.ts` — populate initial restaurant + categories + menu items using the existing mock data from `data.svelte.ts` and `menu-data.ts`
  - Estimate: 3h +/- 1h | Priority: H
  - Dependencies: Schema exists
  - Stack: Convex mutations + queries

- [ ] **1.2: Convex menu item functions**
  - Create `convex/menuItems.ts` — `listByCategory` query, `listByRestaurant` query (with availability filter), `create`/`update`/`delete`/`toggleAvailability` mutations
  - Image upload: `generateUploadUrl` mutation + `getImageUrl` query using Convex file storage
  - Estimate: 3h +/- 1h | Priority: H
  - Dependencies: 1.1
  - Stack: Convex mutations + queries + file storage

- [ ] **1.3: Convex table & WiFi functions**
  - Create `convex/tables.ts` — `listByRestaurant` query, `getByQrCode` query, `create`/`update`/`updateStatus` mutations
  - Create `convex/wifi.ts` — `getActiveByRestaurant` query, `update` mutation
  - QR generation: encode table ID into QR → on scan, query `getByQrCode` → return table + restaurant + WiFi config
  - Estimate: 2h +/- 0.5h | Priority: H
  - Dependencies: 1.1
  - Stack: Convex mutations + queries

- [ ] **1.4: Convex order functions (core)**
  - Create `convex/orders.ts`:
    - `placeOrder` mutation — accepts items array, tableId (optional), customerName, calculates subtotal/tax/total, generates orderNumber, creates order + orderItems
    - `getByRestaurant` query — filtered by status, with orderItems joined
    - `getByTable` query — active orders for a table
    - `getByOrderNumber` query — for customer tracking
    - `updateStatus` mutation — status transitions with timestamp updates (confirmedAt, preparedAt, readyAt, servedAt)
    - `cancelOrder` mutation
  - Estimate: 4h +/- 1h | Priority: H
  - Dependencies: 1.1, 1.2, 1.3
  - Stack: Convex mutations + queries

- [ ] **1.5: Convex staff & auth functions**
  - Create `convex/staff.ts` — `listByRestaurant` query, `getByWorkosId` query, `create`/`update`/`toggleActive` mutations
  - Create `convex/auth.ts` — WorkOS JWT verification, role-based access helpers
  - Estimate: 2h +/- 1h | Priority: H
  - Dependencies: 1.1
  - Stack: Convex mutations + queries + WorkOS

- [ ] **1.6: Convex payment functions**
  - Create `convex/payments.ts` — `createPayment` mutation, `getByOrder` query, `updateStatus` mutation, `listByRestaurant` query (for analytics)
  - Estimate: 2h +/- 0.5h | Priority: M
  - Dependencies: 1.4
  - Stack: Convex mutations + queries

---

### Phase 2: Wire Convex to All Apps (4 days)

This is the critical phase — replacing ALL mock data in all three apps with real Convex subscriptions.

**Worker: Web-SvelteKit (surface:634)**

- [ ] **2.1: Web — Connect menu to Convex**
  - Replace `menu-data.ts` static data with `convex-svelte` reactive queries
  - Wire `+page.svelte` (landing) featured items from Convex `menuItems.listByRestaurant`
  - Wire `/menu/+page.svelte` with category filtering from Convex
  - Estimate: 3h +/- 1h | Priority: H
  - Screenshot Should Show: Menu page loads items from Convex, category filters work, items display with correct Nepali translations
  - Dependencies: 1.1, 1.2

- [ ] **2.2: Web — Dynamic WiFi page**
  - Replace hardcoded `MeroRestaurant-Guest` / `namaste2024` with Convex `wifi.getActiveByRestaurant` query
  - Generate WiFi URI dynamically: `WIFI:T:{encryptionType};S:{ssid};P:{password};;`
  - QR code on the page encodes the WiFi URI (use `qrcode` npm package for SVG generation)
  - Estimate: 2h +/- 0.5h | Priority: H
  - Screenshot Should Show: WiFi page shows live SSID from Convex, QR code renders, connect button uses dynamic credentials
  - Dependencies: 1.3

- [ ] **2.3: Web — Order placement flow**
  - Create `/order/+page.svelte` — cart-based ordering (add items from menu → review → place order)
  - Wire to Convex `orders.placeOrder` mutation
  - Create `/order/[id]/+page.svelte` — real-time order tracking via Convex subscription
  - Status display with animated transitions: placed → confirmed → preparing → ready → served
  - Estimate: 4h +/- 1h | Priority: H
  - Screenshot Should Show: User adds items, sees cart, places order, order tracking page updates in real-time as status changes
  - Dependencies: 1.4

**Worker: Expo-Mobile (surface:635)**

- [ ] **2.4: Mobile — Connect menu to Convex**
  - Replace hardcoded `MENU_ITEMS` / `CATEGORIES` in `menu.tsx` with Convex `useQuery` hooks
  - Wire `MenuItemCard` to use Convex image URLs
  - Wire cart `addItem` to reference real Convex menuItem IDs
  - Estimate: 3h +/- 1h | Priority: H
  - Screenshot Should Show: Menu screen loads items from Convex, category pills filter correctly, search works against Convex data
  - Dependencies: 1.1, 1.2

- [ ] **2.5: Mobile — QR scan → WiFi + table**
  - Wire `scan/index.tsx` to decode QR → extract table/restaurant IDs → query Convex for WiFi config
  - Auto-populate cart with tableId after scan
  - Show WiFi connection prompt with dynamic credentials
  - Estimate: 3h +/- 1h | Priority: H
  - Screenshot Should Show: Camera scans QR, WiFi credentials appear, table info displayed, cart linked to table
  - Dependencies: 1.3

- [ ] **2.6: Mobile — Order placement + tracking**
  - Wire cart checkout to Convex `orders.placeOrder`
  - Wire `order/[id].tsx` to Convex subscription for real-time status updates
  - Wire `(tabs)/orders.tsx` to show order history from Convex
  - Estimate: 4h +/- 1h | Priority: H
  - Screenshot Should Show: Cart submits to Convex, order appears in history, status updates live
  - Dependencies: 1.4

**Worker: Tauri-Desktop (surface:637)**

- [ ] **2.7: Desktop — Replace mock data store with Convex**
  - Rewrite `data.svelte.ts` to use `convex-svelte` reactive queries instead of mock arrays
  - All CRUD operations become Convex mutations
  - Real-time subscriptions for orders, tables, menu items
  - Estimate: 5h +/- 1h | Priority: H
  - Screenshot Should Show: Desktop app loads all data from Convex, kitchen display shows real orders, tables reflect real state
  - Dependencies: 1.1 through 1.6

- [ ] **2.8: Desktop — Kitchen display real-time**
  - Kitchen page subscribes to `orders.getByRestaurant` with status filter
  - Status transition buttons call Convex `orders.updateStatus`
  - Audio notification on new order (Tauri notification API)
  - Order urgency calculated from real timestamps
  - Estimate: 3h +/- 1h | Priority: H
  - Screenshot Should Show: Kitchen display updates instantly when order placed from web/mobile, status buttons work, urgency colors correct
  - Dependencies: 2.7

- [ ] **2.9: Desktop — Menu CRUD with image upload**
  - Menu management page wired to Convex mutations
  - Image upload via Convex file storage (drag-and-drop)
  - Category management (add/edit/delete/reorder)
  - Toggle item availability
  - Estimate: 3h +/- 1h | Priority: H
  - Screenshot Should Show: Admin adds menu item with image, it appears on web/mobile instantly
  - Dependencies: 2.7

- [ ] **2.10: Desktop — Table management + QR generation**
  - Table layout page wired to Convex
  - Generate printable QR codes per table (encode restaurant + table ID)
  - Table status updates in real-time (occupied when order placed, available when served)
  - Estimate: 3h +/- 1h | Priority: M
  - Screenshot Should Show: Admin creates table, generates QR, scanning QR on mobile connects to that table
  - Dependencies: 2.7

---

### Phase 3: Auth + Payments (3 days)

**Worker: Convex (surface:636) + Web (surface:634)**

- [ ] **3.1: WorkOS AuthKit integration — Web**
  - Install and configure WorkOS AuthKit for SvelteKit
  - Create `/auth/login` and `/auth/callback` routes
  - Session management with cookies
  - Protect admin routes (redirect to login if not authenticated)
  - Estimate: 3h +/- 1h | Priority: H
  - Screenshot Should Show: Login page renders, WorkOS redirect works, session persists, protected routes redirect
  - Dependencies: 1.5

- [ ] **3.2: WorkOS AuthKit — Desktop**
  - WorkOS auth flow adapted for Tauri (OAuth redirect → localhost callback)
  - Store tokens in Tauri secure storage
  - Role-based sidebar visibility (chef sees only kitchen, owner sees everything)
  - Estimate: 3h +/- 1h | Priority: H
  - Screenshot Should Show: Desktop login opens browser for WorkOS, callback sets session, sidebar shows role-appropriate menu
  - Dependencies: 1.5

- [ ] **3.3: Payment integration — @nabwin/paisa**
  - Install `@nabwin/paisa` in web app
  - Create Convex action for payment initiation (generates payment URL for Khalti/eSewa/Fonepay)
  - Create `/payment/[orderId]/+page.svelte` — payment method selection + redirect
  - Create `/payment/callback/+server.ts` — webhook handler for payment verification
  - Update payment status in Convex on successful callback
  - Estimate: 5h +/- 2h | Priority: H
  - Screenshot Should Show: Order checkout shows payment methods, selecting Khalti/eSewa opens payment page, callback updates order as paid
  - Dependencies: 1.6, 2.3

- [ ] **3.4: Mobile payment flow**
  - Payment method selection in cart checkout
  - Deep link to Khalti/eSewa/Fonepay apps (or in-app WebView)
  - Payment confirmation screen
  - Estimate: 3h +/- 1h | Priority: H
  - Screenshot Should Show: Cart shows payment options, selecting one redirects to payment app, returns to confirmation
  - Dependencies: 3.3

- [ ] **3.5: Desktop — Fonepay QR display**
  - Wire Fonepay page to display live QR for table payments
  - Real-time payment status subscription — QR page shows "Paid!" when payment confirmed
  - Print-friendly QR layout
  - Estimate: 2h +/- 0.5h | Priority: M
  - Screenshot Should Show: Fonepay QR displays for active order, updates to "Paid" when payment webhook fires
  - Dependencies: 3.3

---

### Phase 4: Polish, i18n, Deploy (3 days)

- [ ] **4.1: Migrate i18n to @inlang/paraglide-js**
  - Replace custom store-based i18n in web app with Paraglide
  - Create message files for English + Nepali
  - Wire language switcher in Navbar
  - Translate all user-facing strings (landing, menu, order, WiFi pages)
  - Estimate: 4h +/- 1h | Priority: M
  - Screenshot Should Show: Language toggle switches all text between English and नेपाली instantly
  - Dependencies: None (can run in parallel with Phase 3)
  - Stack: @inlang/paraglide-js

- [ ] **4.2: Dark mode polish — all apps**
  - Verify all pages render correctly in dark mode (web already has CSS vars)
  - Fix any color mismatches, contrast issues, or missing dark variants
  - Desktop: wire system preference detection
  - Mobile: wire dark mode toggle with system theme
  - Estimate: 2h +/- 0.5h | Priority: M
  - Screenshot Should Show: All three apps in dark mode — no white flashes, no unreadable text, consistent palette

- [ ] **4.3: Convex environment setup + seed data**
  - Run `npx convex dev` to create Convex project
  - Set up `.env.local` with `CONVEX_DEPLOYMENT` and `CONVEX_URL`
  - Run seed function to populate initial restaurant, categories, menu items, tables
  - Configure WorkOS environment variables
  - Estimate: 1h +/- 0.5h | Priority: H
  - Dependencies: All Convex functions done

- [ ] **4.4: Deploy web to Cloudflare Workers**
  - Configure `@sveltejs/adapter-cloudflare`
  - Set up `wrangler.toml` with custom domain `restaurant.surkhet.app`
  - Set Convex + WorkOS secrets via `wrangler secret put`
  - Deploy and verify live
  - Estimate: 2h +/- 1h | Priority: H
  - Screenshot Should Show: restaurant.surkhet.app loads the landing page
  - Stack: wrangler deploy

- [ ] **4.5: Build desktop with Tauri**
  - Configure Tauri build for macOS (.dmg)
  - Create GitHub Actions workflow for Tauri builds on tag
  - Create `v0.1.0` release with binary
  - Estimate: 2h +/- 1h | Priority: M
  - Screenshot Should Show: Tauri app launches natively, loads data from Convex
  - Stack: bun tauri build, gh release create

- [ ] **4.6: Mobile build with EAS**
  - Configure `eas.json` for iOS + Android builds
  - Test on Expo Go first
  - Create development build
  - Estimate: 2h +/- 1h | Priority: M
  - Screenshot Should Show: App runs on device, loads menu from Convex
  - Stack: eas build

- [ ] **4.7: Desktop — Analytics page**
  - Wire analytics page to Convex queries (daily revenue, popular items, order counts)
  - Charts using simple CSS/SVG (no heavy chart library needed for MVP)
  - Estimate: 3h +/- 1h | Priority: L
  - Dependencies: 2.7

---

## Worker Assignment Summary

| Worker | Surface | Phase 1 Tasks | Phase 2 Tasks | Phase 3 Tasks | Phase 4 Tasks |
|--------|---------|---------------|---------------|---------------|---------------|
| Convex | 636 | 1.1-1.6 | — | 3.1 (auth helpers) | 4.3 |
| Web | 634 | — | 2.1-2.3 | 3.1, 3.3 | 4.1, 4.4 |
| Mobile | 635 | — | 2.4-2.6 | 3.4 | 4.6 |
| Desktop | 637 | — | 2.7-2.10 | 3.2, 3.5 | 4.2, 4.5, 4.7 |

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| @nabwin/paisa API instability | M | H | Build payment abstraction layer, test with sandbox APIs first |
| Convex cold start latency in Nepal | L | M | Convex edge network covers Asia; measure actual latency |
| WorkOS OAuth redirect in Tauri | M | M | Use localhost callback server pattern; fallback to manual token entry |
| Expo camera QR scanning permissions | L | M | Test on real devices early; expo-camera handles permissions |
| Nepali Unicode rendering issues | L | L | Test with actual Nepali text on all platforms early |
| WiFi auto-connect cross-platform | H | M | Android supports WiFi URI natively; iOS shows credentials for manual connect |

## Critical Path

```
1.1 → 1.2 → 1.4 → 2.1 → 2.3 → 3.3 → 4.4 (Deploy)
                 ↘ 2.4 → 2.6 → 3.4 → 4.6
                 ↘ 2.7 → 2.8 → 3.2 → 4.5
```

The critical path runs through Convex functions → Web menu/ordering → Payments → Deploy.

## Parallel Opportunities

- **Phase 1**: All Convex functions can be written in parallel (1.1-1.6)
- **Phase 2**: Web (2.1-2.3), Mobile (2.4-2.6), Desktop (2.7-2.10) are fully parallelizable after Phase 1
- **Phase 3**: Auth (3.1-3.2) and Payments (3.3-3.5) can run in parallel
- **Phase 4**: i18n (4.1), dark mode (4.2), and deploys (4.4-4.6) are independent

---

## TESTING.md Entries (Initial)

Each task adds its own entries. Starting checklist:

```markdown
# Testing Checklist

## Menu (Web)
- [ ] Landing page loads featured items from Convex
- [ ] /menu shows all categories from Convex
- [ ] Category filter shows only items in that category
- [ ] Menu items show Nepali names when language switched to ne
- [ ] Veg/spicy badges display correctly
- [ ] Empty category shows "No items" message

## WiFi (Web)
- [ ] /wifi shows current SSID from Convex (not hardcoded)
- [ ] QR code encodes dynamic WiFi URI
- [ ] Connect button uses live password
- [ ] Admin changes WiFi password → /wifi reflects immediately

## Orders (Web)
- [ ] Add item to cart → cart count updates
- [ ] Place order → order number displayed
- [ ] Order tracking page updates status in real-time
- [ ] Cancel order works

## Kitchen (Desktop)
- [ ] New order from web → appears in kitchen display instantly
- [ ] Status filter buttons work (all/pending/confirmed/preparing/ready)
- [ ] Advance order status → web tracking page reflects change
- [ ] Urgency color changes after 15 min / 30 min

## Payments
- [ ] Select Khalti → redirects to Khalti payment page
- [ ] Successful payment → order marked as paid
- [ ] Failed payment → shows retry option

## Auth
- [ ] Desktop login → WorkOS redirect → callback → session set
- [ ] Chef role → only sees kitchen page
- [ ] Owner role → sees all admin pages
- [ ] Unauthenticated → redirected to login

## i18n
- [ ] Toggle EN → NE → all text switches
- [ ] Nepali Unicode renders correctly everywhere
- [ ] Menu items show nameNe in Nepali mode
```
