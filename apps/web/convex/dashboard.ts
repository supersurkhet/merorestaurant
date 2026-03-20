import { v } from "convex/values";
import { query } from "./_generated/server";

// Aggregated dashboard stats for a restaurant
export const getStats = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const [tables, activeOrders, completedOrders, payments] =
      await Promise.all([
        ctx.db
          .query("tables")
          .withIndex("by_restaurant", (q) =>
            q.eq("restaurantId", args.restaurantId),
          )
          .collect(),
        ctx.db
          .query("orders")
          .withIndex("by_restaurant_and_status", (q) =>
            q
              .eq("restaurantId", args.restaurantId)
              .eq("status", "preparing"),
          )
          .collect(),
        ctx.db
          .query("orders")
          .withIndex("by_restaurant_and_status", (q) =>
            q
              .eq("restaurantId", args.restaurantId)
              .eq("status", "completed"),
          )
          .collect(),
        ctx.db
          .query("payments")
          .withIndex("by_restaurant", (q) =>
            q.eq("restaurantId", args.restaurantId),
          )
          .collect(),
      ]);

    const occupiedTables = tables.filter((t) => t.status === "occupied").length;
    const totalRevenue = payments
      .filter((p) => p.status === "completed")
      .reduce((sum, p) => sum + p.amount, 0);

    return {
      totalTables: tables.length,
      occupiedTables,
      availableTables: tables.filter((t) => t.status === "available").length,
      activeOrderCount: activeOrders.length,
      completedOrderCount: completedOrders.length,
      totalRevenue,
    };
  },
});
