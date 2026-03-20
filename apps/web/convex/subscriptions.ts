import { v } from "convex/values";
import { query } from "./_generated/server";

// ── Tier limits ─────────────────────────────────────────────────────

export const TIER_LIMITS = {
  free: { menuItems: 10, tables: 5, ordersPerMonth: 50 },
  starter: { menuItems: 50, tables: 15, ordersPerMonth: 500 },
  pro: { menuItems: Infinity, tables: Infinity, ordersPerMonth: 5000 },
  enterprise: { menuItems: Infinity, tables: Infinity, ordersPerMonth: Infinity },
} as const;

export type SubscriptionTier = keyof typeof TIER_LIMITS;

// ── Check limits ────────────────────────────────────────────────────

const NEPAL_OFFSET_MS = (5 * 60 + 45) * 60 * 1000;

function getMonthBounds(): { start: number; end: number } {
  const nepalNow = new Date(Date.now() + NEPAL_OFFSET_MS);
  const year = nepalNow.getUTCFullYear();
  const month = nepalNow.getUTCMonth();
  const startUtc = Date.UTC(year, month, 1) - NEPAL_OFFSET_MS;
  const endUtc = Date.UTC(year, month + 1, 1) - NEPAL_OFFSET_MS;
  return { start: startUtc, end: endUtc };
}

export const checkLimits = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant) {
      return { error: "Restaurant not found" };
    }

    const tier = (restaurant.subscriptionTier ?? "free") as SubscriptionTier;
    const limits = TIER_LIMITS[tier];

    // Count menu items
    const menuItems = await ctx.db
      .query("menuItems")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();
    const menuItemCount = menuItems.length;

    // Count tables
    const tables = await ctx.db
      .query("tables")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();
    const tableCount = tables.length;

    // Count orders this month
    const { start, end } = getMonthBounds();
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();
    const monthlyOrderCount = orders.filter(
      (o) =>
        o._creationTime >= start &&
        o._creationTime < end &&
        o.status !== "cancelled",
    ).length;

    return {
      tier,
      limits: {
        menuItems: limits.menuItems,
        tables: limits.tables,
        ordersPerMonth: limits.ordersPerMonth,
      },
      usage: {
        menuItems: menuItemCount,
        tables: tableCount,
        ordersThisMonth: monthlyOrderCount,
      },
      exceeded: {
        menuItems: menuItemCount >= limits.menuItems,
        tables: tableCount >= limits.tables,
        ordersPerMonth: monthlyOrderCount >= limits.ordersPerMonth,
      },
      canPlaceOrder: monthlyOrderCount < limits.ordersPerMonth,
      canAddMenuItem: menuItemCount < limits.menuItems,
      canAddTable: tableCount < limits.tables,
    };
  },
});
