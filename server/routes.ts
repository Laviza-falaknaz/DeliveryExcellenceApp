import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertOrderUpdateSchema,
  insertEnvironmentalImpactSchema,
  insertRmaSchema,
  insertSupportTicketSchema,
  insertCaseStudySchema,
  insertDeliveryTimelineSchema,
  insertWaterProjectSchema,
  insertAchievementSchema,
  insertMilestoneSchema,
  insertUserProgressSchema,
  insertActivityLogSchema,
  insertWarrantySchema,
  insertKeyPerformanceInsightSchema,
  User
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import crypto from "crypto";
import MemoryStore from "memorystore";
import bcrypt from "bcryptjs";
import { requireAdmin } from "./admin-middleware";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Setup session
  const SessionStore = MemoryStore(session);
  app.use(
    session({
      cookie: { maxAge: 24 * 60 * 60 * 1000 }, // 24 hours
      store: new SessionStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      resave: false,
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET || "circular-computing-secret",
    })
  );

  // Setup passport
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false, { message: "Incorrect username or password." });
        }

        // Use bcrypt to compare passwords
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          return done(null, false, { message: "Incorrect username or password." });
        }

        // Check if user is active
        if (!user.isActive) {
          return done(null, false, { message: "Your account has been deactivated. Please contact your administrator for assistance." });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    })
  );

  passport.serializeUser((user: Express.User, done) => {
    done(null, (user as User).id);
  });

  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });

  // Authentication middleware
  const isAuthenticated = (req: Request, res: Response, next: Function) => {
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: "Unauthorized" });
  };

  // API Key authentication middleware
  const requireApiKey = async (req: Request, res: Response, next: Function) => {
    try {
      // Check for API key in headers: X-API-Key or Authorization: Bearer <key>
      const apiKey = req.headers['x-api-key'] as string || 
                     (req.headers.authorization?.startsWith('Bearer ') ? 
                      req.headers.authorization.substring(7) : null);
      
      if (!apiKey) {
        console.log(`[API Key Auth] Missing API key for ${req.method} ${req.path}`);
        return res.status(401).json({ 
          success: false,
          error: "API key required. Provide it in X-API-Key header or Authorization: Bearer <key>" 
        });
      }

      const keyPrefix = apiKey.substring(0, 11);
      console.log(`[API Key Auth] Validating key with prefix: ${keyPrefix} for ${req.method} ${req.path}`);

      const validKey = await storage.validateApiKey(apiKey);
      
      if (!validKey) {
        console.log(`[API Key Auth] FAILED - Invalid or expired key with prefix: ${keyPrefix}`);
        return res.status(401).json({ 
          success: false,
          error: "Invalid or expired API key" 
        });
      }

      console.log(`[API Key Auth] SUCCESS - Valid key: ${validKey.name} (ID: ${validKey.id})`);
      // API key is valid, proceed
      next();
    } catch (error) {
      console.error('[API Key Auth] Exception:', error);
      res.status(500).json({ 
        success: false,
        error: "Internal server error" 
      });
    }
  };

  // API Key OR Admin Session authentication middleware
  const requireApiKeyOrAdmin = async (req: Request, res: Response, next: Function) => {
    // Check if user is authenticated via session and is admin
    if (req.isAuthenticated() && req.user && (req.user as User).isAdmin) {
      console.log(`[Auth] Admin session authenticated: ${(req.user as User).username}`);
      return next();
    }

    // Otherwise, check for API key
    try {
      const apiKey = req.headers['x-api-key'] as string || 
                     (req.headers.authorization?.startsWith('Bearer ') ? 
                      req.headers.authorization.substring(7) : null);
      
      if (!apiKey) {
        console.log(`[Auth] No API key or admin session for ${req.method} ${req.path}`);
        return res.status(401).json({ 
          success: false,
          error: "Admin session or API key required. Provide API key in X-API-Key header or Authorization: Bearer <key>" 
        });
      }

      const keyPrefix = apiKey.substring(0, 11);
      console.log(`[API Key Auth] Validating key with prefix: ${keyPrefix} for ${req.method} ${req.path}`);

      const validKey = await storage.validateApiKey(apiKey);
      
      if (!validKey) {
        console.log(`[API Key Auth] FAILED - Invalid or expired key with prefix: ${keyPrefix}`);
        return res.status(401).json({ 
          success: false,
          error: "Invalid or expired API key" 
        });
      }

      console.log(`[API Key Auth] SUCCESS - Valid key: ${validKey.name} (ID: ${validKey.id})`);
      next();
    } catch (error) {
      console.error('[Auth] Exception:', error);
      res.status(500).json({ 
        success: false,
        error: "Internal server error" 
      });
    }
  };

  // Auth routes
  // Registration is disabled - users are created by administrators
  app.post("/api/auth/register", async (req, res) => {
    return res.status(403).json({ 
      message: "Registration is disabled. Please contact your administrator to create an account." 
    });
  });

  app.post("/api/auth/login", passport.authenticate("local"), async (req, res) => {
    const user = req.user as User;
    const { password, ...userWithoutPassword } = user;
    
    try {
      const progress = await storage.getUserProgress(user.id);
      if (!progress) {
        await storage.createUserProgress({
          userId: user.id,
          level: 1,
          experiencePoints: 0,
          totalPoints: 0,
          currentStreak: 0,
          longestStreak: 0,
        });
      }
      
      await storage.updateStreak(user.id);
      
      await storage.createActivityLog({
        userId: user.id,
        activityType: "login",
        description: "User logged in",
        pointsEarned: 10,
      });
      
      await storage.addExperiencePoints(user.id, 10);
    } catch (error) {
      console.error("Error initializing user progress:", error);
    }
    
    res.json(userWithoutPassword);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", isAuthenticated, (req, res) => {
    const user = req.user as User;
    const { password, ...userWithoutPassword } = user;
    console.log("=== /api/auth/me ===");
    console.log("Full user object:", user);
    console.log("isAdmin field:", user?.isAdmin);
    console.log("User without password:", userWithoutPassword);
    console.log("==================");
    res.setHeader('Cache-Control', 'no-store');
    res.json(userWithoutPassword);
  });

  // User routes
  app.get("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/users/:id", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUser = req.user as User;
      
      if (userId !== currentUser.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const userData = req.body;
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Change password endpoint
  app.post("/api/users/:id/change-password", isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const currentUser = req.user as User;
      
      // Users can only change their own password
      if (userId !== currentUser.id) {
        return res.status(403).json({ 
          success: false,
          error: "Forbidden" 
        });
      }
      
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ 
          success: false,
          error: "Current password and new password are required" 
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ 
          success: false,
          error: "New password must be at least 6 characters long" 
        });
      }
      
      const result = await storage.changePassword(userId, currentPassword, newPassword);
      
      if (!result.success) {
        return res.status(400).json(result);
      }
      
      res.json({ 
        success: true,
        message: "Password changed successfully" 
      });
    } catch (error) {
      console.error('Password change error:', error);
      res.status(500).json({ 
        success: false,
        error: "Internal server error" 
      });
    }
  });

  // Order routes
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const orders = await storage.getOrdersByUserId(user.id);
      
      const ordersWithTimeline = await Promise.all(
        orders.map(async (order) => {
          const timeline = await storage.getDeliveryTimeline(order.id);
          
          let currentStatus = order.status;
          let displayDate = order.orderDate;
          let expectedShipping = order.estimatedDelivery;
          
          if (timeline) {
            if (timeline.orderCompleted) {
              currentStatus = 'completed';
              displayDate = timeline.orderCompleted;
            } else if (timeline.dispatchDate) {
              currentStatus = 'shipped';
              displayDate = timeline.dispatchDate;
              expectedShipping = timeline.dispatchDate;
            } else if (timeline.dateFulfilled) {
              currentStatus = 'quality_check';
              displayDate = timeline.dateFulfilled;
            } else if (timeline.sentToWarehouse) {
              currentStatus = 'in_production';
              displayDate = timeline.sentToWarehouse;
            } else if (timeline.paymentDate) {
              currentStatus = 'processing';
              displayDate = timeline.paymentDate;
            } else if (timeline.orderDate) {
              currentStatus = 'placed';
              displayDate = timeline.orderDate;
            }
          }
          
          return {
            ...order,
            timelineStatus: currentStatus,
            timelineDate: displayDate,
            timelineExpectedShipping: expectedShipping,
            deliveryTimeline: timeline,
          };
        })
      );
      
      res.json(ordersWithTimeline);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    try {
      const order = await storage.getOrder(parseInt(req.params.id));
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const user = req.user as User;
      if (order.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/orders", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId: user.id,
      });
      
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Order items routes
  app.get("/api/orders/:orderId/items", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const user = req.user as User;
      if (order.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const items = await storage.getOrderItems(orderId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/orders/:orderId/items", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const user = req.user as User;
      if (order.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const itemData = insertOrderItemSchema.parse({
        ...req.body,
        orderId,
      });
      
      const item = await storage.createOrderItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Order updates routes
  app.get("/api/orders/:orderId/updates", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const user = req.user as User;
      if (order.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const updates = await storage.getOrderUpdates(orderId);
      res.json(updates);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get delivery timeline for an order
  app.get("/api/orders/:orderId/timeline", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const user = req.user as User;
      if (order.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const timeline = await storage.getDeliveryTimeline(orderId);
      res.json(timeline || {});
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Environmental impact routes
  app.get("/api/impact", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const impact = await storage.getTotalEnvironmentalImpact(user.id);
      res.json(impact);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/impact/order/:orderId", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      const user = req.user as User;
      if (order.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const impact = await storage.getEnvironmentalImpactByOrderId(orderId);
      if (!impact) {
        return res.status(404).json({ message: "Impact not found" });
      }
      
      res.json(impact);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get monthly impact trends
  app.get("/api/impact/trends", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const orders = await storage.getOrdersByUserId(user.id);
      
      // Group impacts by month based on dispatch date from delivery timeline
      const monthlyData: Record<string, any> = {};
      const now = new Date();
      
      // Initialize last 6 months with zero values
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = date.toLocaleString('default', { month: 'short' });
        monthlyData[monthKey] = {
          name: monthKey,
          carbon: 0,
          water: 0,
          minerals: 0,
        };
      }
      
      // Process each order and group by dispatch date from timeline
      for (const order of orders) {
        const timeline = await storage.getDeliveryTimeline(order.id);
        const impact = await storage.getEnvironmentalImpactByOrderId(order.id);
        
        if (timeline?.dispatchDate && impact) {
          const dispatchDate = new Date(timeline.dispatchDate);
          const monthKey = dispatchDate.toLocaleString('default', { month: 'short' });
          
          if (monthlyData[monthKey]) {
            monthlyData[monthKey].carbon += (impact.carbonSaved / 1000); // Convert to kg
            monthlyData[monthKey].water += impact.waterProvided;
            monthlyData[monthKey].minerals += impact.mineralsSaved;
          }
        }
      }
      
      // Calculate cumulative values
      const months = Object.keys(monthlyData);
      let cumulativeCarbon = 0;
      let cumulativeWater = 0;
      let cumulativeMinerals = 0;
      
      const cumulativeData = months.map(month => {
        cumulativeCarbon += monthlyData[month].carbon;
        cumulativeWater += monthlyData[month].water;
        cumulativeMinerals += monthlyData[month].minerals;
        
        return {
          name: month,
          carbon: Math.round(cumulativeCarbon),
          water: Math.round(cumulativeWater),
          minerals: Math.round(cumulativeMinerals),
        };
      });
      
      res.json(cumulativeData);
    } catch (error) {
      console.error("Error fetching impact trends:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get water projects grouped by region
  app.get("/api/impact/water-by-region", isAuthenticated, async (req, res) => {
    try {
      const waterProjects = await storage.getWaterProjects();
      
      // Group by location/region
      const regionData: Record<string, number> = {};
      
      waterProjects.forEach(project => {
        const region = project.location;
        if (!regionData[region]) {
          regionData[region] = 0;
        }
        regionData[region] += project.waterProvided;
      });
      
      // Convert to array format for charts
      const chartData = Object.keys(regionData).map(region => ({
        name: region,
        water: regionData[region],
      }));
      
      res.json(chartData);
    } catch (error) {
      console.error("Error fetching water by region:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get impact equivalents (relatable comparisons)
  app.get("/api/impact/equivalents", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const impact = await storage.getTotalEnvironmentalImpact(user.id);
      
      if (!impact) {
        return res.json([]);
      }
      
      const carbonKg = impact.carbonSaved / 1000; // Convert grams to kg
      
      // Fetch configured equivalency settings from database
      const settings = await storage.getActiveImpactEquivalencySettings();
      
      // Calculate equivalents based on configured settings
      const equivalents = settings.map(setting => {
        let value: number;
        const conversionFactor = parseFloat(setting.conversionFactor.toString());
        
        // Calculate value based on operation type
        if (setting.conversionOperation === 'divide') {
          value = Math.round(carbonKg / conversionFactor);
        } else {
          value = Math.round(carbonKg * conversionFactor);
        }
        
        return {
          name: setting.name,
          value: value,
          icon: setting.icon,
          description: `${value} ${setting.description}`,
          color: setting.color
        };
      });
      
      res.json(equivalents);
    } catch (error) {
      console.error("Error fetching impact equivalents:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get impact by order
  app.get("/api/impact/by-order", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const impacts = await storage.getEnvironmentalImpactByUserId(user.id);
      
      // Get orders for this user
      const orders = await storage.getOrdersByUserId(user.id);
      
      // Map ALL impacts to orders with calculated total impact score
      const orderImpacts = await Promise.all(
        impacts.map(async (impact) => {
          const order = impact.orderId 
            ? orders.find(o => o.id === impact.orderId)
            : null;
          
          // Get dispatch date from delivery timeline
          let displayDate = order?.orderDate || impact.createdAt;
          if (order) {
            const timeline = await storage.getDeliveryTimeline(order.id);
            if (timeline?.dispatchDate) {
              displayDate = timeline.dispatchDate;
            }
          }
          
          const carbonKg = impact.carbonSaved / 1000; // Convert to kg
          const mineralsKg = impact.mineralsSaved / 1000; // Convert to kg
          
          // Calculate normalized total impact score
          // Weight carbon and minerals more heavily than water
          const totalImpact = (carbonKg * 10) + (impact.waterProvided / 10) + (mineralsKg * 5);
          
          return {
            orderNumber: order?.orderNumber || 'N/A',
            orderDate: displayDate,
            carbonSaved: carbonKg,
            waterProvided: impact.waterProvided,
            mineralsSaved: mineralsKg,
            totalImpact: totalImpact
          };
        })
      );
      
      // Sort by total impact descending, then take top 10
      orderImpacts.sort((a, b) => b.totalImpact - a.totalImpact);
      const topOrders = orderImpacts.slice(0, 10);
      
      res.json(topOrders);
    } catch (error) {
      console.error("Error fetching impact by order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin: Impact Equivalency Settings routes
  app.get("/api/admin/impact-equivalency-settings", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      
      const settings = await storage.getAllImpactEquivalencySettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching impact equivalency settings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/impact-equivalency-settings", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      
      const setting = await storage.createImpactEquivalencySetting(req.body);
      res.status(201).json(setting);
    } catch (error) {
      console.error("Error creating impact equivalency setting:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/impact-equivalency-settings/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      
      const id = parseInt(req.params.id);
      const updated = await storage.updateImpactEquivalencySetting(id, req.body);
      
      if (!updated) {
        return res.status(404).json({ message: "Setting not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating impact equivalency setting:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/impact-equivalency-settings/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      
      const id = parseInt(req.params.id);
      await storage.deleteImpactEquivalencySetting(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting impact equivalency setting:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin: ESG Measurement Parameters routes
  app.get("/api/admin/esg-parameters", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      
      const parameters = await storage.getAllEsgMeasurementParameters();
      res.json(parameters);
    } catch (error) {
      console.error("Error fetching ESG measurement parameters:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/esg-parameters", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      
      const parameter = await storage.createEsgMeasurementParameter(req.body);
      res.status(201).json(parameter);
    } catch (error) {
      console.error("Error creating ESG measurement parameter:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put("/api/admin/esg-parameters/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      
      const id = parseInt(req.params.id);
      const updated = await storage.updateEsgMeasurementParameter(id, req.body);
      
      if (!updated) {
        return res.status(404).json({ message: "Parameter not found" });
      }
      
      // Recalculate environmental impact for all existing orders with updated parameters
      const recalcResult = await storage.recalculateAllEnvironmentalImpact();
      console.log(`Recalculated environmental impact after ESG parameter update: ${recalcResult.updated} orders updated, ${recalcResult.errors} errors`);
      
      res.json({
        parameter: updated,
        recalculated: recalcResult
      });
    } catch (error) {
      console.error("Error updating ESG measurement parameter:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/esg-parameters/:id", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      if (!user.isAdmin) {
        return res.status(403).json({ message: "Forbidden: Admin access required" });
      }
      
      const id = parseInt(req.params.id);
      await storage.deleteEsgMeasurementParameter(id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting ESG measurement parameter:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // RMA routes
  app.get("/api/rma", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const rmas = await storage.getRmasByUserId(user.id);
      
      // Fetch items for each RMA to match frontend RmaWithItems structure
      const rmasWithItems = await Promise.all(
        rmas.map(async (rma) => {
          const items = await storage.getRmaItems(rma.id);
          return { rma, items };
        })
      );
      
      res.json(rmasWithItems);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all RMA request logs for the authenticated user
  app.get("/api/rma-requests", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const requestLogs = await storage.getRmaRequestLogsByUserId(user.id);
      res.json(requestLogs);
    } catch (error) {
      console.error("Error fetching RMA request logs:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get specific RMA request log by request number
  app.get("/api/rma-request/:requestNumber", isAuthenticated, async (req, res) => {
    try {
      const requestNumber = req.params.requestNumber;
      const requestLog = await storage.getRmaRequestLogByNumber(requestNumber);
      
      if (!requestLog) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      const user = req.user as User;
      if (requestLog.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(requestLog);
    } catch (error) {
      console.error("Error fetching RMA request log:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/rma/:rmaNumber", isAuthenticated, async (req, res) => {
    try {
      const rmaNumber = req.params.rmaNumber;
      const rmaWithItems = await storage.getRmaWithItems(rmaNumber);
      
      if (!rmaWithItems) {
        return res.status(404).json({ message: "RMA not found" });
      }
      
      const user = req.user as User;
      if (rmaWithItems.rma.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(rmaWithItems);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // New warranty claim RMA endpoint (from warranty claim form)
  // This creates a request log and sends email, but doesn't create actual RMA yet
  app.post("/api/rmas", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      
      const warrantyClaimSchema = z.object({
        fullName: z.string(),
        companyName: z.string(),
        email: z.string().email(),
        phone: z.string(),
        address: z.string(),
        deliveryAddress: z.string(),
        recipientContactNumber: z.string(),
        countryOfPurchase: z.string(),
        products: z.array(z.object({
          productMakeModel: z.string(),
          manufacturerSerialNumber: z.string(),
          inHouseSerialNumber: z.string(),
          faultDescription: z.string(),
        })).min(1),
        consent: z.boolean(),
        userId: z.number().optional(),
        emailChanged: z.boolean().optional(),
        trackWithCurrentUser: z.boolean().optional(),
        fileAttachment: z.object({
          name: z.string(),
          size: z.number(),
          type: z.string(),
        }).nullable().optional(),
      });
      
      const validatedData = warrantyClaimSchema.parse(req.body);
      
      // Determine which user ID to use for the request
      let targetUserId = user.id;
      let newUserCreated = false;
      
      // If email changed and user doesn't want to track with current account
      if (validatedData.emailChanged && !validatedData.trackWithCurrentUser) {
        // Create pending user for new email (requires admin approval)
        try {
          const newUser = await storage.createUser({
            username: validatedData.email,
            password: 'PENDING_APPROVAL', // Placeholder - will need to be set by admin
            name: validatedData.fullName,
            company: validatedData.companyName,
            email: validatedData.email,
            phoneNumber: validatedData.phone,
            isAdmin: false,
            isActive: false, // Inactive until approved
            notificationPreferences: {
              orderUpdates: true,
              environmentalImpact: true,
              charityUpdates: true,
              serviceReminders: true,
            },
          });
          
          targetUserId = newUser.id;
          newUserCreated = true;
          
          console.log(`New user created (pending approval): ${validatedData.email} for RMA request`);
        } catch (userError) {
          console.error('Failed to create new user:', userError);
          return res.status(500).json({ message: "Failed to create new user account" });
        }
      }
      
      // Generate request number
      const requestNumber = `REQ-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // For backward compatibility, use first product for old fields
      const firstProduct = validatedData.products[0];
      
      // Create RMA request log with initial status "submitted"
      let requestLog = await storage.createRmaRequestLog({
        userId: targetUserId,
        requestNumber,
        fullName: validatedData.fullName,
        companyName: validatedData.companyName,
        email: validatedData.email,
        phone: validatedData.phone,
        address: validatedData.address,
        deliveryAddress: validatedData.deliveryAddress,
        recipientContactNumber: validatedData.recipientContactNumber,
        countryOfPurchase: validatedData.countryOfPurchase,
        numberOfProducts: validatedData.products.length,
        productMakeModel: firstProduct.productMakeModel,
        manufacturerSerialNumber: firstProduct.manufacturerSerialNumber,
        inHouseSerialNumber: firstProduct.inHouseSerialNumber,
        faultDescription: firstProduct.faultDescription,
        products: validatedData.products,
        fileAttachment: validatedData.fileAttachment || null,
        status: "submitted",
        rmaNumber: null,
        declineReason: null,
        processedAt: null,
      });
      
      // Send notifications synchronously to determine final status
      let webhookSuccess = false;
      let finalStatus: "submitted" | "approved" = "submitted";
      
      try {
        // Get admin settings to check for webhook configuration
        const adminSettings = await storage.getSystemSetting('admin_portal');
        const hasWebhook = !!adminSettings?.settingValue?.rmaWebhookUrl;
        
        // Import email helpers in case we need them (for fallback or when no webhook)
        const { sendRmaNotification, sendNewUserNotification } = await import('./email-service.js');
        
        if (hasWebhook) {
          // Try webhook first
          try {
            const webhookResult = await sendRmaWebhookNotification(requestLog);
            webhookSuccess = webhookResult.success;
            
            // If webhook succeeds, mark as approved
            if (webhookSuccess) {
              finalStatus = "approved";
              console.log(`✅ Webhook succeeded - RMA request ${requestNumber} marked as approved`);
            } else {
              console.error('Webhook notification failed - RMA request remains as submitted');
            }
          } catch (webhookError) {
            console.error('Webhook notification error - RMA request remains as submitted:', webhookError);
          }
        }
        
        // Send email notifications if:
        // 1. No webhook configured, OR
        // 2. Webhook failed
        if (!hasWebhook || !webhookSuccess) {
          // Send RMA request notification
          if (adminSettings?.settingValue?.rmaNotificationEmails) {
            const firstProduct = validatedData.products[0];
            await sendRmaNotification(
              adminSettings.settingValue.rmaNotificationEmails,
              {
                rmaNumber: requestLog.requestNumber,
                customerName: validatedData.fullName,
                customerEmail: validatedData.email,
                productDetails: firstProduct.productMakeModel,
                serialNumber: firstProduct.manufacturerSerialNumber,
                faultDescription: firstProduct.faultDescription,
              }
            );
          }
          
          // Send new user notification if applicable
          if (newUserCreated && adminSettings?.settingValue?.newUserAlertEmails) {
            await sendNewUserNotification(
              adminSettings.settingValue.newUserAlertEmails,
              {
                userName: validatedData.fullName,
                userEmail: validatedData.email,
                userCompany: validatedData.companyName,
                rmaNumber: requestLog.requestNumber,
              }
            );
          }
        }
      } catch (notificationError) {
        console.error('Failed to send notifications:', notificationError);
        // Don't fail the request if notification sending fails
      }
      
      // Update RMA request status based on webhook result
      if (finalStatus === "approved") {
        const updatedLog = await storage.updateRmaRequestLog(requestLog.id, { status: "approved" });
        if (updatedLog) {
          requestLog = updatedLog;
        }
      }
      
      // Return request log (not an RMA)
      res.status(201).json({
        requestNumber: requestLog.requestNumber,
        status: requestLog.status,
        createdAt: requestLog.createdAt,
        message: "Your warranty claim request has been submitted successfully. You will be notified once it is reviewed.",
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Warranty claim RMA creation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/rma", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const { email, serials, status } = req.body;
      
      // Validate request structure
      const rmaRequestSchema = z.object({
        email: z.string().email(),
        status: z.string().optional(),
        serials: z.array(z.object({
          SerialNumber: z.string().min(1, "Serial number is required"),
          ErrorDescription: z.string().min(1, "Error description is required"),
          ReceivedAtWarehouseOn: z.string().nullable().optional(),
          Solution: z.string().optional(),
          ReasonForReturn: z.string().min(1, "Reason for return is required"),
          ProductDetails: z.string().min(1, "Product details are required"),
          RelatedOrder: z.string().nullable().optional(),
        })).min(1, "At least one serial is required"),
      });
      
      const validatedData = rmaRequestSchema.parse(req.body);
      
      // Generate RMA number
      const rmaNumber = `RMA-${Math.floor(10000 + Math.random() * 90000)}`;
      
      // Create RMA
      const rmaData = insertRmaSchema.parse({
        userId: user.id,
        rmaNumber,
        email: validatedData.email,
        status: validatedData.status || "requested",
      });
      
      const rma = await storage.createRma(rmaData);
      
      // Create RMA items (serials) - wrapped for atomicity
      try {
        for (const serial of validatedData.serials) {
          await storage.createRmaItem({
            rmaId: rma.id,
            serialNumber: serial.SerialNumber,
            errorDescription: serial.ErrorDescription,
            receivedAtWarehouseOn: serial.ReceivedAtWarehouseOn ? new Date(serial.ReceivedAtWarehouseOn) : null,
            solution: serial.Solution || "Pending",
            reasonForReturn: serial.ReasonForReturn,
            productDetails: serial.ProductDetails,
            relatedOrder: serial.RelatedOrder || null,
          });
        }
      } catch (itemError) {
        // If items creation fails, delete the RMA to avoid orphan records
        await storage.deleteRma(rma.id);
        throw itemError;
      }
      
      // Return RMA with items
      const rmaWithItems = await storage.getRmaWithItems(rma.rmaNumber);
      res.status(201).json(rmaWithItems);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("RMA creation error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Water project routes
  app.get("/api/water-projects", async (req, res) => {
    try {
      const projects = await storage.getWaterProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/water-projects/:id", async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const project = await storage.getWaterProject(projectId);
      
      if (!project) {
        return res.status(404).json({ message: "Water project not found" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Support ticket routes
  app.get("/api/support-tickets", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const tickets = await storage.getSupportTicketsByUserId(user.id);
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/support-tickets/:id", isAuthenticated, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      const ticket = await storage.getSupportTicket(ticketId);
      
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      const user = req.user as User;
      if (ticket.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/support-tickets", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const ticketData = insertSupportTicketSchema.parse({
        ...req.body,
        userId: user.id,
      });
      
      const ticket = await storage.createSupportTicket(ticketData);
      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Case study routes
  app.get("/api/case-studies", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const caseStudies = await storage.getCaseStudiesByUserId(user.id);
      res.json(caseStudies);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/case-studies", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const caseStudyData = insertCaseStudySchema.parse({
        ...req.body,
        userId: user.id,
      });
      
      const caseStudy = await storage.createCaseStudy(caseStudyData);
      res.status(201).json(caseStudy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delivery timeline routes
  app.get("/api/delivery-timeline/:orderId", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const timeline = await storage.getDeliveryTimeline(orderId);
      
      if (!timeline) {
        return res.status(404).json({ message: "Timeline not found" });
      }
      
      res.json(timeline);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/delivery-timeline", isAuthenticated, async (req, res) => {
    try {
      const timelineData = insertDeliveryTimelineSchema.parse(req.body);
      const timeline = await storage.createDeliveryTimeline(timelineData);
      res.status(201).json(timeline);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/delivery-timeline/:orderId", isAuthenticated, async (req, res) => {
    try {
      const orderId = parseInt(req.params.orderId);
      const updateData = req.body;
      
      const timeline = await storage.updateDeliveryTimeline(orderId, updateData);
      
      if (!timeline) {
        return res.status(404).json({ message: "Timeline not found" });
      }
      
      res.json(timeline);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });


  // ============================================
  // External CRUD API Routes with Filtering
  // ============================================
  // Note: These routes are designed for external access with comprehensive filtering options

  // Users API
  app.get("/api/crud/users", requireAdmin, async (req, res) => {
    try {
      const { email, name, company } = req.query;
      
      if (email || name || company) {
        const users = await storage.searchUsers({
          email: email as string,
          name: name as string,
          company: company as string
        });
        return res.json(users.map(u => {
          const { password, ...userWithoutPassword } = u;
          return userWithoutPassword;
        }));
      }
      
      const users = await storage.getAllUsers();
      res.json(users.map(u => {
        const { password, ...userWithoutPassword } = u;
        return userWithoutPassword;
      }));
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/crud/users/:id", requireAdmin, async (req, res) => {
    try {
      const user = await storage.getUser(parseInt(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/crud/users", requireAdmin, async (req, res) => {
    try {
      const validated = insertUserSchema.parse(req.body);
      const user = await storage.createUser(validated);
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/crud/users/:id", requireAdmin, async (req, res) => {
    try {
      const user = await storage.updateUser(parseInt(req.params.id), req.body);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/crud/users/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteUser(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Orders API
  app.get("/api/crud/orders", requireAdmin, async (req, res) => {
    try {
      const { orderNumber, userId, status } = req.query;
      
      if (orderNumber || userId || status) {
        const orders = await storage.searchOrders({
          orderNumber: orderNumber as string,
          userId: userId ? parseInt(userId as string) : undefined,
          status: status as string
        });
        return res.json(orders);
      }
      
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/crud/orders/:id", requireAdmin, async (req, res) => {
    try {
      const order = await storage.getOrder(parseInt(req.params.id));
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/crud/orders", requireAdmin, async (req, res) => {
    try {
      const validated = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validated);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/crud/orders/:id", requireAdmin, async (req, res) => {
    try {
      const order = await storage.updateOrder(parseInt(req.params.id), req.body);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/crud/orders/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteOrder(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Order Items API
  app.get("/api/crud/order-items", requireAdmin, async (req, res) => {
    try {
      const { orderId } = req.query;
      
      if (!orderId) {
        return res.status(400).json({ message: "orderId query parameter is required" });
      }
      
      const items = await storage.getOrderItems(parseInt(orderId as string));
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/crud/order-items", requireAdmin, async (req, res) => {
    try {
      const validated = insertOrderItemSchema.parse(req.body);
      const item = await storage.createOrderItem(validated);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // RMAs API
  app.get("/api/crud/rmas", requireAdmin, async (req, res) => {
    try {
      const { rmaNumber, userId, status } = req.query;
      
      if (rmaNumber || userId || status) {
        const rmas = await storage.searchRmas({
          rmaNumber: rmaNumber as string,
          userId: userId ? parseInt(userId as string) : undefined,
          status: status as string
        });
        return res.json(rmas);
      }
      
      const rmas = await storage.getAllRmas();
      res.json(rmas);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/crud/rmas/:id", requireAdmin, async (req, res) => {
    try {
      const rma = await storage.getRma(parseInt(req.params.id));
      if (!rma) {
        return res.status(404).json({ message: "RMA not found" });
      }
      res.json(rma);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/crud/rmas", requireAdmin, async (req, res) => {
    try {
      const validated = insertRmaSchema.parse(req.body);
      const rma = await storage.createRma(validated);
      res.status(201).json(rma);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/crud/rmas/:id", requireAdmin, async (req, res) => {
    try {
      const rma = await storage.updateRma(parseInt(req.params.id), req.body);
      if (!rma) {
        return res.status(404).json({ message: "RMA not found" });
      }
      res.json(rma);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/crud/rmas/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteRma(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Support Tickets API
  app.get("/api/crud/support-tickets", requireAdmin, async (req, res) => {
    try {
      const { ticketNumber, userId, status } = req.query;
      
      if (ticketNumber || userId || status) {
        const tickets = await storage.searchSupportTickets({
          ticketNumber: ticketNumber as string,
          userId: userId ? parseInt(userId as string) : undefined,
          status: status as string
        });
        return res.json(tickets);
      }
      
      const tickets = await storage.getAllSupportTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/crud/support-tickets/:id", requireAdmin, async (req, res) => {
    try {
      const ticket = await storage.getSupportTicket(parseInt(req.params.id));
      if (!ticket) {
        return res.status(404).json({ message: "Support ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/crud/support-tickets", requireAdmin, async (req, res) => {
    try {
      const validated = insertSupportTicketSchema.parse(req.body);
      const ticket = await storage.createSupportTicket(validated);
      res.status(201).json(ticket);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/crud/support-tickets/:id", requireAdmin, async (req, res) => {
    try {
      const ticket = await storage.updateSupportTicket(parseInt(req.params.id), req.body);
      if (!ticket) {
        return res.status(404).json({ message: "Support ticket not found" });
      }
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/crud/support-tickets/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteSupportTicket(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Environmental Impact API
  app.get("/api/crud/environmental-impact", requireAdmin, async (req, res) => {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ message: "userId query parameter is required" });
      }
      
      const impacts = await storage.getEnvironmentalImpactByUserId(parseInt(userId as string));
      res.json(impacts);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/crud/environmental-impact", requireAdmin, async (req, res) => {
    try {
      const validated = insertEnvironmentalImpactSchema.parse(req.body);
      const impact = await storage.createEnvironmentalImpact(validated);
      res.status(201).json(impact);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Water Projects API
  app.get("/api/crud/water-projects", requireAdmin, async (req, res) => {
    try {
      const projects = await storage.getWaterProjects();
      res.json(projects);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/crud/water-projects/:id", requireAdmin, async (req, res) => {
    try {
      const project = await storage.getWaterProject(parseInt(req.params.id));
      if (!project) {
        return res.status(404).json({ message: "Water project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/crud/water-projects", requireAdmin, async (req, res) => {
    try {
      const validated = insertWaterProjectSchema.parse(req.body);
      const project = await storage.createWaterProject(validated);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/crud/water-projects/:id", requireAdmin, async (req, res) => {
    try {
      const project = await storage.updateWaterProject(parseInt(req.params.id), req.body);
      if (!project) {
        return res.status(404).json({ message: "Water project not found" });
      }
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/crud/water-projects/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteWaterProject(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delivery Timelines API
  app.get("/api/crud/delivery-timelines", requireAdmin, async (req, res) => {
    try {
      const { orderId } = req.query;
      
      if (!orderId) {
        return res.status(400).json({ message: "orderId query parameter is required" });
      }
      
      const timeline = await storage.getDeliveryTimeline(parseInt(orderId as string));
      res.json(timeline);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/crud/delivery-timelines", requireAdmin, async (req, res) => {
    try {
      const validated = insertDeliveryTimelineSchema.parse(req.body);
      const timeline = await storage.createDeliveryTimeline(validated);
      res.status(201).json(timeline);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/crud/delivery-timelines/:orderId", requireAdmin, async (req, res) => {
    try {
      const timeline = await storage.updateDeliveryTimeline(parseInt(req.params.orderId), req.body);
      if (!timeline) {
        return res.status(404).json({ message: "Delivery timeline not found" });
      }
      res.json(timeline);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ====================
  // GAMIFICATION ROUTES
  // ====================

  // Achievement Routes
  app.get("/api/gamification/achievements", isAuthenticated, async (req, res) => {
    try {
      const achievements = await storage.getAllAchievements();
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/gamification/achievements/:id", isAuthenticated, async (req, res) => {
    try {
      const achievement = await storage.getAchievement(parseInt(req.params.id));
      if (!achievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      res.json(achievement);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/gamification/achievements", requireAdmin, async (req, res) => {
    try {
      const validated = insertAchievementSchema.parse(req.body);
      const achievement = await storage.createAchievement(validated);
      res.status(201).json(achievement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/gamification/achievements/:id", requireAdmin, async (req, res) => {
    try {
      const achievement = await storage.updateAchievement(parseInt(req.params.id), req.body);
      if (!achievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      res.json(achievement);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/gamification/achievements/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteAchievement(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User Achievement Routes
  app.get("/api/gamification/user-achievements", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const userAchievements = await storage.getUserAchievementWithDetails(user.id);
      res.json(userAchievements);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/gamification/user-achievements/unlock", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      
      const unlockSchema = z.object({
        achievementId: z.number().int().positive(),
      });
      
      const validated = unlockSchema.parse(req.body);
      const { achievementId } = validated;
      
      const achievement = await storage.getAchievement(achievementId);
      if (!achievement) {
        return res.status(404).json({ message: "Achievement not found" });
      }
      
      const hasIt = await storage.hasAchievement(user.id, achievementId);
      if (hasIt) {
        return res.status(400).json({ message: "Achievement already unlocked" });
      }

      const unlocked = await storage.unlockAchievement(user.id, achievementId);
      
      await storage.addExperiencePoints(user.id, achievement.points);
      await storage.createActivityLog({
        userId: user.id,
        activityType: "achievement_unlocked",
        description: `Unlocked achievement: ${achievement.name}`,
        pointsEarned: achievement.points,
      });

      res.status(201).json(unlocked);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Milestone Routes
  app.get("/api/gamification/milestones", isAuthenticated, async (req, res) => {
    try {
      const milestones = await storage.getAllMilestones();
      res.json(milestones);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/gamification/milestones", requireAdmin, async (req, res) => {
    try {
      const validated = insertMilestoneSchema.parse(req.body);
      const milestone = await storage.createMilestone(validated);
      res.status(201).json(milestone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/gamification/milestones/:id", requireAdmin, async (req, res) => {
    try {
      const milestone = await storage.updateMilestone(parseInt(req.params.id), req.body);
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }
      res.json(milestone);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/gamification/milestones/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteMilestone(parseInt(req.params.id));
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // User Progress Routes
  app.get("/api/gamification/user-progress", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      let progress = await storage.getUserProgress(user.id);
      
      if (!progress) {
        progress = await storage.createUserProgress({
          userId: user.id,
          level: 1,
          experiencePoints: 0,
          totalPoints: 0,
          currentStreak: 0,
          longestStreak: 0,
        });
      }
      
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/gamification/user-progress/add-points", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const { points } = req.body;
      
      if (!points || points <= 0) {
        return res.status(400).json({ message: "Points must be a positive number" });
      }
      
      const progress = await storage.addExperiencePoints(user.id, points);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/gamification/user-progress/update-streak", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const progress = await storage.updateStreak(user.id);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Activity Log Routes
  app.get("/api/gamification/activity-log", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const activities = await storage.getActivityLog(user.id, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/gamification/activity-log", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const validated = insertActivityLogSchema.parse({
        ...req.body,
        userId: user.id,
      });
      const log = await storage.createActivityLog(validated);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/gamification/recent-activity", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const days = req.query.days ? parseInt(req.query.days as string) : 7;
      const activities = await storage.getRecentActivity(user.id, days);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ==================== ADMIN SETTINGS ====================
  // Admin portal configuration settings

  // Get admin settings (visible tabs and notification emails)
  app.get("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const setting = await storage.getSystemSetting('admin_portal');
      
      // Default settings if none exist
      const defaultSettings = {
        visibleTabs: ['users', 'orders', 'rmas', 'tickets', 'water-projects', 'case-studies', 'gamification', 'api-keys', 'sustainability', 'key-insights', 'esg-targets', 'theme', 'connection'],
        rmaNotificationEmails: [],
        newUserAlertEmails: [],
      };

      const settings = setting?.settingValue || defaultSettings;
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Save admin settings
  app.post("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const settingsSchema = z.object({
        visibleTabs: z.array(z.string()),
        rmaNotificationEmails: z.array(z.string().email()),
        newUserAlertEmails: z.array(z.string().email()),
        documentDownloadApiUrl: z.string().url().regex(/^https:\/\//, "URL must use HTTPS protocol").optional(),
        rmaWebhookUrl: z.string().url().regex(/^https:\/\//, "URL must use HTTPS protocol").optional(),
      });

      const validatedSettings = settingsSchema.parse(req.body);
      
      await storage.setSystemSetting('admin_portal', validatedSettings);
      
      res.json({
        success: true,
        message: "Settings saved successfully",
        settings: validatedSettings,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin User Management
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const createSchema = z.object({
        username: z.string().min(1),
        password: z.string().min(6),
        name: z.string().min(1),
        company: z.string().min(1),
        email: z.string().email(),
        phoneNumber: z.string().nullable().optional(),
        isAdmin: z.boolean().default(false),
      });

      const validatedData = createSchema.parse(req.body);
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      const newUser = await storage.createUser({
        ...validatedData,
        password: hashedPassword,
        isActive: true,
      });

      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updateSchema = z.object({
        isActive: z.boolean().optional(),
        isAdmin: z.boolean().optional(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        company: z.string().optional(),
        phoneNumber: z.string().nullable().optional(),
        username: z.string().optional(),
        password: z.string().optional(),
      });

      const validatedData = updateSchema.parse(req.body);
      
      // Hash password if provided
      if (validatedData.password) {
        const hashedPassword = await bcrypt.hash(validatedData.password, 10);
        validatedData.password = hashedPassword;
      }

      const updatedUser = await storage.updateUser(userId, validatedData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin Order Management
  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const allOrders = await storage.getAllOrders();
      res.json(allOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/orders/:id", requireAdmin, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      const updateSchema = z.object({
        status: z.string().optional(),
        userId: z.number().optional(),
        isActive: z.boolean().optional(),
      });

      const validatedData = updateSchema.parse(req.body);
      const updatedOrder = await storage.updateOrder(orderId, validatedData);
      
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }

      res.json(updatedOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating order:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin RMA Management
  app.get("/api/admin/rmas", requireAdmin, async (req, res) => {
    try {
      const allRmas = await storage.getAllRmas();
      res.json(allRmas);
    } catch (error) {
      console.error("Error fetching RMAs:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/rmas/:id", requireAdmin, async (req, res) => {
    try {
      const rmaId = parseInt(req.params.id);
      const updateSchema = z.object({
        status: z.enum(["requested", "approved", "in_transit", "received", "processing", "completed", "rejected"]).optional(),
        userId: z.number().optional(),
      });

      const validatedData = updateSchema.parse(req.body);
      const updatedRma = await storage.updateRma(rmaId, validatedData);
      
      if (!updatedRma) {
        return res.status(404).json({ message: "RMA not found" });
      }

      res.json(updatedRma);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating RMA:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/rmas/:id/resend", requireAdmin, async (req, res) => {
    try {
      const rmaId = parseInt(req.params.id);
      const rma = await storage.getRma(rmaId);
      
      if (!rma) {
        return res.status(404).json({ message: "RMA not found" });
      }

      // TODO: Implement actual email sending logic
      // For now, just return success
      res.json({ 
        success: true, 
        message: "RMA notification resent successfully",
        rmaNumber: rma.rmaNumber 
      });
    } catch (error) {
      console.error("Error resending RMA:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/rmas/:id/decline", requireAdmin, async (req, res) => {
    try {
      const rmaId = parseInt(req.params.id);
      const updatedRma = await storage.updateRma(rmaId, { status: "rejected" });
      
      if (!updatedRma) {
        return res.status(404).json({ message: "RMA not found" });
      }

      res.json({
        success: true,
        message: "RMA declined successfully",
        rma: updatedRma
      });
    } catch (error) {
      console.error("Error declining RMA:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin RMA Request Logs Management
  app.get("/api/admin/rma-requests", requireAdmin, async (req, res) => {
    try {
      const allRequests = await storage.getAllRmaRequestLogs();
      res.json(allRequests);
    } catch (error) {
      console.error("Error fetching RMA requests:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/rma-requests/:id", requireAdmin, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const updateSchema = z.object({
        status: z.enum(["submitted", "approved", "declined"]).optional(),
        declineReason: z.string().optional(),
      });

      const validatedData = updateSchema.parse(req.body);
      const updatedRequest = await storage.updateRmaRequestLog(requestId, validatedData);
      
      if (!updatedRequest) {
        return res.status(404).json({ message: "RMA request not found" });
      }

      res.json(updatedRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      console.error("Error updating RMA request:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Helper function to send RMA webhook notifications
  async function sendRmaWebhookNotification(request: any): Promise<{ success: boolean; error?: string }> {
    try {
      // Get RMA webhook URL from settings
      const setting = await storage.getSystemSetting('admin_portal');
      const webhookUrl = setting?.settingValue?.rmaWebhookUrl;

      if (!webhookUrl) {
        console.log("No RMA webhook URL configured, skipping webhook notification");
        return { success: false, error: "No webhook URL configured" };
      }

      // Validate webhook URL is HTTPS
      try {
        const url = new URL(webhookUrl);
        if (url.protocol !== 'https:') {
          console.error("RMA webhook URL must use HTTPS protocol");
          return { success: false, error: "Webhook URL must use HTTPS" };
        }
      } catch (error) {
        console.error("Invalid RMA webhook URL configured");
        return { success: false, error: "Invalid webhook URL" };
      }

      // Prepare the webhook payload with complete RMA request details
      const webhookPayload = {
        requestId: request.id,
        requestNumber: request.requestNumber,
        fullName: request.fullName,
        companyName: request.companyName,
        email: request.email,
        phone: request.phone,
        address: request.address,
        deliveryAddress: request.deliveryAddress,
        recipientContactNumber: request.recipientContactNumber,
        countryOfPurchase: request.countryOfPurchase,
        numberOfProducts: request.numberOfProducts,
        products: request.products || [{
          productMakeModel: request.productMakeModel,
          manufacturerSerialNumber: request.manufacturerSerialNumber,
          inHouseSerialNumber: request.inHouseSerialNumber,
          faultDescription: request.faultDescription,
        }],
        status: request.status,
        createdAt: request.createdAt,
        timestamp: new Date().toISOString()
      };

      // Send HTTP POST request to webhook
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Circular-Computing-Portal/1.0'
        },
        body: JSON.stringify(webhookPayload)
      });

      if (!webhookResponse.ok) {
        console.error("Webhook request failed:", webhookResponse.status, webhookResponse.statusText);
        return { 
          success: false, 
          error: `Webhook failed with status ${webhookResponse.status}`
        };
      }

      console.log("✅ RMA request notification sent to webhook:", webhookUrl);
      console.log("   Request Number:", request.requestNumber);
      return { success: true };
    } catch (error) {
      console.error("Error sending RMA webhook notification:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }

  app.post("/api/admin/rma-requests/:id/resend", requireAdmin, async (req, res) => {
    try {
      const requestId = parseInt(req.params.id);
      const request = await storage.getRmaRequestLog(requestId);
      
      if (!request) {
        return res.status(404).json({ message: "RMA request not found" });
      }

      // Send webhook notification
      const result = await sendRmaWebhookNotification(request);

      if (!result.success) {
        return res.status(400).json({ 
          message: result.error || "Failed to send webhook notification"
        });
      }

      // Mark request as approved after successful notification
      await storage.updateRmaRequestLog(requestId, { status: "approved" });

      res.json({ 
        success: true, 
        message: "RMA request details sent to webhook and marked as approved",
        requestNumber: request.requestNumber 
      });
    } catch (error) {
      console.error("Error resending RMA request:", error);
      res.status(500).json({ 
        message: "Failed to send webhook notification",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Download order document (proxy to external API)
  app.post("/api/orders/:orderNumber/documents/download", isAuthenticated, async (req, res) => {
    try {
      const { orderNumber } = req.params;
      const { documentType } = req.body;

      // Validate document type
      const validDocumentTypes = ['invoice', 'packing_list', 'hashcodes', 'credit_note'];
      if (!documentType || !validDocumentTypes.includes(documentType)) {
        return res.status(400).json({ error: "Invalid document type" });
      }

      // Get the configured API URL from settings
      const setting = await storage.getSystemSetting('admin_portal');
      const apiUrl = setting?.settingValue?.documentDownloadApiUrl;

      if (!apiUrl) {
        return res.status(503).json({ 
          error: "Document download service not configured",
          message: "Please contact your administrator to configure the document download API."
        });
      }

      // Make request to external API
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderNumber,
          documentType,
        }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return res.status(404).json({ 
            error: "Document not available",
            message: "This document is not available yet. Please check back later or contact support."
          });
        }
        throw new Error(`External API returned ${response.status}`);
      }

      const contentType = response.headers.get('content-type');

      // Check if response is JSON (array of files) or a single file
      if (contentType && contentType.includes('application/json')) {
        // Response is JSON - expect array of file URLs or file data
        const jsonData = await response.json();
        
        // Handle array of files - create ZIP
        if (Array.isArray(jsonData) && jsonData.length > 0) {
          const archiver = (await import('archiver')).default;
          const archive = archiver('zip', { zlib: { level: 9 } });

          // Set response headers for ZIP download
          const zipFileName = `${orderNumber}_${documentType}_${Date.now()}.zip`;
          res.setHeader('Content-Type', 'application/zip');
          res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);

          // Pipe archive to response
          archive.pipe(res);

          // Add each file to the archive
          for (let i = 0; i < jsonData.length; i++) {
            const fileData = jsonData[i];
            
            try {
              let fileBuffer: Buffer;
              let fileName: string;

              // Handle different response formats
              if (typeof fileData === 'string') {
                // File URL - fetch it
                const fileResponse = await fetch(fileData);
                if (!fileResponse.ok) {
                  console.error(`Failed to fetch file from ${fileData}`);
                  continue;
                }
                fileBuffer = Buffer.from(await fileResponse.arrayBuffer());
                fileName = `${documentType}_${i + 1}.pdf`;
              } else if (fileData['$content']) {
                // Object with $content (base64) and $content-type format
                fileBuffer = Buffer.from(fileData['$content'], 'base64');
                fileName = fileData.fileName || fileData.name || `${documentType}_${i + 1}.pdf`;
              } else if (fileData.url) {
                // Object with URL
                const fileResponse = await fetch(fileData.url);
                if (!fileResponse.ok) {
                  console.error(`Failed to fetch file from ${fileData.url}`);
                  continue;
                }
                fileBuffer = Buffer.from(await fileResponse.arrayBuffer());
                fileName = fileData.fileName || fileData.name || `${documentType}_${i + 1}.pdf`;
              } else if (fileData.data) {
                // Object with base64 data
                fileBuffer = Buffer.from(fileData.data, 'base64');
                fileName = fileData.fileName || fileData.name || `${documentType}_${i + 1}.pdf`;
              } else {
                console.error('Unknown file format in array:', fileData);
                continue;
              }

              // Add file to archive
              archive.append(fileBuffer, { name: fileName });
            } catch (fileError) {
              console.error(`Error processing file ${i}:`, fileError);
              // Continue with other files
            }
          }

          // Finalize the archive
          await archive.finalize();
          return;
        } else if (jsonData.url) {
          // Single file with URL
          const fileResponse = await fetch(jsonData.url);
          if (!fileResponse.ok) {
            throw new Error('Failed to fetch file from provided URL');
          }
          const fileBuffer = await fileResponse.arrayBuffer();
          const fileName = jsonData.fileName || jsonData.name || `${orderNumber}_${documentType}.pdf`;
          
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
          return res.send(Buffer.from(fileBuffer));
        } else {
          throw new Error('Invalid JSON response format from API');
        }
      } else {
        // Response is a single file - return it directly
        const contentDisposition = response.headers.get('content-disposition');
        const fileBuffer = await response.arrayBuffer();

        if (contentType) {
          res.setHeader('Content-Type', contentType);
        }
        if (contentDisposition) {
          res.setHeader('Content-Disposition', contentDisposition);
        }

        return res.send(Buffer.from(fileBuffer));
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      res.status(500).json({ 
        error: "Failed to download document",
        message: "An error occurred while downloading the document. Please try again later."
      });
    }
  });

  // Get sustainability metrics settings
  app.get("/api/admin/sustainability-metrics", requireAdmin, async (req, res) => {
    try {
      const setting = await storage.getSystemSetting('sustainability_metrics');
      
      // Default metrics if none exist (per laptop)
      const defaultMetrics = {
        carbonReductionPerLaptop: 316000, // 316 KGS in grams
        resourcePreservationPerLaptop: 1200000, // 1200 KGS in grams
        waterSavedPerLaptop: 190000, // 190,000 liters
        eWasteReductionPercentage: 0, // 0% e-waste
        familiesHelpedPerLaptop: 1, // 1 family
        treesEquivalentPerLaptop: 3, // 3 trees equivalent
      };

      const metrics = setting?.settingValue || defaultMetrics;
      res.json(metrics);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update sustainability metrics settings
  app.put("/api/admin/sustainability-metrics", requireAdmin, async (req, res) => {
    try {
      const metricsSchema = z.object({
        carbonReductionPerLaptop: z.number().min(0),
        resourcePreservationPerLaptop: z.number().min(0),
        waterSavedPerLaptop: z.number().min(0),
        eWasteReductionPercentage: z.number().min(0).max(100),
        familiesHelpedPerLaptop: z.number().min(0),
        treesEquivalentPerLaptop: z.number().min(0),
      });

      const validatedMetrics = metricsSchema.parse(req.body);
      
      await storage.setSystemSetting('sustainability_metrics', validatedMetrics);
      
      // Recalculate environmental impact for all existing orders with new metrics
      const recalcResult = await storage.recalculateAllEnvironmentalImpact();
      console.log(`Recalculated environmental impact: ${recalcResult.updated} orders updated, ${recalcResult.errors} errors`);
      
      res.json({
        success: true,
        message: "Sustainability metrics updated successfully",
        metrics: validatedMetrics,
        recalculated: recalcResult,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ==================== API KEY MANAGEMENT ====================
  // Admin endpoints to generate and manage API keys for data push APIs

  // Create a new API key
  app.post("/api/admin/api-keys", requireAdmin, async (req, res) => {
    try {
      const user = req.user as User;
      const { name } = req.body;
      
      if (!name || typeof name !== 'string') {
        return res.status(400).json({ 
          success: false,
          error: "API key name is required" 
        });
      }

      const { key, apiKey } = await storage.createApiKey(name, user.id);
      
      // Return the full key only once (it won't be shown again)
      res.json({
        success: true,
        apiKey: key, // The actual key to use in API calls
        metadata: {
          id: apiKey.id,
          name: apiKey.name,
          keyPrefix: apiKey.keyPrefix,
          createdAt: apiKey.createdAt,
          isActive: apiKey.isActive
        },
        message: "Save this API key securely. It won't be shown again."
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: "Internal server error" 
      });
    }
  });

  // List all API keys (doesn't show the actual keys)
  app.get("/api/admin/api-keys", requireAdmin, async (req, res) => {
    try {
      const activeOnly = req.query.activeOnly !== 'false';
      const keys = await storage.listApiKeys(activeOnly);
      
      // Don't return the key hash, only metadata
      const safeKeys = keys.map(k => ({
        id: k.id,
        name: k.name,
        keyPrefix: k.keyPrefix,
        createdBy: k.createdBy,
        lastUsedAt: k.lastUsedAt,
        expiresAt: k.expiresAt,
        isActive: k.isActive,
        createdAt: k.createdAt
      }));
      
      res.json(safeKeys);
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: "Internal server error" 
      });
    }
  });

  // Revoke an API key
  app.patch("/api/admin/api-keys/:id/revoke", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const revoked = await storage.revokeApiKey(id);
      
      if (!revoked) {
        return res.status(404).json({ 
          success: false,
          error: "API key not found" 
        });
      }
      
      res.json({
        success: true,
        message: "API key revoked successfully"
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: "Internal server error" 
      });
    }
  });

  // Delete an API key
  app.delete("/api/admin/api-keys/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteApiKey(id);
      
      res.json({
        success: true,
        message: "API key deleted successfully"
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: "Internal server error" 
      });
    }
  });

  // ==================== DATA PUSH APIS ====================
  // These APIs allow external systems to push data into the portal
  // Authentication required: Use API key in X-API-Key header or Authorization: Bearer <key>

  // Warranty Lookup API (User-facing)
  app.get("/api/warranties/search", async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ 
          found: false,
          message: "Please provide a serial number to search" 
        });
      }

      const warranty = await storage.searchWarranty(q);
      
      if (!warranty) {
        return res.json({
          found: false,
          message: "No warranty found for this serial number"
        });
      }

      const now = new Date();
      const endDate = new Date(warranty.endDate);
      const startDate = new Date(warranty.startDate);
      const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      let status = 'active';
      if (now < startDate) {
        status = 'upcoming';
      } else if (now > endDate) {
        status = 'expired';
      }

      res.json({
        found: true,
        warranty: {
          serialNumber: warranty.serialNumber,
          manufacturerSerialNumber: warranty.manufacturerSerialNumber,
          productDescription: warranty.productDescription,
          areaId: warranty.areaId,
          itemId: warranty.itemId,
          warrantyDescription: warranty.warrantyDescription,
          startDate: warranty.startDate,
          endDate: warranty.endDate,
          status,
          daysRemaining: daysRemaining > 0 ? daysRemaining : 0
        }
      });
    } catch (error) {
      res.status(500).json({ 
        found: false,
        message: "Internal server error" 
      });
    }
  });

  // Upsert Users API
  app.post("/api/data/users/upsert", requireApiKey, async (req, res) => {
    try {
      const { users: usersToUpsert } = req.body;
      
      if (!Array.isArray(usersToUpsert)) {
        return res.status(400).json({ 
          success: false,
          error: "Request must include 'users' array" 
        });
      }

      let created = 0;
      let updated = 0;
      const errors: any[] = [];

      for (const userData of usersToUpsert) {
        try {
          // Hash password if it's provided in plain text
          // Bcrypt hashes start with $2a$ or $2b$, so we check if it's already hashed
          if (userData.password && !userData.password.startsWith('$2a$') && !userData.password.startsWith('$2b$')) {
            userData.password = await bcrypt.hash(userData.password, 10);
          }
          
          const existing = await storage.getUserByEmail(userData.email);
          await storage.upsertUser(userData.email, userData);
          if (existing) {
            updated++;
          } else {
            created++;
          }
        } catch (error: any) {
          errors.push({
            email: userData.email,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        created,
        updated,
        errors
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: "Internal server error" 
      });
    }
  });

  // Helper function to determine order status from timeline based on actual system dates
  const determineOrderStatus = (timeline: any): string => {
    if (!timeline) return "placed";
    
    // Check timeline milestones in reverse order (most recent status first)
    if (timeline.orderCompleted) return "completed";
    if (timeline.dispatchDate) return "shipped";
    if (timeline.dateFulfilled) return "in_production";
    if (timeline.sentToWarehouse) return "in_production";
    if (timeline.paymentDate) return "processing";
    if (timeline.orderDate) return "placed";
    
    return "placed";
  };

  // Upsert Orders API
  app.post("/api/data/orders/upsert", requireApiKey, async (req, res) => {
    try {
      const { orders: ordersToUpsert } = req.body;
      
      if (!Array.isArray(ordersToUpsert)) {
        return res.status(400).json({ 
          success: false,
          error: "Request must include 'orders' array" 
        });
      }

      let created = 0;
      let updated = 0;
      const errors: any[] = [];

      for (const orderData of ordersToUpsert) {
        try {
          const { orderNumber, email, items, timeline, ...order } = orderData;
          
          // Convert date strings to Date objects
          if (order.orderDate) order.orderDate = new Date(order.orderDate);
          if (order.estimatedDelivery) order.estimatedDelivery = new Date(order.estimatedDelivery);
          
          // Process timeline data if provided
          let processedTimeline: any = null;
          if (timeline && typeof timeline === 'object') {
            processedTimeline = {};
            // Convert timeline date strings to Date objects, preserve null values
            for (const [key, value] of Object.entries(timeline)) {
              if (value === null || value === undefined) {
                processedTimeline[key] = null;
              } else if (typeof value === 'string' && value.trim() !== '') {
                processedTimeline[key] = new Date(value);
              } else if (value instanceof Date) {
                processedTimeline[key] = value;
              } else if (typeof value === 'string' && value.trim() === '') {
                processedTimeline[key] = null;
              }
            }
          }
          
          // Automatically determine status from timeline (overrides any provided status)
          if (processedTimeline) {
            order.status = determineOrderStatus(processedTimeline);
          } else if (!order.status) {
            order.status = "placed";
          }
          
          // Convert dates in order items if they exist
          const processedItems = items?.map((item: any) => {
            if (item.warrantyEndDate) {
              return { ...item, warrantyEndDate: new Date(item.warrantyEndDate) };
            }
            return item;
          });
          
          const existing = await storage.getOrderByNumber(orderNumber);
          const upsertedOrder = await storage.upsertOrder(orderNumber, email, order, processedItems);
          
          // Upsert delivery timeline if provided
          if (processedTimeline) {
            const existingTimeline = await storage.getDeliveryTimeline(upsertedOrder.id);
            if (existingTimeline) {
              await storage.updateDeliveryTimeline(upsertedOrder.id, processedTimeline);
            } else {
              await storage.createDeliveryTimeline({ ...processedTimeline, orderId: upsertedOrder.id });
            }
          }
          
          if (existing) {
            updated++;
          } else {
            created++;
          }
        } catch (error: any) {
          errors.push({
            orderNumber: orderData.orderNumber,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        created,
        updated,
        errors
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: "Internal server error" 
      });
    }
  });

  // Upsert Order Documents API
  app.post("/api/data/documents/upsert", requireApiKey, async (req, res) => {
    try {
      const { documents: documentsToUpsert } = req.body;
      
      if (!Array.isArray(documentsToUpsert)) {
        return res.status(400).json({ 
          success: false,
          error: "Request must include 'documents' array" 
        });
      }

      let created = 0;
      let updated = 0;
      const errors: any[] = [];

      for (const docData of documentsToUpsert) {
        try {
          const { orderNumber, documentType, fileName, fileUrl, fileSize, mimeType } = docData;
          
          if (!orderNumber || !documentType || !fileName || !fileUrl) {
            errors.push({
              orderNumber: orderNumber || 'unknown',
              error: 'Missing required fields: orderNumber, documentType, fileName, and fileUrl are required'
            });
            continue;
          }

          // Valid document types
          const validTypes = ['credit_note', 'packing_list', 'hashcodes', 'invoice'];
          if (!validTypes.includes(documentType)) {
            errors.push({
              orderNumber,
              error: `Invalid documentType. Must be one of: ${validTypes.join(', ')}`
            });
            continue;
          }

          // Check if document already exists
          const existing = await storage.getOrderDocumentsByNumber(orderNumber);
          const existingDoc = existing.find(d => d.documentType === documentType);

          const upsertedDoc = await storage.upsertOrderDocument(orderNumber, documentType, {
            fileName,
            fileUrl,
            fileSize: fileSize || null,
            mimeType: mimeType || null
          });

          if (existingDoc) {
            updated++;
          } else {
            created++;
          }
        } catch (error: any) {
          errors.push({
            orderNumber: docData.orderNumber,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        created,
        updated,
        errors
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: "Internal server error" 
      });
    }
  });

  // Upsert RMAs API
  app.post("/api/data/rmas/upsert", requireApiKey, async (req, res) => {
    try {
      const { rmas: rmasToUpsert } = req.body;
      
      if (!Array.isArray(rmasToUpsert)) {
        return res.status(400).json({ 
          success: false,
          error: "Request must include 'rmas' array" 
        });
      }

      let created = 0;
      let updated = 0;
      const errors: any[] = [];

      for (const rmaData of rmasToUpsert) {
        try {
          const { rmaNumber, email, serials, ...rma } = rmaData;
          
          // Convert date strings to Date objects if they exist
          if (rma.createdAt) rma.createdAt = new Date(rma.createdAt);
          
          const existing = await storage.getRmaByNumber(rmaNumber);
          
          // Upsert RMA
          const upsertedRma = await storage.upsertRma(rmaNumber, email, rma);
          
          // Upsert RMA items if serials array is provided
          if (serials && Array.isArray(serials) && serials.length > 0) {
            // Map serials to RMA items format
            const rmaItems = serials.map((serial: any) => ({
              serialNumber: serial.SerialNumber || serial.serialNumber,
              errorDescription: serial.ErrorDescription || serial.errorDescription,
              receivedAtWarehouseOn: serial.ReceivedAtWarehouseOn 
                ? new Date(serial.ReceivedAtWarehouseOn) 
                : serial.receivedAtWarehouseOn 
                  ? new Date(serial.receivedAtWarehouseOn) 
                  : undefined,
              solution: serial.Solution || serial.solution,
              reasonForReturn: serial.ReasonForReturn || serial.reasonForReturn,
              productDetails: serial.ProductDetails || serial.productDetails,
              relatedOrder: serial.RelatedOrder || serial.relatedOrder,
            }));
            
            await storage.upsertRmaItems(upsertedRma.id, rmaItems);
          }
          
          if (existing) {
            updated++;
          } else {
            created++;
          }
        } catch (error: any) {
          errors.push({
            rmaNumber: rmaData.rmaNumber,
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        created,
        updated,
        errors
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: "Internal server error" 
      });
    }
  });

  // Bulk Upsert Warranties API with Chunking Support
  app.post("/api/data/warranties/upsert", requireApiKey, async (req, res) => {
    try {
      const { 
        warranties: warrantiesToUpsert,
        batchNumber: batchNumberRaw = 1,
        totalBatches: totalBatchesRaw = 1
      } = req.body;
      
      if (!Array.isArray(warrantiesToUpsert)) {
        return res.status(400).json({ 
          success: false,
          error: "Request must include 'warranties' array" 
        });
      }

      // Coerce batch parameters to integers (handles string inputs from Power Automate, etc.)
      const batchNumber = parseInt(String(batchNumberRaw), 10);
      const totalBatches = parseInt(String(totalBatchesRaw), 10);

      // Validate batch parameters are valid integers
      if (isNaN(batchNumber) || isNaN(totalBatches)) {
        return res.status(400).json({
          success: false,
          error: "batchNumber and totalBatches must be valid integers"
        });
      }

      // Validate batch parameters are in valid range
      if (batchNumber < 1 || batchNumber > totalBatches) {
        return res.status(400).json({
          success: false,
          error: `Invalid batchNumber ${batchNumber}. Must be between 1 and ${totalBatches}`
        });
      }

      // Validate and convert each warranty
      const validatedWarranties = [];
      const validationErrors: any[] = [];
      
      for (let i = 0; i < warrantiesToUpsert.length; i++) {
        try {
          const validated = insertWarrantySchema.parse({
            ...warrantiesToUpsert[i],
            startDate: new Date(warrantiesToUpsert[i].startDate),
            endDate: new Date(warrantiesToUpsert[i].endDate)
          });
          validatedWarranties.push(validated);
        } catch (error: any) {
          if (error instanceof z.ZodError) {
            validationErrors.push({
              serialNumber: warrantiesToUpsert[i].serialNumber || `index-${i}`,
              error: error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
            });
          } else {
            validationErrors.push({
              serialNumber: warrantiesToUpsert[i].serialNumber || `index-${i}`,
              error: error.message
            });
          }
        }
      }

      // Upsert validated warranties with truncate flag for first batch
      const shouldTruncate = batchNumber === 1;
      const result = await storage.bulkUpsertWarranties(validatedWarranties, shouldTruncate);

      res.json({
        success: true,
        ...result,
        batchNumber,
        totalBatches,
        isLastBatch: batchNumber === totalBatches,
        errors: [...result.errors, ...validationErrors]
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: "Internal server error" 
      });
    }
  });

  // Key Performance Insights API (Admin only)
  app.get("/api/admin/key-insights", requireAdmin, async (req, res) => {
    try {
      const insights = await storage.getAllKeyPerformanceInsights();
      res.json(insights);
    } catch (error) {
      console.error("Error fetching key insights:", error);
      res.status(500).json({ error: "Failed to fetch key insights" });
    }
  });

  app.get("/api/key-insights", isAuthenticated, async (req, res) => {
    try {
      const insights = await storage.getAllKeyPerformanceInsights();
      const activeInsights = insights.filter(i => i.isActive);
      res.json(activeInsights);
    } catch (error) {
      console.error("Error fetching key insights:", error);
      res.status(500).json({ error: "Failed to fetch key insights" });
    }
  });

  app.post("/api/admin/key-insights", requireAdmin, async (req, res) => {
    try {
      const validatedData = insertKeyPerformanceInsightSchema.parse(req.body);
      const insight = await storage.createKeyPerformanceInsight(validatedData);
      res.json(insight);
    } catch (error: any) {
      console.error("Error creating key insight:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create key insight" });
      }
    }
  });

  app.put("/api/admin/key-insights/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updated = await storage.updateKeyPerformanceInsight(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: "Key insight not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating key insight:", error);
      res.status(500).json({ error: "Failed to update key insight" });
    }
  });

  app.delete("/api/admin/key-insights/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteKeyPerformanceInsight(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting key insight:", error);
      res.status(500).json({ error: "Failed to delete key insight" });
    }
  });

  // Organizational Metrics endpoints
  app.get("/api/organizational-metrics", isAuthenticated, async (req, res) => {
    try {
      const metrics = await storage.getAllOrganizationalMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Error fetching organizational metrics:", error);
      res.status(500).json({ error: "Failed to fetch organizational metrics" });
    }
  });

  app.get("/api/organizational-metrics/:metricKey", isAuthenticated, async (req, res) => {
    try {
      const metric = await storage.getOrganizationalMetric(req.params.metricKey);
      if (!metric) {
        return res.status(404).json({ error: "Metric not found" });
      }
      res.json(metric);
    } catch (error) {
      console.error("Error fetching organizational metric:", error);
      res.status(500).json({ error: "Failed to fetch organizational metric" });
    }
  });

  app.put("/api/admin/organizational-metrics/:metricKey", requireApiKeyOrAdmin, async (req, res) => {
    try {
      const { metricKey } = req.params;
      const { value } = req.body;
      
      if (typeof value !== 'number') {
        return res.status(400).json({ error: "Value must be a number" });
      }

      const updated = await storage.updateOrganizationalMetric(metricKey, value, (req.user as User)?.id);
      if (!updated) {
        return res.status(404).json({ error: "Metric not found" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating organizational metric:", error);
      res.status(500).json({ error: "Failed to update organizational metric" });
    }
  });

  app.post("/api/admin/organizational-metrics", requireApiKeyOrAdmin, async (req, res) => {
    try {
      const { metricKey, metricValue, metricUnit, description } = req.body;
      
      const metric = await storage.upsertOrganizationalMetric(metricKey, {
        metricValue: metricValue.toString(),
        metricUnit,
        description,
        lastUpdatedBy: (req.user as User)?.id
      });
      
      res.json(metric);
    } catch (error) {
      console.error("Error creating/updating organizational metric:", error);
      res.status(500).json({ error: "Failed to create/update organizational metric" });
    }
  });

  // ESG Targets endpoints
  app.get("/api/esg-targets", isAuthenticated, async (req, res) => {
    try {
      const targets = await storage.getActiveEsgTargets();
      res.json(targets);
    } catch (error) {
      console.error("Error fetching ESG targets:", error);
      res.status(500).json({ error: "Failed to fetch ESG targets" });
    }
  });

  app.get("/api/admin/esg-targets", requireAdmin, async (req, res) => {
    try {
      const targets = await storage.getEsgTargets();
      res.json(targets);
    } catch (error) {
      console.error("Error fetching all ESG targets:", error);
      res.status(500).json({ error: "Failed to fetch ESG targets" });
    }
  });

  app.get("/api/admin/esg-targets/:id", requireAdmin, async (req, res) => {
    try {
      const target = await storage.getEsgTarget(parseInt(req.params.id));
      if (!target) {
        return res.status(404).json({ error: "ESG target not found" });
      }
      res.json(target);
    } catch (error) {
      console.error("Error fetching ESG target:", error);
      res.status(500).json({ error: "Failed to fetch ESG target" });
    }
  });

  app.post("/api/admin/esg-targets", requireAdmin, async (req, res) => {
    try {
      const target = await storage.createEsgTarget(req.body);
      res.json(target);
    } catch (error) {
      console.error("Error creating ESG target:", error);
      res.status(500).json({ error: "Failed to create ESG target" });
    }
  });

  app.put("/api/admin/esg-targets/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateEsgTarget(parseInt(req.params.id), req.body);
      if (!updated) {
        return res.status(404).json({ error: "ESG target not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating ESG target:", error);
      res.status(500).json({ error: "Failed to update ESG target" });
    }
  });

  app.delete("/api/admin/esg-targets/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteEsgTarget(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting ESG target:", error);
      res.status(500).json({ error: "Failed to delete ESG target" });
    }
  });

  // Update ESG target progress (simplified endpoint for automated updates)
  app.patch("/api/admin/esg-targets/:id/progress", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Validate input with Zod schema
      const progressSchema = z.object({
        currentValue: z.union([
          z.string().regex(/^\d+(\.\d+)?$/, "Must be a valid number"),
          z.number().nonnegative("Must be non-negative")
        ]).transform(val => String(val))
      });

      const validation = progressSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Invalid input", 
          details: validation.error.errors 
        });
      }

      const target = await storage.getEsgTarget(id);
      if (!target) {
        return res.status(404).json({ error: "ESG target not found" });
      }

      const updated = await storage.updateEsgTarget(id, { currentValue: validation.data.currentValue });
      res.json(updated);
    } catch (error) {
      console.error(`Error updating ESG target progress (ID: ${req.params.id}):`, error);
      res.status(500).json({ error: "Failed to update progress" });
    }
  });

  // Gamification: User-facing endpoints
  app.get("/api/gamification/score", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as User).id;
      const { scoringService } = await import("./scoring-service");
      const scoreResult = await scoringService.calculateUserESGScore(userId);
      res.json(scoreResult);
    } catch (error) {
      console.error("Error calculating ESG score:", error);
      res.status(500).json({ error: "Failed to calculate ESG score" });
    }
  });

  app.post("/api/gamification/calculate-score", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as User).id;
      const { scoringService } = await import("./scoring-service");
      await scoringService.updateUserESGScore(userId);
      const scoreResult = await scoringService.calculateUserESGScore(userId);
      res.json(scoreResult);
    } catch (error) {
      console.error("Error updating ESG score:", error);
      res.status(500).json({ error: "Failed to update ESG score" });
    }
  });

  app.get("/api/gamification/achievements", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as User).id;
      const achievements = await storage.getUserAchievementProgressWithDetails(userId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching user achievements:", error);
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });

  app.get("/api/gamification/milestones", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as User).id;
      const milestones = await storage.getUserMilestoneEventsWithDetails(userId);
      res.json(milestones);
    } catch (error) {
      console.error("Error fetching user milestones:", error);
      res.status(500).json({ error: "Failed to fetch milestones" });
    }
  });

  app.get("/api/gamification/all-milestones", isAuthenticated, async (req, res) => {
    try {
      const milestones = await storage.getActiveGamificationMilestones();
      res.json(milestones);
    } catch (error) {
      console.error("Error fetching all milestones:", error);
      res.status(500).json({ error: "Failed to fetch milestones" });
    }
  });

  app.get("/api/gamification/leaderboard", isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const period = (req.query.period as string) || 'current';
      const { scoringService } = await import("./scoring-service");
      const leaderboard = await scoringService.getLeaderboard(limit, period);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  app.get("/api/gamification/benchmark", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as User).id;
      const { scoringService } = await import("./scoring-service");
      const benchmark = await scoringService.getBenchmarkComparison(userId);
      res.json(benchmark);
    } catch (error) {
      console.error("Error fetching benchmark:", error);
      res.status(500).json({ error: "Failed to fetch benchmark" });
    }
  });

  app.get("/api/gamification/tiers", isAuthenticated, async (req, res) => {
    try {
      const tiers = await storage.getActiveTiers();
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching tiers:", error);
      res.status(500).json({ error: "Failed to fetch tiers" });
    }
  });

  // Gamification: Admin endpoints - Tiers
  app.get("/api/admin/gamification/tiers", requireAdmin, async (req, res) => {
    try {
      const tiers = await storage.getGamificationTiers();
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching all tiers:", error);
      res.status(500).json({ error: "Failed to fetch tiers" });
    }
  });

  app.get("/api/admin/gamification/tiers/:id", requireAdmin, async (req, res) => {
    try {
      const tier = await storage.getGamificationTier(parseInt(req.params.id));
      if (!tier) {
        return res.status(404).json({ error: "Tier not found" });
      }
      res.json(tier);
    } catch (error) {
      console.error("Error fetching tier:", error);
      res.status(500).json({ error: "Failed to fetch tier" });
    }
  });

  app.post("/api/admin/gamification/tiers", requireAdmin, async (req, res) => {
    try {
      const tier = await storage.createGamificationTier(req.body);
      res.json(tier);
    } catch (error) {
      console.error("Error creating tier:", error);
      res.status(500).json({ error: "Failed to create tier" });
    }
  });

  app.put("/api/admin/gamification/tiers/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateGamificationTier(parseInt(req.params.id), req.body);
      if (!updated) {
        return res.status(404).json({ error: "Tier not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating tier:", error);
      res.status(500).json({ error: "Failed to update tier" });
    }
  });

  app.delete("/api/admin/gamification/tiers/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteGamificationTier(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting tier:", error);
      res.status(500).json({ error: "Failed to delete tier" });
    }
  });

  // Gamification: Admin endpoints - Achievements
  app.get("/api/admin/gamification/achievements", requireAdmin, async (req, res) => {
    try {
      const achievements = await storage.getGamificationAchievements();
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching all achievements:", error);
      res.status(500).json({ error: "Failed to fetch achievements" });
    }
  });

  app.get("/api/admin/gamification/achievements/:id", requireAdmin, async (req, res) => {
    try {
      const achievement = await storage.getGamificationAchievement(parseInt(req.params.id));
      if (!achievement) {
        return res.status(404).json({ error: "Achievement not found" });
      }
      res.json(achievement);
    } catch (error) {
      console.error("Error fetching achievement:", error);
      res.status(500).json({ error: "Failed to fetch achievement" });
    }
  });

  app.post("/api/admin/gamification/achievements", requireAdmin, async (req, res) => {
    try {
      const achievement = await storage.createGamificationAchievement(req.body);
      res.json(achievement);
    } catch (error) {
      console.error("Error creating achievement:", error);
      res.status(500).json({ error: "Failed to create achievement" });
    }
  });

  app.put("/api/admin/gamification/achievements/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateGamificationAchievement(parseInt(req.params.id), req.body);
      if (!updated) {
        return res.status(404).json({ error: "Achievement not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating achievement:", error);
      res.status(500).json({ error: "Failed to update achievement" });
    }
  });

  app.delete("/api/admin/gamification/achievements/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteGamificationAchievement(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting achievement:", error);
      res.status(500).json({ error: "Failed to delete achievement" });
    }
  });

  // Gamification: Admin endpoints - Milestones
  app.get("/api/admin/gamification/milestones", requireAdmin, async (req, res) => {
    try {
      const milestones = await storage.getGamificationMilestones();
      res.json(milestones);
    } catch (error) {
      console.error("Error fetching all milestones:", error);
      res.status(500).json({ error: "Failed to fetch milestones" });
    }
  });

  app.get("/api/admin/gamification/milestones/:id", requireAdmin, async (req, res) => {
    try {
      const milestone = await storage.getGamificationMilestone(parseInt(req.params.id));
      if (!milestone) {
        return res.status(404).json({ error: "Milestone not found" });
      }
      res.json(milestone);
    } catch (error) {
      console.error("Error fetching milestone:", error);
      res.status(500).json({ error: "Failed to fetch milestone" });
    }
  });

  app.post("/api/admin/gamification/milestones", requireAdmin, async (req, res) => {
    try {
      const milestone = await storage.createGamificationMilestone(req.body);
      res.json(milestone);
    } catch (error) {
      console.error("Error creating milestone:", error);
      res.status(500).json({ error: "Failed to create milestone" });
    }
  });

  app.put("/api/admin/gamification/milestones/:id", requireAdmin, async (req, res) => {
    try {
      const updated = await storage.updateGamificationMilestone(parseInt(req.params.id), req.body);
      if (!updated) {
        return res.status(404).json({ error: "Milestone not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating milestone:", error);
      res.status(500).json({ error: "Failed to update milestone" });
    }
  });

  app.delete("/api/admin/gamification/milestones/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteGamificationMilestone(parseInt(req.params.id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting milestone:", error);
      res.status(500).json({ error: "Failed to delete milestone" });
    }
  });

  // Gamification: Admin endpoints - Settings
  app.get("/api/admin/gamification/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getGamificationSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching gamification settings:", error);
      res.status(500).json({ error: "Failed to fetch gamification settings" });
    }
  });

  app.get("/api/admin/gamification/settings/:key", requireAdmin, async (req, res) => {
    try {
      const setting = await storage.getGamificationSetting(req.params.key);
      if (!setting) {
        return res.status(404).json({ error: "Setting not found" });
      }
      res.json(setting);
    } catch (error) {
      console.error("Error fetching gamification setting:", error);
      res.status(500).json({ error: "Failed to fetch gamification setting" });
    }
  });

  app.put("/api/admin/gamification/settings/:key", requireAdmin, async (req, res) => {
    try {
      const { value, description } = req.body;
      const setting = await storage.setGamificationSetting(req.params.key, value, description);
      res.json(setting);
    } catch (error) {
      console.error("Error updating gamification setting:", error);
      res.status(500).json({ error: "Failed to update gamification setting" });
    }
  });

  return httpServer;
}
