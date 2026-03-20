import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./_helpers";

export const listByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, { restaurantId }) => {
    return await ctx.db
      .query("tables")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurantId))
      .collect();
  },
});

export const getByQrCode = query({
  args: { qrCode: v.string() },
  handler: async (ctx, { qrCode }) => {
    const table = await ctx.db
      .query("tables")
      .withIndex("by_qr", (q) => q.eq("qrCode", qrCode))
      .first();
    if (!table) return null;
    const restaurant = await ctx.db.get(table.restaurantId);
    // Also get WiFi config
    const wifi = await ctx.db
      .query("wifiConfigs")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", table.restaurantId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
    return { table, restaurant, wifi };
  },
});

export const get = query({
  args: { id: v.id("tables") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    number: v.number(),
    label: v.string(),
    capacity: v.number(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.restaurantId, ["owner", "manager"]);
    const qrCode = `${args.restaurantId}-table-${args.number}`;
    return await ctx.db.insert("tables", {
      ...args,
      status: "available",
      qrCode,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tables"),
    label: v.optional(v.string()),
    capacity: v.optional(v.number()),
    number: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const table = await ctx.db.get(id);
    if (!table) throw new Error("Table not found");
    await requireRole(ctx, table.restaurantId, ["owner", "manager"]);
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("tables"),
    status: v.union(
      v.literal("available"),
      v.literal("occupied"),
      v.literal("reserved")
    ),
  },
  handler: async (ctx, { id, status }) => {
    const table = await ctx.db.get(id);
    if (!table) throw new Error("Table not found");
    await requireRole(ctx, table.restaurantId, ["owner", "manager", "waiter"]);
    await ctx.db.patch(id, { status });
  },
});

export const remove = mutation({
  args: { id: v.id("tables") },
  handler: async (ctx, { id }) => {
    const table = await ctx.db.get(id);
    if (!table) throw new Error("Table not found");
    await requireRole(ctx, table.restaurantId, ["owner", "manager"]);
    await ctx.db.delete(id);
  },
});
