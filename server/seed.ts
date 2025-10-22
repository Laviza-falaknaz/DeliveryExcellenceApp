import { db } from "./db";
import { users, waterProjects } from "@shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Check if we already have a test user
    const existingUsers = await db.select().from(users).limit(1);
    
    if (existingUsers.length === 0) {
      console.log("Creating initial test user...");
      
      // Create test user with hashed password
      const hashedPassword = await bcrypt.hash("admin123", 10);
      
      await db.insert(users).values({
        username: "lavizaniazi2001@gmail.com",
        password: hashedPassword,
        name: "Admin User",
        company: "A2C",
        email: "lavizaniazi2001@gmail.com",
        phoneNumber: "+44 1234 567890",
        isAdmin: true,
        notificationPreferences: {
          orderUpdates: true,
          environmentalImpact: true,
          charityUpdates: true,
          serviceReminders: true,
        },
      });
      
      console.log("✅ Test user created: lavizaniazi2001@gmail.com / admin123");
    }

    // Check if we already have water projects
    const existingProjects = await db.select().from(waterProjects).limit(1);
    
    if (existingProjects.length === 0) {
      console.log("Creating water projects...");
      
      await db.insert(waterProjects).values([
        {
          name: "Ethiopia Clean Water Initiative",
          location: "Ethiopia",
          description: "This project is providing clean water access to rural communities in Ethiopia, focusing on sustainable well construction and community education on water management.",
          peopleImpacted: 1200,
          waterProvided: 3000000,
          imageUrl: "/attached_assets/Ethiopia.png",
        },
        {
          name: "Rwanda Clean Water Project",
          location: "Rwanda",
          description: "Building sustainable water infrastructure in rural Rwanda to provide clean drinking water and improve sanitation facilities.",
          peopleImpacted: 850,
          waterProvided: 1850000,
          imageUrl: "/attached_assets/Rwanda.png",
        },
        {
          name: "Uganda Rainwater Harvesting",
          location: "Uganda",
          description: "Implementing rainwater harvesting systems to collect and store clean water for communities in drought-prone regions of Uganda.",
          peopleImpacted: 730,
          waterProvided: 1450000,
          imageUrl: "/attached_assets/Uganda.png",
        },
      ]);
      
      console.log("✅ Water projects created");
    }

    console.log("✅ Database seeding completed successfully");
  } catch (error) {
    console.error("❌ Error during database seeding:", error);
    throw error;
  }
}
