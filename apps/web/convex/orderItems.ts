import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .collect();
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("orderItems"),
    status: v.union(
      v.literal("pending"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("served"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

// Mark all items in an order as a given status (kitchen bulk action)
export const bulkUpdateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    fromStatus: v.union(
      v.literal("pending"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("served"),
      v.literal("cancelled"),
    ),
    toStatus: v.union(
      v.literal("pending"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("served"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_order_and_status", (q) =>
        q.eq("orderId", args.orderId).eq("status", args.fromStatus),
      )
      .collect();
    for (const item of items) {
      await ctx.db.patch(item._id, { status: args.toStatus });
    }
    return items.length;
  },
});
