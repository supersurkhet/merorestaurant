import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createPayment = mutation({
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
    if (!payment) throw new Error("Payment not found");

    const patch: Record<string, unknown> = { status: args.status };
    if (args.externalRef) patch.externalRef = args.externalRef;
    await ctx.db.patch(args.id, patch);

    // On completion, mark order completed and free table
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
      }
    }
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
