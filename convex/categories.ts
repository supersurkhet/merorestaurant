import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./_helpers";

// Queries are PUBLIC — customers browse menus without auth
export const listByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, { restaurantId }) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurantId))
      .collect();
    return categories.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listActiveByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, { restaurantId }) => {
    const categories = await ctx.db
      .query("categories")
      .withIndex("by_restaurant_active", (q) =>
        q.eq("restaurantId", restaurantId).eq("isActive", true)
      )
      .collect();
    return categories.sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

// Mutations require admin auth
export const create = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    name: v.string(),
    nameNe: v.optional(v.string()),
    description: v.optional(v.string()),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.restaurantId, ["owner", "manager"]);
    return await ctx.db.insert("categories", {
      ...args,
      nameNe: args.nameNe ?? args.name,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("categories"),
    name: v.optional(v.string()),
    nameNe: v.optional(v.string()),
    description: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    image: v.optional(v.id("_storage")),
  },
  handler: async (ctx, { id, ...updates }) => {
    const cat = await ctx.db.get(id);
    if (!cat) throw new Error("Category not found");
    await requireRole(ctx, cat.restaurantId, ["owner", "manager"]);
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, { id }) => {
    const cat = await ctx.db.get(id);
    if (!cat) throw new Error("Category not found");
    await requireRole(ctx, cat.restaurantId, ["owner", "manager"]);
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_category", (q) => q.eq("categoryId", id))
      .collect();
    if (items.length > 0) {
      throw new Error("Cannot delete category with menu items. Remove items first.");
    }
    await ctx.db.delete(id);
  },
});
