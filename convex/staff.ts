import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listByRestaurant = query({
  args: {
    restaurantId: v.id("restaurants"),
    role: v.optional(
      v.union(
        v.literal("owner"),
        v.literal("manager"),
        v.literal("chef"),
        v.literal("waiter"),
        v.literal("cashier")
      )
    ),
  },
  handler: async (ctx, { restaurantId, role }) => {
    if (role) {
      return await ctx.db
        .query("staff")
        .withIndex("by_restaurant_role", (q) =>
          q.eq("restaurantId", restaurantId).eq("role", role)
        )
        .collect();
    }
    return await ctx.db
      .query("staff")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurantId))
      .collect();
  },
});

export const getByWorkosId = query({
  args: { workosUserId: v.string() },
  handler: async (ctx, { workosUserId }) => {
    return await ctx.db
      .query("staff")
      .withIndex("by_workos_user", (q) => q.eq("workosUserId", workosUserId))
      .first();
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
      v.literal("chef"),
      v.literal("waiter"),
      v.literal("cashier")
    ),
  },
  handler: async (ctx, args) => {
    // Check for duplicate WorkOS user
    const existing = await ctx.db
      .query("staff")
      .withIndex("by_workos_user", (q) => q.eq("workosUserId", args.workosUserId))
      .first();
    if (existing) throw new Error("Staff member with this WorkOS ID already exists");
    return await ctx.db.insert("staff", { ...args, isActive: true });
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
        v.literal("chef"),
        v.literal("waiter"),
        v.literal("cashier")
      )
    ),
  },
  handler: async (ctx, { id, ...updates }) => {
    const member = await ctx.db.get(id);
    if (!member) throw new Error("Staff member not found");
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

export const toggleActive = mutation({
  args: { id: v.id("staff") },
  handler: async (ctx, { id }) => {
    const member = await ctx.db.get(id);
    if (!member) throw new Error("Staff member not found");
    await ctx.db.patch(id, { isActive: !member.isActive });
  },
});

export const remove = mutation({
  args: { id: v.id("staff") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});
