import type { MutationCtx, QueryCtx } from "./_generated/server";

/** Require authentication. Throws if no identity. Returns the identity. */
export async function requireAuth(ctx: MutationCtx | QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Authentication required");
  return identity;
}

/** Require authentication + check the user has one of the allowed roles at a restaurant. */
export async function requireRole(
  ctx: MutationCtx | QueryCtx,
  restaurantId: string,
  allowedRoles: string[]
) {
  const identity = await requireAuth(ctx);
  const staff = await ctx.db
    .query("staff")
    .withIndex("by_workos_user", (q: any) =>
      q.eq("workosUserId", identity.subject)
    )
    .collect();
  const match = staff.find(
    (s: any) => s.restaurantId === restaurantId && s.isActive
  );
  if (!match || !allowedRoles.includes(match.role)) {
    throw new Error(
      `Access denied. Required role: ${allowedRoles.join(" or ")}`
    );
  }
  return { identity, staff: match };
}
