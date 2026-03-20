import { v } from "convex/values";
import { query } from "./_generated/server";

// Helper query to resolve a WorkOS user to their staff roles
export const getStaffRoles = query({
  args: { workosUserId: v.string() },
  handler: async (ctx, args) => {
    const staffEntries = await ctx.db
      .query("staff")
      .withIndex("by_workos_user", (q) =>
        q.eq("workosUserId", args.workosUserId),
      )
      .collect();

    return staffEntries
      .filter((s) => s.isActive)
      .map((s) => ({
        restaurantId: s.restaurantId,
        role: s.role,
        name: s.name,
      }));
  },
});

// Get the restaurants a user has access to
export const getAccessibleRestaurants = query({
  args: { workosUserId: v.string() },
  handler: async (ctx, args) => {
    const staffEntries = await ctx.db
      .query("staff")
      .withIndex("by_workos_user", (q) =>
        q.eq("workosUserId", args.workosUserId),
      )
      .collect();

    const restaurants = await Promise.all(
      staffEntries
        .filter((s) => s.isActive)
        .map(async (s) => {
          const restaurant = await ctx.db.get(s.restaurantId);
          return restaurant
            ? { ...restaurant, role: s.role }
            : null;
        }),
    );

    return restaurants.filter(Boolean);
  },
});
