import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { authenticateForRestaurant } from "./auth";

export const getByOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return ctx.db.query("orderItems").withIndex("by_order", (q) => q.eq("orderId", args.orderId)).collect();
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("orderItems"),
    status: v.union(v.literal("pending"), v.literal("preparing"), v.literal("ready"), v.literal("served"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");

    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Order item not found");
    const order = await ctx.db.get(item.orderId);
    if (!order) throw new Error("Order not found");
    await authenticateForRestaurant(ctx, order.restaurantId);

    await ctx.db.patch(args.id, { status: args.status });
  },
});
