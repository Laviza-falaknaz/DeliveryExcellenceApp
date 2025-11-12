import { db } from "./db";
import { users, waterProjects, systemSettings, organizationalMetrics, impactEquivalencySettings, esgMeasurementParameters, keyPerformanceInsights } from "@shared/schema";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { seedGamificationData } from "./gamification-seed";
import { seedEsgTargets } from "./esg-targets-seed";

export async function seedDatabase() {
  console.log("🌱 Starting database seeding...");

  try {
    // Only create test user in development environment (security: never create default admin in production)
    if (process.env.NODE_ENV === "development") {
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
    } else {
      console.log("📦 Production mode - skipping default admin user creation (must be created manually)");
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

    // Check if Power Automate serial lookup URL setting exists
    const existingSerialLookupSetting = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.settingKey, 'serial_lookup'))
      .limit(1);
    
    if (existingSerialLookupSetting.length === 0) {
      console.log("Creating serial lookup setting...");
      
      await db.insert(systemSettings).values({
        settingKey: 'serial_lookup',
        settingValue: {
          powerAutomateSerialLookupUrl: 'https://01f7d87362b64cf3a95fbd0a0c6bc1.28.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/1cb5b4bb76f44fa594528ecc2a799812/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=IWxO9ZCrNZUx9a_InGB4zoR7rNcyETORigbC51XVv04'
        },
      });
      
      console.log("✅ Serial lookup setting created");
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

    // Check and seed impact equivalency settings
    const existingEquivalencySettings = await db.select().from(impactEquivalencySettings).limit(1);
    
    if (existingEquivalencySettings.length === 0) {
      console.log("Creating impact equivalency settings...");
      
      await db.insert(impactEquivalencySettings).values([
        {
          equivalencyType: 'trees',
          name: 'Trees Planted',
          description: 'trees planted',
          conversionFactor: '21', // Divide by 21 (21kg CO2 per tree per year)
          conversionOperation: 'divide',
          icon: 'ri-plant-line',
          color: '#22c55e',
          displayOrder: 1,
          isActive: true,
        },
        {
          equivalencyType: 'car_miles',
          name: 'Car Miles Saved',
          description: 'miles not driven',
          conversionFactor: '2.5', // Multiply by 2.5 (~0.4 kg CO2 per mile)
          conversionOperation: 'multiply',
          icon: 'ri-car-line',
          color: '#3b82f6',
          displayOrder: 2,
          isActive: true,
        },
        {
          equivalencyType: 'phone_charges',
          name: 'Phone Charges',
          description: 'full charges',
          conversionFactor: '1000', // Multiply by 1000 (~1kg CO2 per 1000 charges)
          conversionOperation: 'multiply',
          icon: 'ri-smartphone-line',
          color: '#f97316',
          displayOrder: 3,
          isActive: true,
        },
        {
          equivalencyType: 'plastic_bottles',
          name: 'Plastic Bottles',
          description: 'bottles recycled',
          conversionFactor: '20', // Multiply by 20 (~50g CO2 per bottle)
          conversionOperation: 'multiply',
          icon: 'ri-delete-bin-line',
          color: '#ef4444',
          displayOrder: 4,
          isActive: true,
        },
        {
          equivalencyType: 'homes_powered',
          name: 'Homes Powered',
          description: 'day(s) of power',
          conversionFactor: '365', // Divide by 365 (~365 kg CO2 per home per day)
          conversionOperation: 'divide',
          icon: 'ri-home-line',
          color: '#a855f7',
          displayOrder: 5,
          isActive: true,
        },
        {
          equivalencyType: 'flights_offset',
          name: 'Flights Offset',
          description: 'short flight(s)',
          conversionFactor: '90', // Divide by 90 (~90 kg CO2 per short flight)
          conversionOperation: 'divide',
          icon: 'ri-flight-takeoff-line',
          color: '#08ABAB',
          displayOrder: 6,
          isActive: true,
        },
      ]);
      
      console.log("✅ Impact equivalency settings created");
    }

    // Check and seed ESG measurement parameters
    const existingEsgParameters = await db.select().from(esgMeasurementParameters).limit(1);
    
    if (existingEsgParameters.length === 0) {
      console.log("Creating ESG measurement parameters...");
      
      await db.insert(esgMeasurementParameters).values([
        {
          parameterKey: 'carbon_per_laptop',
          parameterName: 'Carbon Saved per Laptop',
          parameterValue: '316', // 316 kg CO2 saved per laptop
          unit: 'kg',
          category: 'environmental',
          description: 'Amount of CO2 emissions saved by choosing a remanufactured laptop over a new one',
          displayOrder: 1,
          isActive: true,
        },
        {
          parameterKey: 'water_provided_per_laptop',
          parameterName: 'Clean Water Provided per Laptop',
          parameterValue: '60', // 60 liters provided per laptop through charity partnership
          unit: 'liters',
          category: 'social',
          description: 'Liters of clean water provided to communities through charity: water partnership per laptop sold',
          displayOrder: 2,
          isActive: true,
        },
        {
          parameterKey: 'minerals_saved_per_laptop',
          parameterName: 'Minerals Preserved per Laptop',
          parameterValue: '1200', // 1200 grams of minerals saved per laptop
          unit: 'grams',
          category: 'environmental',
          description: 'Precious metals and minerals conserved by remanufacturing instead of mining new materials',
          displayOrder: 3,
          isActive: true,
        },
        {
          parameterKey: 'water_saved_per_laptop',
          parameterName: 'Water Saved per Laptop',
          parameterValue: '190000', // 190,000 liters of water saved per laptop
          unit: 'liters',
          category: 'environmental',
          description: 'Water consumption avoided in manufacturing process by choosing remanufactured laptops',
          displayOrder: 4,
          isActive: true,
        },
        {
          parameterKey: 'families_helped_per_laptop',
          parameterName: 'Families Helped per Laptop',
          parameterValue: '1', // 1 family helped per laptop
          unit: 'families',
          category: 'social',
          description: 'Number of families receiving clean water access through charity partnership per laptop',
          displayOrder: 5,
          isActive: true,
        },
      ]);
      
      console.log("✅ ESG measurement parameters created");
    }

    // Seed Key Performance Insights
    const existingKpiInsights = await db.select().from(keyPerformanceInsights).limit(1);
    
    if (existingKpiInsights.length === 0) {
      console.log("Creating key performance insights...");
      
      await db.insert(keyPerformanceInsights).values([
        {
          metricKey: 'remanufactured_units_deployed',
          metricName: 'Remanufactured Units Deployed',
          metricValue: '15,234',
          metricUnit: 'units',
          metricCategory: 'environmental',
          description: 'Total number of remanufactured laptops deployed to customers',
          displayOrder: 1,
          isActive: true,
        },
        {
          metricKey: 'total_carbon_offset',
          metricName: 'Total Carbon Offset',
          metricValue: '4,814',
          metricUnit: 'tonnes CO₂e',
          metricCategory: 'environmental',
          description: 'Total carbon emissions prevented through remanufacturing',
          displayOrder: 2,
          isActive: true,
        },
        {
          metricKey: 'e_waste_diverted',
          metricName: 'E-Waste Diverted from Landfills',
          metricValue: '18,281',
          metricUnit: 'kg',
          metricCategory: 'environmental',
          description: 'Electronic waste prevented from entering landfills',
          displayOrder: 3,
          isActive: true,
        },
        {
          metricKey: 'water_conservation',
          metricName: 'Water Conservation',
          metricValue: '2.9',
          metricUnit: 'million litres',
          metricCategory: 'environmental',
          description: 'Water saved in manufacturing through remanufacturing process',
          displayOrder: 4,
          isActive: true,
        },
        {
          metricKey: 'communities_supported',
          metricName: 'Communities Supported',
          metricValue: '28',
          metricUnit: 'communities',
          metricCategory: 'social',
          description: 'Number of communities receiving clean water through charity partnerships',
          displayOrder: 5,
          isActive: true,
        },
        {
          metricKey: 'families_with_clean_water',
          metricName: 'Families with Clean Water Access',
          metricValue: '3,420',
          metricUnit: 'families',
          metricCategory: 'social',
          description: 'Families provided with clean drinking water through our partnerships',
          displayOrder: 6,
          isActive: true,
        },
        {
          metricKey: 'circular_economy_rate',
          metricName: 'Circular Economy Rate',
          metricValue: '94',
          metricUnit: '%',
          metricCategory: 'governance',
          description: 'Percentage of materials recovered and reused in circular economy',
          displayOrder: 7,
          isActive: true,
        },
        {
          metricKey: 'warranty_fulfillment',
          metricName: 'Warranty Fulfillment Rate',
          metricValue: '98.5',
          metricUnit: '%',
          metricCategory: 'governance',
          description: 'Percentage of warranty claims successfully fulfilled',
          displayOrder: 8,
          isActive: true,
        },
      ]);
      
      console.log("✅ Key performance insights created");
    }

    // Seed gamification data
    await seedGamificationData();

    // Seed ESG targets
    await seedEsgTargets();

    console.log("✅ Database seeding completed successfully");
  } catch (error) {
    console.error("❌ Error during database seeding:", error);
    throw error;
  }
}
