import {
  users, User, InsertUser,
  orders, Order, InsertOrder,
  orderItems, OrderItem, InsertOrderItem,
  orderUpdates, OrderUpdate, InsertOrderUpdate,
  environmentalImpact, EnvironmentalImpact, InsertEnvironmentalImpact,
  rmas, Rma, InsertRma,
  waterProjects, WaterProject, InsertWaterProject,
  supportTickets, SupportTicket, InsertSupportTicket,
  caseStudies, CaseStudy, InsertCaseStudy,
  deliveryTimelines, DeliveryTimeline, InsertDeliveryTimeline,
  systemSettings, SystemSetting
} from "@shared/schema";
import { db } from "./db";
import { eq, sum } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;

  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, data: Partial<Order>): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  deleteOrder(id: number): Promise<void>;

  // Order items operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;

  // Order updates operations
  getOrderUpdates(orderId: number): Promise<OrderUpdate[]>;
  createOrderUpdate(orderUpdate: InsertOrderUpdate): Promise<OrderUpdate>;

  // Environmental impact operations
  getEnvironmentalImpactByUserId(userId: number): Promise<EnvironmentalImpact[]>;
  getEnvironmentalImpactByOrderId(orderId: number): Promise<EnvironmentalImpact | undefined>;
  createEnvironmentalImpact(impact: InsertEnvironmentalImpact): Promise<EnvironmentalImpact>;
  getTotalEnvironmentalImpact(userId: number): Promise<{
    carbonSaved: number;
    waterProvided: number;
    mineralsSaved: number;
    treesEquivalent: number;
    familiesHelped: number;
  }>;

  // RMA operations
  getRma(id: number): Promise<Rma | undefined>;
  getRmasByUserId(userId: number): Promise<Rma[]>;
  createRma(rma: InsertRma): Promise<Rma>;
  updateRma(id: number, data: Partial<Rma>): Promise<Rma | undefined>;
  getAllRmas(): Promise<Rma[]>;
  deleteRma(id: number): Promise<void>;

  // Water project operations
  getWaterProjects(): Promise<WaterProject[]>;
  getWaterProject(id: number): Promise<WaterProject | undefined>;
  createWaterProject(project: InsertWaterProject): Promise<WaterProject>;
  updateWaterProject(id: number, data: Partial<WaterProject>): Promise<WaterProject | undefined>;
  deleteWaterProject(id: number): Promise<void>;

  // Support ticket operations
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  getSupportTicketsByUserId(userId: number): Promise<SupportTicket[]>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: number, data: Partial<SupportTicket>): Promise<SupportTicket | undefined>;
  getAllSupportTickets(): Promise<SupportTicket[]>;
  deleteSupportTicket(id: number): Promise<void>;

  // Case study operations
  getCaseStudy(id: number): Promise<CaseStudy | undefined>;
  getCaseStudiesByUserId(userId: number): Promise<CaseStudy[]>;
  createCaseStudy(caseStudy: InsertCaseStudy): Promise<CaseStudy>;
  updateCaseStudy(id: number, data: Partial<CaseStudy>): Promise<CaseStudy | undefined>;
  deleteCaseStudy(id: number): Promise<void>;

  // Delivery timeline operations
  getDeliveryTimeline(orderId: number): Promise<DeliveryTimeline | undefined>;
  createDeliveryTimeline(timeline: InsertDeliveryTimeline): Promise<DeliveryTimeline>;
  updateDeliveryTimeline(orderId: number, data: Partial<DeliveryTimeline>): Promise<DeliveryTimeline | undefined>;

  // Theme settings operations
  getThemeSettings(): Promise<any>;
  saveThemeSettings(settings: any): Promise<any>;
}

// Database storage implementation using Drizzle ORM - blueprint:javascript_database
export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updated] = await db.update(users).set(data).where(eq(users.id, id)).returning();
    return updated || undefined;
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber));
    return order || undefined;
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return db.select().from(orders).where(eq(orders.userId, userId));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db.insert(orders).values(insertOrder).returning();
    return order;
  }

  async updateOrder(id: number, data: Partial<Order>): Promise<Order | undefined> {
    const [updated] = await db.update(orders).set(data).where(eq(orders.id, id)).returning();
    return updated || undefined;
  }

  // Order items operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const [item] = await db.insert(orderItems).values(insertOrderItem).returning();
    return item;
  }

  // Order updates operations
  async getOrderUpdates(orderId: number): Promise<OrderUpdate[]> {
    return db.select().from(orderUpdates).where(eq(orderUpdates.orderId, orderId));
  }

  async createOrderUpdate(insertOrderUpdate: InsertOrderUpdate): Promise<OrderUpdate> {
    const [update] = await db.insert(orderUpdates).values(insertOrderUpdate).returning();
    return update;
  }

  // Environmental impact operations
  async getEnvironmentalImpactByUserId(userId: number): Promise<EnvironmentalImpact[]> {
    return db.select().from(environmentalImpact).where(eq(environmentalImpact.userId, userId));
  }

  async getEnvironmentalImpactByOrderId(orderId: number): Promise<EnvironmentalImpact | undefined> {
    const [impact] = await db.select().from(environmentalImpact).where(eq(environmentalImpact.orderId, orderId));
    return impact || undefined;
  }

  async createEnvironmentalImpact(insertImpact: InsertEnvironmentalImpact): Promise<EnvironmentalImpact> {
    const [impact] = await db.insert(environmentalImpact).values(insertImpact).returning();
    return impact;
  }

  async getTotalEnvironmentalImpact(userId: number): Promise<{
    carbonSaved: number;
    waterProvided: number;
    mineralsSaved: number;
    treesEquivalent: number;
    familiesHelped: number;
  }> {
    const [result] = await db
      .select({
        carbonSaved: sum(environmentalImpact.carbonSaved),
        waterProvided: sum(environmentalImpact.waterProvided),
        mineralsSaved: sum(environmentalImpact.mineralsSaved),
        treesEquivalent: sum(environmentalImpact.treesEquivalent),
        familiesHelped: sum(environmentalImpact.familiesHelped),
      })
      .from(environmentalImpact)
      .where(eq(environmentalImpact.userId, userId));

    return {
      carbonSaved: Number(result.carbonSaved) || 0,
      waterProvided: Number(result.waterProvided) || 0,
      mineralsSaved: Number(result.mineralsSaved) || 0,
      treesEquivalent: Number(result.treesEquivalent) || 0,
      familiesHelped: Number(result.familiesHelped) || 0,
    };
  }

  // RMA operations
  async getRma(id: number): Promise<Rma | undefined> {
    const [rma] = await db.select().from(rmas).where(eq(rmas.id, id));
    return rma || undefined;
  }

  async getRmasByUserId(userId: number): Promise<Rma[]> {
    return db.select().from(rmas).where(eq(rmas.userId, userId));
  }

  async createRma(insertRma: InsertRma): Promise<Rma> {
    const [rma] = await db.insert(rmas).values(insertRma).returning();
    return rma;
  }

  async updateRma(id: number, data: Partial<Rma>): Promise<Rma | undefined> {
    const [updated] = await db.update(rmas).set(data).where(eq(rmas.id, id)).returning();
    return updated || undefined;
  }

  // Water project operations
  async getWaterProjects(): Promise<WaterProject[]> {
    return db.select().from(waterProjects);
  }

  async getWaterProject(id: number): Promise<WaterProject | undefined> {
    const [project] = await db.select().from(waterProjects).where(eq(waterProjects.id, id));
    return project || undefined;
  }

  async createWaterProject(insertProject: InsertWaterProject): Promise<WaterProject> {
    const [project] = await db.insert(waterProjects).values(insertProject).returning();
    return project;
  }

  // Support ticket operations
  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.id, id));
    return ticket || undefined;
  }

  async getSupportTicketsByUserId(userId: number): Promise<SupportTicket[]> {
    return db.select().from(supportTickets).where(eq(supportTickets.userId, userId));
  }

  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const [ticket] = await db.insert(supportTickets).values(insertTicket).returning();
    return ticket;
  }

  async updateSupportTicket(id: number, data: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const [updated] = await db.update(supportTickets).set(data).where(eq(supportTickets.id, id)).returning();
    return updated || undefined;
  }

  // Case study operations
  async getCaseStudy(id: number): Promise<CaseStudy | undefined> {
    const [study] = await db.select().from(caseStudies).where(eq(caseStudies.id, id));
    return study || undefined;
  }

  async getCaseStudiesByUserId(userId: number): Promise<CaseStudy[]> {
    return db.select().from(caseStudies).where(eq(caseStudies.userId, userId));
  }

  async createCaseStudy(insertCaseStudy: InsertCaseStudy): Promise<CaseStudy> {
    const [study] = await db.insert(caseStudies).values(insertCaseStudy).returning();
    return study;
  }

  async updateCaseStudy(id: number, data: Partial<CaseStudy>): Promise<CaseStudy | undefined> {
    const [updated] = await db.update(caseStudies).set(data).where(eq(caseStudies.id, id)).returning();
    return updated || undefined;
  }

  // Delivery timeline operations
  async getDeliveryTimeline(orderId: number): Promise<DeliveryTimeline | undefined> {
    const [timeline] = await db.select().from(deliveryTimelines).where(eq(deliveryTimelines.orderId, orderId));
    return timeline || undefined;
  }

  async createDeliveryTimeline(insertTimeline: InsertDeliveryTimeline): Promise<DeliveryTimeline> {
    const [timeline] = await db.insert(deliveryTimelines).values({
      ...insertTimeline,
      orderPlaced: true // First step is always completed
    }).returning();
    return timeline;
  }

  async updateDeliveryTimeline(orderId: number, data: Partial<DeliveryTimeline>): Promise<DeliveryTimeline | undefined> {
    const [updated] = await db.update(deliveryTimelines)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(deliveryTimelines.orderId, orderId))
      .returning();
    return updated || undefined;
  }

  // Admin methods
  async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getAllOrders(): Promise<Order[]> {
    return db.select().from(orders);
  }

  async deleteOrder(id: number): Promise<void> {
    await db.delete(orders).where(eq(orders.id, id));
  }

  async getAllRmas(): Promise<Rma[]> {
    return db.select().from(rmas);
  }

  async deleteRma(id: number): Promise<void> {
    await db.delete(rmas).where(eq(rmas.id, id));
  }

  async getAllSupportTickets(): Promise<SupportTicket[]> {
    return db.select().from(supportTickets);
  }

  async deleteSupportTicket(id: number): Promise<void> {
    await db.delete(supportTickets).where(eq(supportTickets.id, id));
  }

  async updateWaterProject(id: number, data: Partial<WaterProject>): Promise<WaterProject | undefined> {
    const [updated] = await db.update(waterProjects).set(data).where(eq(waterProjects.id, id)).returning();
    return updated || undefined;
  }

  async deleteWaterProject(id: number): Promise<void> {
    await db.delete(waterProjects).where(eq(waterProjects.id, id));
  }

  async deleteCaseStudy(id: number): Promise<void> {
    await db.delete(caseStudies).where(eq(caseStudies.id, id));
  }

  // Theme settings operations
  async getThemeSettings(): Promise<any> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.settingKey, 'theme'));
    return setting?.settingValue || null;
  }

  async saveThemeSettings(settings: any): Promise<any> {
    const [existing] = await db.select().from(systemSettings).where(eq(systemSettings.settingKey, 'theme'));
    
    if (existing) {
      const [updated] = await db
        .update(systemSettings)
        .set({ settingValue: settings, updatedAt: new Date() })
        .where(eq(systemSettings.settingKey, 'theme'))
        .returning();
      return updated.settingValue;
    } else {
      const [created] = await db
        .insert(systemSettings)
        .values({ settingKey: 'theme', settingValue: settings })
        .returning();
      return created.settingValue;
    }
  }
}

export const storage = new DatabaseStorage();
