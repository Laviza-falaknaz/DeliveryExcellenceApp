import { db } from "./db";
import { 
  gamificationTiers,
  gamificationAchievements,
  gamificationSettings,
  gamificationMilestones
} from "@shared/schema";

export async function seedGamificationData() {
  console.log("Seeding gamification data...");

  try {
    // Check if gamification data is already seeded
    const existingTiers = await db.select().from(gamificationTiers).limit(1);
    if (existingTiers.length > 0) {
      console.log("Gamification data already seeded");
      return;
    }

    // 1. Seed Gamification Tiers
    console.log("Creating gamification tiers...");
    const [explorerTier] = await db.insert(gamificationTiers).values({
      name: "Explorer",
      minScore: 0,
      maxScore: 999,
      colorAccent: "#78909C",
      icon: "ri-compass-3-line",
      benefits: ["Access to basic ESG reports", "Achievement tracking", "Impact visualization"],
      displayOrder: 1,
      isActive: true,
    }).returning();

    const [innovatorTier] = await db.insert(gamificationTiers).values({
      name: "Innovator",
      minScore: 1000,
      maxScore: 4999,
      colorAccent: "#08ABAB",
      icon: "ri-lightbulb-line",
      benefits: ["All Explorer benefits", "Advanced analytics", "Social sharing", "Quarterly impact reports"],
      displayOrder: 2,
      isActive: true,
    }).returning();

    const [vanguardTier] = await db.insert(gamificationTiers).values({
      name: "Vanguard",
      minScore: 5000,
      maxScore: null,
      colorAccent: "#FFD700",
      icon: "ri-vip-crown-line",
      benefits: ["All Innovator benefits", "Priority support", "Custom impact reports", "Industry benchmarking", "Exclusive case studies"],
      displayOrder: 3,
      isActive: true,
    }).returning();

    console.log("✅ Gamification tiers created");

    // 2. Seed Gamification Achievements
    console.log("Creating achievements...");
    await db.insert(gamificationAchievements).values([
      {
        code: "first_order",
        name: "First Steps",
        description: "Place your first order for remanufactured equipment",
        icon: "ri-shopping-cart-line",
        category: "engagement",
        thresholdType: "orders_count",
        thresholdValue: "1",
        rewardPoints: 100,
        shareCopy: "Just took my first step toward sustainability with @CircularComputing! 🌱",
        displayOrder: 1,
        isActive: true,
      },
      {
        code: "carbon_saver_1kg",
        name: "Carbon Saver",
        description: "Save 1kg of CO₂ through your purchases",
        icon: "ri-leaf-line",
        category: "environmental",
        thresholdType: "carbon_saved",
        thresholdValue: "1000",
        rewardPoints: 150,
        shareCopy: "Saved 1kg of CO₂ with remanufactured tech! Every gram counts. 🌍",
        displayOrder: 2,
        isActive: true,
      },
      {
        code: "water_champion_10",
        name: "Water Champion",
        description: "Provide clean water to 10 families",
        icon: "ri-water-flash-line",
        category: "social",
        thresholdType: "families_helped",
        thresholdValue: "10",
        rewardPoints: 200,
        shareCopy: "Helped provide clean water to 10 families through sustainable IT choices! 💧",
        displayOrder: 3,
        isActive: true,
      },
      {
        code: "carbon_hero_10kg",
        name: "Carbon Hero",
        description: "Save 10kg of CO₂ emissions",
        icon: "ri-plant-line",
        category: "environmental",
        thresholdType: "carbon_saved",
        thresholdValue: "10000",
        rewardPoints: 500,
        shareCopy: "10kg of CO₂ saved! Proud to be making a real environmental impact. 🌿",
        displayOrder: 4,
        isActive: true,
      },
      {
        code: "resource_guardian_5kg",
        name: "Resource Guardian",
        description: "Conserve 5kg of precious minerals",
        icon: "ri-recycle-line",
        category: "environmental",
        thresholdType: "minerals_saved",
        thresholdValue: "5000",
        rewardPoints: 400,
        shareCopy: "Conserving precious resources, one laptop at a time! ♻️",
        displayOrder: 5,
        isActive: true,
      },
      {
        code: "frequent_buyer_5",
        name: "Frequent Buyer",
        description: "Place 5 orders for sustainable IT equipment",
        icon: "ri-shopping-bag-3-line",
        category: "engagement",
        thresholdType: "orders_count",
        thresholdValue: "5",
        rewardPoints: 300,
        shareCopy: "5 orders of sustainable tech and counting! Making circular economy a priority. 🔄",
        displayOrder: 6,
        isActive: true,
      },
      {
        code: "impact_sharer",
        name: "Impact Sharer",
        description: "Share your environmental impact on social media",
        icon: "ri-share-line",
        category: "engagement",
        thresholdType: "impact_shared",
        thresholdValue: "1",
        rewardPoints: 150,
        shareCopy: "Spreading the word about sustainability! Join me in making a difference. 📢",
        displayOrder: 7,
        isActive: true,
      },
      {
        code: "water_warrior_50",
        name: "Water Warrior",
        description: "Provide clean water to 50 families",
        icon: "ri-water-percent-line",
        category: "social",
        thresholdType: "families_helped",
        thresholdValue: "50",
        rewardPoints: 750,
        shareCopy: "50 families with clean water access thanks to sustainable tech choices! 💙",
        displayOrder: 8,
        isActive: true,
      },
      {
        code: "carbon_champion_50kg",
        name: "Carbon Champion",
        description: "Save 50kg of CO₂ emissions",
        icon: "ri-trophy-line",
        category: "environmental",
        thresholdType: "carbon_saved",
        thresholdValue: "50000",
        rewardPoints: 1000,
        tierRequired: innovatorTier?.id,
        shareCopy: "Carbon Champion status unlocked! 50kg CO₂ saved and still going strong! 🏆",
        displayOrder: 9,
        isActive: true,
      },
      {
        code: "sustainability_master",
        name: "Sustainability Master",
        description: "Reach Vanguard tier status",
        icon: "ri-vip-crown-line",
        category: "governance",
        thresholdType: "esg_score",
        thresholdValue: "5000",
        rewardPoints: 2000,
        tierRequired: vanguardTier?.id,
        shareCopy: "Vanguard tier achieved! Leading the way in sustainable IT. 👑",
        displayOrder: 10,
        isActive: true,
      },
    ]);

    console.log("✅ Achievements created");

    // 3. Seed Gamification Milestones
    console.log("Creating milestones...");
    await db.insert(gamificationMilestones).values([
      {
        tierId: null,
        title: "Journey Begins",
        description: "Welcome to your sustainability journey! Every step counts toward a greener future.",
        icon: "ri-footprint-line",
        requiredScore: 0,
        orderIndex: 1,
        isActive: true,
      },
      {
        tierId: explorerTier?.id,
        title: "First Impact Recorded",
        description: "Made your first environmental impact through sustainable technology",
        icon: "ri-seedling-line",
        requiredScore: 100,
        orderIndex: 2,
        isActive: true,
      },
      {
        tierId: explorerTier?.id,
        title: "Gaining Momentum",
        description: "Building consistent environmental impact",
        icon: "ri-rocket-line",
        requiredScore: 500,
        orderIndex: 3,
        isActive: true,
      },
      {
        tierId: innovatorTier?.id,
        title: "Innovator Status Achieved",
        description: "Reached Innovator tier - making significant environmental contributions",
        icon: "ri-lightbulb-flash-line",
        requiredScore: 1000,
        orderIndex: 4,
        isActive: true,
      },
      {
        tierId: innovatorTier?.id,
        title: "Impact Multiplier",
        description: "Amplifying your environmental influence",
        icon: "ri-line-chart-line",
        requiredScore: 2500,
        orderIndex: 5,
        isActive: true,
      },
      {
        tierId: vanguardTier?.id,
        title: "Vanguard Leader",
        description: "Achieved Vanguard status - leading the sustainability revolution",
        icon: "ri-medal-line",
        requiredScore: 5000,
        orderIndex: 6,
        isActive: true,
      },
      {
        tierId: vanguardTier?.id,
        title: "Sustainability Champion",
        description: "Setting the gold standard for environmental responsibility",
        icon: "ri-trophy-fill",
        requiredScore: 10000,
        orderIndex: 7,
        isActive: true,
      },
    ]);

    console.log("✅ Milestones created");

    // 4. Seed Gamification Settings
    console.log("Creating gamification settings...");
    await db.insert(gamificationSettings).values([
      {
        settingKey: "scoring_weights",
        settingValue: {
          carbon: 40,     // 40% weight for carbon savings
          water: 25,      // 25% weight for water impact
          resources: 20,  // 20% weight for resource conservation
          social: 15      // 15% weight for social impact
        },
        description: "Weights for calculating ESG scores from different environmental pillars",
      },
      {
        settingKey: "features_enabled",
        settingValue: {
          achievements: true,
          leaderboard: true,
          milestones: true,
          socialSharing: true,
          tierSystem: true
        },
        description: "Feature toggles for gamification elements",
      },
      {
        settingKey: "leaderboard_config",
        settingValue: {
          anonymizeNames: true,
          showTopN: 10,
          updateFrequency: "daily",
          includeOrgComparison: true
        },
        description: "Configuration for leaderboard display and privacy",
      },
      {
        settingKey: "scoring_normalization",
        settingValue: {
          baseUnit: 1000,                    // Normalize per 1,000g of impact
          carbonMultiplier: 1,               // 1 point per kg CO2 saved
          waterMultiplier: 0.5,              // 0.5 points per family helped
          resourcesMultiplier: 0.8,          // 0.8 points per kg minerals saved
          socialMultiplier: 2                // 2 points per family helped
        },
        description: "Multipliers for converting environmental metrics to points",
      },
    ]);

    console.log("✅ Gamification settings created");
    console.log("Gamification data seeded successfully!");
    
  } catch (error) {
    console.error("Error seeding gamification data:", error);
  }
}
