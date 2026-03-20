import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("payments")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .collect();
  },
});

export const listByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("payments")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .order("desc")
      .collect();
  },
});

export const record = mutation({
  args: {
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
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const paymentId = await ctx.db.insert("payments", {
      ...args,
      status: "pending",
    });

    return paymentId;
  },
});

export const complete = mutation({
  args: {
    id: v.id("payments"),
    externalRef: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const payment = await ctx.db.get(args.id);
    if (!payment) throw new Error("Payment not found");

    await ctx.db.patch(args.id, {
      status: "completed",
      externalRef: args.externalRef ?? payment.externalRef,
    });

    // Mark order as completed
    await ctx.db.patch(payment.orderId, { status: "completed" });

    // Free the table
    const order = await ctx.db.get(payment.orderId);
    if (order) {
      await ctx.db.patch(order.tableId, {
        status: "cleaning",
        currentOrderId: undefined,
      });
    }
  },
});

export const refund = mutation({
  args: { id: v.id("payments") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "refunded" });
  },
});
