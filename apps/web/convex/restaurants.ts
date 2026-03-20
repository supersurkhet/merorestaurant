import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("restaurants")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
  },
});

export const getById = query({
  args: { id: v.id("restaurants") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.id);
  },
});

export const listByOwner = query({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("restaurants")
      .withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId))
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    timezone: v.string(),
    currency: v.string(),
    ownerId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("restaurants")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .unique();
    if (existing) throw new Error("Restaurant slug already taken");

    const restaurantId = await ctx.db.insert("restaurants", {
      ...args,
      isActive: true,
    });

    // Create owner as staff member
    await ctx.db.insert("staff", {
      restaurantId,
      workosUserId: args.ownerId,
      name: "Owner",
      email: "",
      role: "owner",
      isActive: true,
    });

    return restaurantId;
  },
});

export const update = mutation({
  args: {
    id: v.id("restaurants"),
    name: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    timezone: v.optional(v.string()),
    currency: v.optional(v.string()),
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
