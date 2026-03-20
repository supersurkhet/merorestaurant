import { v } from "convex/values";
import {
  query,
  mutation,
  type QueryCtx,
  type MutationCtx,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { throwLocalizedError } from "./i18n";

// ── Core auth helpers ───────────────────────────────────────────────

export interface AuthContext {
  workosUserId: string;
  staff: Doc<"staff">;
  restaurantId: Id<"restaurants">;
  role: Doc<"staff">["role"];
}

/**
 * Require authentication via Convex built-in auth.
 * Returns the WorkOS user ID from the JWT identity.
 */
export async function requireAuth(
  ctx: QueryCtx | MutationCtx,
): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Authentication required");
  }
  // identity.subject is the WorkOS user ID (sub claim)
  return identity.subject;
}

/**
 * Authenticate a user for a specific restaurant.
 * Verifies JWT identity AND that user is active staff of the restaurant.
 */
export async function authenticateForRestaurant(
  ctx: QueryCtx | MutationCtx,
  restaurantId: Id<"restaurants">,
): Promise<AuthContext> {
  const workosUserId = await requireAuth(ctx);

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
  restaurantId: Id<"restaurants">,
  roles: Doc<"staff">["role"][],
): Promise<AuthContext> {
  const auth = await authenticateForRestaurant(ctx, restaurantId);
  if (!roles.includes(auth.role)) {
    throwLocalizedError("auth.access_denied", {
      roles: roles.join(", "),
      current: auth.role,
    });
  }
  return auth;
}

// ── Public queries ──────────────────────────────────────────────────

/** Get the current user's profile and all restaurants they have access to. */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const workosUserId = identity.subject;

    const user = await ctx.db
      .query("users")
      .withIndex("by_workos_user", (q) => q.eq("workosUserId", workosUserId))
      .unique();

    const staffEntries = await ctx.db
      .query("staff")
      .withIndex("by_workos_user", (q) => q.eq("workosUserId", workosUserId))
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
      workosUserId,
      user: user
        ? {
            name: user.name,
            email: user.email,
            isPlatformAdmin: user.isPlatformAdmin,
          }
        : null,
      restaurants: restaurants.filter(Boolean),
    };
  },
});

/** Get user's role in a specific restaurant. */
export const getRoleInRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const staffEntries = await ctx.db
      .query("staff")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();

    const member = staffEntries.find(
      (s) => s.workosUserId === identity.subject && s.isActive,
    );
    return member ? { role: member.role, staffId: member._id } : null;
  },
});

/** Ensure a platform user record exists (called after login). */
export const ensureUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const workosUserId = await requireAuth(ctx);

    const existing = await ctx.db
      .query("users")
      .withIndex("by_workos_user", (q) => q.eq("workosUserId", workosUserId))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { name: args.name, email: args.email });
      return existing._id;
    }

    return ctx.db.insert("users", {
      workosUserId,
      name: args.name,
      email: args.email,
      isPlatformAdmin: false,
    });
  },
});
