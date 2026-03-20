import { v } from "convex/values";
import { query, mutation, type QueryCtx, type MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { throwLocalizedError } from "./i18n";

// ── Auth context ────────────────────────────────────────────────────

export interface AuthContext {
  workosUserId: string;
  staff: Doc<"staff">;
  restaurantId: Id<"restaurants">;
  role: Doc<"staff">["role"];
}

/**
 * Authenticate a user for a specific restaurant.
 * The workosUserId is passed from the SvelteKit server after JWT verification.
 * Convex validates the user is an active staff member of the restaurant.
 */
export async function authenticateForRestaurant(
  ctx: QueryCtx | MutationCtx,
  workosUserId: string,
  restaurantId: Id<"restaurants">,
): Promise<AuthContext> {
  if (!workosUserId) throwLocalizedError("auth.unauthorized");

  const staffEntries = await ctx.db
    .query("staff")
    .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurantId))
    .collect();

  const staff = staffEntries.find(
    (s) => s.workosUserId === workosUserId && s.isActive,
  );
  if (!staff) throwLocalizedError("auth.unauthorized");

  return { workosUserId, staff, restaurantId, role: staff.role };
}

/**
 * Require specific roles for a restaurant operation.
 */
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  workosUserId: string,
  restaurantId: Id<"restaurants">,
  roles: Doc<"staff">["role"][],
): Promise<AuthContext> {
  const auth = await authenticateForRestaurant(ctx, workosUserId, restaurantId);
  if (!roles.includes(auth.role)) {
    throwLocalizedError("auth.access_denied", {
      roles: roles.join(", "),
      current: auth.role,
    });
  }
  return auth;
}

/**
 * Lightweight auth check — just verify the workosUserId exists as a platform user.
 * Used for operations that aren't restaurant-scoped (e.g. registering a new restaurant).
 */
export async function authenticateUser(
  ctx: QueryCtx | MutationCtx,
  workosUserId: string,
): Promise<Doc<"users"> | null> {
  if (!workosUserId) throwLocalizedError("auth.unauthorized");
  const user = await ctx.db
    .query("users")
    .withIndex("by_workos_user", (q) => q.eq("workosUserId", workosUserId))
    .unique();
  return user;
}

// ── Public queries ──────────────────────────────────────────────────

/** Get the current user's profile and all restaurants they have access to. */
export const currentUser = query({
  args: { workosUserId: v.string() },
  handler: async (ctx, args) => {
    if (!args.workosUserId) return null;

    // Get platform user
    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_user", (q) =>
        q.eq("workosUserId", args.workosUserId),
      )
      .unique();

    // Get all restaurant memberships
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
          if (!restaurant || !restaurant.isActive) return null;
          return {
            restaurantId: s.restaurantId,
            restaurantName: restaurant.name,
            restaurantSlug: restaurant.slug,
            role: s.role,
            staffId: s._id,
          };
        }),
    );

    return {
      workosUserId: args.workosUserId,
      user: user
        ? { name: user.name, email: user.email, isPlatformAdmin: user.isPlatformAdmin }
        : null,
      restaurants: restaurants.filter(Boolean),
    };
  },
});

/** Get user's role in a specific restaurant. */
export const getRoleInRestaurant = query({
  args: {
    workosUserId: v.string(),
    restaurantId: v.id("restaurants"),
  },
  handler: async (ctx, args) => {
    const staffEntries = await ctx.db
      .query("staff")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();

    const member = staffEntries.find(
      (s) => s.workosUserId === args.workosUserId && s.isActive,
    );
    return member ? { role: member.role, staffId: member._id } : null;
  },
});

/** Ensure a platform user record exists (called after WorkOS login). */
export const ensureUser = mutation({
  args: {
    workosUserId: v.string(),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_workos_user", (q) =>
        q.eq("workosUserId", args.workosUserId),
      )
      .unique();

    if (existing) {
      // Update name/email if changed
      await ctx.db.patch(existing._id, {
        name: args.name,
        email: args.email,
      });
      return existing._id;
    }

    return ctx.db.insert("users", {
      workosUserId: args.workosUserId,
      name: args.name,
      email: args.email,
      isPlatformAdmin: false,
    });
  },
});
