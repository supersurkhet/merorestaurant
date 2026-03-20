import { v } from "convex/values";
import {
  query,
  type QueryCtx,
  type MutationCtx,
} from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

// ── JWT verification ────────────────────────────────────────────────
// WorkOS JWTs are RS256-signed. In Convex (V8 runtime) we do a
// lightweight decode + expiry check. Full RS256 signature verification
// should happen at the edge (SvelteKit server / Cloudflare Worker)
// before the token reaches Convex mutations.

interface WorkosJwtPayload {
  sub: string; // WorkOS user ID
  exp: number;
  iat: number;
  org_id?: string;
  role?: string;
}

export function decodeJwtPayload(token: string): WorkosJwtPayload {
  const parts = token.split(".");
  if (parts.length !== 3) throw new Error("Invalid JWT format");
  // base64url → base64 → decode
  const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
  const json = atob(base64);
  return JSON.parse(json);
}

export function verifyWorkosToken(token: string): WorkosJwtPayload {
  const payload = decodeJwtPayload(token);
  if (!payload.sub) throw new Error("JWT missing sub claim");
  if (payload.exp && payload.exp * 1000 < Date.now()) {
    throw new Error("JWT has expired");
  }
  return payload;
}

// ── Staff lookup by token ───────────────────────────────────────────

export async function getStaffByToken(
  ctx: QueryCtx | MutationCtx,
  token: string,
): Promise<Doc<"staff"> & { restaurantId: Id<"restaurants"> }> {
  const { sub: workosUserId } = verifyWorkosToken(token);

  const staffEntries = await ctx.db
    .query("staff")
    .withIndex("by_workos_user", (q) => q.eq("workosUserId", workosUserId))
    .collect();

  const active = staffEntries.find((s) => s.isActive);
  if (!active) {
    throw new Error("No active staff account for this user");
  }
  return active;
}

// ── Role guard ──────────────────────────────────────────────────────

type StaffRole = Doc<"staff">["role"];

export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  token: string,
  roles: StaffRole[],
): Promise<Doc<"staff">> {
  const staff = await getStaffByToken(ctx, token);
  if (!roles.includes(staff.role)) {
    throw new Error(
      `Access denied: requires one of [${roles.join(", ")}], you have "${staff.role}"`,
    );
  }
  return staff;
}

// ── Public queries (callable from client) ───────────────────────────

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
          return restaurant ? { ...restaurant, role: s.role } : null;
        }),
    );

    return restaurants.filter(Boolean);
  },
});
