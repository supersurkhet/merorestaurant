import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { throwLocalizedError } from "./i18n";

export const listByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();
    return items
      .filter((i) => i.isAvailable)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const listByRestaurant = query({
  args: {
    restaurantId: v.id("restaurants"),
    availableOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();
    const filtered = args.availableOnly
      ? items.filter((i) => i.isAvailable)
      : items;
    // Resolve image URLs
    return Promise.all(
      filtered.map(async (item) => {
        const imageUrl = item.imageStorageId
          ? await ctx.storage.getUrl(item.imageStorageId)
          : null;
        return { ...item, imageUrl };
      }),
    );
  },
});

export const getImageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return ctx.storage.getUrl(args.storageId);
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return ctx.storage.generateUploadUrl();
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
    imageStorageId: v.optional(v.id("_storage")),
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
    imageStorageId: v.optional(v.id("_storage")),
    isVeg: v.optional(v.boolean()),
    isAvailable: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
    categoryId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) updates[key] = val;
    }
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const toggleAvailability = mutation({
  args: { id: v.id("menuItems") },
  handler: async (ctx, args) => {
    const item = await ctx.db.get(args.id);
    if (!item) throwLocalizedError("menu.item_not_found", { id: args.id });
    await ctx.db.patch(args.id, { isAvailable: !item.isAvailable });
  },
});
