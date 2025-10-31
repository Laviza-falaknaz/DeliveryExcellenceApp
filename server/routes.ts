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
      res.json(orders);
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
          const { orderNumber, email, items, ...order } = orderData;
          
          // Convert date strings to Date objects
          if (order.orderDate) order.orderDate = new Date(order.orderDate);
          if (order.estimatedDelivery) order.estimatedDelivery = new Date(order.estimatedDelivery);
          
          // Convert dates in order items if they exist
          const processedItems = items?.map((item: any) => {
            if (item.warrantyEndDate) {
              return { ...item, warrantyEndDate: new Date(item.warrantyEndDate) };
            }
            return item;
          });
          
          const existing = await storage.getOrderByNumber(orderNumber);
          await storage.upsertOrder(orderNumber, email, order, processedItems);
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

  // Bulk Upsert Warranties API
  app.post("/api/data/warranties/upsert", requireApiKey, async (req, res) => {
    try {
      const { warranties: warrantiesToUpsert } = req.body;
      
      if (!Array.isArray(warrantiesToUpsert)) {
        return res.status(400).json({ 
          success: false,
          error: "Request must include 'warranties' array" 
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

      // Upsert validated warranties
      const result = await storage.bulkUpsertWarranties(validatedWarranties);

      res.json({
        success: true,
        ...result,
        errors: [...result.errors, ...validationErrors]
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        error: "Internal server error" 
      });
    }
  });

  return httpServer;
}
