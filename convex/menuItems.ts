import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requireRole } from "./_helpers";

export const listByRestaurant = query({
  args: {
    restaurantId: v.id("restaurants"),
    onlyAvailable: v.optional(v.boolean()),
  },
  handler: async (ctx, { restaurantId, onlyAvailable }) => {
    if (onlyAvailable) {
      return await ctx.db
        .query("menuItems")
        .withIndex("by_restaurant_available", (q) =>
          q.eq("restaurantId", restaurantId).eq("isAvailable", true)
        )
        .collect();
    }
    return await ctx.db
      .query("menuItems")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurantId))
      .collect();
  },
});

export const listByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, { categoryId }) => {
    return await ctx.db
      .query("menuItems")
      .withIndex("by_category", (q) => q.eq("categoryId", categoryId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("menuItems") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    categoryId: v.id("categories"),
    name: v.string(),
    nameNe: v.string(),
    description: v.optional(v.string()),
    descriptionNe: v.optional(v.string()),
    price: v.number(),
    image: v.optional(v.id("_storage")),
    isVeg: v.boolean(),
    isSpicy: v.boolean(),
    preparationTime: v.optional(v.number()),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.restaurantId, ["owner", "manager"]);
    return await ctx.db.insert("menuItems", { ...args, isAvailable: true });
  },
});

export const update = mutation({
  args: {
    id: v.id("menuItems"),
    name: v.optional(v.string()),
    nameNe: v.optional(v.string()),
    description: v.optional(v.string()),
    descriptionNe: v.optional(v.string()),
    price: v.optional(v.number()),
    image: v.optional(v.id("_storage")),
    isVeg: v.optional(v.boolean()),
    isSpicy: v.optional(v.boolean()),
    isAvailable: v.optional(v.boolean()),
    preparationTime: v.optional(v.number()),
    sortOrder: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, { id, ...updates }) => {
    const item = await ctx.db.get(id);
    if (!item) throw new Error("Menu item not found");
    await requireRole(ctx, item.restaurantId, ["owner", "manager"]);
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

export const remove = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, { id }) => {
    const item = await ctx.db.get(id);
    if (!item) throw new Error("Menu item not found");
    await requireRole(ctx, item.restaurantId, ["owner", "manager"]);
    await ctx.db.delete(id);
  },
});

export const toggleAvailability = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, { id }) => {
    const item = await ctx.db.get(id);
    if (!item) throw new Error("Menu item not found");
    await requireRole(ctx, item.restaurantId, ["owner", "manager", "chef"]);
    await ctx.db.patch(id, { isAvailable: !item.isAvailable });
  },
});

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAuth(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    return await ctx.storage.getUrl(storageId);
  },
});
