// Replit PostgreSQL database connection using blueprint:javascript_database
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use connection pooler for production deployments (better performance)
const connectionString = process.env.DATABASE_URL.replace('.c-2.us-east-2', '-pooler.c-2.us-east-2');

export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });

// Graceful shutdown
process.on('SIGINT', async () => {
  await pool.end();
  console.log('🔌 Database connection closed');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await pool.end();
  console.log('🔌 Database connection closed');
  process.exit(0);
});
