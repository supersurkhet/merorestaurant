import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { validateSsid, validateStringLength } from "./validation";
import { requireRole } from "./auth";

export const getByRestaurant = query({
  args: { restaurantId: v.id("restaurants") },
  handler: async (ctx, args) => {
    const configs = await ctx.db.query("wifiConfigs").withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId)).collect();
    const active = configs.find((c) => c.isActive);
    if (!active) return null;
    return {
      _id: active._id,
      ssid: active.ssid,
      password: active.password,
      encryptionType: active.encryptionType,
      qrString: `WIFI:T:${active.encryptionType};S:${active.ssid};P:${active.password};;`,
    };
  },
});

export const update = mutation({
  args: {
    workosUserId: v.string(),
    restaurantId: v.id("restaurants"),
    ssid: v.string(),
    password: v.string(),
    encryptionType: v.union(v.literal("WPA"), v.literal("WPA2"), v.literal("WEP"), v.literal("nopass")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, args.workosUserId, args.restaurantId, ["owner", "manager"]);
    validateSsid(args.ssid);
    validateStringLength(args.password, "WiFi password", 63);

    const existing = await ctx.db.query("wifiConfigs").withIndex("by_restaurant", (q) => q.eq("restaurantId", args.restaurantId)).collect();
    for (const config of existing) {
      await ctx.db.patch(config._id, { isActive: false });
    }
    return ctx.db.insert("wifiConfigs", {
      restaurantId: args.restaurantId,
      ssid: args.ssid,
      password: args.password,
      encryptionType: args.encryptionType,
      isActive: true,
      updatedBy: args.workosUserId,
    });
  },
});
