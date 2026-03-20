import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";

const TAX_RATE = 0.13; // 13% VAT (Nepal)

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
    if (args.items.length === 0) {
      throw new Error("Order must have at least one item");
    }

    // Generate order number: ORD-XXXX (sequential per restaurant)
    const existingOrders = await ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();
    const orderNumber = `ORD-${String(existingOrders.length + 1).padStart(4, "0")}`;

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
        throw new Error(`Menu item not found: ${item.menuItemId}`);
      }
      if (!menuItem.isAvailable) {
        throw new Error(`"${menuItem.name}" is currently unavailable`);
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

    // Join orderItems
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
    // Get active (non-completed, non-cancelled) orders for this table
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
    if (!order) throw new Error("Order not found");

    const now = Date.now();
    const patch: Record<string, unknown> = { status: args.status };

    // Set the appropriate timestamp
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

    // Free table on completed/served
    if (
      (args.status === "completed" || args.status === "served") &&
      order.tableId
    ) {
      if (args.status === "completed") {
        await ctx.db.patch(order.tableId, {
          status: "cleaning",
          currentOrderId: undefined,
        });
      }
    }
  },
});

export const cancelOrder = mutation({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");
    if (order.status === "completed" || order.status === "cancelled") {
      throw new Error(`Cannot cancel an order that is already ${order.status}`);
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
  },
});
