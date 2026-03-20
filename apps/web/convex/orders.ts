import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { internal } from "./_generated/api";
import type { Doc } from "./_generated/dataModel";
import { throwLocalizedError } from "./i18n";
import { checkRateLimit } from "./rateLimit";
import {
  validatePhone,
  validateQuantity,
  validateStringLength,
  validateOrderItems,
} from "./validation";

const TAX_RATE = 0.13; // 13% VAT (Nepal)
const NEPAL_OFFSET_MS = (5 * 60 + 45) * 60 * 1000;

/** Generate date-based order number: ORD-MMDD-NNN */
function generateOrderNumber(
  existingToday: number,
  now: number = Date.now(),
): string {
  const nepalTime = new Date(now + NEPAL_OFFSET_MS);
  const mm = String(nepalTime.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(nepalTime.getUTCDate()).padStart(2, "0");
  const seq = String(existingToday + 1).padStart(3, "0");
  return `ORD-${mm}${dd}-${seq}`;
}

/** Get Nepal day boundaries for counting today's orders */
function getTodayBounds(): { start: number; end: number } {
  const nowUtc = Date.now();
  const nepalNow = nowUtc + NEPAL_OFFSET_MS;
  const dayStart =
    Math.floor(nepalNow / 86_400_000) * 86_400_000 - NEPAL_OFFSET_MS;
  return { start: dayStart, end: dayStart + 86_400_000 };
}

export const placeOrder = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    tableId: v.optional(v.id("tables")),
    items: v.array(
      v.object({
        menuItemId: v.id("menuItems"),
        quantity: v.number(),
        notes: v.optional(v.string()),
      }),
    ),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Rate limit: 10 orders/min per restaurant
    await checkRateLimit(ctx, "placeOrder", args.restaurantId);

    // Input validation
    if (args.items.length === 0) {
      throwLocalizedError("order.empty_items");
    }
    validateOrderItems(args.items.length);
    validatePhone(args.customerPhone);
    validateStringLength(args.customerName, "Customer name", 100);
    validateStringLength(args.notes, "Notes", 500);
    for (const item of args.items) {
      validateQuantity(item.quantity);
      validateStringLength(item.notes, "Item notes", 200);
    }

    // Count today's orders for sequential numbering
    const { start, end } = getTodayBounds();
    const todaysOrders = await ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();
    const todayCount = todaysOrders.filter(
      (o) => o._creationTime >= start && o._creationTime < end,
    ).length;
    const orderNumber = generateOrderNumber(todayCount);

    // Snapshot each menu item's name + price, calculate totals
    let subtotal = 0;
    const itemSnapshots: {
      menuItemId: Doc<"menuItems">["_id"];
      name: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      notes?: string;
    }[] = [];

    for (const item of args.items) {
      const menuItem = await ctx.db.get(item.menuItemId);
      if (!menuItem) {
        throwLocalizedError("menu.item_not_found", { id: item.menuItemId });
      }
      if (!menuItem.isAvailable) {
        throwLocalizedError("menu.item_unavailable", { name: menuItem.name });
      }
      const totalPrice = menuItem.price * item.quantity;
      subtotal += totalPrice;
      itemSnapshots.push({
        menuItemId: item.menuItemId,
        name: menuItem.name,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        totalPrice,
        notes: item.notes,
      });
    }

    const tax = Math.round(subtotal * TAX_RATE);
    const total = subtotal + tax;

    // Create the order
    const orderId = await ctx.db.insert("orders", {
      restaurantId: args.restaurantId,
      tableId: args.tableId,
      orderNumber,
      status: "pending",
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      notes: args.notes,
      subtotal,
      tax,
      total,
      createdBy: args.createdBy,
    });

    // Create order items
    for (const snap of itemSnapshots) {
      await ctx.db.insert("orderItems", {
        orderId,
        menuItemId: snap.menuItemId,
        name: snap.name,
        quantity: snap.quantity,
        unitPrice: snap.unitPrice,
        totalPrice: snap.totalPrice,
        notes: snap.notes,
        status: "pending",
      });
    }

    // Mark table as occupied if provided
    if (args.tableId) {
      await ctx.db.patch(args.tableId, {
        status: "occupied",
        currentOrderId: orderId,
      });
    }

    // Send real-time notification
    const itemSummary = itemSnapshots
      .map((s) => `${s.quantity}x ${s.name}`)
      .join(", ");
    await ctx.scheduler.runAfter(0, internal.notifications.createNotification, {
      restaurantId: args.restaurantId,
      type: "new_order",
      title: `New Order ${orderNumber}`,
      message: args.tableId
        ? `Table order: ${itemSummary} (Rs ${total})`
        : `Takeaway: ${itemSummary} (Rs ${total})`,
      orderId,
    });

    return { orderId, orderNumber };
  },
});

export const getByRestaurant = query({
  args: {
    restaurantId: v.id("restaurants"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("confirmed"),
        v.literal("preparing"),
        v.literal("ready"),
        v.literal("served"),
        v.literal("completed"),
        v.literal("cancelled"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    let orders: Doc<"orders">[];
    if (args.status) {
      orders = await ctx.db
        .query("orders")
        .withIndex("by_restaurant_and_status", (q) =>
          q
            .eq("restaurantId", args.restaurantId)
            .eq("status", args.status!),
        )
        .order("desc")
        .collect();
    } else {
      orders = await ctx.db
        .query("orders")
        .withIndex("by_restaurant", (q) =>
          q.eq("restaurantId", args.restaurantId),
        )
        .order("desc")
        .collect();
    }

    return Promise.all(
      orders.map(async (order) => {
        const items = await ctx.db
          .query("orderItems")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .collect();
        return { ...order, items };
      }),
    );
  },
});

export const getByTable = query({
  args: { tableId: v.id("tables") },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .order("desc")
      .collect();
    const activeOrders = orders.filter(
      (o) => o.status !== "completed" && o.status !== "cancelled",
    );

    return Promise.all(
      activeOrders.map(async (order) => {
        const items = await ctx.db
          .query("orderItems")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .collect();
        return { ...order, items };
      }),
    );
  },
});

export const getByOrderNumber = query({
  args: {
    restaurantId: v.id("restaurants"),
    orderNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_order_number", (q) =>
        q
          .eq("restaurantId", args.restaurantId)
          .eq("orderNumber", args.orderNumber),
      )
      .unique();
    if (!order) return null;
    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", order._id))
      .collect();
    return { ...order, items };
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("served"),
      v.literal("completed"),
    ),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throwLocalizedError("order.not_found");

    const now = Date.now();
    const patch: Record<string, unknown> = { status: args.status };

    const timestampMap: Record<string, string> = {
      confirmed: "confirmedAt",
      preparing: "preparingAt",
      ready: "readyAt",
      served: "servedAt",
      completed: "completedAt",
    };
    const tsField = timestampMap[args.status];
    if (tsField) patch[tsField] = now;

    await ctx.db.patch(args.id, patch);

    // Free table on completed
    if (args.status === "completed" && order.tableId) {
      await ctx.db.patch(order.tableId, {
        status: "cleaning",
        currentOrderId: undefined,
      });
    }

    // Notify when order is ready
    if (args.status === "ready") {
      await ctx.scheduler.runAfter(
        0,
        internal.notifications.createNotification,
        {
          restaurantId: order.restaurantId,
          type: "order_ready",
          title: `Order ${order.orderNumber} Ready`,
          message: `Order ${order.orderNumber} is ready to be served.`,
          orderId: order._id,
        },
      );
    }
  },
});

export const cancelOrder = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throwLocalizedError("order.not_found");
    if (order.status === "completed") {
      throwLocalizedError("order.already_completed");
    }
    if (order.status === "cancelled") {
      throwLocalizedError("order.already_cancelled");
    }

    await ctx.db.patch(args.id, {
      status: "cancelled",
      cancelledAt: Date.now(),
    });

    // Free the table
    if (order.tableId) {
      await ctx.db.patch(order.tableId, {
        status: "available",
        currentOrderId: undefined,
      });
    }

    // Cancel all pending/preparing items
    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", args.id))
      .collect();
    for (const item of items) {
      if (item.status === "pending" || item.status === "preparing") {
        await ctx.db.patch(item._id, { status: "cancelled" });
      }
    }

    // Notify
    await ctx.scheduler.runAfter(
      0,
      internal.notifications.createNotification,
      {
        restaurantId: order.restaurantId,
        type: "order_cancelled",
        title: `Order ${order.orderNumber} Cancelled`,
        message: `Order ${order.orderNumber} has been cancelled.`,
        orderId: order._id,
      },
    );
  },
});
