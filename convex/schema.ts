import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─── PLATFORM USERS ────────────────────────────────────────────
  // Restaurant owners who register on the SaaS platform
  users: defineTable({
    workosUserId: v.string(),
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_workos", ["workosUserId"])
    .index("by_email", ["email"]),

  // ─── RESTAURANTS (TENANTS) ─────────────────────────────────────
  // Each restaurant is an isolated tenant on the platform
  restaurants: defineTable({
    ownerId: v.id("users"), // platform user who owns this restaurant
    name: v.string(),
    nameNe: v.optional(v.string()),
    slug: v.string(), // unique URL-safe identifier
    description: v.optional(v.string()),
    descriptionNe: v.optional(v.string()),
    address: v.string(),
    city: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    logo: v.optional(v.id("_storage")),
    coverImage: v.optional(v.id("_storage")),
    isActive: v.boolean(),
    openingTime: v.string(),
    closingTime: v.string(),
    currency: v.string(), // "NPR"
    taxRate: v.number(), // e.g. 0.13 for 13% VAT
    // Subscription & onboarding
    subscriptionTier: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("pro"),
      v.literal("enterprise")
    ),
    onboardingStatus: v.union(
      v.literal("registered"), // owner signed up
      v.literal("profile_complete"), // restaurant details filled
      v.literal("menu_added"), // at least 1 menu item
      v.literal("tables_configured"), // tables + QR set up
      v.literal("operational") // fully live, accepting orders
    ),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"])
    .index("by_active", ["isActive"])
    .index("by_city", ["city"]),

  // ─── MENU ──────────────────────────────────────────────────────
  categories: defineTable({
    restaurantId: v.id("restaurants"),
    name: v.string(),
    nameNe: v.optional(v.string()),
    description: v.optional(v.string()),
    image: v.optional(v.id("_storage")),
    sortOrder: v.number(),
    isActive: v.boolean(),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_restaurant_active", ["restaurantId", "isActive"]),

  menuItems: defineTable({
    restaurantId: v.id("restaurants"),
    categoryId: v.id("categories"),
    name: v.string(),
    nameNe: v.optional(v.string()),
    description: v.optional(v.string()),
    descriptionNe: v.optional(v.string()),
    price: v.number(), // in paisa
    image: v.optional(v.id("_storage")),
    isVeg: v.boolean(),
    isSpicy: v.boolean(),
    isAvailable: v.boolean(),
    preparationTime: v.optional(v.number()), // minutes
    sortOrder: v.number(),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_category", ["categoryId"])
    .index("by_restaurant_available", ["restaurantId", "isAvailable"]),

  // ─── TABLES & WIFI ─────────────────────────────────────────────
  tables: defineTable({
    restaurantId: v.id("restaurants"),
    number: v.number(),
    label: v.string(),
    capacity: v.number(),
    status: v.union(
      v.literal("available"),
      v.literal("occupied"),
      v.literal("reserved")
    ),
    qrCode: v.optional(v.string()), // unique QR identifier
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_restaurant_status", ["restaurantId", "status"])
    .index("by_qr", ["qrCode"]),

  wifiConfigs: defineTable({
    restaurantId: v.id("restaurants"),
    ssid: v.string(),
    password: v.string(),
    encryptionType: v.union(
      v.literal("WPA"),
      v.literal("WPA2"),
      v.literal("WEP"),
      v.literal("nopass")
    ),
    isActive: v.boolean(),
    updatedAt: v.number(),
  }).index("by_restaurant", ["restaurantId"]),

  // ─── ORDERS ────────────────────────────────────────────────────
  orders: defineTable({
    restaurantId: v.id("restaurants"),
    tableId: v.optional(v.id("tables")),
    orderNumber: v.string(),
    status: v.union(
      v.literal("placed"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("served"),
      v.literal("cancelled")
    ),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    subtotal: v.number(),
    tax: v.number(),
    total: v.number(),
    notes: v.optional(v.string()),
    placedAt: v.number(),
    confirmedAt: v.optional(v.number()),
    preparedAt: v.optional(v.number()),
    readyAt: v.optional(v.number()),
    servedAt: v.optional(v.number()),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_restaurant_status", ["restaurantId", "status"])
    .index("by_table", ["tableId"])
    .index("by_order_number", ["orderNumber"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    menuItemId: v.id("menuItems"),
    name: v.string(),
    price: v.number(),
    quantity: v.number(),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("served")
    ),
  })
    .index("by_order", ["orderId"])
    .index("by_menu_item", ["menuItemId"]),

  // ─── PAYMENTS ──────────────────────────────────────────────────
  payments: defineTable({
    orderId: v.id("orders"),
    restaurantId: v.id("restaurants"),
    amount: v.number(),
    method: v.union(
      v.literal("cash"),
      v.literal("khalti"),
      v.literal("esewa"),
      v.literal("fonepay")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    transactionId: v.optional(v.string()),
    paidAt: v.optional(v.number()),
  })
    .index("by_order", ["orderId"])
    .index("by_restaurant", ["restaurantId"])
    .index("by_restaurant_status", ["restaurantId", "status"]),

  // ─── STAFF (per restaurant) ────────────────────────────────────
  staff: defineTable({
    restaurantId: v.id("restaurants"),
    userId: v.optional(v.id("users")), // linked platform user (optional)
    workosUserId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("owner"),
      v.literal("manager"),
      v.literal("chef"),
      v.literal("waiter"),
      v.literal("cashier")
    ),
    isActive: v.boolean(),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_workos_user", ["workosUserId"])
    .index("by_restaurant_role", ["restaurantId", "role"]),
});
