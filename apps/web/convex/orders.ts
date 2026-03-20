import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByRestaurant = query({
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
    if (args.status) {
      return ctx.db
        .query("orders")
        .withIndex("by_restaurant_and_status", (q) =>
          q
            .eq("restaurantId", args.restaurantId)
            .eq("status", args.status!),
        )
        .order("desc")
        .collect();
    }
    return ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .order("desc")
      .collect();
  },
});

// Real-time kitchen display: active orders
export const listActiveForKitchen = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const statuses = ["confirmed", "preparing", "ready"] as const;
    const orders = [];
    for (const status of statuses) {
      const batch = await ctx.db
        .query("orders")
        .withIndex("by_restaurant_and_status", (q) =>
          q.eq("restaurantId", args.restaurantId).eq("status", status),
        )
        .collect();
      orders.push(...batch);
    }
    // Fetch items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await ctx.db
          .query("orderItems")
          .withIndex("by_order", (q) => q.eq("orderId", order._id))
          .collect();
        return { ...order, items };
      }),
    );
    return ordersWithItems;
  },
});

export const getById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) return null;
    const items = await ctx.db
      .query("orderItems")
      .withIndex("by_order", (q) => q.eq("orderId", args.id))
      .collect();
    return { ...order, items };
  },
});

export const getByTable = query({
  args: { tableId: v.id("tables") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("orders")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .order("desc")
      .first();
  },
});

export const create = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    tableId: v.id("tables"),
    customerName: v.optional(v.string()),
    customerPhone: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdBy: v.optional(v.string()),
    items: v.array(
      v.object({
        menuItemId: v.id("menuItems"),
        quantity: v.number(),
        notes: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Generate order number
    const existingOrders = await ctx.db
      .query("orders")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();
    const orderNumber = `ORD-${String(existingOrders.length + 1).padStart(4, "0")}`;

    // Calculate totals from items
    let subtotal = 0;
    const itemsToInsert = [];
    for (const item of args.items) {
      const menuItem = await ctx.db.get(item.menuItemId);
      if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);
      if (!menuItem.isAvailable)
        throw new Error(`${menuItem.name} is not available`);

      const totalPrice = menuItem.price * item.quantity;
      subtotal += totalPrice;
      itemsToInsert.push({
        menuItemId: item.menuItemId,
        name: menuItem.name,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        totalPrice,
        notes: item.notes,
        status: "pending" as const,
      });
    }

    const tax = Math.round(subtotal * 0.13); // 13% VAT (Nepal)
    const total = subtotal + tax;

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

    // Insert order items
    for (const item of itemsToInsert) {
      await ctx.db.insert("orderItems", { orderId, ...item });
    }

    // Mark table as occupied
    await ctx.db.patch(args.tableId, {
      status: "occupied",
      currentOrderId: orderId,
    });

    return orderId;
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("preparing"),
      v.literal("ready"),
      v.literal("served"),
      v.literal("completed"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.id);
    if (!order) throw new Error("Order not found");

    await ctx.db.patch(args.id, { status: args.status });

    // If completed or cancelled, free the table
    if (args.status === "completed" || args.status === "cancelled") {
      await ctx.db.patch(order.tableId, {
        status: "cleaning",
        currentOrderId: undefined,
      });
    }
  },
});

export const addItems = mutation({
  args: {
    orderId: v.id("orders"),
    items: v.array(
      v.object({
        menuItemId: v.id("menuItems"),
        quantity: v.number(),
        notes: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    let additionalSubtotal = 0;
    for (const item of args.items) {
      const menuItem = await ctx.db.get(item.menuItemId);
      if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);

      const totalPrice = menuItem.price * item.quantity;
      additionalSubtotal += totalPrice;

      await ctx.db.insert("orderItems", {
        orderId: args.orderId,
        menuItemId: item.menuItemId,
        name: menuItem.name,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        totalPrice,
        notes: item.notes,
        status: "pending",
      });
    }

    const newSubtotal = order.subtotal + additionalSubtotal;
    const newTax = Math.round(newSubtotal * 0.13);
    await ctx.db.patch(args.orderId, {
      subtotal: newSubtotal,
      tax: newTax,
      total: newSubtotal + newTax,
    });
  },
});
