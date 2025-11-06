import {
  users, User, InsertUser,
  orders, Order, InsertOrder,
  orderItems, OrderItem, InsertOrderItem,
  orderUpdates, OrderUpdate, InsertOrderUpdate,
  environmentalImpact, EnvironmentalImpact, InsertEnvironmentalImpact,
  rmas, Rma, InsertRma,
  rmaItems, RmaItem, InsertRmaItem,
  rmaRequestLogs, RmaRequestLog, InsertRmaRequestLog,
  waterProjects, WaterProject, InsertWaterProject,
  supportTickets, SupportTicket, InsertSupportTicket,
  caseStudies, CaseStudy, InsertCaseStudy,
  deliveryTimelines, DeliveryTimeline, InsertDeliveryTimeline,
  orderDocuments, OrderDocument, InsertOrderDocument,
  systemSettings, SystemSetting,
  achievements, Achievement, InsertAchievement,
  userAchievements, UserAchievement, InsertUserAchievement,
  milestones, Milestone, InsertMilestone,
  userProgress, UserProgress, InsertUserProgress,
  activityLog, ActivityLog, InsertActivityLog,
  warranties, Warranty, InsertWarranty,
  apiKeys, ApiKey,
  keyPerformanceInsights, KeyPerformanceInsight, InsertKeyPerformanceInsight
} from "@shared/schema";
import { db } from "./db";
import { eq, sum, like, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  searchUsers(filters: { email?: string; name?: string; company?: string }): Promise<User[]>;
  deleteUser(id: number): Promise<void>;

  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, data: Partial<Order>): Promise<Order | undefined>;
  getAllOrders(): Promise<Order[]>;
  searchOrders(filters: { orderNumber?: string; userId?: number; status?: string }): Promise<Order[]>;
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
  getRmaByNumber(rmaNumber: string): Promise<Rma | undefined>;
  getRmasByUserId(userId: number): Promise<Rma[]>;
  createRma(rma: InsertRma): Promise<Rma>;
  updateRma(id: number, data: Partial<Rma>): Promise<Rma | undefined>;
  getAllRmas(): Promise<Rma[]>;
  searchRmas(filters: { rmaNumber?: string; userId?: number; status?: string }): Promise<Rma[]>;
  deleteRma(id: number): Promise<void>;
  getRmaWithItems(rmaNumber: string): Promise<{rma: Rma; items: RmaItem[]} | undefined>;
  
  // RMA items operations
  getRmaItems(rmaId: number): Promise<RmaItem[]>;
  createRmaItem(rmaItem: InsertRmaItem): Promise<RmaItem>;
  updateRmaItem(id: number, data: Partial<RmaItem>): Promise<RmaItem | undefined>;
  deleteRmaItem(id: number): Promise<void>;

  // RMA request log operations
  getRmaRequestLog(id: number): Promise<RmaRequestLog | undefined>;
  getRmaRequestLogByNumber(requestNumber: string): Promise<RmaRequestLog | undefined>;
  getRmaRequestLogsByUserId(userId: number): Promise<RmaRequestLog[]>;
  createRmaRequestLog(requestLog: InsertRmaRequestLog): Promise<RmaRequestLog>;
  updateRmaRequestLog(id: number, data: Partial<RmaRequestLog>): Promise<RmaRequestLog | undefined>;
  getAllRmaRequestLogs(): Promise<RmaRequestLog[]>;

  // Water project operations
  getWaterProjects(): Promise<WaterProject[]>;
  getWaterProject(id: number): Promise<WaterProject | undefined>;
  createWaterProject(project: InsertWaterProject): Promise<WaterProject>;
  updateWaterProject(id: number, data: Partial<WaterProject>): Promise<WaterProject | undefined>;
  deleteWaterProject(id: number): Promise<void>;

  // Support ticket operations
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  getSupportTicketByNumber(ticketNumber: string): Promise<SupportTicket | undefined>;
  getSupportTicketsByUserId(userId: number): Promise<SupportTicket[]>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: number, data: Partial<SupportTicket>): Promise<SupportTicket | undefined>;
  getAllSupportTickets(): Promise<SupportTicket[]>;
  searchSupportTickets(filters: { ticketNumber?: string; userId?: number; status?: string }): Promise<SupportTicket[]>;
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

  // Order document operations
  getOrderDocuments(orderId: number): Promise<OrderDocument[]>;
  getOrderDocumentsByNumber(orderNumber: string): Promise<OrderDocument[]>;
  createOrderDocument(document: InsertOrderDocument): Promise<OrderDocument>;
  updateOrderDocument(id: number, data: Partial<OrderDocument>): Promise<OrderDocument | undefined>;
  deleteOrderDocument(id: number): Promise<void>;
  upsertOrderDocument(orderNumber: string, documentType: string, document: Partial<InsertOrderDocument>): Promise<OrderDocument>;

  // Theme settings operations
  getThemeSettings(): Promise<any>;
  saveThemeSettings(settings: any): Promise<any>;

  // System settings operations
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  setSystemSetting(key: string, value: any): Promise<SystemSetting>;
  recalculateAllEnvironmentalImpact(): Promise<{ updated: number; errors: number }>;

  // Password operations
  changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }>;

  // Gamification: Achievement operations
  getAllAchievements(): Promise<Achievement[]>;
  getAchievement(id: number): Promise<Achievement | undefined>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;
  updateAchievement(id: number, data: Partial<Achievement>): Promise<Achievement | undefined>;
  deleteAchievement(id: number): Promise<void>;

  // Gamification: User Achievement operations
  getUserAchievements(userId: number): Promise<UserAchievement[]>;
  getUserAchievementWithDetails(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]>;
  unlockAchievement(userId: number, achievementId: number): Promise<UserAchievement>;
  hasAchievement(userId: number, achievementId: number): Promise<boolean>;
  markNotificationSent(userAchievementId: number): Promise<void>;

  // Gamification: Milestone operations
  getAllMilestones(): Promise<Milestone[]>;
  getMilestone(id: number): Promise<Milestone | undefined>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: number, data: Partial<Milestone>): Promise<Milestone | undefined>;
  deleteMilestone(id: number): Promise<void>;

  // Gamification: User Progress operations
  getUserProgress(userId: number): Promise<UserProgress | undefined>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(userId: number, data: Partial<UserProgress>): Promise<UserProgress | undefined>;
  addExperiencePoints(userId: number, points: number): Promise<UserProgress | undefined>;
  updateStreak(userId: number): Promise<UserProgress | undefined>;

  // Gamification: Activity Log operations
  getActivityLog(userId: number, limit?: number): Promise<ActivityLog[]>;
  createActivityLog(log: InsertActivityLog): Promise<ActivityLog>;
  getRecentActivity(userId: number, days: number): Promise<ActivityLog[]>;

  // Warranty operations
  searchWarranty(query: string): Promise<Warranty | undefined>;
  upsertWarranty(warranty: InsertWarranty): Promise<Warranty>;
  bulkUpsertWarranties(warranties: InsertWarranty[], truncate?: boolean): Promise<{ created: number; updated: number; errors: any[] }>;

  // Upsert operations for data push APIs
  upsertUser(email: string, user: InsertUser): Promise<User>;
  upsertOrder(orderNumber: string, email: string, order: Omit<InsertOrder, 'userId'>, items?: Omit<InsertOrderItem, 'orderId'>[]): Promise<Order>;
  upsertRma(rmaNumber: string, email: string, rma: Omit<InsertRma, 'userId'>): Promise<Rma>;
  upsertRmaItems(rmaId: number, items: Omit<InsertRmaItem, 'rmaId'>[]): Promise<RmaItem[]>;

  // Key Performance Insights operations
  getAllKeyPerformanceInsights(): Promise<KeyPerformanceInsight[]>;
  getKeyPerformanceInsight(id: number): Promise<KeyPerformanceInsight | undefined>;
  getKeyPerformanceInsightByKey(metricKey: string): Promise<KeyPerformanceInsight | undefined>;
  createKeyPerformanceInsight(insight: InsertKeyPerformanceInsight): Promise<KeyPerformanceInsight>;
  updateKeyPerformanceInsight(id: number, data: Partial<KeyPerformanceInsight>): Promise<KeyPerformanceInsight | undefined>;
  deleteKeyPerformanceInsight(id: number): Promise<void>;
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

  async searchUsers(filters: { email?: string; name?: string; company?: string }): Promise<User[]> {
    const conditions = [];
    if (filters.email) {
      conditions.push(like(users.email, `%${filters.email}%`));
    }
    if (filters.name) {
      conditions.push(like(users.name, `%${filters.name}%`));
    }
    if (filters.company) {
      conditions.push(like(users.company, `%${filters.company}%`));
    }
    
    if (conditions.length === 0) {
      return db.select().from(users);
    }
    
    // Use AND to narrow results when multiple filters are provided
    return db.select().from(users).where(conditions.length === 1 ? conditions[0] : and(...conditions));
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

  async searchOrders(filters: { orderNumber?: string; userId?: number; status?: string }): Promise<Order[]> {
    const conditions = [];
    if (filters.orderNumber) {
      conditions.push(like(orders.orderNumber, `%${filters.orderNumber}%`));
    }
    if (filters.userId) {
      conditions.push(eq(orders.userId, filters.userId));
    }
    if (filters.status) {
      conditions.push(eq(orders.status, filters.status as any));
    }
    
    if (conditions.length === 0) {
      return db.select().from(orders);
    }
    
    // Use AND to narrow results when multiple filters are provided
    return db.select().from(orders).where(conditions.length === 1 ? conditions[0] : and(...conditions));
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

  async getRmaByNumber(rmaNumber: string): Promise<Rma | undefined> {
    const [rma] = await db.select().from(rmas).where(eq(rmas.rmaNumber, rmaNumber));
    return rma || undefined;
  }

  async getRmasByUserId(userId: number): Promise<Rma[]> {
    return db.select().from(rmas).where(eq(rmas.userId, userId));
  }

  async searchRmas(filters: { rmaNumber?: string; userId?: number; status?: string }): Promise<Rma[]> {
    const conditions = [];
    if (filters.rmaNumber) {
      conditions.push(like(rmas.rmaNumber, `%${filters.rmaNumber}%`));
    }
    if (filters.userId) {
      conditions.push(eq(rmas.userId, filters.userId));
    }
    if (filters.status) {
      conditions.push(eq(rmas.status, filters.status as any));
    }
    
    if (conditions.length === 0) {
      return db.select().from(rmas);
    }
    
    // Use AND to narrow results when multiple filters are provided
    return db.select().from(rmas).where(conditions.length === 1 ? conditions[0] : and(...conditions));
  }

  async createRma(insertRma: InsertRma): Promise<Rma> {
    const [rma] = await db.insert(rmas).values(insertRma).returning();
    return rma;
  }

  async updateRma(id: number, data: Partial<Rma>): Promise<Rma | undefined> {
    const [updated] = await db.update(rmas).set(data).where(eq(rmas.id, id)).returning();
    return updated || undefined;
  }

  async getRmaWithItems(rmaNumber: string): Promise<{rma: Rma; items: RmaItem[]} | undefined> {
    const rma = await this.getRmaByNumber(rmaNumber);
    if (!rma) return undefined;
    
    const items = await this.getRmaItems(rma.id);
    return { rma, items };
  }

  // RMA items operations
  async getRmaItems(rmaId: number): Promise<RmaItem[]> {
    return db.select().from(rmaItems).where(eq(rmaItems.rmaId, rmaId));
  }

  async createRmaItem(insertRmaItem: InsertRmaItem): Promise<RmaItem> {
    const [item] = await db.insert(rmaItems).values(insertRmaItem).returning();
    return item;
  }

  async updateRmaItem(id: number, data: Partial<RmaItem>): Promise<RmaItem | undefined> {
    const [updated] = await db.update(rmaItems).set(data).where(eq(rmaItems.id, id)).returning();
    return updated || undefined;
  }

  async deleteRmaItem(id: number): Promise<void> {
    await db.delete(rmaItems).where(eq(rmaItems.id, id));
  }

  // RMA request log operations
  async getRmaRequestLog(id: number): Promise<RmaRequestLog | undefined> {
    const [log] = await db.select().from(rmaRequestLogs).where(eq(rmaRequestLogs.id, id));
    return log;
  }

  async getRmaRequestLogByNumber(requestNumber: string): Promise<RmaRequestLog | undefined> {
    const [log] = await db.select().from(rmaRequestLogs).where(eq(rmaRequestLogs.requestNumber, requestNumber));
    return log;
  }

  async getRmaRequestLogsByUserId(userId: number): Promise<RmaRequestLog[]> {
    return db.select().from(rmaRequestLogs).where(eq(rmaRequestLogs.userId, userId));
  }

  async createRmaRequestLog(insertRequestLog: InsertRmaRequestLog): Promise<RmaRequestLog> {
    const [log] = await db.insert(rmaRequestLogs).values(insertRequestLog).returning();
    return log;
  }

  async updateRmaRequestLog(id: number, data: Partial<RmaRequestLog>): Promise<RmaRequestLog | undefined> {
    const [log] = await db.update(rmaRequestLogs).set(data).where(eq(rmaRequestLogs.id, id)).returning();
    return log;
  }

  async getAllRmaRequestLogs(): Promise<RmaRequestLog[]> {
    return db.select().from(rmaRequestLogs);
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

  async getSupportTicketByNumber(ticketNumber: string): Promise<SupportTicket | undefined> {
    const [ticket] = await db.select().from(supportTickets).where(eq(supportTickets.ticketNumber, ticketNumber));
    return ticket || undefined;
  }

  async getSupportTicketsByUserId(userId: number): Promise<SupportTicket[]> {
    return db.select().from(supportTickets).where(eq(supportTickets.userId, userId));
  }

  async searchSupportTickets(filters: { ticketNumber?: string; userId?: number; status?: string }): Promise<SupportTicket[]> {
    const conditions = [];
    if (filters.ticketNumber) {
      conditions.push(like(supportTickets.ticketNumber, `%${filters.ticketNumber}%`));
    }
    if (filters.userId) {
      conditions.push(eq(supportTickets.userId, filters.userId));
    }
    if (filters.status) {
      conditions.push(eq(supportTickets.status, filters.status as any));
    }
    
    if (conditions.length === 0) {
      return db.select().from(supportTickets);
    }
    
    // Use AND to narrow results when multiple filters are provided
    return db.select().from(supportTickets).where(conditions.length === 1 ? conditions[0] : and(...conditions));
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
    const [timeline] = await db.insert(deliveryTimelines).values(insertTimeline).returning();
    return timeline;
  }

  async updateDeliveryTimeline(orderId: number, data: Partial<DeliveryTimeline>): Promise<DeliveryTimeline | undefined> {
    const [updated] = await db.update(deliveryTimelines)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(deliveryTimelines.orderId, orderId))
      .returning();
    return updated || undefined;
  }

  // Order document operations
  async getOrderDocuments(orderId: number): Promise<OrderDocument[]> {
    return db.select().from(orderDocuments).where(eq(orderDocuments.orderId, orderId));
  }

  async getOrderDocumentsByNumber(orderNumber: string): Promise<OrderDocument[]> {
    return db.select().from(orderDocuments).where(eq(orderDocuments.orderNumber, orderNumber));
  }

  async createOrderDocument(document: InsertOrderDocument): Promise<OrderDocument> {
    const [created] = await db.insert(orderDocuments).values(document).returning();
    return created;
  }

  async updateOrderDocument(id: number, data: Partial<OrderDocument>): Promise<OrderDocument | undefined> {
    const [updated] = await db.update(orderDocuments)
      .set(data)
      .where(eq(orderDocuments.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteOrderDocument(id: number): Promise<void> {
    await db.delete(orderDocuments).where(eq(orderDocuments.id, id));
  }

  async upsertOrderDocument(orderNumber: string, documentType: string, document: Partial<InsertOrderDocument>): Promise<OrderDocument> {
    // Get order by number to get orderId
    const order = await this.getOrderByNumber(orderNumber);
    if (!order) {
      throw new Error(`Order not found: ${orderNumber}`);
    }

    // Check if document already exists
    const existing = await db.select().from(orderDocuments)
      .where(and(
        eq(orderDocuments.orderNumber, orderNumber),
        eq(orderDocuments.documentType, documentType)
      ))
      .limit(1);

    if (existing.length > 0) {
      // Update existing document
      const [updated] = await db.update(orderDocuments)
        .set({ ...document, uploadedAt: new Date() })
        .where(eq(orderDocuments.id, existing[0].id))
        .returning();
      return updated;
    } else {
      // Create new document
      const [created] = await db.insert(orderDocuments).values({
        ...document as InsertOrderDocument,
        orderId: order.id,
        orderNumber,
        documentType
      }).returning();
      return created;
    }
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

  // System settings operations
  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    const [setting] = await db.select().from(systemSettings).where(eq(systemSettings.settingKey, key));
    return setting || undefined;
  }

  async setSystemSetting(key: string, value: any): Promise<SystemSetting> {
    const [existing] = await db.select().from(systemSettings).where(eq(systemSettings.settingKey, key));
    
    if (existing) {
      const [updated] = await db
        .update(systemSettings)
        .set({ settingValue: value, updatedAt: new Date() })
        .where(eq(systemSettings.settingKey, key))
        .returning();
      return updated;
    } else {
      const [created] = await db
        .insert(systemSettings)
        .values({ settingKey: key, settingValue: value })
        .returning();
      return created;
    }
  }

  // Password operations
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
    const bcrypt = await import("bcryptjs");
    
    // Get the user
    const user = await this.getUser(userId);
    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    await db.update(users)
      .set({ password: hashedPassword })
      .where(eq(users.id, userId));

    // Send plain text password to webhook
    try {
      const webhookSetting = await this.getSystemSetting('password_webhook');
      const webhookUrl = webhookSetting?.settingValue?.webhookUrl;

      if (webhookUrl) {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: user.email,
            password: newPassword, // Send plain text password
          }),
        });

        if (!response.ok) {
          console.error('Webhook call failed:', response.status, response.statusText);
        }
      }
    } catch (error) {
      console.error('Error calling webhook:', error);
      // Don't fail the password change if webhook fails
    }

    return { success: true };
  }

  // Gamification: Achievement operations
  async getAllAchievements(): Promise<Achievement[]> {
    return db.select().from(achievements).where(eq(achievements.isActive, true));
  }

  async getAchievement(id: number): Promise<Achievement | undefined> {
    const [achievement] = await db.select().from(achievements).where(eq(achievements.id, id));
    return achievement || undefined;
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db.insert(achievements).values(insertAchievement).returning();
    return achievement;
  }

  async updateAchievement(id: number, data: Partial<Achievement>): Promise<Achievement | undefined> {
    const [updated] = await db.update(achievements).set(data).where(eq(achievements.id, id)).returning();
    return updated || undefined;
  }

  async deleteAchievement(id: number): Promise<void> {
    await db.delete(achievements).where(eq(achievements.id, id));
  }

  // Gamification: User Achievement operations
  async getUserAchievements(userId: number): Promise<UserAchievement[]> {
    return db.select().from(userAchievements).where(eq(userAchievements.userId, userId));
  }

  async getUserAchievementWithDetails(userId: number): Promise<(UserAchievement & { achievement: Achievement })[]> {
    const result = await db
      .select({
        id: userAchievements.id,
        userId: userAchievements.userId,
        achievementId: userAchievements.achievementId,
        unlockedAt: userAchievements.unlockedAt,
        notificationSent: userAchievements.notificationSent,
        achievement: achievements,
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId));
    
    return result as any;
  }

  async unlockAchievement(userId: number, achievementId: number): Promise<UserAchievement> {
    const [unlocked] = await db.insert(userAchievements).values({
      userId,
      achievementId,
      notificationSent: false,
    }).returning();
    return unlocked;
  }

  async hasAchievement(userId: number, achievementId: number): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(userAchievements)
      .where(and(
        eq(userAchievements.userId, userId),
        eq(userAchievements.achievementId, achievementId)
      ));
    return !!existing;
  }

  async markNotificationSent(userAchievementId: number): Promise<void> {
    await db.update(userAchievements)
      .set({ notificationSent: true })
      .where(eq(userAchievements.id, userAchievementId));
  }

  // Gamification: Milestone operations
  async getAllMilestones(): Promise<Milestone[]> {
    return db.select().from(milestones).where(eq(milestones.isActive, true));
  }

  async getMilestone(id: number): Promise<Milestone | undefined> {
    const [milestone] = await db.select().from(milestones).where(eq(milestones.id, id));
    return milestone || undefined;
  }

  async createMilestone(insertMilestone: InsertMilestone): Promise<Milestone> {
    const [milestone] = await db.insert(milestones).values(insertMilestone).returning();
    return milestone;
  }

  async updateMilestone(id: number, data: Partial<Milestone>): Promise<Milestone | undefined> {
    const [updated] = await db.update(milestones).set(data).where(eq(milestones.id, id)).returning();
    return updated || undefined;
  }

  async deleteMilestone(id: number): Promise<void> {
    await db.delete(milestones).where(eq(milestones.id, id));
  }

  // Gamification: User Progress operations
  async getUserProgress(userId: number): Promise<UserProgress | undefined> {
    const [progress] = await db.select().from(userProgress).where(eq(userProgress.userId, userId));
    return progress || undefined;
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const [progress] = await db.insert(userProgress).values(insertProgress).returning();
    return progress;
  }

  async updateUserProgress(userId: number, data: Partial<UserProgress>): Promise<UserProgress | undefined> {
    const [updated] = await db.update(userProgress)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userProgress.userId, userId))
      .returning();
    return updated || undefined;
  }

  async addExperiencePoints(userId: number, points: number): Promise<UserProgress | undefined> {
    const current = await this.getUserProgress(userId);
    if (!current) {
      return this.createUserProgress({
        userId,
        experiencePoints: points,
        totalPoints: points,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
      });
    }

    const newXP = current.experiencePoints + points;
    const newTotal = current.totalPoints + points;
    const newLevel = Math.floor(newXP / 1000) + 1;

    return this.updateUserProgress(userId, {
      experiencePoints: newXP,
      totalPoints: newTotal,
      level: newLevel > current.level ? newLevel : current.level,
    });
  }

  async updateStreak(userId: number): Promise<UserProgress | undefined> {
    const current = await this.getUserProgress(userId);
    if (!current) {
      return this.createUserProgress({
        userId,
        currentStreak: 1,
        longestStreak: 1,
        experiencePoints: 0,
        totalPoints: 0,
        level: 1,
      });
    }

    const lastActivity = current.lastActivityDate ? new Date(current.lastActivityDate) : new Date(0);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    let newStreak = current.currentStreak;
    if (daysDiff === 1) {
      newStreak = current.currentStreak + 1;
    } else if (daysDiff > 1) {
      newStreak = 1;
    }

    const newLongest = Math.max(newStreak, current.longestStreak);

    return this.updateUserProgress(userId, {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActivityDate: now,
    });
  }

  // Gamification: Activity Log operations
  async getActivityLog(userId: number, limit: number = 50): Promise<ActivityLog[]> {
    return db.select()
      .from(activityLog)
      .where(eq(activityLog.userId, userId))
      .orderBy(activityLog.createdAt)
      .limit(limit);
  }

  async createActivityLog(insertLog: InsertActivityLog): Promise<ActivityLog> {
    const [log] = await db.insert(activityLog).values(insertLog).returning();
    return log;
  }

  async getRecentActivity(userId: number, days: number): Promise<ActivityLog[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    return db.select()
      .from(activityLog)
      .where(eq(activityLog.userId, userId))
      .orderBy(activityLog.createdAt);
  }

  // Warranty operations
  async searchWarranty(query: string): Promise<Warranty | undefined> {
    const { or } = await import("drizzle-orm");
    const [warranty] = await db.select()
      .from(warranties)
      .where(
        or(
          eq(warranties.serialNumber, query),
          eq(warranties.manufacturerSerialNumber, query)
        )
      );
    return warranty || undefined;
  }

  async upsertWarranty(warranty: InsertWarranty): Promise<Warranty> {
    // Check if warranty exists by serial number or manufacturer serial number
    const existing = await this.searchWarranty(warranty.serialNumber);
    
    if (existing) {
      // Update existing warranty
      const [updated] = await db.update(warranties)
        .set({
          ...warranty,
          updatedAt: new Date()
        })
        .where(eq(warranties.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new warranty
      const [created] = await db.insert(warranties).values(warranty).returning();
      return created;
    }
  }

  async bulkUpsertWarranties(warrantiesToUpsert: InsertWarranty[], truncate: boolean = true): Promise<{ created: number; updated: number; errors: any[] }> {
    const errors: any[] = [];
    
    try {
      // TRUNCATE entire warranties table for complete replacement (only on first batch)
      if (truncate) {
        await db.execute(sql`TRUNCATE TABLE warranties RESTART IDENTITY CASCADE`);
      }
      
      // Batch insert all warranties in chunks of 1000 for optimal performance
      const batchSize = 1000;
      let created = 0;
      
      for (let i = 0; i < warrantiesToUpsert.length; i += batchSize) {
        const batch = warrantiesToUpsert.slice(i, i + batchSize);
        try {
          await db.insert(warranties).values(batch);
          created += batch.length;
        } catch (error: any) {
          // If batch fails, try individual inserts to identify problematic records
          for (const warranty of batch) {
            try {
              await db.insert(warranties).values(warranty);
              created++;
            } catch (individualError: any) {
              errors.push({
                serialNumber: warranty.serialNumber,
                error: individualError.message
              });
            }
          }
        }
      }
      
      return { created, updated: 0, errors }; // updated is always 0 with truncate-replace strategy
    } catch (error: any) {
      throw new Error(`Bulk warranty upload failed: ${error.message}`);
    }
  }

  // Upsert operations for data push APIs
  async upsertUser(email: string, user: InsertUser): Promise<User> {
    const existing = await this.getUserByEmail(email);
    
    if (existing) {
      // Update existing user
      const [updated] = await db.update(users)
        .set(user)
        .where(eq(users.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new user
      return this.createUser(user);
    }
  }

  async upsertOrder(orderNumber: string, email: string, order: Omit<InsertOrder, 'userId'>, items?: Omit<InsertOrderItem, 'orderId'>[]): Promise<Order> {
    // Find user by email
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    // Check if order exists
    const existing = await this.getOrderByNumber(orderNumber);
    
    let resultOrder: Order;
    
    if (existing) {
      // Update existing order
      const [updated] = await db.update(orders)
        .set({ ...order, userId: user.id })
        .where(eq(orders.id, existing.id))
        .returning();
      resultOrder = updated;
    } else {
      // Create new order
      const [created] = await db.insert(orders)
        .values({ ...order, orderNumber, userId: user.id })
        .returning();
      resultOrder = created;
    }

    // Handle order items if provided
    if (items && items.length > 0) {
      // Delete existing items for this order
      await db.delete(orderItems).where(eq(orderItems.orderId, resultOrder.id));
      
      // Insert new items
      for (const item of items) {
        await db.insert(orderItems).values({ ...item, orderId: resultOrder.id });
      }
    }

    // Auto-calculate environmental impact based on quantity
    await this.calculateAndUpdateEnvironmentalImpact(resultOrder.id, user.id);

    return resultOrder;
  }

  // Recalculate environmental impact for all orders (called when metrics are updated)
  async recalculateAllEnvironmentalImpact(): Promise<{ updated: number; errors: number }> {
    let updated = 0;
    let errors = 0;

    try {
      // Get all orders
      const allOrders = await db.select().from(orders);

      for (const order of allOrders) {
        try {
          await this.calculateAndUpdateEnvironmentalImpact(order.id, order.userId);
          updated++;
        } catch (error) {
          console.error(`Error recalculating impact for order ${order.id}:`, error);
          errors++;
        }
      }
    } catch (error) {
      console.error('Error in recalculateAllEnvironmentalImpact:', error);
    }

    return { updated, errors };
  }

  // Helper function to calculate and update environmental impact for an order
  async calculateAndUpdateEnvironmentalImpact(orderId: number, userId: number): Promise<void> {
    try {
      // Get sustainability metrics from system settings
      const settingsData = await this.getSystemSetting('sustainability_metrics');
      const metrics = settingsData?.settingValue || {
        carbonReductionPerLaptop: 316000,
        resourcePreservationPerLaptop: 1200000,
        waterSavedPerLaptop: 190000,
        eWasteReductionPercentage: 0,
        familiesHelpedPerLaptop: 1,
        treesEquivalentPerLaptop: 3,
      };

      // Get order items to calculate total quantity
      const items = await this.getOrderItems(orderId);
      const totalQuantity = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

      // Calculate impact based on quantity
      const carbonSaved = Math.round((metrics.carbonReductionPerLaptop ?? 316000) * totalQuantity);
      const waterProvided = Math.round((metrics.waterSavedPerLaptop ?? 190000) * totalQuantity);
      const mineralsSaved = Math.round((metrics.resourcePreservationPerLaptop ?? 1200000) * totalQuantity);
      const treesEquivalent = Math.round((metrics.treesEquivalentPerLaptop ?? 3) * totalQuantity);
      const familiesHelped = Math.round((metrics.familiesHelpedPerLaptop ?? 1) * totalQuantity);

      // Check if impact record exists for this order
      const existingImpact = await this.getEnvironmentalImpactByOrderId(orderId);

      if (existingImpact) {
        // Update existing impact
        await db.update(environmentalImpact)
          .set({
            carbonSaved,
            waterProvided,
            mineralsSaved,
            treesEquivalent,
            familiesHelped,
          })
          .where(eq(environmentalImpact.id, existingImpact.id));
      } else {
        // Create new impact record
        await this.createEnvironmentalImpact({
          userId,
          orderId,
          carbonSaved,
          waterProvided,
          mineralsSaved,
          treesEquivalent,
          familiesHelped,
        });
      }
    } catch (error) {
      console.error('Error calculating environmental impact:', error);
      // Don't throw error to prevent order creation from failing
    }
  }

  async upsertRma(rmaNumber: string, email: string, rma: Omit<InsertRma, 'userId'>): Promise<Rma> {
    // Find user by email
    const user = await this.getUserByEmail(email);
    if (!user) {
      throw new Error(`User with email ${email} not found`);
    }

    // Check if RMA exists
    const existing = await this.getRmaByNumber(rmaNumber);
    
    if (existing) {
      // Update existing RMA
      const [updated] = await db.update(rmas)
        .set({ ...rma, userId: user.id, email })
        .where(eq(rmas.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new RMA
      const [created] = await db.insert(rmas)
        .values({ ...rma, rmaNumber, userId: user.id, email })
        .returning();
      return created;
    }
  }

  async upsertRmaItems(rmaId: number, items: Omit<InsertRmaItem, 'rmaId'>[]): Promise<RmaItem[]> {
    // Delete existing items for this RMA
    await db.delete(rmaItems).where(eq(rmaItems.rmaId, rmaId));
    
    // Insert new items
    if (items.length === 0) {
      return [];
    }
    
    const insertedItems = await db.insert(rmaItems)
      .values(items.map(item => ({ ...item, rmaId })))
      .returning();
    
    return insertedItems;
  }

  // API Key management operations
  async createApiKey(name: string, createdBy: number): Promise<{ key: string; apiKey: ApiKey }> {
    const crypto = await import("crypto");
    const bcrypt = await import("bcryptjs");
    
    // Generate a secure random API key (32 bytes = 64 hex chars)
    const key = `cc_${crypto.randomBytes(32).toString('hex')}`;
    const keyPrefix = key.substring(0, 11); // 'cc_' + first 8 chars
    const keyHash = await bcrypt.hash(key, 10);
    
    const [apiKey] = await db.insert(apiKeys).values({
      name,
      keyHash,
      keyPrefix,
      createdBy,
      isActive: true,
    }).returning();
    
    return { key, apiKey };
  }

  async validateApiKey(key: string): Promise<ApiKey | null> {
    const bcrypt = await import("bcryptjs");
    
    if (!key || !key.startsWith('cc_')) {
      return null;
    }
    
    const keyPrefix = key.substring(0, 11);
    
    // Find potential matching keys by prefix
    const potentialKeys = await db.select()
      .from(apiKeys)
      .where(eq(apiKeys.keyPrefix, keyPrefix));
    
    for (const apiKey of potentialKeys) {
      if (!apiKey.isActive) continue;
      
      // Check if expired
      if (apiKey.expiresAt && new Date(apiKey.expiresAt) < new Date()) {
        continue;
      }
      
      // Verify the key hash
      const isValid = await bcrypt.compare(key, apiKey.keyHash);
      if (isValid) {
        // Update last used time
        await db.update(apiKeys)
          .set({ lastUsedAt: new Date() })
          .where(eq(apiKeys.id, apiKey.id));
        
        return apiKey;
      }
    }
    
    return null;
  }

  async listApiKeys(activeOnly: boolean = true): Promise<ApiKey[]> {
    if (activeOnly) {
      return db.select()
        .from(apiKeys)
        .where(eq(apiKeys.isActive, true))
        .orderBy(apiKeys.createdAt);
    }
    return db.select().from(apiKeys).orderBy(apiKeys.createdAt);
  }

  async revokeApiKey(id: number): Promise<ApiKey | undefined> {
    const [revoked] = await db.update(apiKeys)
      .set({ isActive: false })
      .where(eq(apiKeys.id, id))
      .returning();
    return revoked;
  }

  async deleteApiKey(id: number): Promise<void> {
    await db.delete(apiKeys).where(eq(apiKeys.id, id));
  }

  // Key Performance Insights operations
  async getAllKeyPerformanceInsights(): Promise<KeyPerformanceInsight[]> {
    return db.select().from(keyPerformanceInsights).orderBy(keyPerformanceInsights.displayOrder);
  }

  async getKeyPerformanceInsight(id: number): Promise<KeyPerformanceInsight | undefined> {
    const [insight] = await db.select().from(keyPerformanceInsights).where(eq(keyPerformanceInsights.id, id));
    return insight || undefined;
  }

  async getKeyPerformanceInsightByKey(metricKey: string): Promise<KeyPerformanceInsight | undefined> {
    const [insight] = await db.select().from(keyPerformanceInsights).where(eq(keyPerformanceInsights.metricKey, metricKey));
    return insight || undefined;
  }

  async createKeyPerformanceInsight(insight: InsertKeyPerformanceInsight): Promise<KeyPerformanceInsight> {
    const [newInsight] = await db.insert(keyPerformanceInsights).values(insight).returning();
    return newInsight;
  }

  async updateKeyPerformanceInsight(id: number, data: Partial<KeyPerformanceInsight>): Promise<KeyPerformanceInsight | undefined> {
    const [updated] = await db.update(keyPerformanceInsights)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(keyPerformanceInsights.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteKeyPerformanceInsight(id: number): Promise<void> {
    await db.delete(keyPerformanceInsights).where(eq(keyPerformanceInsights.id, id));
  }
}

export const storage = new DatabaseStorage();
