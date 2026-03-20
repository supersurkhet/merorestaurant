import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const tables = await ctx.db
      .query("tables")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();
    return tables.sort((a, b) => a.number - b.number);
  },
});

export const getByStatus = query({
  args: {
    restaurantId: v.id("restaurants"),
    status: v.union(
      v.literal("available"),
      v.literal("occupied"),
      v.literal("reserved"),
      v.literal("cleaning"),
    ),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("tables")
      .withIndex("by_restaurant_and_status", (q) =>
        q.eq("restaurantId", args.restaurantId).eq("status", args.status),
      )
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("tables") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    number: v.number(),
    label: v.optional(v.string()),
    seats: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("tables", {
      ...args,
      status: "available",
    });
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("tables"),
    status: v.union(
      v.literal("available"),
      v.literal("occupied"),
      v.literal("reserved"),
      v.literal("cleaning"),
    ),
    currentOrderId: v.optional(v.id("orders")),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = { status: args.status };
    if (args.currentOrderId !== undefined) {
      updates.currentOrderId = args.currentOrderId;
    }
    if (args.status === "available") {
      updates.currentOrderId = undefined;
    }
    await ctx.db.patch(args.id, updates);
  },
});

export const update = mutation({
  args: {
    id: v.id("tables"),
    number: v.optional(v.number()),
    label: v.optional(v.string()),
    seats: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined),
    );
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("tables") },
  handler: async (ctx, args) => {
    const table = await ctx.db.get(args.id);
    if (table?.status === "occupied") {
      throw new Error("Cannot delete an occupied table");
    }
    await ctx.db.delete(args.id);
  },
});
