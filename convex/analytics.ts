import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./_helpers";

/** Daily revenue for a restaurant — owner/manager only */
export const getDailyRevenue = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, { restaurantId }) => {
    await requireRole(ctx, restaurantId as string, ["owner", "manager"]);

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_restaurant_status", (q) =>
        q.eq("restaurantId", restaurantId).eq("status", "completed")
      )
      .collect();

    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    ).getTime();

    const todayPayments = payments.filter(
      (p) => (p.paidAt ?? p._creationTime) >= todayStart
    );

    return {
      totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
      todayRevenue: todayPayments.reduce((sum, p) => sum + p.amount, 0),
      todayCount: todayPayments.length,
      allTimeCount: payments.length,
    };
  },
});

/** Popular menu items by order count — owner/manager only */
export const getPopularItems = query({
  args: {
    restaurantId: v.id("restaurants"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { restaurantId, limit }) => {
    await requireRole(ctx, restaurantId as string, ["owner", "manager"]);

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurantId))
      .collect();

    // Aggregate order items across all orders
    const itemCounts = new Map<
      string,
      { name: string; count: number; revenue: number }
    >();

    for (const order of orders) {
      if (order.status === "cancelled") continue;
      const items = await ctx.db
        .query("orderItems")
        .withIndex("by_order", (q) => q.eq("orderId", order._id))
        .collect();
      for (const item of items) {
        const existing = itemCounts.get(item.name) ?? {
          name: item.name,
          count: 0,
          revenue: 0,
        };
        existing.count += item.quantity;
        existing.revenue += item.price * item.quantity;
        itemCounts.set(item.name, existing);
      }
    }

    return [...itemCounts.values()]
      .sort((a, b) => b.count - a.count)
      .slice(0, limit ?? 10);
  },
});

/** Orders grouped by hour of day — owner/manager only */
export const getOrdersByHour = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, { restaurantId }) => {
    await requireRole(ctx, restaurantId as string, ["owner", "manager"]);

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurantId))
      .collect();

    const hours = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i === 0 ? 12 : i > 12 ? i - 12 : i}${i < 12 ? "AM" : "PM"}`,
      count: 0,
    }));

    for (const order of orders) {
      if (order.status === "cancelled") continue;
      const h = new Date(order.placedAt).getHours();
      hours[h].count++;
    }

    // Return only business hours (7 AM to 10 PM)
    return hours.slice(7, 23);
  },
});

/** Payment method breakdown — owner/manager only */
export const getPaymentBreakdown = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, { restaurantId }) => {
    await requireRole(ctx, restaurantId as string, ["owner", "manager"]);

    const payments = await ctx.db
      .query("payments")
      .withIndex("by_restaurant_status", (q) =>
        q.eq("restaurantId", restaurantId).eq("status", "completed")
      )
      .collect();

    const byMethod = new Map<string, { method: string; total: number; count: number }>();
    let grandTotal = 0;

    for (const p of payments) {
      const existing = byMethod.get(p.method) ?? {
        method: p.method,
        total: 0,
        count: 0,
      };
      existing.total += p.amount;
      existing.count++;
      grandTotal += p.amount;
      byMethod.set(p.method, existing);
    }

    return [...byMethod.values()]
      .map((m) => ({
        ...m,
        percent: grandTotal > 0 ? Math.round((m.total / grandTotal) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  },
});
