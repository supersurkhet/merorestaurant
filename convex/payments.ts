import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requireRole } from "./_helpers";

export const createPayment = mutation({
  args: {
    orderId: v.id("orders"),
    restaurantId: v.id("restaurants"),
    amount: v.number(),
    method: v.union(
      v.literal("cash"),
      v.literal("khalti"),
      v.literal("esewa"),
      v.literal("fonepay")
    ),
  },
  handler: async (ctx, args) => {
    // Payments can be created by anyone (customers place orders)
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    // Check for existing completed payment
    const existing = await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .filter((q) => q.eq(q.field("status"), "completed"))
      .first();
    if (existing) throw new Error("Order already has a completed payment");

    return await ctx.db.insert("payments", {
      ...args,
      status: args.method === "cash" ? "pending" : "pending",
      paidAt: undefined,
    });
  },
});

export const getByOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    return await ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", orderId))
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("payments"),
    status: v.union(
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded")
    ),
    transactionId: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, transactionId }) => {
    // Payment status updates come from webhooks (server-side) or admin
    const payment = await ctx.db.get(id);
    if (!payment) throw new Error("Payment not found");

    const updates: Record<string, unknown> = { status };
    if (transactionId) updates.transactionId = transactionId;
    if (status === "completed") {
      updates.paidAt = Date.now();
      // Also update the order to served if it's ready
      const order = await ctx.db.get(payment.orderId);
      if (order && order.status === "ready") {
        await ctx.db.patch(payment.orderId, {
          status: "served",
          servedAt: Date.now(),
        });
        // Free the table
        if (order.tableId) {
          await ctx.db.patch(order.tableId, { status: "available" });
        }
      }
    }
    await ctx.db.patch(id, updates);
  },
});

export const listByRestaurant = query({
  args: {
    restaurantId: v.id("restaurants"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("refunded")
      )
    ),
  },
  handler: async (ctx, { restaurantId, status }) => {
    if (status) {
      return await ctx.db
        .query("payments")
        .withIndex("by_restaurant_status", (q) =>
          q.eq("restaurantId", restaurantId).eq("status", status)
        )
        .collect();
    }
    return await ctx.db
      .query("payments")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurantId))
      .collect();
  },
});
