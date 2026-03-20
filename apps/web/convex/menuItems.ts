import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listByMenu = query({
  args: { menuId: v.id("menus") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_menu", (q) => q.eq("menuId", args.menuId))
      .collect();
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();
    return items.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("menuItems")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    menuId: v.id("menus"),
    categoryId: v.id("categories"),
    name: v.string(),
    nameNe: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.number(),
    imageUrl: v.optional(v.string()),
    isVeg: v.boolean(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("menuItems", { ...args, isAvailable: true });
  },
});

export const update = mutation({
  args: {
    id: v.id("menuItems"),
    name: v.optional(v.string()),
    nameNe: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
    isVeg: v.optional(v.boolean()),
    isAvailable: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([_, v]) => v !== undefined),
    );
    await ctx.db.patch(id, filtered);
  },
});

export const toggleAvailability = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throw new Error("Menu item not found");
    await ctx.db.patch(args.id, { isAvailable: !item.isAvailable });
  },
});
