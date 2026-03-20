import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireRole } from "./auth";

export const listByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("menus")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId))
      .collect();
  },
});

export const getActive = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const menus = await ctx.db
      .query("menus")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId))
      .collect();
    return menus.find((m) => m.isActive) ?? null;
  },
});

export const create = mutation({
  args: { workosUserId: v.string(), restaurantId: v.id("restaurants"), name: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.workosUserId, args.restaurantId, ["owner", "manager"]);
    return ctx.db.insert("menus", { restaurantId: args.restaurantId, name: args.name, isActive: true });
  },
});

export const update = mutation({
  args: {
    workosUserId: v.string(),
    restaurantId: v.id("restaurants"),
    id: v.id("menus"),
    name: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.workosUserId, args.restaurantId, ["owner", "manager"]);
    const { id, workosUserId, restaurantId, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined),
    );
    await ctx.db.patch(id, filtered);
  },
});
