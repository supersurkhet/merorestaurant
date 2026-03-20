import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import { throwLocalizedError } from "./i18n";
import { checkRateLimit } from "./rateLimit";
import { validatePaymentAmount } from "./validation";
import { authenticateForRestaurant } from "./auth";

export const createPayment = mutation({
  args: {
    workosUserId: v.string(),
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
    externalRef: v.optional(v.string()),
    processedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await authenticateForRestaurant(ctx, args.workosUserId, args.restaurantId);
    await checkRateLimit(ctx, "createPayment", args.orderId);
    validatePaymentAmount(args.amount);

    // Verify order belongs to this restaurant
    const order = await ctx.db.get(args.orderId);
    if (!order) throwLocalizedError("order.not_found");
    if (order.restaurantId !== args.restaurantId) {
      throwLocalizedError("order.not_found");
    }

    return ctx.db.insert("payments", { ...args, status: "pending" });
  },
});

export const getByOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("payments"),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("refunded"),
    ),
    externalRef: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.id);
    if (!payment) throwLocalizedError("payment.not_found");
    if (payment.status === "completed" && args.status === "completed") {
      throwLocalizedError("payment.already_completed");
    }

    const patch: Record<string, unknown> = { status: args.status };
    if (args.externalRef) patch.externalRef = args.externalRef;
    await ctx.db.patch(args.id, patch);

    if (args.status === "completed") {
      const order = await ctx.db.get(payment.orderId);
      if (order) {
        await ctx.db.patch(payment.orderId, {
          status: "completed",
          completedAt: Date.now(),
        });
        if (order.tableId) {
          await ctx.db.patch(order.tableId, {
            status: "cleaning",
            currentOrderId: undefined,
          });
        }
        await ctx.scheduler.runAfter(
          0,
          internal.notifications.createNotification,
          {
            restaurantId: payment.restaurantId,
            type: "payment_received",
            title: "Payment Received",
            message: `Rs ${payment.amount} via ${payment.method} for ${order.orderNumber}.`,
            orderId: order._id,
          },
        );
      }
    }
  },
});

/** List payments for a restaurant (settlement tracking). */
export const listByRestaurant = query({
  args: {
    restaurantId: v.id("restaurants"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("refunded"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    if (args.status) {
      return ctx.db
        .query("payments")
        .withIndex("by_restaurant_and_status", (q) =>
          q
            .eq("restaurantId", args.restaurantId)
            .eq("status", args.status!),
        )
        .order("desc")
        .collect();
    }
    return ctx.db
      .query("payments")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .order("desc")
      .collect();
  },
});

/** Settlement summary for a restaurant. */
export const getSettlement = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();

    const completed = payments.filter((p) => p.status === "completed");
    const pending = payments.filter((p) => p.status === "pending");
    const refunded = payments.filter((p) => p.status === "refunded");

    const byMethod: Record<string, { count: number; total: number }> = {};
    for (const p of completed) {
      if (!byMethod[p.method]) byMethod[p.method] = { count: 0, total: 0 };
      byMethod[p.method].count++;
      byMethod[p.method].total += p.amount;
    }

    return {
      totalCollected: completed.reduce((s, p) => s + p.amount, 0),
      totalPending: pending.reduce((s, p) => s + p.amount, 0),
      totalRefunded: refunded.reduce((s, p) => s + p.amount, 0),
      completedCount: completed.length,
      byMethod,
    };
  },
});
