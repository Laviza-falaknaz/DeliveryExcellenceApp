import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { seedDatabase } from "./seed";
import { db } from "./db";
import * as schema from "@shared/schema";
import { createRequire } from "node:module";

// Function to push database schema programmatically
async function pushDatabaseSchema() {
  try {
    console.log('📦 Pushing database schema...');
    
    // Use require to import drizzle-kit/api (ESM workaround)
    const require = createRequire(import.meta.url);
    const { pushSchema } = require('drizzle-kit/api');
    
    // Push schema to database
    const result = await pushSchema(schema, db);
    
    // Apply the changes
    await result.apply();
    
    console.log('✅ Database schema pushed successfully');
  } catch (error) {
    console.error('⚠️ Error pushing database schema:', error);
    throw error;
  }
}

const app = express();
app.use(express.json({ limit: '50mb' })); // Increased limit for bulk uploads
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Serve attached assets
app.use('/attached_assets', express.static(path.resolve(import.meta.dirname, '../attached_assets')));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // Push database schema and seed data in both development and production
  // Schema push ensures tables exist before seeding
  // Seeding only inserts missing data (checked via queries in seed.ts)
  Promise.race([
    (async () => {
      await pushDatabaseSchema();
      await seedDatabase();
    })(),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Schema push/seed timeout')), 60000)
    )
  ])
    .then(() => console.log('✅ Database initialization completed'))
    .catch((error) => {
      console.error('⚠️ Database initialization failed or timed out:', error.message);
    });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
