import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./_helpers";

// placeOrder is PUBLIC — customers place orders without auth
export const placeOrder = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    tableId: v.optional(v.id("tables")),
    items: v.array(
      v.object({
        menuItemId: v.id("menuItems"),
        quantity: v.number(),
        notes: v.optional(v.string()),
      })
    ),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.items.length === 0) throw new Error("Order must have at least one item");

    // Snapshot menu items and calculate totals
    let subtotal = 0;
    const itemSnapshots = [];
    for (const item of args.items) {
      const menuItem = await ctx.db.get(item.menuItemId);
      if (!menuItem) throw new Error(`Menu item not found: ${item.menuItemId}`);
      if (!menuItem.isAvailable) throw new Error(`${menuItem.name} is not available`);
      const lineTotal = menuItem.price * item.quantity;
      subtotal += lineTotal;
      itemSnapshots.push({
        menuItemId: item.menuItemId,
        name: menuItem.name,
        price: menuItem.price,
        quantity: item.quantity,
        notes: item.notes,
      });
    }

    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant) throw new Error("Restaurant not found");
    const tax = Math.round(subtotal * (restaurant.taxRate ?? 0.13));
    const total = subtotal + tax;

    // Generate order number: ORD-MMDD-XXX
    const now = Date.now();
    const d = new Date(now);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const rand = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
    const orderNumber = `ORD-${mm}${dd}-${rand}`;

    // Create the order
    const orderId = await ctx.db.insert("orders", {
      restaurantId: args.restaurantId,
      tableId: args.tableId,
      orderNumber,
      status: "placed",
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      subtotal,
      tax,
      total,
      notes: args.notes,
      placedAt: now,
    });

    // Create order items
    for (const snap of itemSnapshots) {
      await ctx.db.insert("orderItems", {
        orderId,
        menuItemId: snap.menuItemId,
        name: snap.name,
        price: snap.price,
        quantity: snap.quantity,
        notes: snap.notes,
        status: "pending",
      });
    }

    // Mark table as occupied
    if (args.tableId) {
      const table = await ctx.db.get(args.tableId);
      if (table) {
        await ctx.db.patch(args.tableId, { status: "occupied" });
      }
    }

    return { orderId, orderNumber, total };
  },
});

export const getByRestaurant = query({
  args: {
    restaurantId: v.id("restaurants"),
    status: v.optional(
      v.union(
        v.literal("placed"),
        v.literal("confirmed"),
        v.literal("preparing"),
        v.literal("ready"),
        v.literal("served"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, { restaurantId, status }) => {
    let orders;
    if (status) {
      orders = await ctx.db
        .query("orders")
        .withIndex("by_restaurant_status", (q) =>
          q.eq("restaurantId", restaurantId).eq("status", status)
        )
        .collect();
    } else {
      orders = await ctx.db
        .query("orders")
        .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurantId))
        .collect();
    }

    // Join order items
    const result = [];
    for (const order of orders) {
      const items = await ctx.db
        .query("orderItems")
        .withIndex("by_order", (q) => q.eq("orderId", order._id))
        .collect();
      result.push({ ...order, items });
    }
    return result.sort((a, b) => b.placedAt - a.placedAt);
  },
});

export const getActiveByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, { restaurantId }) => {
    const allOrders = await ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurantId))
      .collect();
    const active = allOrders.filter(
      (o) => !["served", "cancelled"].includes(o.status)
    );
    const result = [];
    for (const order of active) {
      const items = await ctx.db
        .query("orderItems")
        .withIndex("by_order", (q) => q.eq("orderId", order._id))
        .collect();
      result.push({ ...order, items });
    }
    return result.sort((a, b) => a.placedAt - b.placedAt);
  },
});

export const getByTable = query({
  args: { tableId: v.id("tables") },
  handler: async (ctx, { tableId }) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_table", (q) => q.eq("tableId", tableId))
      .collect();
    const active = orders.filter(
      (o) => !["served", "cancelled"].includes(o.status)
    );
    const result = [];
    for (const order of active) {
      const items = await ctx.db
        .query("orderItems")
        .withIndex("by_order", (q) => q.eq("orderId", order._id))
        .collect();
      result.push({ ...order, items });
    }
    return result;
  },
});

export const getByOrderNumber = query({
  args: { orderNumber: v.string() },
  handler: async (ctx, { orderNumber }) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_order_number", (q) => q.eq("orderNumber", orderNumber))
      .first();
    if (!order) return null;
    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", order._id))
      .collect();
    return { ...order, items };
  },
});

export const get = query({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => {
    const order = await ctx.db.get(id);
    if (!order) return null;
    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", order._id))
      .collect();
    return { ...order, items };
  },
});

const STATUS_TRANSITIONS: Record<string, string[]> = {
  placed: ["confirmed", "cancelled"],
  confirmed: ["preparing", "cancelled"],
  preparing: ["ready"],
  ready: ["served"],
};

export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("served"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, { id, status }) => {
    const order = await ctx.db.get(id);
    if (!order) throw new Error("Order not found");

    // Status updates require staff auth
    await requireRole(ctx, order.restaurantId, ["owner", "manager", "chef", "waiter"]);

    const allowed = STATUS_TRANSITIONS[order.status];
    if (!allowed || !allowed.includes(status)) {
      throw new Error(`Cannot transition from ${order.status} to ${status}`);
    }

    const now = Date.now();
    const updates: Record<string, unknown> = { status };

    if (status === "confirmed") updates.confirmedAt = now;
    if (status === "preparing") updates.preparedAt = now;
    if (status === "ready") updates.readyAt = now;
    if (status === "served") {
      updates.servedAt = now;
      // Free the table
      if (order.tableId) {
        await ctx.db.patch(order.tableId, { status: "available" });
      }
    }
    if (status === "cancelled" && order.tableId) {
      // Check if table has other active orders
      const otherOrders = await ctx.db
        .query("orders")
        .withIndex("by_table", (q) => q.eq("tableId", order.tableId!))
        .collect();
      const hasOtherActive = otherOrders.some(
        (o) => o._id !== id && !["served", "cancelled"].includes(o.status)
      );
      if (!hasOtherActive) {
        await ctx.db.patch(order.tableId, { status: "available" });
      }
    }

    await ctx.db.patch(id, updates);
  },
});

export const cancelOrder = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => {
    const order = await ctx.db.get(id);
    if (!order) throw new Error("Order not found");
    // Cancel can be done by staff or the customer who placed it
    if (["served", "cancelled"].includes(order.status)) {
      throw new Error("Cannot cancel a completed order");
    }
    await ctx.db.patch(id, { status: "cancelled" });
    if (order.tableId) {
      const otherOrders = await ctx.db
        .query("orders")
        .withIndex("by_table", (q) => q.eq("tableId", order.tableId!))
        .collect();
      const hasOtherActive = otherOrders.some(
        (o) => o._id !== id && !["served", "cancelled"].includes(o.status)
      );
      if (!hasOtherActive) {
        await ctx.db.patch(order.tableId, { status: "available" });
      }
    }
  },
});
