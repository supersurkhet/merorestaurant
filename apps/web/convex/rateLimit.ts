import type { MutationCtx } from "./_generated/server";

interface RateLimitConfig {
  /** Max number of operations allowed in the window */
  maxRequests: number;
  /** Window size in milliseconds */
  windowMs: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  placeOrder: { maxRequests: 10, windowMs: 60_000 }, // 10 orders per minute per restaurant
  createPayment: { maxRequests: 5, windowMs: 60_000 }, // 5 payments per minute per order
  generateUploadUrl: { maxRequests: 20, windowMs: 60_000 }, // 20 uploads per minute
};

/**
 * Check and enforce rate limits. Throws if limit exceeded.
 *
 * @param ctx - Mutation context
 * @param operation - The operation name (must exist in RATE_LIMITS)
 * @param identifier - A unique key segment (e.g. restaurantId, orderId)
 */
export async function checkRateLimit(
  ctx: MutationCtx,
  operation: string,
  identifier: string,
): Promise<void> {
  const config = RATE_LIMITS[operation];
  if (!config) return; // no limit configured

  const key = `${operation}:${identifier}`;
  const now = Date.now();

  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .unique();

  if (!existing) {
    // First request in this window
    await ctx.db.insert("rateLimits", {
      key,
      count: 1,
      windowStart: now,
    });
    return;
  }

  // Check if window has expired
  if (now - existing.windowStart > config.windowMs) {
    // Reset window
    await ctx.db.patch(existing._id, {
      count: 1,
      windowStart: now,
    });
    return;
  }

  // Window is still active
  if (existing.count >= config.maxRequests) {
    const retryAfterSec = Math.ceil(
      (existing.windowStart + config.windowMs - now) / 1000,
    );
    throw new Error(
      `Rate limit exceeded for ${operation}. Try again in ${retryAfterSec}s.`,
    );
  }

  // Increment count
  await ctx.db.patch(existing._id, {
    count: existing.count + 1,
  });
}
