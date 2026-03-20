import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

export const getByWorkosUser = query({
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

export const getRole = query({
  args: {
    restaurantId: v.id("restaurants"),
    workosUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const staffMembers = await ctx.db
      .query("staff")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();
    const member = staffMembers.find(
      (s) => s.workosUserId === args.workosUserId,
    );
    return member?.role ?? null;
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
    return ctx.db.insert("staff", { ...args, isActive: true });
  },
});

export const updateRole = mutation({
  args: {
    id: v.id("staff"),
    role: v.union(
      v.literal("owner"),
      v.literal("manager"),
      v.literal("waiter"),
      v.literal("kitchen"),
      v.literal("cashier"),
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { role: args.role });
  },
});

export const deactivate = mutation({
  args: { id: v.id("staff") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: false });
  },
});
