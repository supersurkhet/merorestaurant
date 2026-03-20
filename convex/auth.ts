import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Upsert a user from WorkOS authentication.
 * Called after WorkOS login to create/update staff record.
 */
export const upsertFromWorkos = mutation({
  args: {
    workosUserId: v.string(),
    email: v.string(),
    name: v.string(),
    restaurantId: v.id("restaurants"),
  },
  handler: async (ctx, { workosUserId, email, name, restaurantId }) => {
    const existing = await ctx.db
      .query("staff")
      .withIndex("by_workos_user", (q) => q.eq("workosUserId", workosUserId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { email, name });
      return existing._id;
    }

    // New staff defaults to waiter role
    return await ctx.db.insert("staff", {
      restaurantId,
      workosUserId,
      name,
      email,
      role: "waiter",
      isActive: true,
    });
  },
});

/**
 * Get current user's staff record by WorkOS user ID.
 */
export const currentUser = query({
  args: { workosUserId: v.string() },
  handler: async (ctx, { workosUserId }) => {
    const staff = await ctx.db
      .query("staff")
      .withIndex("by_workos_user", (q) => q.eq("workosUserId", workosUserId))
      .first();
    if (!staff) return null;
    const restaurant = await ctx.db.get(staff.restaurantId);
    return { ...staff, restaurant };
  },
});

/**
 * Check if a staff member has one of the required roles.
 */
export const checkRole = query({
  args: {
    workosUserId: v.string(),
    requiredRoles: v.array(v.string()),
  },
  handler: async (ctx, { workosUserId, requiredRoles }) => {
    const staff = await ctx.db
      .query("staff")
      .withIndex("by_workos_user", (q) => q.eq("workosUserId", workosUserId))
      .first();
    if (!staff || !staff.isActive) return { allowed: false, role: null };
    return {
      allowed: requiredRoles.includes(staff.role),
      role: staff.role,
    };
  },
});
