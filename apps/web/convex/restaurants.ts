import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { throwLocalizedError } from "./i18n";
import { validateSlug, validatePhone, validateStringLength } from "./validation";
import { requireAuth, requireRole } from "./auth";

/** Register a new restaurant — caller must be authenticated. */
export const register = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    timezone: v.string(),
    currency: v.string(),
    ownerName: v.string(),
    ownerEmail: v.string(),
    city: v.optional(v.string()),
    taxRate: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");
    const ownerId = identity.subject;

    validateSlug(args.slug);
    validateStringLength(args.name, "Restaurant name", 100);
    validatePhone(args.phone);

    const existing = await ctx.db.query("restaurants").withIndex("by_slug", (q) => q.eq("slug", args.slug)).unique();
    if (existing) throwLocalizedError("restaurant.slug_taken", { slug: args.slug });

    // Upsert platform user
    const existingUser = await ctx.db.query("users").withIndex("by_workos_user", (q) => q.eq("workosUserId", ownerId)).unique();
    if (!existingUser) {
      await ctx.db.insert("users", { workosUserId: ownerId, name: args.ownerName, email: args.ownerEmail, isPlatformAdmin: false });
    }

    const restaurantId = await ctx.db.insert("restaurants", {
      name: args.name, slug: args.slug, address: args.address, phone: args.phone,
      city: args.city, timezone: args.timezone, currency: args.currency,
      taxRate: args.taxRate ?? 0.13, isActive: true, ownerId,
      subscriptionTier: "free", onboardingStatus: "pending",
    });

    await ctx.db.insert("staff", { restaurantId, workosUserId: ownerId, name: args.ownerName, email: args.ownerEmail, role: "owner", isActive: true });
    await ctx.db.insert("menus", { restaurantId, name: "Main Menu", isActive: true });

    return restaurantId;
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return ctx.db.query("restaurants").withIndex("by_slug", (q) => q.eq("slug", args.slug)).unique();
  },
});

export const getByOwner = query({
  args: { ownerId: v.string() },
  handler: async (ctx, args) => {
    return ctx.db.query("restaurants").withIndex("by_owner", (q) => q.eq("ownerId", args.ownerId)).collect();
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Authentication required");
    await requireRole(ctx, args.id, ["owner", "manager"]);

    if (args.name) validateStringLength(args.name, "Restaurant name", 100);
    if (args.phone) validatePhone(args.phone);
    const { id, ...fields } = args;
    const updates: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(fields)) { if (val !== undefined) updates[key] = val; }
    await ctx.db.patch(id, updates);
  },
});

export const list = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("restaurants").collect();
    return all.filter((r) => r.isActive);
  },
});
