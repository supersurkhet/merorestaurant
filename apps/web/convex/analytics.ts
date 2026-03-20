import { v } from "convex/values";
import { query } from "./_generated/server";

// Nepal is UTC+5:45
const NEPAL_OFFSET_MS = (5 * 60 + 45) * 60 * 1000;

function getTodayBoundsNepal(): { startOfDay: number; endOfDay: number } {
  const nowUtc = Date.now();
  const nepalNow = nowUtc + NEPAL_OFFSET_MS;
  const nepalDayStart =
    Math.floor(nepalNow / 86_400_000) * 86_400_000 - NEPAL_OFFSET_MS;
  return { startOfDay: nepalDayStart, endOfDay: nepalDayStart + 86_400_000 };
}

export const getDailyRevenue = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const { startOfDay, endOfDay } = getTodayBoundsNepal();
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();

    let total = 0;
    let count = 0;
    for (const p of payments) {
      if (
        p.status === "completed" &&
        p._creationTime >= startOfDay &&
        p._creationTime < endOfDay
      ) {
        total += p.amount;
        count++;
      }
    }
    return { total, count };
  },
});

export const getPopularItems = query({
  args: { restaurantId: v.id("restaurants"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    // Get all orders for this restaurant
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();

    const orderIds = new Set(orders.map((o) => o._id));

    // Aggregate orderItems across all orders
    const countMap = new Map<
      string,
      { name: string; menuItemId: string; totalQuantity: number }
    >();

    for (const order of orders) {
      const items = await ctx.db
        .query("orderItems")
        .withIndex("by_order", (q) => q.eq("orderId", order._id))
        .collect();
      for (const item of items) {
        if (item.status === "cancelled") continue;
        const key = item.menuItemId;
        const existing = countMap.get(key);
        if (existing) {
          existing.totalQuantity += item.quantity;
        } else {
          countMap.set(key, {
            name: item.name,
            menuItemId: key,
            totalQuantity: item.quantity,
          });
        }
      }
    }

    return [...countMap.values()]
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);
  },
});

export const getOrdersByHour = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const { startOfDay, endOfDay } = getTodayBoundsNepal();
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();

    // Initialize 24 hour buckets
    const hourly: { hour: number; count: number; revenue: number }[] = [];
    for (let h = 0; h < 24; h++) {
      hourly.push({ hour: h, count: 0, revenue: 0 });
    }

    for (const order of orders) {
      if (
        order._creationTime >= startOfDay &&
        order._creationTime < endOfDay &&
        order.status !== "cancelled"
      ) {
        // Convert to Nepal hour
        const nepalTime = order._creationTime + NEPAL_OFFSET_MS;
        const hour = Math.floor((nepalTime % 86_400_000) / 3_600_000);
        hourly[hour].count++;
        hourly[hour].revenue += order.total;
      }
    }

    return hourly;
  },
});

export const getPaymentBreakdown = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const { startOfDay, endOfDay } = getTodayBoundsNepal();
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();

    const breakdown: Record<string, { count: number; total: number }> = {};

    for (const p of payments) {
      if (
        p.status === "completed" &&
        p._creationTime >= startOfDay &&
        p._creationTime < endOfDay
      ) {
        if (!breakdown[p.method]) {
          breakdown[p.method] = { count: 0, total: 0 };
        }
        breakdown[p.method].count++;
        breakdown[p.method].total += p.amount;
      }
    }

    return breakdown;
  },
});
