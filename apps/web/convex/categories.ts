import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { throwLocalizedError } from "./i18n";
import { validateStringLength } from "./validation";
import { requireRole } from "./auth";

/** List active categories for a restaurant, sorted by sortOrder. */
export const listByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const all = await ctx.db
      .query("categories")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();
    return all
      .filter((c) => c.isActive)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  },
});

export const create = mutation({
  args: {
    workosUserId: v.string(),
    restaurantId: v.id("restaurants"),
    name: v.string(),
    nameNe: v.optional(v.string()),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.workosUserId, args.restaurantId, ["owner", "manager"]);
    validateStringLength(args.name, "Category name", 50);
    const { workosUserId, ...data } = args;
    return ctx.db.insert("categories", { ...data, isActive: true });
  },
});

export const update = mutation({
  args: {
    workosUserId: v.string(),
    restaurantId: v.id("restaurants"),
    id: v.id("categories"),
    name: v.optional(v.string()),
    nameNe: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.workosUserId, args.restaurantId, ["owner", "manager"]);
    if (args.name) validateStringLength(args.name, "Category name", 50);
    const { id, workosUserId, restaurantId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(fields)) {
      if (val !== undefined) updates[key] = val;
    }
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: {
    workosUserId: v.string(),
    restaurantId: v.id("restaurants"),
    id: v.id("categories"),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.workosUserId, args.restaurantId, ["owner", "manager"]);
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_category", (q) => q.eq("categoryId", args.id))
      .first();
    if (items) throwLocalizedError("menu.category_has_items");
    await ctx.db.delete(args.id);
  },
});
