import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { throwLocalizedError } from "./i18n";
import { validateEmail, validateStringLength } from "./validation";
import { requireRole } from "./auth";

export const listByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    return ctx.db.query("staff").withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId)).collect();
  },
});

export const getByWorkosId = query({
  args: { workosUserId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db.query("staff").withIndex("by_workos_user", (q) => q.eq("workosUserId", args.workosUserId)).collect();
  },
});

export const invite = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    targetWorkosUserId: v.string(),
    name: v.string(),
    email: v.string(),
    role: v.union(v.literal("owner"), v.literal("manager"), v.literal("waiter"), v.literal("kitchen"), v.literal("cashier")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.restaurantId, ["owner", "manager"]);
    validateStringLength(args.name, "Staff name", 100);
    validateEmail(args.email);

    const restaurant = await ctx.db.get(args.restaurantId);
    if (!restaurant) throwLocalizedError("restaurant.not_found");

    const existing = await ctx.db.query("staff").withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId)).collect();
    const alreadyMember = existing.find((s) => s.workosUserId === args.targetWorkosUserId);
    if (alreadyMember) {
      await ctx.db.patch(alreadyMember._id, { role: args.role, isActive: true, name: args.name, email: args.email });
      return alreadyMember._id;
    }

    return ctx.db.insert("staff", {
      restaurantId: args.restaurantId, workosUserId: args.targetWorkosUserId,
      name: args.name, email: args.email, role: args.role, isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    id: v.id("staff"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.union(v.literal("owner"), v.literal("manager"), v.literal("waiter"), v.literal("kitchen"), v.literal("cashier"))),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.restaurantId, ["owner", "manager"]);
    if (args.name) validateStringLength(args.name, "Staff name", 100);
    if (args.email) validateEmail(args.email);
    const { id, restaurantId, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(fields)) { if (val !== undefined) updates[key] = val; }
    await ctx.db.patch(id, updates);
  },
});

export const toggleActive = mutation({
  args: { restaurantId: v.id("restaurants"), id: v.id("staff") },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.restaurantId, ["owner", "manager"]);
    const member = await ctx.db.get(args.id);
    if (!member) throwLocalizedError("staff.not_found");
    await ctx.db.patch(args.id, { isActive: !member.isActive });
  },
});

export const removeFromRestaurant = mutation({
  args: { restaurantId: v.id("restaurants"), id: v.id("staff") },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.restaurantId, ["owner"]);
    const member = await ctx.db.get(args.id);
    if (!member) throwLocalizedError("staff.not_found");
    if (member.role === "owner") throw new Error("Cannot remove the restaurant owner.");
    await ctx.db.delete(args.id);
  },
});
