import { storage } from "./storage";

export async function seedGamificationData() {
  console.log("Seeding gamification data...");

  try {
    const existingAchievements = await storage.getAllAchievements();
    if (existingAchievements.length > 0) {
      console.log("Gamification data already seeded");
      return;
    }

    const achievements = [
      {
        name: "First Steps",
        description: "Place your first order for remanufactured equipment",
        category: "orders" as const,
        icon: "ri-shopping-cart-line",
        badgeColor: "#4caf50",
        points: 100,
        criteria: { type: "orders_count", threshold: 1 },
        isActive: true,
      },
      {
        name: "Eco Warrior",
        description: "Save 1kg of CO₂ through your purchases",
        category: "environmental" as const,
        icon: "ri-leaf-line",
        badgeColor: "#2e7d32",
        points: 200,
        criteria: { type: "carbon_saved", threshold: 1000 },
        isActive: true,
      },
      {
        name: "Water Champion",
        description: "Provide clean water to 10 families",
        category: "environmental" as const,
        icon: "ri-water-flash-line",
        badgeColor: "#0288d1",
        points: 250,
        criteria: { type: "families_helped", threshold: 10 },
        isActive: true,
      },
      {
        name: "Frequent Buyer",
        description: "Place 5 orders for sustainable IT equipment",
        category: "orders" as const,
        icon: "ri-shopping-bag-3-line",
        badgeColor: "#f57c00",
        points: 300,
        criteria: { type: "orders_count", threshold: 5 },
        isActive: true,
      },
      {
        name: "Impact Sharer",
        description: "Share your environmental impact on social media",
        category: "social" as const,
        icon: "ri-share-line",
        badgeColor: "#8e24aa",
        points: 150,
        criteria: { type: "impact_shared", threshold: 1 },
        isActive: true,
      },
      {
        name: "Support Star",
        description: "Successfully resolve a support ticket",
        category: "engagement" as const,
        icon: "ri-customer-service-2-line",
        badgeColor: "#ff9e1c",
        points: 100,
        criteria: { type: "support_tickets_resolved", threshold: 1 },
        isActive: true,
      },
      {
        name: "Sustainability Streak",
        description: "Log in for 7 consecutive days",
        category: "engagement" as const,
        icon: "ri-fire-line",
        badgeColor: "#d32f2f",
        points: 350,
        criteria: { type: "login_streak", threshold: 7 },
        isActive: true,
      },
      {
        name: "Carbon Hero",
        description: "Save 10kg of CO₂ emissions",
        category: "environmental" as const,
        icon: "ri-plant-line",
        badgeColor: "#388e3c",
        points: 500,
        criteria: { type: "carbon_saved", threshold: 10000 },
        isActive: true,
      },
      {
        name: "Resource Guardian",
        description: "Conserve 5kg of precious minerals",
        category: "environmental" as const,
        icon: "ri-recycle-line",
        badgeColor: "#5e35b1",
        points: 400,
        criteria: { type: "minerals_saved", threshold: 5000 },
        isActive: true,
      },
      {
        name: "Milestone Master",
        description: "Reach a major environmental milestone",
        category: "milestones" as const,
        icon: "ri-flag-line",
        badgeColor: "#08ABAB",
        points: 600,
        criteria: { type: "milestone_reached", threshold: 1 },
        isActive: true,
      },
    ];

    const milestones = [
      {
        name: "Bronze Impact",
        description: "Save 500g of CO₂ from the atmosphere",
        metricType: "carbon_saved",
        targetValue: 500,
        rewardPoints: 250,
        icon: "ri-medal-line",
        color: "#cd7f32",
        isActive: true,
      },
      {
        name: "Silver Impact",
        description: "Save 2kg of CO₂ from the atmosphere",
        metricType: "carbon_saved",
        targetValue: 2000,
        rewardPoints: 500,
        icon: "ri-medal-2-line",
        color: "#c0c0c0",
        isActive: true,
      },
      {
        name: "Gold Impact",
        description: "Save 5kg of CO₂ from the atmosphere",
        metricType: "carbon_saved",
        targetValue: 5000,
        rewardPoints: 1000,
        icon: "ri-vip-crown-line",
        color: "#ffd700",
        isActive: true,
      },
      {
        name: "Water Provider",
        description: "Provide clean water to 5 families",
        metricType: "families_helped",
        targetValue: 5,
        rewardPoints: 300,
        icon: "ri-water-flash-line",
        color: "#08ABAB",
        isActive: true,
      },
      {
        name: "Resource Protector",
        description: "Conserve 1kg of precious minerals",
        metricType: "minerals_saved",
        targetValue: 1000,
        rewardPoints: 400,
        icon: "ri-earth-line",
        color: "#4caf50",
        isActive: true,
      },
    ];

    for (const achievement of achievements) {
      await storage.createAchievement(achievement);
    }

    for (const milestone of milestones) {
      await storage.createMilestone(milestone);
    }

    console.log("Gamification data seeded successfully!");
  } catch (error) {
    console.error("Error seeding gamification data:", error);
  }
}
