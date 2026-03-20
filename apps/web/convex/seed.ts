import { internalMutation } from "./_generated/server";

export const seedDatabase = internalMutation({
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db
      .query("restaurants")
      .withIndex("by_slug", (q) => q.eq("slug", "mero-surkhet"))
      .unique();
    if (existing) {
      throw new Error("Database already seeded (mero-surkhet exists)");
    }

    // ═══════════════════════════════════════════════════════════════════
    // Platform users
    // ═══════════════════════════════════════════════════════════════════
    await ctx.db.insert("users", {
      workosUserId: "workos-rajesh",
      name: "Rajesh Sharma",
      email: "rajesh@merorestaurant.com",
      isPlatformAdmin: true,
    });
    await ctx.db.insert("users", {
      workosUserId: "workos-anita",
      name: "Anita Rana",
      email: "anita@himalayanbites.com",
      isPlatformAdmin: false,
    });

    // ═══════════════════════════════════════════════════════════════════
    // RESTAURANT 1: Mero Restaurant, Surkhet (Pro tier)
    // ═══════════════════════════════════════════════════════════════════
    const r1 = await ctx.db.insert("restaurants", {
      name: "Mero Restaurant",
      slug: "mero-surkhet",
      address: "Birendranagar, Surkhet, Nepal",
      phone: "083-520123",
      city: "Surkhet",
      timezone: "Asia/Kathmandu",
      currency: "NPR",
      taxRate: 0.13,
      isActive: true,
      ownerId: "workos-rajesh",
      subscriptionTier: "pro",
      onboardingStatus: "complete",
    });

    const menu1 = await ctx.db.insert("menus", {
      restaurantId: r1,
      name: "Main Menu",
      isActive: true,
    });

    // Staff
    await ctx.db.insert("staff", {
      restaurantId: r1,
      workosUserId: "workos-rajesh",
      name: "Rajesh Sharma",
      email: "rajesh@merorestaurant.com",
      role: "owner",
      isActive: true,
    });
    await ctx.db.insert("staff", {
      restaurantId: r1,
      workosUserId: "workos-suman",
      name: "Suman Thapa",
      email: "suman@merorestaurant.com",
      role: "manager",
      isActive: true,
    });
    await ctx.db.insert("staff", {
      restaurantId: r1,
      workosUserId: "workos-kumar",
      name: "Kumar Bhandari",
      email: "kumar@merorestaurant.com",
      role: "kitchen",
      isActive: true,
    });

    // Categories
    const r1CatApp = await ctx.db.insert("categories", {
      restaurantId: r1,
      name: "Appetizers",
      nameNe: "स्न्याक्स",
      sortOrder: 1,
      isActive: true,
    });
    const r1CatMain = await ctx.db.insert("categories", {
      restaurantId: r1,
      name: "Main Course",
      nameNe: "मुख्य खाना",
      sortOrder: 2,
      isActive: true,
    });
    const r1CatDrink = await ctx.db.insert("categories", {
      restaurantId: r1,
      name: "Drinks",
      nameNe: "पेय पदार्थ",
      sortOrder: 3,
      isActive: true,
    });
    const r1CatDessert = await ctx.db.insert("categories", {
      restaurantId: r1,
      name: "Desserts",
      nameNe: "मिठाई",
      sortOrder: 4,
      isActive: true,
    });

    // Menu items
    const r1Items = [
      { categoryId: r1CatApp, name: "Chicken Momo", nameNe: "चिकन मोमो", description: "Steamed dumplings with spiced chicken and tomato achar", price: 250, isVeg: false, sortOrder: 1 },
      { categoryId: r1CatApp, name: "Vegetable Momo", nameNe: "तरकारी मोमो", description: "Steamed dumplings with mixed vegetables and paneer", price: 200, isVeg: true, sortOrder: 2 },
      { categoryId: r1CatApp, name: "Newari Choila", nameNe: "नेवारी छोइला", description: "Spicy grilled buffalo meat in Nepali spices", price: 350, isVeg: false, sortOrder: 3 },
      { categoryId: r1CatApp, name: "Chatamari", nameNe: "चतामरी", description: "Newari rice crepe with minced meat and egg", price: 280, isVeg: false, sortOrder: 4 },
      { categoryId: r1CatMain, name: "Dal Bhat Tarkari", nameNe: "दालभात तरकारी", description: "Traditional Nepali meal — lentil soup, rice, vegetables, pickle & papad", price: 400, isVeg: true, sortOrder: 1 },
      { categoryId: r1CatMain, name: "Thakali Set", nameNe: "थकाली सेट", description: "Complete Thakali meal with dal, rice, meat curry, gundruk, and sides", price: 550, isVeg: false, sortOrder: 2 },
      { categoryId: r1CatMain, name: "Sekuwa", nameNe: "सेकुवा", description: "Smoky grilled meat skewers in traditional spices", price: 450, isVeg: false, sortOrder: 3 },
      { categoryId: r1CatMain, name: "Gorkhali Lamb Curry", nameNe: "गोरखाली खसीको मासु", description: "Slow-cooked lamb in Gorkhali spice blend", price: 600, isVeg: false, sortOrder: 4 },
      { categoryId: r1CatDrink, name: "Nepali Chiya", nameNe: "नेपाली चिया", description: "Traditional milk tea with cardamom and ginger", price: 60, isVeg: true, sortOrder: 1 },
      { categoryId: r1CatDrink, name: "Mango Lassi", nameNe: "आँपको लस्सी", description: "Creamy yogurt drink with fresh mango", price: 150, isVeg: true, sortOrder: 2 },
      { categoryId: r1CatDrink, name: "Tongba", nameNe: "तोङ्बा", description: "Traditional millet beer in a wooden pot", price: 300, isVeg: true, sortOrder: 3 },
      { categoryId: r1CatDessert, name: "Juju Dhau", nameNe: "जुजु धौ", description: "Traditional Bhaktapur-style creamy yogurt", price: 120, isVeg: true, sortOrder: 1 },
      { categoryId: r1CatDessert, name: "Sel Roti", nameNe: "सेल रोटी", description: "Traditional ring-shaped sweet rice bread", price: 80, isVeg: true, sortOrder: 2 },
      { categoryId: r1CatDessert, name: "Rice Kheer", nameNe: "खीर", description: "Rice pudding with cardamom, nuts, and saffron", price: 150, isVeg: true, sortOrder: 3 },
    ];
    for (const item of r1Items) {
      await ctx.db.insert("menuItems", { restaurantId: r1, menuId: menu1, ...item, isAvailable: true });
    }

    // Tables
    for (const t of [
      { number: 1, label: "Window Seat", seats: 2 },
      { number: 2, label: "Garden View", seats: 4 },
      { number: 3, seats: 4 },
      { number: 4, label: "Family Booth", seats: 6 },
      { number: 5, seats: 2 },
      { number: 6, label: "Party Table", seats: 8 },
    ]) {
      await ctx.db.insert("tables", {
        restaurantId: r1,
        number: t.number,
        label: t.label,
        seats: t.seats,
        qrCode: `mero-surkhet-t${t.number}`,
        status: "available",
      });
    }

    // WiFi
    await ctx.db.insert("wifiConfigs", {
      restaurantId: r1,
      ssid: "MeroRestaurant_Surkhet",
      password: "namaste2024",
      encryptionType: "WPA2",
      isActive: true,
      updatedBy: "workos-rajesh",
    });

    // ═══════════════════════════════════════════════════════════════════
    // RESTAURANT 2: Himalayan Bites, Kathmandu
    // ═══════════════════════════════════════════════════════════════════
    const r2 = await ctx.db.insert("restaurants", {
      name: "Himalayan Bites",
      slug: "himalayan-bites-ktm",
      address: "Thamel, Kathmandu, Nepal",
      phone: "01-4441234",
      city: "Kathmandu",
      timezone: "Asia/Kathmandu",
      currency: "NPR",
      taxRate: 0.13,
      isActive: true,
      ownerId: "workos-anita",
      subscriptionTier: "starter",
      onboardingStatus: "complete",
    });

    const menu2 = await ctx.db.insert("menus", {
      restaurantId: r2,
      name: "Main Menu",
      isActive: true,
    });

    // Staff
    await ctx.db.insert("staff", {
      restaurantId: r2,
      workosUserId: "workos-anita",
      name: "Anita Rana",
      email: "anita@himalayanbites.com",
      role: "owner",
      isActive: true,
    });
    await ctx.db.insert("staff", {
      restaurantId: r2,
      workosUserId: "workos-bikram",
      name: "Bikram KC",
      email: "bikram@himalayanbites.com",
      role: "manager",
      isActive: true,
    });
    // Suman also works at this restaurant as a waiter (multi-tenant!)
    await ctx.db.insert("staff", {
      restaurantId: r2,
      workosUserId: "workos-suman",
      name: "Suman Thapa",
      email: "suman@merorestaurant.com",
      role: "waiter",
      isActive: true,
    });

    // Categories
    const r2CatStarter = await ctx.db.insert("categories", {
      restaurantId: r2,
      name: "Starters",
      nameNe: "स्टार्टर",
      sortOrder: 1,
      isActive: true,
    });
    const r2CatMain = await ctx.db.insert("categories", {
      restaurantId: r2,
      name: "Mains",
      nameNe: "मुख्य",
      sortOrder: 2,
      isActive: true,
    });
    const r2CatDrink = await ctx.db.insert("categories", {
      restaurantId: r2,
      name: "Beverages",
      nameNe: "पेय",
      sortOrder: 3,
      isActive: true,
    });

    const r2Items = [
      { categoryId: r2CatStarter, name: "Buff Momo (Fried)", nameNe: "बफ मोमो (फ्राइड)", description: "Crispy fried buffalo dumplings", price: 280, isVeg: false, sortOrder: 1 },
      { categoryId: r2CatStarter, name: "Paneer Tikka", nameNe: "पनीर टिक्का", description: "Grilled cottage cheese with spices", price: 320, isVeg: true, sortOrder: 2 },
      { categoryId: r2CatStarter, name: "Aloo Sadeko", nameNe: "आलु सदेको", description: "Spiced potato salad with mustard oil", price: 150, isVeg: true, sortOrder: 3 },
      { categoryId: r2CatMain, name: "Chicken Biryani", nameNe: "चिकन बिरयानी", description: "Fragrant rice with spiced chicken", price: 500, isVeg: false, sortOrder: 1 },
      { categoryId: r2CatMain, name: "Newari Khaja Set", nameNe: "नेवारी खाजा सेट", description: "Traditional Newari feast platter", price: 650, isVeg: false, sortOrder: 2 },
      { categoryId: r2CatMain, name: "Veg Thali", nameNe: "भेज थाली", description: "Complete vegetarian meal set", price: 350, isVeg: true, sortOrder: 3 },
      { categoryId: r2CatDrink, name: "Fresh Lime Soda", nameNe: "ताजा लेमन सोडा", description: "Fresh squeezed lemon with soda", price: 80, isVeg: true, sortOrder: 1 },
      { categoryId: r2CatDrink, name: "Masala Tea", nameNe: "मसला चिया", description: "Spiced milk tea", price: 50, isVeg: true, sortOrder: 2 },
    ];
    for (const item of r2Items) {
      await ctx.db.insert("menuItems", { restaurantId: r2, menuId: menu2, ...item, isAvailable: true });
    }

    // Tables
    for (const t of [
      { number: 1, label: "Street View", seats: 2 },
      { number: 2, seats: 4 },
      { number: 3, label: "Rooftop", seats: 6 },
      { number: 4, seats: 2 },
    ]) {
      await ctx.db.insert("tables", {
        restaurantId: r2,
        number: t.number,
        label: t.label,
        seats: t.seats,
        qrCode: `himalayan-bites-t${t.number}`,
        status: "available",
      });
    }

    // WiFi
    await ctx.db.insert("wifiConfigs", {
      restaurantId: r2,
      ssid: "HimalayanBites_Guest",
      password: "thamel2024",
      encryptionType: "WPA2",
      isActive: true,
      updatedBy: "workos-anita",
    });

    return { restaurant1: r1, restaurant2: r2 };
  },
});
