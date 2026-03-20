import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { throwLocalizedError } from "./i18n";
import { checkRateLimit } from "./rateLimit";
import { validatePhone, validateQuantity, validateStringLength, validateOrderItems } from "./validation";
import { authenticateForRestaurant, requireAuth } from "./auth";

const DEFAULT_TAX_RATE = 0.13;
const NEPAL_OFFSET_MS = (5 * 60 + 45) * 60 * 1000;

function generateOrderNumber(existingToday: number): string {
  const nepalTime = new Date(Date.now() + NEPAL_OFFSET_MS);
  const mm = String(nepalTime.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(nepalTime.getUTCDate()).padStart(2, "0");
  const seq = String(existingToday + 1).padStart(3, "0");
  return `ORD-${mm}${dd}-${seq}`;
}

function getTodayBounds(): { start: number; end: number } {
  const nepalNow = Date.now() + NEPAL_OFFSET_MS;
  const dayStart = Math.floor(nepalNow / 86_400_000) * 86_400_000 - NEPAL_OFFSET_MS;
  return { start: dayStart, end: dayStart + 86_400_000 };
}

/** Place an order — public (customers) or authenticated (staff). */
export const placeOrder = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    tableId: v.optional(v.id("tables")),
    items: v.array(v.object({ menuItemId: v.id("menuItems"), quantity: v.number(), notes: v.optional(v.string()) })),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Auth is optional for placeOrder — customers can order without login
    const identity = await ctx.auth.getUserIdentity();
    const createdBy = identity?.subject ?? "customer";

    await checkRateLimit(ctx, "placeOrder", args.restaurantId);
    if (args.items.length === 0) throwLocalizedError("order.empty_items");
    validateOrderItems(args.items.length);
    validatePhone(args.customerPhone);
    validateStringLength(args.customerName, "Customer name", 100);
    validateStringLength(args.notes, "Notes", 500);
    for (const item of args.items) validateQuantity(item.quantity);

    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant || !restaurant.isActive) throwLocalizedError("restaurant.not_found");
    const taxRate = restaurant.taxRate ?? DEFAULT_TAX_RATE;

    if (args.tableId) {
      const table = await ctx.db.get(args.tableId);
      if (!table || table.restaurantId !== args.restaurantId) throwLocalizedError("table.not_found");
    }

    const { start, end } = getTodayBounds();
    const todaysOrders = await ctx.db.query("orders").withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId)).collect();
    const todayCount = todaysOrders.filter((o) => o._creationTime >= start && o._creationTime < end).length;
    const orderNumber = generateOrderNumber(todayCount);

    let subtotal = 0;
    const snapshots: { menuItemId: Doc<"menuItems">["_id"]; name: string; quantity: number; unitPrice: number; totalPrice: number; notes?: string }[] = [];

    for (const item of args.items) {
      const menuItem = await ctx.db.get(item.menuItemId);
      if (!menuItem || menuItem.restaurantId !== args.restaurantId) throwLocalizedError("menu.item_not_found", { id: item.menuItemId });
      if (!menuItem.isAvailable) throwLocalizedError("menu.item_unavailable", { name: menuItem.name });
      const totalPrice = menuItem.price * item.quantity;
      subtotal += totalPrice;
      snapshots.push({ menuItemId: item.menuItemId, name: menuItem.name, quantity: item.quantity, unitPrice: menuItem.price, totalPrice, notes: item.notes });
    }

    const tax = Math.round(subtotal * taxRate);
    const total = subtotal + tax;

    const orderId = await ctx.db.insert("orders", {
      restaurantId: args.restaurantId, tableId: args.tableId, orderNumber, status: "pending",
      customerName: args.customerName, customerPhone: args.customerPhone, notes: args.notes,
      subtotal, tax, total, createdBy,
    });

    for (const snap of snapshots) {
      await ctx.db.insert("orderItems", { orderId, ...snap, status: "pending" });
    }

    if (args.tableId) {
      await ctx.db.patch(args.tableId, { status: "occupied", currentOrderId: orderId });
    }

    const itemSummary = snapshots.map((s) => `${s.quantity}x ${s.name}`).join(", ");
    await ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
      restaurantId: args.restaurantId, type: "new_order", title: `New Order ${orderNumber}`,
      message: args.tableId ? `Table order: ${itemSummary} (Rs ${total})` : `Takeaway: ${itemSummary} (Rs ${total})`,
      orderId,
    });

    return { orderId, orderNumber };
  },
});

export const getByRestaurant = query({
  args: { restaurantId: v.id("restaurants"), status: v.optional(v.union(v.literal("pending"), v.literal("confirmed"), v.literal("preparing"), v.literal("ready"), v.literal("served"), v.literal("completed"), v.literal("cancelled"))) },
  handler: async (ctx, args) => {
    let orders: Doc<"orders">[];
    if (args.status) {
      orders = await ctx.db.query("orders").withIndex("by_restaurant_and_status", (q) => q.eq("restaurantId", args.restaurantId).eq("status", args.status!)).order("desc").collect();
    } else {
      orders = await ctx.db.query("orders").withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId)).order("desc").collect();
    }
    return Promise.all(orders.map(async (order) => {
      const items = await ctx.db.query("orderItems").withIndex("by_order", (q) => q.eq("orderId", order._id)).collect();
      return { ...order, items };
    }));
  },
});

export const getActiveForKitchen = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const statuses = ["pending", "confirmed", "preparing", "ready"] as const;
    const orders: Doc<"orders">[] = [];
    for (const status of statuses) {
      const batch = await ctx.db.query("orders").withIndex("by_restaurant_and_status", (q) => q.eq("restaurantId", args.restaurantId).eq("status", status)).collect();
      orders.push(...batch);
    }
    return Promise.all(orders.map(async (order) => {
      const items = await ctx.db.query("orderItems").withIndex("by_order", (q) => q.eq("orderId", order._id)).collect();
      const table = order.tableId ? await ctx.db.get(order.tableId) : null;
      return { ...order, items, tableNumber: table?.number };
    }));
  },
});

export const getByTable = query({
  args: { tableId: v.id("tables") },
  handler: async (ctx, args) => {
    const orders = await ctx.db.query("orders").withIndex("by_table", (q) => q.eq("tableId", args.tableId)).order("desc").collect();
    const active = orders.filter((o) => o.status !== "completed" && o.status !== "cancelled");
    return Promise.all(active.map(async (order) => {
      const items = await ctx.db.query("orderItems").withIndex("by_order", (q) => q.eq("orderId", order._id)).collect();
      return { ...order, items };
    }));
  },
});

export const getByOrderNumber = query({
  args: { restaurantId: v.id("restaurants"), orderNumber: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db.query("orders").withIndex("by_order_number", (q) => q.eq("restaurantId", args.restaurantId).eq("orderNumber", args.orderNumber)).unique();
    if (!order) return null;
    const items = await ctx.db.query("orderItems").withIndex("by_order", (q) => q.eq("orderId", order._id)).collect();
    return { ...order, items };
  },
});

export const updateStatus = mutation({
  args: { id: v.id("orders"), status: v.union(v.literal("confirmed"), v.literal("preparing"), v.literal("ready"), v.literal("served"), v.literal("completed")) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const order = await ctx.db.get(args.id);
    if (!order) throwLocalizedError("order.not_found");
    await authenticateForRestaurant(ctx, order.restaurantId);

    const now = Date.now();
    const patch: Record<string, unknown> = { status: args.status };
    const tsMap: Record<string, string> = { confirmed: "confirmedAt", preparing: "preparingAt", ready: "readyAt", served: "servedAt", completed: "completedAt" };
    const tsField = tsMap[args.status];
    if (tsField) patch[tsField] = now;
    await ctx.db.patch(args.id, patch);

    if (args.status === "completed" && order.tableId) {
      await ctx.db.patch(order.tableId, { status: "cleaning", currentOrderId: undefined });
    }
    if (args.status === "ready") {
      await ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
        restaurantId: order.restaurantId, type: "order_ready", title: `Order ${order.orderNumber} Ready`,
        message: `Order ${order.orderNumber} is ready to serve.`, orderId: order._id,
      });
    }
  },
});

export const cancelOrder = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const order = await ctx.db.get(args.id);
    if (!order) throwLocalizedError("order.not_found");
    await authenticateForRestaurant(ctx, order.restaurantId);

    if (order.status === "completed") throwLocalizedError("order.already_completed");
    if (order.status === "cancelled") throwLocalizedError("order.already_cancelled");

    await ctx.db.patch(args.id, { status: "cancelled", cancelledAt: Date.now() });
    if (order.tableId) await ctx.db.patch(order.tableId, { status: "available", currentOrderId: undefined });

    const items = await ctx.db.query("orderItems").withIndex("by_order", (q) => q.eq("orderId", args.id)).collect();
    for (const item of items) {
      if (item.status === "pending" || item.status === "preparing") await ctx.db.patch(item._id, { status: "cancelled" });
    }

    await ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
      restaurantId: order.restaurantId, type: "order_cancelled", title: `Order ${order.orderNumber} Cancelled`,
      message: `Order ${order.orderNumber} has been cancelled.`, orderId: order._id,
    });
  },
});
