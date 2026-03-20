import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getActiveByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, { restaurantId }) => {
    const config = await ctx.db
      .query("wifiConfigs")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurantId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();
    if (!config) return null;
    // Generate WiFi QR string
    const qrString = `WIFI:T:${config.encryptionType};S:${config.ssid};P:${config.password};;`;
    return { ...config, qrString };
  },
});

export const getByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, { restaurantId }) => {
    return await ctx.db
      .query("wifiConfigs")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurantId))
      .collect();
  },
});

export const update = mutation({
  args: {
    restaurantId: v.id("restaurants"),
    ssid: v.string(),
    password: v.string(),
    encryptionType: v.union(
      v.literal("WPA"),
      v.literal("WPA2"),
      v.literal("WEP"),
      v.literal("nopass")
    ),
  },
  handler: async (ctx, { restaurantId, ssid, password, encryptionType }) => {
    // Deactivate existing configs
    const existing = await ctx.db
      .query("wifiConfigs")
      .withIndex("by_restaurant", (q) => q.eq("restaurantId", restaurantId))
      .collect();
    for (const config of existing) {
      await ctx.db.patch(config._id, { isActive: false });
    }
    // Insert new active config
    return await ctx.db.insert("wifiConfigs", {
      restaurantId,
      ssid,
      password,
      encryptionType,
      isActive: true,
      updatedAt: Date.now(),
    });
  },
});
