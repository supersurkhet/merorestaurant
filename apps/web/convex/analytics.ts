import { v } from "convex/values";
import { query } from "./_generated/server";

const NEPAL_OFFSET_MS = (5 * 60 + 45) * 60 * 1000;

function getTodayBoundsNepal(): { startOfDay: number; endOfDay: number } {
  const nepalNow = Date.now() + NEPAL_OFFSET_MS;
  const nepalDayStart =
    Math.floor(nepalNow / 86_400_000) * 86_400_000 - NEPAL_OFFSET_MS;
  return { startOfDay: nepalDayStart, endOfDay: nepalDayStart + 86_400_000 };
}

/** Per-restaurant daily revenue. */
export const getDailyRevenue = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const { startOfDay, endOfDay } = getTodayBoundsNepal();
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_restaurant_and_status", (q) =>
        q.eq("restaurantId", args.restaurantId).eq("status", "completed"),
      )
      .collect();

    let total = 0;
    let count = 0;
    for (const p of payments) {
      if (p._creationTime >= startOfDay && p._creationTime < endOfDay) {
        total += p.amount;
        count++;
      }
    }
    return { total, count };
  },
});

/** Per-restaurant top menu items. */
export const getPopularItems = query({
  args: { restaurantId: v.id("restaurants"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();

    const countMap = new Map<
      string,
      { name: string; menuItemId: string; totalQuantity: number; revenue: number }
    >();

    for (const order of orders) {
      if (order.status === "cancelled") continue;
      const items = await ctx.db
        .query("orderItems")
        .withIndex("by_order", (q) => q.eq("orderId", order._id))
        .collect();
      for (const item of items) {
        if (item.status === "cancelled") continue;
        const existing = countMap.get(item.menuItemId);
        if (existing) {
          existing.totalQuantity += item.quantity;
          existing.revenue += item.totalPrice;
        } else {
          countMap.set(item.menuItemId, {
            name: item.name,
            menuItemId: item.menuItemId,
            totalQuantity: item.quantity,
            revenue: item.totalPrice,
          });
        }
      }
    }

    return [...countMap.values()]
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, limit);
  },
});

/** Per-restaurant orders by hour (for dashboard chart). */
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
        const nepalTime = order._creationTime + NEPAL_OFFSET_MS;
        const hour = Math.floor((nepalTime % 86_400_000) / 3_600_000);
        hourly[hour].count++;
        hourly[hour].revenue += order.total;
      }
    }

    return hourly;
  },
});

/** Per-restaurant payment breakdown by method. */
export const getPaymentBreakdown = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const { startOfDay, endOfDay } = getTodayBoundsNepal();
    const payments = await ctx.db
      .query("payments")
      .withIndex("by_restaurant_and_status", (q) =>
        q.eq("restaurantId", args.restaurantId).eq("status", "completed"),
      )
      .collect();

    const breakdown: Record<string, { count: number; total: number }> = {};
    for (const p of payments) {
      if (p._creationTime >= startOfDay && p._creationTime < endOfDay) {
        if (!breakdown[p.method]) breakdown[p.method] = { count: 0, total: 0 };
        breakdown[p.method].count++;
        breakdown[p.method].total += p.amount;
      }
    }

    return breakdown;
  },
});

/** Per-restaurant dashboard summary. */
export const getDashboard = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const { startOfDay, endOfDay } = getTodayBoundsNepal();

    const [tables, orders, payments, staff] = await Promise.all([
      ctx.db
        .query("tables")
        .withIndex("by_restaurant", (q) =>
          q.eq("restaurantId", args.restaurantId),
        )
        .collect(),
      ctx.db
        .query("orders")
        .withIndex("by_restaurant", (q) =>
          q.eq("restaurantId", args.restaurantId),
        )
        .collect(),
      ctx.db
        .query("payments")
        .withIndex("by_restaurant_and_status", (q) =>
          q.eq("restaurantId", args.restaurantId).eq("status", "completed"),
        )
        .collect(),
      ctx.db
        .query("staff")
        .withIndex("by_restaurant", (q) =>
          q.eq("restaurantId", args.restaurantId),
        )
        .collect(),
    ]);

    const todayOrders = orders.filter(
      (o) =>
        o._creationTime >= startOfDay &&
        o._creationTime < endOfDay &&
        o.status !== "cancelled",
    );
    const todayRevenue = payments
      .filter(
        (p) => p._creationTime >= startOfDay && p._creationTime < endOfDay,
      )
      .reduce((s, p) => s + p.amount, 0);

    const activeOrders = orders.filter(
      (o) =>
        o.status !== "completed" &&
        o.status !== "cancelled",
    );

    return {
      totalTables: tables.length,
      occupiedTables: tables.filter((t) => t.status === "occupied").length,
      availableTables: tables.filter((t) => t.status === "available").length,
      todayOrderCount: todayOrders.length,
      activeOrderCount: activeOrders.length,
      todayRevenue,
      activeStaff: staff.filter((s) => s.isActive).length,
    };
  },
});
