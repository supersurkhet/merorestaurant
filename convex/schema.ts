import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  restaurants: defineTable({
    name: v.string(),
    nameNe: v.string(), // Nepali name
    slug: v.string(),
    description: v.optional(v.string()),
    descriptionNe: v.optional(v.string()),
    address: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    logo: v.optional(v.id("_storage")),
    coverImage: v.optional(v.id("_storage")),
    isActive: v.boolean(),
    openingTime: v.string(), // "07:00"
    closingTime: v.string(), // "22:00"
    currency: v.string(), // "NPR"
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["isActive"]),

  categories: defineTable({
    restaurantId: v.id("restaurants"),
    name: v.string(),
    nameNe: v.string(),
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
    nameNe: v.string(),
    description: v.optional(v.string()),
    descriptionNe: v.optional(v.string()),
    price: v.number(), // in paisa (smallest unit)
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

  tables: defineTable({
    restaurantId: v.id("restaurants"),
    number: v.number(),
    label: v.string(), // "Table 1", "Window Seat"
    capacity: v.number(),
    status: v.union(
      v.literal("available"),
      v.literal("occupied"),
      v.literal("reserved"),
    ),
    qrCode: v.optional(v.string()), // QR code identifier
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
      v.literal("nopass"),
    ),
    isActive: v.boolean(),
    updatedAt: v.number(), // timestamp
  }).index("by_restaurant", ["restaurantId"]),

  orders: defineTable({
    restaurantId: v.id("restaurants"),
    tableId: v.optional(v.id("tables")),
    orderNumber: v.string(), // "ORD-001"
    status: v.union(
      v.literal("placed"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("served"),
      v.literal("cancelled"),
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
    name: v.string(), // snapshot at order time
    price: v.number(), // snapshot at order time
    quantity: v.number(),
    notes: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("served"),
    ),
  })
    .index("by_order", ["orderId"])
    .index("by_menu_item", ["menuItemId"]),

  payments: defineTable({
    orderId: v.id("orders"),
    restaurantId: v.id("restaurants"),
    amount: v.number(),
    method: v.union(
      v.literal("cash"),
      v.literal("khalti"),
      v.literal("esewa"),
      v.literal("fonepay"),
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded"),
    ),
    transactionId: v.optional(v.string()),
    paidAt: v.optional(v.number()),
  })
    .index("by_order", ["orderId"])
    .index("by_restaurant", ["restaurantId"])
    .index("by_restaurant_status", ["restaurantId", "status"]),

  staff: defineTable({
    restaurantId: v.id("restaurants"),
    workosUserId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("owner"),
      v.literal("manager"),
      v.literal("chef"),
      v.literal("waiter"),
      v.literal("cashier"),
    ),
    isActive: v.boolean(),
  })
    .index("by_restaurant", ["restaurantId"])
    .index("by_workos_user", ["workosUserId"])
    .index("by_restaurant_role", ["restaurantId", "role"]),
});
