import { internalMutation } from "./_generated/server";

export const seedDatabase = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existing = await ctx.db
      .query("restaurants")
      .first();
    if (existing) {
      console.log("Database already seeded, skipping.");
      return;
    }

    // 0. Create demo owner user
    const ownerId = await ctx.db.insert("users", {
      workosUserId: "workos_demo_owner",
      email: "rajesh@merorestaurant.com",
      name: "Rajesh Sharma",
      phone: "+977-9858012345",
      createdAt: Date.now(),
    });

    // 1. Create restaurant (tenant)
    const restaurantId = await ctx.db.insert("restaurants", {
      ownerId,
      name: "Mero Restaurant",
      nameNe: "मेरो रेस्टुरेन्ट",
      slug: "mero-restaurant",
      description: "Authentic Nepali cuisine in the heart of Surkhet",
      descriptionNe: "सुर्खेतको मुटुमा प्रामाणिक नेपाली खाना",
      address: "Birendranagar-10, Surkhet, Nepal",
      city: "Surkhet",
      phone: "+977-083-520123",
      email: "hello@merorestaurant.com",
      isActive: true,
      openingTime: "07:00",
      closingTime: "21:00",
      currency: "NPR",
      taxRate: 0.13,
      subscriptionTier: "pro",
      onboardingStatus: "operational",
      createdAt: Date.now(),
    });

    // 2. Create categories
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

    // 3. Create menu items
    const items = [
      { categoryId: catAppetizers, name: "Chicken Momo", nameNe: "चिकन मोमो", description: "Steamed dumplings filled with spiced chicken, served with tomato achar", descriptionNe: "मसलेदार चिकनले भरिएका भाप मोमो, टमाटर अचारसँग", price: 25000, isVeg: false, isSpicy: true, preparationTime: 20, sortOrder: 1 },
      { categoryId: catAppetizers, name: "Vegetable Momo", nameNe: "तरकारी मोमो", description: "Steamed dumplings with mixed vegetables and paneer", descriptionNe: "मिश्रित तरकारी र पनीरको भाप मोमो", price: 20000, isVeg: true, isSpicy: false, preparationTime: 20, sortOrder: 2 },
      { categoryId: catAppetizers, name: "Newari Choila", nameNe: "नेवारी छोइला", description: "Spicy grilled buffalo meat marinated in Nepali spices", descriptionNe: "नेपाली मसलामा मरिनेट गरिएको पिरो ग्रिल गरिएको बफ", price: 35000, isVeg: false, isSpicy: true, preparationTime: 15, sortOrder: 3 },
      { categoryId: catAppetizers, name: "Chatamari", nameNe: "चतामरी", description: "Newari rice crepe topped with minced meat and egg", descriptionNe: "कीमा र अण्डाले भरिएको नेवारी चामलको क्रेप", price: 28000, isVeg: false, isSpicy: false, preparationTime: 15, sortOrder: 4 },
      { categoryId: catMains, name: "Dal Bhat Tarkari", nameNe: "दालभात तरकारी", description: "Traditional Nepali meal with lentil soup, steamed rice, seasonal vegetables, pickle & papad", descriptionNe: "परम्परागत नेपाली खाना — दाल, भात, मौसमी तरकारी, अचार र पापड", price: 40000, isVeg: true, isSpicy: false, preparationTime: 15, sortOrder: 1 },
      { categoryId: catMains, name: "Thakali Set", nameNe: "थकाली सेट", description: "Complete Thakali meal with dal, rice, meat curry, gundruk, and sides", descriptionNe: "दाल, भात, मासु, गुन्द्रुक र साइड सहित पूर्ण थकाली खाना", price: 55000, isVeg: false, isSpicy: false, preparationTime: 25, sortOrder: 2 },
      { categoryId: catMains, name: "Sekuwa", nameNe: "सेकुवा", description: "Smoky grilled meat skewers marinated in traditional spices", descriptionNe: "परम्परागत मसलामा मरिनेट गरिएको धुँवादार ग्रिल मासु", price: 45000, isVeg: false, isSpicy: true, preparationTime: 30, sortOrder: 3 },
      { categoryId: catMains, name: "Gorkhali Lamb Curry", nameNe: "गोरखाली खसीको मासु", description: "Slow-cooked lamb in rich, aromatic Gorkhali spice blend", descriptionNe: "गोरखाली मसलामा ढिलो पकाइएको खसीको मासु", price: 60000, isVeg: false, isSpicy: true, preparationTime: 35, sortOrder: 4 },
      { categoryId: catDrinks, name: "Nepali Chiya", nameNe: "नेपाली चिया", description: "Traditional Nepali milk tea with cardamom and ginger", descriptionNe: "अलैँची र अदुवा सहित परम्परागत नेपाली दूध चिया", price: 6000, isVeg: true, isSpicy: false, preparationTime: 5, sortOrder: 1 },
      { categoryId: catDrinks, name: "Mango Lassi", nameNe: "आँपको लस्सी", description: "Creamy yogurt drink blended with fresh mango", descriptionNe: "ताजा आँपसँग मिसाइएको क्रिमी दही पेय", price: 15000, isVeg: true, isSpicy: false, preparationTime: 5, sortOrder: 2 },
      { categoryId: catDrinks, name: "Tongba", nameNe: "तोङ्बा", description: "Traditional millet beer served in a wooden pot", descriptionNe: "काठको भाँडोमा सर्भ गरिएको परम्परागत कोदो जाँड", price: 30000, isVeg: true, isSpicy: false, preparationTime: 5, sortOrder: 3 },
      { categoryId: catDesserts, name: "Juju Dhau", nameNe: "जुजु धौ", description: "King of yogurt — traditional Bhaktapur-style creamy yogurt", descriptionNe: "दहीको राजा — परम्परागत भक्तपुर शैलीको क्रिमी दही", price: 12000, isVeg: true, isSpicy: false, preparationTime: 0, sortOrder: 1 },
      { categoryId: catDesserts, name: "Sel Roti", nameNe: "सेल रोटी", description: "Traditional ring-shaped sweet rice bread", descriptionNe: "परम्परागत गोलाकार मीठो चामलको रोटी", price: 8000, isVeg: true, isSpicy: false, preparationTime: 10, sortOrder: 2 },
      { categoryId: catDesserts, name: "Rice Kheer", nameNe: "खीर", description: "Creamy rice pudding with cardamom, nuts, and saffron", descriptionNe: "अलैँची, गेडागुडी र केशरसहित क्रिमी चामलको खीर", price: 15000, isVeg: true, isSpicy: false, preparationTime: 0, sortOrder: 3 },
    ];

    for (const item of items) {
      await ctx.db.insert("menuItems", {
        restaurantId,
        ...item,
        isAvailable: true,
      });
    }

    // 4. Create tables
    for (let i = 1; i <= 6; i++) {
      await ctx.db.insert("tables", {
        restaurantId,
        number: i,
        label: `Table ${i}`,
        capacity: i <= 4 ? 4 : 8,
        status: "available",
        qrCode: `${restaurantId}-table-${i}`,
      });
    }

    // 5. Create WiFi config
    await ctx.db.insert("wifiConfigs", {
      restaurantId,
      ssid: "MeroRestaurant_Surkhet",
      password: "namaste2024",
      encryptionType: "WPA2",
      isActive: true,
      updatedAt: Date.now(),
    });

    // 6. Create staff (owner is auto-created by register, but seed directly)
    await ctx.db.insert("staff", {
      restaurantId,
      userId: ownerId,
      workosUserId: "workos_demo_owner",
      name: "Rajesh Sharma",
      email: "rajesh@merorestaurant.com",
      role: "owner",
      isActive: true,
    });
    await ctx.db.insert("staff", {
      restaurantId,
      workosUserId: "workos_manager_001",
      name: "Suman Thapa",
      email: "suman@merorestaurant.com",
      role: "manager",
      isActive: true,
    });
    await ctx.db.insert("staff", {
      restaurantId,
      workosUserId: "workos_chef_001",
      name: "Kumar Bhandari",
      email: "kumar@merorestaurant.com",
      role: "chef",
      isActive: true,
    });

    console.log("Database seeded successfully!");
    return { restaurantId };
  },
});
