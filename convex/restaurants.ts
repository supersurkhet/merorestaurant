import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAuth, requireRole } from "./_helpers";

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    return await ctx.db
      .query("restaurants")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
  },
});

export const getByOwner = query({
  args: { ownerId: v.id("users") },
  handler: async (ctx, { ownerId }) => {
    return await ctx.db
      .query("restaurants")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .collect();
  },
});

export const get = query({
  args: { id: v.id("restaurants") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
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

export const getByCity = query({
  args: { city: v.string() },
  handler: async (ctx, { city }) => {
    return await ctx.db
      .query("restaurants")
      .withIndex("by_city", (q) => q.eq("city", city))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

/** Register a new restaurant (creates tenant) */
export const register = mutation({
  args: {
    ownerId: v.id("users"),
    name: v.string(),
    nameNe: v.optional(v.string()),
    slug: v.string(),
    address: v.string(),
    city: v.string(),
    phone: v.string(),
    email: v.optional(v.string()),
    description: v.optional(v.string()),
    descriptionNe: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAuth(ctx);
    // Check slug uniqueness
    const existing = await ctx.db
      .query("restaurants")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    if (existing) throw new Error("A restaurant with this slug already exists");

    const restaurantId = await ctx.db.insert("restaurants", {
      ...args,
      isActive: false, // not live until onboarding complete
      openingTime: "07:00",
      closingTime: "22:00",
      currency: "NPR",
      taxRate: 0.13,
      subscriptionTier: "free",
      onboardingStatus: "registered",
      createdAt: Date.now(),
    });

    // Auto-create owner as staff
    const owner = await ctx.db.get(args.ownerId);
    if (owner) {
      await ctx.db.insert("staff", {
        restaurantId,
        userId: args.ownerId,
        workosUserId: owner.workosUserId,
        name: owner.name,
        email: owner.email,
        role: "owner",
        isActive: true,
      });
    }

    return restaurantId;
  },
});

/** Update restaurant profile (owner/manager only) */
export const update = mutation({
  args: {
    id: v.id("restaurants"),
    name: v.optional(v.string()),
    nameNe: v.optional(v.string()),
    description: v.optional(v.string()),
    descriptionNe: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    logo: v.optional(v.id("_storage")),
    coverImage: v.optional(v.id("_storage")),
    isActive: v.optional(v.boolean()),
    openingTime: v.optional(v.string()),
    closingTime: v.optional(v.string()),
    taxRate: v.optional(v.number()),
  },
  handler: async (ctx, { id, ...updates }) => {
    await requireRole(ctx, id, ["owner", "manager"]);
    const restaurant = await ctx.db.get(id);
    if (!restaurant) throw new Error("Restaurant not found");
    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(id, filtered);
  },
});

/** Advance onboarding status */
export const advanceOnboarding = mutation({
  args: {
    id: v.id("restaurants"),
    status: v.union(
      v.literal("profile_complete"),
      v.literal("menu_added"),
      v.literal("tables_configured"),
      v.literal("operational")
    ),
  },
  handler: async (ctx, { id, status }) => {
    await requireRole(ctx, id, ["owner", "manager"]);
    const restaurant = await ctx.db.get(id);
    if (!restaurant) throw new Error("Restaurant not found");
    const updates: Record<string, unknown> = { onboardingStatus: status };
    if (status === "operational") {
      updates.isActive = true; // go live
    }
    await ctx.db.patch(id, updates);
  },
});

/** Update subscription tier */
export const updateSubscription = mutation({
  args: {
    id: v.id("restaurants"),
    tier: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("pro"),
      v.literal("enterprise")
    ),
  },
  handler: async (ctx, { id, tier }) => {
    await requireRole(ctx, id, ["owner"]);
    await ctx.db.patch(id, { subscriptionTier: tier });
  },
});
