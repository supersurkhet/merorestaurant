import { v } from "convex/values";
import {
  internalMutation,
  mutation,
  query,
} from "./_generated/server";

export const getUnread = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("notifications")
      .withIndex("by_restaurant_unread", (q) =>
        q.eq("restaurantId", args.restaurantId).eq("isRead", false),
      )
      .order("desc")
      .collect();
  },
});

export const markRead = mutation({
  args: { id: v.id("notifications") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isRead: true });
  },
});

export const markAllRead = mutation({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const unread = await ctx.db
      .query("notifications")
      .withIndex("by_restaurant_unread", (q) =>
        q.eq("restaurantId", args.restaurantId).eq("isRead", false),
      )
      .collect();
    for (const n of unread) {
      await ctx.db.patch(n._id, { isRead: true });
    }
  },
});

export const createNotification = internalMutation({
  args: {
    restaurantId: v.id("restaurants"),
    type: v.union(
      v.literal("new_order"),
      v.literal("order_ready"),
      v.literal("payment_received"),
      v.literal("order_cancelled"),
    ),
    title: v.string(),
    message: v.string(),
    orderId: v.optional(v.id("orders")),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("notifications", {
      ...args,
      isRead: false,
    });
  },
});
