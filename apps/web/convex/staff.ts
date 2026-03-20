import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { throwLocalizedError } from "./i18n";
import { validateEmail, validateStringLength } from "./validation";

export const listByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("staff")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();
  },
});

export const getByWorkosId = query({
  args: { workosUserId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("staff")
      .withIndex("by_workos_user", (q) =>
        q.eq("workosUserId", args.workosUserId),
      )
      .collect();
  },
});

export const create = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    workosUserId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(
      v.literal("owner"),
      v.literal("manager"),
      v.literal("waiter"),
      v.literal("kitchen"),
      v.literal("cashier"),
    ),
  },
  handler: async (ctx, args) => {
    validateStringLength(args.name, "Staff name", 100);
    validateEmail(args.email);
    return ctx.db.insert("staff", { ...args, isActive: true });
  },
});

export const update = mutation({
  args: {
    id: v.id("staff"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("owner"),
        v.literal("manager"),
        v.literal("waiter"),
        v.literal("kitchen"),
        v.literal("cashier"),
      ),
    ),
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

export const toggleActive = mutation({
  args: { id: v.id("staff") },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.id);
    if (!member) throwLocalizedError("staff.not_found");
    await ctx.db.patch(args.id, { isActive: !member.isActive });
  },
});
