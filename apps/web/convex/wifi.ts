import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Public query — no auth needed, used by QR code display
export const getActive = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const configs = await ctx.db
      .query("wifiConfigs")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();
    const active = configs.find((c) => c.isActive);
    if (!active) return null;
    return {
      ssid: active.ssid,
      password: active.password,
      encryptionType: active.encryptionType,
    };
  },
});

export const list = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    return ctx.db
      .query("wifiConfigs")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();
  },
});

export const upsert = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    ssid: v.string(),
    password: v.string(),
    encryptionType: v.union(
      v.literal("WPA"),
      v.literal("WPA2"),
      v.literal("WEP"),
      v.literal("nopass"),
    ),
    updatedBy: v.string(),
  },
  handler: async (ctx, args) => {
    // Deactivate existing configs
    const existing = await ctx.db
      .query("wifiConfigs")
      .withIndex("by_restaurant", (q) =>
        q.eq("restaurantId", args.restaurantId),
      )
      .collect();
    for (const config of existing) {
      await ctx.db.patch(config._id, { isActive: false });
    }

    // Insert new active config
    return ctx.db.insert("wifiConfigs", {
      ...args,
      isActive: true,
    });
  },
});

export const deactivate = mutation({
  args: { id: v.id("wifiConfigs") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: false });
  },
});
