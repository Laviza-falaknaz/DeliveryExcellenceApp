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

  // Auth routes
  // Registration is disabled - users are created by administrators
  app.post("/api/auth/register", async (req, res) => {
    return res.status(403).json({ 
      message: "Registration is disabled. Please contact your administrator to create an account." 
    });
  });

  app.post("/api/auth/login", passport.authenticate("local"), (req, res) => {
    const user = req.user as User;
    const { password, ...userWithoutPassword } = user;
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
      res.json(rmas);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/rma/:id", isAuthenticated, async (req, res) => {
    try {
      const rmaId = parseInt(req.params.id);
      const rma = await storage.getRma(rmaId);
      
      if (!rma) {
        return res.status(404).json({ message: "RMA not found" });
      }
      
      const user = req.user as User;
      if (rma.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(rma);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/rma", isAuthenticated, async (req, res) => {
    try {
      const user = req.user as User;
      const orderId = parseInt(req.body.orderId);
      const order = await storage.getOrder(orderId);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      if (order.userId !== user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const rmaNumber = `RMA-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
      const rmaData = insertRmaSchema.parse({
        ...req.body,
        userId: user.id,
        rmaNumber,
      });
      
      const rma = await storage.createRma(rmaData);
      res.status(201).json(rma);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
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

  // ============ ADMIN ROUTES ============
  
  // Admin user management
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await storage.createUser({
        ...userData,
        password: hashedPassword,
      });
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      
      // Hash password if it's being updated
      if (updateData.password) {
        updateData.password = await bcrypt.hash(updateData.password, 10);
      }
      
      const user = await storage.updateUser(userId, updateData);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      await storage.deleteUser(userId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin order management
  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/orders/:id", requireAdmin, async (req, res) => {
    try {
      const orderId = parseInt(req.params.id);
      await storage.deleteOrder(orderId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin RMA management
  app.get("/api/admin/rmas", requireAdmin, async (req, res) => {
    try {
      const rmas = await storage.getAllRmas();
      res.json(rmas);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/rmas/:id", requireAdmin, async (req, res) => {
    try {
      const rmaId = parseInt(req.params.id);
      await storage.deleteRma(rmaId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin support ticket management
  app.get("/api/admin/support-tickets", requireAdmin, async (req, res) => {
    try {
      const tickets = await storage.getAllSupportTickets();
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/support-tickets/:id", requireAdmin, async (req, res) => {
    try {
      const ticketId = parseInt(req.params.id);
      await storage.deleteSupportTicket(ticketId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin water project management
  app.post("/api/admin/water-projects", requireAdmin, async (req, res) => {
    try {
      const projectData = insertWaterProjectSchema.parse(req.body);
      const project = await storage.createWaterProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/water-projects/:id", requireAdmin, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      const updateData = req.body;
      
      const project = await storage.updateWaterProject(projectId, updateData);
      
      if (!project) {
        return res.status(404).json({ message: "Water project not found" });
      }
      
      res.json(project);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/water-projects/:id", requireAdmin, async (req, res) => {
    try {
      const projectId = parseInt(req.params.id);
      await storage.deleteWaterProject(projectId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin case study management
  app.delete("/api/admin/case-studies/:id", requireAdmin, async (req, res) => {
    try {
      const caseStudyId = parseInt(req.params.id);
      await storage.deleteCaseStudy(caseStudyId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Theme settings routes
  const themeSettingsSchema = z.object({
    primaryColor: z.string().default("#0D9488"),
    secondaryColor: z.string().default("#14B8A6"),
    accentColor: z.string().default("#2DD4BF"),
    backgroundColor: z.string().default("#FFFFFF"),
    headingFont: z.string().default("Inter"),
    bodyFont: z.string().default("Inter"),
    logoUrl: z.string().default(""),
    companyName: z.string().default("Circular Computing")
  });

  const defaultTheme = {
    primaryColor: "#0D9488",
    secondaryColor: "#14B8A6",
    accentColor: "#2DD4BF",
    backgroundColor: "#FFFFFF",
    headingFont: "Inter",
    bodyFont: "Inter",
    logoUrl: "",
    companyName: "Circular Computing"
  };

  app.get("/api/admin/theme", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getThemeSettings();
      // Merge with defaults to ensure all fields are present
      res.json({ ...defaultTheme, ...(settings || {}) });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/theme", requireAdmin, async (req, res) => {
    try {
      // Validate and apply defaults
      const validated = themeSettingsSchema.parse(req.body);
      const settings = await storage.saveThemeSettings(validated);
      res.json({ ...defaultTheme, ...(settings || {}) });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid theme settings", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Database connection info route
  app.get("/api/admin/connection", requireAdmin, (req, res) => {
    try {
      const dbUrl = process.env.DATABASE_URL || "";
      let maskedUrl = dbUrl;
      
      // Safely mask password by replacing everything between // and @ with username:****
      try {
        const urlObj = new URL(dbUrl);
        if (urlObj.password) {
          maskedUrl = dbUrl.replace(
            new RegExp(`://${urlObj.username}:${urlObj.password.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}@`),
            `://${urlObj.username}:****@`
          );
        }
        
        res.json({
          development: {
            host: urlObj.hostname,
            port: urlObj.port || "5432",
            database: urlObj.pathname.slice(1),
            user: urlObj.username,
            ssl: urlObj.searchParams.get("sslmode") === "require",
            connectionString: maskedUrl
          },
          production: {
            note: "Production database is managed separately by Replit. Use the Replit database pane to access production settings.",
            managedBy: "Replit"
          }
        });
      } catch (urlError) {
        // Fallback if URL parsing fails
        res.json({
          development: {
            host: "N/A",
            port: "N/A",
            database: "N/A",
            user: "N/A",
            ssl: false,
            connectionString: "Unable to parse connection string"
          },
          production: {
            note: "Production database is managed separately by Replit. Use the Replit database pane to access production settings.",
            managedBy: "Replit"
          }
        });
      }
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

  return httpServer;
}
