import { db } from "./db";
import { users, waterProjects, systemSettings, organizationalMetrics } from "@shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { seedGamificationData } from "./gamification-seed";

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

    // Check if password webhook setting exists
    const existingWebhookSetting = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.settingKey, 'password_webhook'))
      .limit(1);
    
    if (existingWebhookSetting.length === 0) {
      console.log("Creating password webhook setting...");
      
      await db.insert(systemSettings).values({
        settingKey: 'password_webhook',
        settingValue: {
          webhookUrl: 'https://01f7d87362b64cf3a95fbd0a0c6bc1.28.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/3a96d10bf06946f88dfae3896847f0ff/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=YHPc_UoSSNcy0ZU9n2lGxcsfUBbYitNe0JGtGDsvxvo'
        },
      });
      
      console.log("✅ Password webhook setting created");
    }

    // Check if sustainability metrics setting exists
    const existingSustainabilitySetting = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.settingKey, 'sustainability_metrics'))
      .limit(1);
    
    if (existingSustainabilitySetting.length === 0) {
      console.log("Creating sustainability metrics setting...");
      
      await db.insert(systemSettings).values({
        settingKey: 'sustainability_metrics',
        settingValue: {
          carbonReductionPerLaptop: 316000, // 316 KGS in grams
          resourcePreservationPerLaptop: 1200000, // 1200 KGS in grams
          waterSavedPerLaptop: 190000, // 190,000 liters
          eWasteReductionPercentage: 0, // 0% e-waste
          familiesHelpedPerLaptop: 1, // 1 family per laptop
          treesEquivalentPerLaptop: 3, // Equivalent to 3 trees per laptop
        },
      });
      
      console.log("✅ Sustainability metrics setting created");
    }

    // Check and seed organizational metrics
    const existingOrgMetrics = await db.select().from(organizationalMetrics).limit(1);
    
    if (existingOrgMetrics.length === 0) {
      console.log("Creating organizational metrics...");
      
      await db.insert(organizationalMetrics).values([
        {
          metricKey: 'total_units_deployed',
          metricValue: '125000', // Total remanufactured units deployed company-wide
          metricUnit: 'units',
          description: 'Total number of remanufactured units deployed across all customers'
        },
        {
          metricKey: 'total_carbon_saved',
          metricValue: '39500000', // 39,500 kg in grams (125000 * 316 kg)
          metricUnit: 'g',
          description: 'Total carbon emissions saved through remanufactured devices'
        },
        {
          metricKey: 'total_water_saved',
          metricValue: '23750000000', // 23.75 billion liters (125000 * 190000)
          metricUnit: 'liters',
          description: 'Total water saved through circular economy practices'
        },
        {
          metricKey: 'total_families_helped',
          metricValue: '125000', // 1 family per laptop
          metricUnit: 'families',
          description: 'Total families helped through water access programs'
        }
      ]);
      
      console.log("✅ Organizational metrics created");
    }

    // Seed gamification data
    await seedGamificationData();

    console.log("✅ Database seeding completed successfully");
  } catch (error) {
    console.error("❌ Error during database seeding:", error);
    throw error;
  }
}
