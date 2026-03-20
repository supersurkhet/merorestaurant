import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { throwLocalizedError } from "./i18n";
import { validateSeats, validateTableNumber } from "./validation";
import { requireRole, authenticateForRestaurant } from "./auth";

export const listByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const tables = await ctx.db
      .query("tables")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId))
      .collect();
    return tables.sort((a, b) => a.number - b.number);
  },
});

export const getByQrCode = query({
  args: { qrCode: v.string() },
  handler: async (ctx, args) => {
    const table = await ctx.db
      .query("tables")
      .withIndex("by_qr_code", (q) => q.eq("qrCode", args.qrCode))
      .unique();
    if (!table) return null;
    const restaurant = await ctx.db.get(table.restaurantId);
    return { ...table, restaurant };
  },
});

export const create = mutation({
  args: {
    workosUserId: v.string(),
    restaurantId: v.id("restaurants"),
    number: v.number(),
    label: v.optional(v.string()),
    seats: v.number(),
    qrCode: v.string(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.workosUserId, args.restaurantId, ["owner", "manager"]);
    validateTableNumber(args.number);
    validateSeats(args.seats);
    const existing = await ctx.db
      .query("tables")
      .withIndex("by_qr_code", (q) => q.eq("qrCode", args.qrCode))
      .unique();
    if (existing) throwLocalizedError("table.qr_code_in_use", { qrCode: args.qrCode });
    const { workosUserId, ...data } = args;
    return ctx.db.insert("tables", { ...data, status: "available" });
  },
});

export const update = mutation({
  args: {
    workosUserId: v.string(),
    restaurantId: v.id("restaurants"),
    id: v.id("tables"),
    number: v.optional(v.number()),
    label: v.optional(v.string()),
    seats: v.optional(v.number()),
    qrCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.workosUserId, args.restaurantId, ["owner", "manager"]);
    if (args.number) validateTableNumber(args.number);
    if (args.seats) validateSeats(args.seats);
    if (args.qrCode) {
      const existing = await ctx.db.query("tables").withIndex("by_qr_code", (q) => q.eq("qrCode", args.qrCode!)).unique();
      if (existing && existing._id !== args.id) throwLocalizedError("table.qr_code_in_use", { qrCode: args.qrCode! });
    }
    const { id, workosUserId, restaurantId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) updates[key] = val;
    }
    await ctx.db.patch(id, updates);
  },
});

export const updateStatus = mutation({
  args: {
    workosUserId: v.string(),
    restaurantId: v.id("restaurants"),
    id: v.id("tables"),
    status: v.union(v.literal("available"), v.literal("occupied"), v.literal("reserved"), v.literal("cleaning")),
    currentOrderId: v.optional(v.id("orders")),
  },
  handler: async (ctx, args) => {
    await authenticateForRestaurant(ctx, args.workosUserId, args.restaurantId);
    const patch: Record<string, unknown> = { status: args.status };
    if (args.status === "available") patch.currentOrderId = undefined;
    else if (args.currentOrderId) patch.currentOrderId = args.currentOrderId;
    await ctx.db.patch(args.id, patch);
  },
});
