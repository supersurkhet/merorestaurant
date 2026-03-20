import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("restaurants")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});

export const getActive = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("restaurants")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("restaurants") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    nameNe: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    descriptionNe: v.optional(v.string()),
    address: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    openingTime: v.string(),
    closingTime: v.string(),
    currency: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("restaurants")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existing) throw new Error("Restaurant with this slug already exists");
    return await ctx.db.insert("restaurants", { ...args, isActive: true });
  },
});

export const update = mutation({
  args: {
    id: v.id("restaurants"),
    name: v.optional(v.string()),
    nameNe: v.optional(v.string()),
    description: v.optional(v.string()),
    descriptionNe: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    logo: v.optional(v.id("_storage")),
    coverImage: v.optional(v.id("_storage")),
    isActive: v.optional(v.boolean()),
    openingTime: v.optional(v.string()),
    closingTime: v.optional(v.string()),
  },
  handler: async (ctx, { id, ...updates }) => {
    const restaurant = await ctx.db.get(id);
    if (!restaurant) throw new Error("Restaurant not found");
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});
