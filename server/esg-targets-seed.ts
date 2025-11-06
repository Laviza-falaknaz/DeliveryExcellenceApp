import { db } from './db';
import { esgTargets } from '@shared/schema';
import { eq } from 'drizzle-orm';

export async function seedEsgTargets() {
  console.log("Seeding ESG targets...");

  const defaultTargets = [
    // Environmental Targets
    {
      category: 'environmental',
      title: 'Carbon Emissions Reduction',
      targetValue: '50000',
      currentValue: '35200',
      unit: 'kg CO₂',
      description: 'Reduce carbon emissions through remanufactured devices',
      displayOrder: 1,
      isActive: true,
      targetDate: new Date('2025-12-31')
    },
    {
      category: 'environmental',
      title: 'E-Waste Diverted from Landfills',
      targetValue: '1000',
      currentValue: '687',
      unit: 'devices',
      description: 'Prevent electronic waste from entering landfills',
      displayOrder: 2,
      isActive: true,
      targetDate: new Date('2025-12-31')
    },
    {
      category: 'environmental',
      title: 'Water Conservation',
      targetValue: '100000',
      currentValue: '62500',
      unit: 'liters',
      description: 'Water saved through device remanufacturing vs new production',
      displayOrder: 3,
      isActive: true,
      targetDate: new Date('2025-12-31')
    },
    
    // Social Targets
    {
      category: 'social',
      title: 'Digital Access for Underserved Communities',
      targetValue: '500',
      currentValue: '342',
      unit: 'families',
      description: 'Provide affordable computing access to underserved families',
      displayOrder: 4,
      isActive: true,
      targetDate: new Date('2025-12-31')
    },
    {
      category: 'social',
      title: 'Educational Institutions Supported',
      targetValue: '50',
      currentValue: '28',
      unit: 'schools',
      description: 'Partner with schools to provide sustainable technology',
      displayOrder: 5,
      isActive: true,
      targetDate: new Date('2025-12-31')
    },
    {
      category: 'social',
      title: 'Clean Water Access Projects',
      targetValue: '25',
      currentValue: '14',
      unit: 'projects',
      description: 'Support water access initiatives in developing regions',
      displayOrder: 6,
      isActive: true,
      targetDate: new Date('2025-12-31')
    },
    
    // Governance Targets
    {
      category: 'governance',
      title: 'Supply Chain Transparency Score',
      targetValue: '95',
      currentValue: '78',
      unit: '%',
      description: 'Achieve comprehensive supply chain visibility and ethical sourcing',
      displayOrder: 7,
      isActive: true,
      targetDate: new Date('2025-12-31')
    },
    {
      category: 'governance',
      title: 'Certified Sustainable Suppliers',
      targetValue: '100',
      currentValue: '72',
      unit: '%',
      description: 'Work exclusively with certified sustainable suppliers',
      displayOrder: 8,
      isActive: true,
      targetDate: new Date('2025-12-31')
    },
    {
      category: 'governance',
      title: 'ESG Reporting Compliance',
      targetValue: '100',
      currentValue: '85',
      unit: '%',
      description: 'Full compliance with international ESG reporting standards',
      displayOrder: 9,
      isActive: true,
      targetDate: new Date('2025-12-31')
    }
  ];

  try {
    // Check if targets already exist
    const existingTargets = await db.select().from(esgTargets).limit(1);
    
    if (existingTargets.length > 0) {
      console.log("ESG targets already seeded");
      return;
    }

    // Insert default targets
    for (const target of defaultTargets) {
      await db.insert(esgTargets).values(target);
    }

    console.log(`✅ Successfully seeded ${defaultTargets.length} ESG targets`);
  } catch (error) {
    console.error("Error seeding ESG targets:", error);
    throw error;
  }
}
