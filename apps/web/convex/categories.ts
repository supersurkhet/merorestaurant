import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();
    return categories.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const create = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    name: v.string(),
    nameNe: v.optional(v.string()),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("categories", { ...args, isActive: true });
  },
});

export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    nameNe: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
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
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    // Check for items in this category
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_category", (q) => q.eq("categoryId", args.id))
      .first();
    if (items) throw new Error("Cannot delete category with menu items");
    await ctx.db.delete(args.id);
  },
});
