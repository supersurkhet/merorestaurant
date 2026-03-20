import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Platform-level user accounts (restaurant owners)
  users: defineTable({
    workosUserId: v.string(),
    name: v.string(),
    email: v.string(),
    avatarUrl: v.optional(v.string()),
    isPlatformAdmin: v.boolean(),
  })
    .index("by_workos_user", ["workosUserId"])
    .index("by_email", ["email"]),

  restaurants: defineTable({
    name: v.string(),
    slug: v.string(),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    city: v.optional(v.string()),
    timezone: v.string(),
    currency: v.string(),
    taxRate: v.number(), // e.g. 0.13 for 13% VAT
    isActive: v.boolean(),
    ownerId: v.string(), // WorkOS user ID
    subscriptionTier: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("pro"),
      v.literal("enterprise"),
    ),
    onboardingStatus: v.union(
      v.literal("pending"),
      v.literal("menu_setup"),
      v.literal("table_setup"),
      v.literal("complete"),
    ),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"])
    .index("by_city", ["city"])
    .index("by_subscription_tier", ["subscriptionTier"]),

  staff: defineTable({
    restaurantId: v.id("restaurants"),
    workosUserId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("owner"),
      v.literal("manager"),
      v.literal("waiter"),
      v.literal("kitchen"),
      v.literal("cashier"),
    ),
    isActive: v.boolean(),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_workos_user", ["workosUserId"])
    .index("by_restaurant_and_role", ["restaurantId", "role"]),

  categories: defineTable({
    restaurantId: v.id("restaurants"),
    name: v.string(),
    nameNe: v.optional(v.string()),
    sortOrder: v.number(),
    isActive: v.boolean(),
  }).index("by_restaurant", ["restaurantId"]),

  menus: defineTable({
    restaurantId: v.id("restaurants"),
    name: v.string(),
    isActive: v.boolean(),
  }).index("by_restaurant", ["restaurantId"]),

  menuItems: defineTable({
    restaurantId: v.id("restaurants"),
    menuId: v.id("menus"),
    categoryId: v.id("categories"),
    name: v.string(),
    nameNe: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.number(),
    imageStorageId: v.optional(v.id("_storage")),
    isVeg: v.boolean(),
    isAvailable: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_menu", ["menuId"])
    .index("by_category", ["categoryId"])
    .index("by_restaurant", ["restaurantId"])
    .index("by_restaurant_available", ["restaurantId", "isAvailable"]),

  tables: defineTable({
    restaurantId: v.id("restaurants"),
    number: v.number(),
    label: v.optional(v.string()),
    seats: v.number(),
    qrCode: v.string(),
    status: v.union(
      v.literal("available"),
      v.literal("occupied"),
      v.literal("reserved"),
      v.literal("cleaning"),
    ),
    currentOrderId: v.optional(v.id("orders")),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_restaurant_and_status", ["restaurantId", "status"])
    .index("by_qr_code", ["qrCode"]),

  orders: defineTable({
    restaurantId: v.id("restaurants"),
    tableId: v.optional(v.id("tables")),
    orderNumber: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("served"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    notes: v.optional(v.string()),
    subtotal: v.number(),
    tax: v.number(),
    total: v.number(),
    createdBy: v.optional(v.string()),
    confirmedAt: v.optional(v.number()),
    preparingAt: v.optional(v.number()),
    readyAt: v.optional(v.number()),
    servedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    cancelledAt: v.optional(v.number()),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_restaurant_and_status", ["restaurantId", "status"])
    .index("by_table", ["tableId"])
    .index("by_order_number", ["restaurantId", "orderNumber"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    menuItemId: v.id("menuItems"),
    name: v.string(),
    quantity: v.number(),
    unitPrice: v.number(),
    totalPrice: v.number(),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("served"),
      v.literal("cancelled"),
    ),
  })
    .index("by_order", ["orderId"])
    .index("by_order_and_status", ["orderId", "status"]),

  payments: defineTable({
    restaurantId: v.id("restaurants"),
    orderId: v.id("orders"),
    method: v.union(
      v.literal("cash"),
      v.literal("card"),
      v.literal("esewa"),
      v.literal("khalti"),
      v.literal("fonepay"),
    ),
    amount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded"),
    ),
    externalRef: v.optional(v.string()),
    processedBy: v.optional(v.string()),
  })
    .index("by_order", ["orderId"])
    .index("by_restaurant", ["restaurantId"])
    .index("by_restaurant_and_status", ["restaurantId", "status"]),

  notifications: defineTable({
    restaurantId: v.id("restaurants"),
    type: v.union(
      v.literal("new_order"),
      v.literal("order_ready"),
      v.literal("payment_received"),
      v.literal("order_cancelled"),
    ),
    title: v.string(),
    message: v.string(),
    orderId: v.optional(v.id("orders")),
    isRead: v.boolean(),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_restaurant_unread", ["restaurantId", "isRead"]),

  rateLimits: defineTable({
    key: v.string(),
    count: v.number(),
    windowStart: v.number(),
  }).index("by_key", ["key"]),

  wifiConfigs: defineTable({
    restaurantId: v.id("restaurants"),
    ssid: v.string(),
    password: v.string(),
    encryptionType: v.union(
      v.literal("WPA"),
      v.literal("WPA2"),
      v.literal("WEP"),
      v.literal("nopass"),
    ),
    isActive: v.boolean(),
    updatedBy: v.string(),
  }).index("by_restaurant", ["restaurantId"]),
});
