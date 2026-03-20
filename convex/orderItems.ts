import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth } from "./_helpers";

export const getByOrder = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, { orderId }) => {
    return await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", orderId))
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
      v.literal("served")
    ),
  },
  handler: async (ctx, { id, status }) => {
    await requireAuth(ctx);
    const item = await ctx.db.get(id);
    if (!item) throw new Error("Order item not found");
    await ctx.db.patch(id, { status });
  },
});
