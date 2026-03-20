import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByWorkosId = query({
  args: { workosUserId: v.string() },
  handler: async (ctx, { workosUserId }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_workos", (q) => q.eq("workosUserId", workosUserId))
      .first();
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
  },
});

export const upsert = mutation({
  args: {
    workosUserId: v.string(),
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, { workosUserId, email, name, phone, avatarUrl }) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_workos", (q) => q.eq("workosUserId", workosUserId))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, { email, name, phone, avatarUrl });
      return existing._id;
    }
    return await ctx.db.insert("users", {
      workosUserId,
      email,
      name,
      phone,
      avatarUrl,
      createdAt: Date.now(),
    });
  },
});
