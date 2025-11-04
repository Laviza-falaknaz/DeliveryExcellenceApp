import { db } from "../server/db";
import { apiKeys } from "../shared/schema";
import crypto from "crypto";
import bcrypt from "bcryptjs";

async function generateApiKey(name: string) {
  try {
    console.log(`\n🔐 Generating API key for: ${name}\n`);

    // Generate secure random key
    const randomBytes = crypto.randomBytes(32);
    const apiKey = `cc_${randomBytes.toString('hex')}`;
    
    // Extract prefix (first 11 characters)
    const keyPrefix = apiKey.substring(0, 11);
    
    // Hash the key for secure storage
    const keyHash = await bcrypt.hash(apiKey, 10);
    
    // Insert into database
    const [newKey] = await db.insert(apiKeys).values({
      name,
      keyHash,
      keyPrefix,
      isActive: true,
      createdBy: null, // System generated
      expiresAt: null, // Never expires
    }).returning();
    
    console.log('✅ API Key created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔑 API KEY (SAVE THIS - IT WILL NOT BE SHOWN AGAIN):');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`\n${apiKey}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 Key Details:');
    console.log(`   ID: ${newKey.id}`);
    console.log(`   Name: ${newKey.name}`);
    console.log(`   Prefix: ${newKey.keyPrefix}`);
    console.log(`   Created: ${newKey.createdAt}`);
    console.log(`   Active: ${newKey.isActive}`);
    console.log(`   Expires: ${newKey.expiresAt || 'Never'}\n`);
    
    console.log('⚠️  IMPORTANT: Copy and save this key now. For security reasons, the full');
    console.log('   key cannot be retrieved later. Only the prefix is stored in the database.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error generating API key:', error);
    process.exit(1);
  }
}

// Get name from command line argument
const keyName = process.argv[2];

if (!keyName) {
  console.error('\n❌ Error: Please provide a name for the API key\n');
  console.log('Usage: npm run generate-api-key "Key Name"\n');
  console.log('Example: npm run generate-api-key "Production Power Automate"\n');
  process.exit(1);
}

generateApiKey(keyName);
