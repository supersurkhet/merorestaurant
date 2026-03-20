import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  restaurants: defineTable({
    name: v.string(),
    slug: v.string(),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    timezone: v.string(),
    currency: v.string(),
    isActive: v.boolean(),
    ownerId: v.string(), // WorkOS user ID
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerId"]),

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
    nameNe: v.optional(v.string()), // Nepali name
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
    nameNe: v.optional(v.string()), // Nepali name
    description: v.optional(v.string()),
    price: v.number(), // in NPR (e.g. 250 = Rs 250)
    imageStorageId: v.optional(v.id("_storage")), // Convex file storage
    isVeg: v.boolean(),
    isAvailable: v.boolean(),
    sortOrder: v.number(),
  })
    .index("by_menu", ["menuId"])
    .index("by_category", ["categoryId"])
    .index("by_restaurant", ["restaurantId"]),

  tables: defineTable({
    restaurantId: v.id("restaurants"),
    number: v.number(),
    label: v.optional(v.string()),
    seats: v.number(),
    qrCode: v.string(), // unique identifier for QR scan, e.g. "mero-surkhet-t1"
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
    tableId: v.optional(v.id("tables")), // optional for takeaway
    orderNumber: v.string(), // human-readable e.g. "ORD-0042"
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
    createdBy: v.optional(v.string()), // staff workosUserId or "customer"
    // Status transition timestamps
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
    name: v.string(), // denormalized snapshot
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
    .index("by_restaurant", ["restaurantId"]),

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
