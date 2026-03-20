import { query } from "./_generated/server";

/** Platform-wide stats (for platform admins). */
export const getStats = query({
  handler: async (ctx) => {
    const restaurants = await ctx.db.query("restaurants").collect();
    const orders = await ctx.db.query("orders").collect();
    const payments = await ctx.db.query("payments").collect();

    const activeRestaurants = restaurants.filter((r) => r.isActive).length;
    const totalOrders = orders.length;
    const completedOrders = orders.filter(
      (o) => o.status === "completed",
    ).length;
    const totalRevenue = payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);
    const cancelledOrders = orders.filter(
      (o) => o.status === "cancelled",
    ).length;

    return {
      totalRestaurants: restaurants.length,
      activeRestaurants,
      totalOrders,
      completedOrders,
      cancelledOrders,
      totalRevenue,
      averageOrderValue:
        completedOrders > 0
          ? Math.round(totalRevenue / completedOrders)
          : 0,
    };
  },
});

/** Count restaurants by subscription tier (for platform admins). */
export const getRestaurantsByTier = query({
  handler: async (ctx) => {
    const restaurants = await ctx.db.query("restaurants").collect();

    const byTier: Record<string, { count: number; active: number }> = {
      free: { count: 0, active: 0 },
      starter: { count: 0, active: 0 },
      pro: { count: 0, active: 0 },
      enterprise: { count: 0, active: 0 },
    };

    for (const r of restaurants) {
      const tier = r.subscriptionTier ?? "free";
      if (!byTier[tier]) byTier[tier] = { count: 0, active: 0 };
      byTier[tier].count++;
      if (r.isActive) byTier[tier].active++;
    }

    return byTier;
  },
});
