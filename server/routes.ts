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
  User
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import crypto from "crypto";
import MemoryStore from "memorystore";
import bcrypt from "bcryptjs";

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

  return httpServer;
}
