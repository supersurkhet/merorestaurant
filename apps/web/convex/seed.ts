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

    // 1. Create restaurant
    const restaurantId = await ctx.db.insert("restaurants", {
      name: "Mero Restaurant",
      slug: "mero-surkhet",
      address: "Birendranagar, Surkhet, Nepal",
      phone: "083-520123",
      timezone: "Asia/Kathmandu",
      currency: "NPR",
      isActive: true,
      ownerId: "seed-owner",
    });

    // 2. Create a default menu
    const menuId = await ctx.db.insert("menus", {
      restaurantId,
      name: "Main Menu",
      isActive: true,
    });

    // 3. Create categories
    const catAppetizers = await ctx.db.insert("categories", {
      restaurantId,
      name: "Appetizers",
      nameNe: "स्न्याक्स",
      sortOrder: 1,
      isActive: true,
    });
    const catMains = await ctx.db.insert("categories", {
      restaurantId,
      name: "Main Course",
      nameNe: "मुख्य खाना",
      sortOrder: 2,
      isActive: true,
    });
    const catDrinks = await ctx.db.insert("categories", {
      restaurantId,
      name: "Drinks",
      nameNe: "पेय पदार्थ",
      sortOrder: 3,
      isActive: true,
    });
    const catDesserts = await ctx.db.insert("categories", {
      restaurantId,
      name: "Desserts",
      nameNe: "मिठाई",
      sortOrder: 4,
      isActive: true,
    });

    // 4. Create menu items (from mock data)
    const menuItemDefs = [
      // Appetizers
      {
        categoryId: catAppetizers,
        name: "Chicken Momo",
        nameNe: "चिकन मोमो",
        description:
          "Steamed dumplings filled with spiced chicken, served with tomato achar",
        price: 250,
        isVeg: false,
        sortOrder: 1,
      },
      {
        categoryId: catAppetizers,
        name: "Vegetable Momo",
        nameNe: "तरकारी मोमो",
        description: "Steamed dumplings with mixed vegetables and paneer",
        price: 200,
        isVeg: true,
        sortOrder: 2,
      },
      {
        categoryId: catAppetizers,
        name: "Newari Choila",
        nameNe: "नेवारी छोइला",
        description:
          "Spicy grilled buffalo meat marinated in Nepali spices",
        price: 350,
        isVeg: false,
        sortOrder: 3,
      },
      {
        categoryId: catAppetizers,
        name: "Chatamari",
        nameNe: "चतामरी",
        description: "Newari rice crepe topped with minced meat and egg",
        price: 280,
        isVeg: false,
        sortOrder: 4,
      },
      // Main Course
      {
        categoryId: catMains,
        name: "Dal Bhat Tarkari",
        nameNe: "दालभात तरकारी",
        description:
          "Traditional Nepali meal — lentil soup, steamed rice, seasonal vegetables, pickle & papad",
        price: 400,
        isVeg: true,
        sortOrder: 1,
      },
      {
        categoryId: catMains,
        name: "Thakali Set",
        nameNe: "थकाली सेट",
        description:
          "Complete Thakali meal with dal, rice, meat curry, gundruk, and sides",
        price: 550,
        isVeg: false,
        sortOrder: 2,
      },
      {
        categoryId: catMains,
        name: "Sekuwa",
        nameNe: "सेकुवा",
        description:
          "Smoky grilled meat skewers marinated in traditional spices",
        price: 450,
        isVeg: false,
        sortOrder: 3,
      },
      {
        categoryId: catMains,
        name: "Gorkhali Lamb Curry",
        nameNe: "गोरखाली खसीको मासु",
        description:
          "Slow-cooked lamb in rich, aromatic Gorkhali spice blend",
        price: 600,
        isVeg: false,
        sortOrder: 4,
      },
      // Drinks
      {
        categoryId: catDrinks,
        name: "Nepali Chiya",
        nameNe: "नेपाली चिया",
        description:
          "Traditional Nepali milk tea with cardamom and ginger",
        price: 60,
        isVeg: true,
        sortOrder: 1,
      },
      {
        categoryId: catDrinks,
        name: "Mango Lassi",
        nameNe: "आँपको लस्सी",
        description: "Creamy yogurt drink blended with fresh mango",
        price: 150,
        isVeg: true,
        sortOrder: 2,
      },
      {
        categoryId: catDrinks,
        name: "Tongba",
        nameNe: "तोङ्बा",
        description:
          "Traditional millet beer served in a wooden pot — a Himalayan classic",
        price: 300,
        isVeg: true,
        sortOrder: 3,
      },
      // Desserts
      {
        categoryId: catDesserts,
        name: "Juju Dhau",
        nameNe: "जुजु धौ",
        description:
          "King of yogurt — traditional Bhaktapur-style creamy yogurt",
        price: 120,
        isVeg: true,
        sortOrder: 1,
      },
      {
        categoryId: catDesserts,
        name: "Sel Roti",
        nameNe: "सेल रोटी",
        description: "Traditional ring-shaped sweet rice bread",
        price: 80,
        isVeg: true,
        sortOrder: 2,
      },
      {
        categoryId: catDesserts,
        name: "Rice Kheer",
        nameNe: "खीर",
        description:
          "Creamy rice pudding with cardamom, nuts, and saffron",
        price: 150,
        isVeg: true,
        sortOrder: 3,
      },
    ];

    for (const item of menuItemDefs) {
      await ctx.db.insert("menuItems", {
        restaurantId,
        menuId,
        ...item,
        isAvailable: true,
      });
    }

    // 5. Create tables (6 tables)
    const tableDefs = [
      { number: 1, label: "Window Seat", seats: 2 },
      { number: 2, label: "Garden View", seats: 4 },
      { number: 3, seats: 4 },
      { number: 4, label: "Family Booth", seats: 6 },
      { number: 5, seats: 2 },
      { number: 6, label: "Party Table", seats: 8 },
    ];

    for (const table of tableDefs) {
      await ctx.db.insert("tables", {
        restaurantId,
        number: table.number,
        label: table.label,
        seats: table.seats,
        qrCode: `mero-surkhet-t${table.number}`,
        status: "available",
      });
    }

    // 6. WiFi config
    await ctx.db.insert("wifiConfigs", {
      restaurantId,
      ssid: "MeroRestaurant_Surkhet",
      password: "namaste2024",
      encryptionType: "WPA2",
      isActive: true,
      updatedBy: "seed-owner",
    });

    // 7. Staff members
    await ctx.db.insert("staff", {
      restaurantId,
      workosUserId: "workos-rajesh",
      name: "Rajesh Sharma",
      email: "rajesh@merorestaurant.com",
      role: "owner",
      isActive: true,
    });
    await ctx.db.insert("staff", {
      restaurantId,
      workosUserId: "workos-suman",
      name: "Suman Thapa",
      email: "suman@merorestaurant.com",
      role: "manager",
      isActive: true,
    });
    await ctx.db.insert("staff", {
      restaurantId,
      workosUserId: "workos-kumar",
      name: "Kumar Bhandari",
      email: "kumar@merorestaurant.com",
      role: "kitchen",
      isActive: true,
    });

    return { restaurantId, menuId };
  },
});
