import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get current user + their restaurants + staff roles.
 * Called on app load after WorkOS auth.
 */
export const currentUser = query({
  args: { workosUserId: v.string() },
  handler: async (ctx, { workosUserId }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos", (q) => q.eq("workosUserId", workosUserId))
      .first();
    if (!user) return null;

    // Get all restaurants this user owns
    const ownedRestaurants = await ctx.db
      .query("restaurants")
      .withIndex("by_owner", (q) => q.eq("ownerId", user._id))
      .collect();

    // Get all staff roles across restaurants
    const staffRoles = await ctx.db
      .query("staff")
      .withIndex("by_workos_user", (q) => q.eq("workosUserId", workosUserId))
      .collect();

    // Resolve restaurant details for each staff role
    const roles = [];
    for (const staff of staffRoles) {
      const restaurant = await ctx.db.get(staff.restaurantId);
      if (restaurant) {
        roles.push({ ...staff, restaurant });
      }
    }

    return { user, ownedRestaurants, roles };
  },
});

/**
 * Check if a user has a specific role at a specific restaurant.
 */
export const checkRole = query({
  args: {
    workosUserId: v.string(),
    restaurantId: v.id("restaurants"),
    requiredRoles: v.array(v.string()),
  },
  handler: async (ctx, { workosUserId, restaurantId, requiredRoles }) => {
    const staffEntries = await ctx.db
      .query("staff")
      .withIndex("by_workos_user", (q) => q.eq("workosUserId", workosUserId))
      .collect();
    const match = staffEntries.find(
      (s) => s.restaurantId === restaurantId && s.isActive
    );
    if (!match) return { allowed: false, role: null };
    return {
      allowed: requiredRoles.includes(match.role),
      role: match.role,
    };
  },
});

/**
 * Login/signup flow: upsert user, return their data.
 */
export const loginOrSignup = mutation({
  args: {
    workosUserId: v.string(),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, { workosUserId, email, name }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_workos", (q) => q.eq("workosUserId", workosUserId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { email, name });
      return existing._id;
    }
    return await ctx.db.insert("users", {
      workosUserId,
      email,
      name,
      createdAt: Date.now(),
    });
  },
});
