import { v } from "convex/values";
import { query, type QueryCtx, type MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { throwLocalizedError } from "./i18n";

// ── JWT helpers ─────────────────────────────────────────────────────

interface WorkosJwtPayload {
  sub: string;
  exp: number;
  iat: number;
  org_id?: string;
}

export function decodeJwtPayload(token: string): WorkosJwtPayload {
  const parts = token.split(".");
  if (parts.length !== 3) throwLocalizedError("auth.invalid_jwt");
  const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64));
}

export function verifyWorkosToken(token: string): WorkosJwtPayload {
  const payload = decodeJwtPayload(token);
  if (!payload.sub) throwLocalizedError("auth.invalid_jwt");
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    throwLocalizedError("auth.jwt_expired");
  }
  return payload;
}

// ── Multi-tenant auth context ───────────────────────────────────────

export interface AuthContext {
  workosUserId: string;
  staff: Doc<"staff">;
  restaurantId: Id<"restaurants">;
  role: Doc<"staff">["role"];
}

/**
 * Resolve the current user in the context of a specific restaurant.
 * Ensures the user is an active staff member of that restaurant.
 */
export async function authenticateForRestaurant(
  ctx: QueryCtx | MutationCtx,
  token: string,
  restaurantId: Id<"restaurants">,
): Promise<AuthContext> {
  const { sub: workosUserId } = verifyWorkosToken(token);

  const staffEntries = await ctx.db
    .query("staff")
    .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurantId))
    .collect();

  const staff = staffEntries.find(
    (s) => s.workosUserId === workosUserId && s.isActive,
  );
  if (!staff) {
    throwLocalizedError("auth.unauthorized");
  }

  return { workosUserId, staff, restaurantId, role: staff.role };
}

/**
 * Require specific roles for a restaurant operation.
 */
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  token: string,
  restaurantId: Id<"restaurants">,
  roles: Doc<"staff">["role"][],
): Promise<AuthContext> {
  const auth = await authenticateForRestaurant(ctx, token, restaurantId);
  if (!roles.includes(auth.role)) {
    throwLocalizedError("auth.access_denied", {
      roles: roles.join(", "),
      current: auth.role,
    });
  }
  return auth;
}

// ── Public queries ──────────────────────────────────────────────────

/** Get all restaurants a user has access to (with their role in each). */
export const currentUser = query({
  args: { workosUserId: v.string() },
  handler: async (ctx, args) => {
    const staffEntries = await ctx.db
      .query("staff")
      .withIndex("by_workos_user", (q) =>
        q.eq("workosUserId", args.workosUserId),
      )
      .collect();

    const active = staffEntries.filter((s) => s.isActive);

    const restaurants = await Promise.all(
      active.map(async (s) => {
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
