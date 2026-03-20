import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

export const cancelStaleOrders = internalMutation({
  handler: async (ctx) => {
    const cutoff = Date.now() - TWO_HOURS_MS;

    // Find all restaurants
    const restaurants = await ctx.db.query("restaurants").collect();

    let cancelledCount = 0;

    for (const restaurant of restaurants) {
      // Get pending orders for this restaurant
      const pendingOrders = await ctx.db
        .query("orders")
        .withIndex("by_restaurant_and_status", (q) =>
          q.eq("restaurantId", restaurant._id).eq("status", "pending"),
        )
        .collect();

      for (const order of pendingOrders) {
        if (order._creationTime < cutoff) {
          // Cancel the order
          await ctx.db.patch(order._id, {
            status: "cancelled",
            cancelledAt: Date.now(),
          });

          // Free the table if any
          if (order.tableId) {
            await ctx.db.patch(order.tableId, {
              status: "available",
              currentOrderId: undefined,
            });
          }

          // Cancel all pending items
          const items = await ctx.db
            .query("orderItems")
            .withIndex("by_order", (q) => q.eq("orderId", order._id))
            .collect();
          for (const item of items) {
            if (item.status === "pending" || item.status === "preparing") {
              await ctx.db.patch(item._id, { status: "cancelled" });
            }
          }

          // Notify
          await ctx.runMutation(internal.notifications.createNotification, {
            restaurantId: restaurant._id,
            type: "order_cancelled",
            title: "Order Auto-Cancelled",
            message: `Order ${order.orderNumber} was auto-cancelled after 2 hours without confirmation.`,
            orderId: order._id,
          });

          cancelledCount++;
        }
      }
    }

    return { cancelledCount };
  },
});
