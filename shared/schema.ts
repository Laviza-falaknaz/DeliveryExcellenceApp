import { pgTable, text, serial, integer, boolean, timestamp, json, foreignKey, pgEnum, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  company: text("company").notNull(),
  email: text("email").notNull().unique(),
  phoneNumber: text("phone_number"),
  isAdmin: boolean("is_admin").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
  notificationPreferences: json("notification_preferences").$type<{
    orderUpdates: boolean;
    environmentalImpact: boolean;
    charityUpdates: boolean;
    serviceReminders: boolean;
  }>().default({
    orderUpdates: true,
    environmentalImpact: true,
    charityUpdates: true,
    serviceReminders: true,
  }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Enum for order status
export const orderStatusEnum = pgEnum("order_status", [
  "placed",
  "processing",
  "in_production",
  "quality_check",
  "shipped",
  "delivered",
  "completed",
  "cancelled",
  "returned",
]);

// Order schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  status: orderStatusEnum("status").notNull().default("placed"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(), // Decimal amount (e.g., 999.99)
  savedAmount: numeric("saved_amount", { precision: 10, scale: 2 }).notNull(), // Decimal amount (e.g., 100.50)
  currency: text("currency").notNull().default("GBP"), // USD, GBP, EUR, AED, etc.
  orderDate: timestamp("order_date").defaultNow(),
  estimatedDelivery: timestamp("estimated_delivery"),
  trackingNumber: text("tracking_number"),
  shippingAddress: json("shipping_address").$type<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

// Order items schema
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  productName: text("product_name").notNull(),
  productDescription: text("product_description").notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(), // Decimal price (e.g., 49.99)
  totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(), // Decimal total (e.g., 99.98)
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

// Order updates schema
export const orderUpdates = pgTable("order_updates", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  status: orderStatusEnum("status").notNull(),
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderUpdateSchema = createInsertSchema(orderUpdates).omit({
  id: true,
  createdAt: true,
});

// Environmental impact schema
export const environmentalImpact = pgTable("environmental_impact", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  orderId: integer("order_id").references(() => orders.id),
  carbonSaved: integer("carbon_saved").notNull(), // in grams
  waterProvided: integer("water_provided").notNull(), // in liters
  mineralsSaved: integer("minerals_saved").notNull(), // in grams
  treesEquivalent: integer("trees_equivalent").notNull(),
  familiesHelped: integer("families_helped").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEnvironmentalImpactSchema = createInsertSchema(environmentalImpact).omit({
  id: true,
  createdAt: true,
});

// RMA schema (Return Merchandise Authorization)
export const rmaStatusEnum = pgEnum("rma_status", [
  "requested",
  "approved",
  "in_transit",
  "received",
  "processing",
  "completed",
  "rejected",
]);

export const rmas = pgTable("rmas", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  rmaNumber: text("rma_number").notNull().unique(),
  email: text("email").notNull(),
  status: rmaStatusEnum("status").notNull().default("requested"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRmaSchema = createInsertSchema(rmas).omit({
  id: true,
  createdAt: true,
});

// RMA Items schema (serial numbers and details)
export const rmaItems = pgTable("rma_items", {
  id: serial("id").primaryKey(),
  rmaId: integer("rma_id").notNull().references(() => rmas.id, { onDelete: 'cascade' }),
  serialNumber: text("serial_number").notNull(),
  errorDescription: text("error_description").notNull(),
  receivedAtWarehouseOn: timestamp("received_at_warehouse_on"),
  solution: text("solution"),
  reasonForReturn: text("reason_for_return").notNull(),
  productDetails: text("product_details").notNull(),
  relatedOrder: text("related_order"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRmaItemSchema = createInsertSchema(rmaItems).omit({
  id: true,
  createdAt: true,
});

export type RmaItem = typeof rmaItems.$inferSelect;
export type InsertRmaItem = z.infer<typeof insertRmaItemSchema>;

// Charity water project schema
export const waterProjects = pgTable("water_projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  description: text("description").notNull(),
  peopleImpacted: integer("people_impacted").notNull(),
  waterProvided: integer("water_provided").notNull(), // in liters
  imageUrl: text("image_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWaterProjectSchema = createInsertSchema(waterProjects).omit({
  id: true,
  createdAt: true,
});

// Support ticket schema
export const supportTicketStatusEnum = pgEnum("support_ticket_status", [
  "open",
  "in_progress",
  "resolved",
  "closed",
]);

export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  orderId: integer("order_id").references(() => orders.id),
  ticketNumber: text("ticket_number").notNull().unique(),
  subject: text("subject").notNull(),
  description: text("description").notNull(),
  status: supportTicketStatusEnum("status").notNull().default("open"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSupportTicketSchema = createInsertSchema(supportTickets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Case study participation schema
export const caseStudies = pgTable("case_studies", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  companyName: text("company_name").notNull(),
  contactName: text("contact_name").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  industryType: text("industry_type").notNull(),
  employeeCount: integer("employee_count"),
  testimonial: text("testimonial"),
  approved: boolean("approved").default(false),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCaseStudySchema = createInsertSchema(caseStudies).omit({
  id: true,
  approved: true,
  featured: true,
  createdAt: true,
});

// Delivery Timeline - stores timestamps for each milestone based on actual system dates
export const deliveryTimelines = pgTable("delivery_timelines", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  orderDate: timestamp("order_date"), // Order Date - When order was placed
  paymentDate: timestamp("payment_date"), // Payment Date - When payment was received  
  invoiceMailed: timestamp("invoice_mailed"), // Date Invoice Mailed - When invoice was sent
  sentToWarehouse: timestamp("sent_to_warehouse"), // Sent to Warehouse Date - When order sent to warehouse for processing
  dateFulfilled: timestamp("date_fulfilled"), // Date Fulfilled - When warehouse completed order preparation
  dispatchDate: timestamp("dispatch_date"), // Dispatch Date - When order left the warehouse
  orderCompleted: timestamp("order_completed"), // Completion Date - When order process fully completed
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDeliveryTimelineSchema = createInsertSchema(deliveryTimelines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Order Documents/Attachments schema
export const orderDocuments = pgTable("order_documents", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  orderNumber: text("order_number").notNull(), // For syncing documents by order number
  documentType: text("document_type").notNull(), // 'credit_note', 'packing_list', 'hashcodes', 'invoice'
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(), // URL/path to the document
  fileSize: integer("file_size"), // File size in bytes
  mimeType: text("mime_type"), // e.g., 'application/pdf', 'text/csv', 'application/vnd.ms-excel'
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrderDocumentSchema = createInsertSchema(orderDocuments).omit({
  id: true,
  createdAt: true,
});

// System Settings schema
export const systemSettings = pgTable("system_settings", {
  id: serial("id").primaryKey(),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: json("setting_value").$type<{
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    headingFont?: string;
    bodyFont?: string;
    logoUrl?: string;
    companyName?: string;
    webhookUrl?: string;
  }>(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSystemSettingsSchema = createInsertSchema(systemSettings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type OrderUpdate = typeof orderUpdates.$inferSelect;
export type InsertOrderUpdate = z.infer<typeof insertOrderUpdateSchema>;

export type EnvironmentalImpact = typeof environmentalImpact.$inferSelect;
export type InsertEnvironmentalImpact = z.infer<typeof insertEnvironmentalImpactSchema>;

export type Rma = typeof rmas.$inferSelect;
export type InsertRma = z.infer<typeof insertRmaSchema>;

export type WaterProject = typeof waterProjects.$inferSelect;
export type InsertWaterProject = z.infer<typeof insertWaterProjectSchema>;

export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = z.infer<typeof insertSupportTicketSchema>;

export type CaseStudy = typeof caseStudies.$inferSelect;
export type InsertCaseStudy = z.infer<typeof insertCaseStudySchema>;

export type DeliveryTimeline = typeof deliveryTimelines.$inferSelect;
export type InsertDeliveryTimeline = z.infer<typeof insertDeliveryTimelineSchema>;

export type OrderDocument = typeof orderDocuments.$inferSelect;
export type InsertOrderDocument = z.infer<typeof insertOrderDocumentSchema>;

export type SystemSetting = typeof systemSettings.$inferSelect;
export type InsertSystemSetting = z.infer<typeof insertSystemSettingsSchema>;

// Gamification: Achievement definitions
export const achievementCategoryEnum = pgEnum("achievement_category", [
  "environmental",
  "orders",
  "engagement",
  "milestones",
  "social",
]);

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: achievementCategoryEnum("category").notNull(),
  icon: text("icon").notNull(), // Remix icon class
  badgeColor: text("badge_color").notNull(), // Hex color
  points: integer("points").notNull().default(100),
  criteria: json("criteria").$type<{
    type: string; // e.g., "orders_count", "carbon_saved", "water_provided"
    threshold: number;
  }>().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  createdAt: true,
});

// Gamification: User achievements (junction table)
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  notificationSent: boolean("notification_sent").default(false),
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements).omit({
  id: true,
  unlockedAt: true,
});

// Gamification: Milestones configuration
export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  metricType: text("metric_type").notNull(), // "carbon_saved", "water_provided", etc.
  targetValue: integer("target_value").notNull(),
  rewardPoints: integer("reward_points").notNull().default(500),
  icon: text("icon").notNull(),
  color: text("color").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
  createdAt: true,
});

// Gamification: User progress (level, points, streaks)
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id),
  level: integer("level").notNull().default(1),
  experiencePoints: integer("experience_points").notNull().default(0),
  totalPoints: integer("total_points").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0), // Days logged in consecutively
  longestStreak: integer("longest_streak").notNull().default(0),
  lastActivityDate: timestamp("last_activity_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Gamification: Activity log
export const activityTypeEnum = pgEnum("activity_type", [
  "login",
  "order_placed",
  "rma_created",
  "support_ticket",
  "impact_shared",
  "profile_updated",
  "milestone_reached",
  "achievement_unlocked",
]);

export const activityLog = pgTable("activity_log", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  activityType: activityTypeEnum("activity_type").notNull(),
  description: text("description").notNull(),
  pointsEarned: integer("points_earned").default(0),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertActivityLogSchema = createInsertSchema(activityLog).omit({
  id: true,
  createdAt: true,
});

// Types
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = z.infer<typeof insertUserAchievementSchema>;

export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type ActivityLog = typeof activityLog.$inferSelect;
export type InsertActivityLog = z.infer<typeof insertActivityLogSchema>;

// Warranty lookup schema
export const warranties = pgTable("warranties", {
  id: serial("id").primaryKey(),
  serialNumber: text("serial_number").notNull(),
  manufacturerSerialNumber: text("manufacturer_serial_number").notNull(),
  productDescription: text("product_description").notNull(), // Product name/description
  areaId: text("area_id").notNull(),
  itemId: text("item_id").notNull(),
  warrantyDescription: text("warranty_description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertWarrantySchema = createInsertSchema(warranties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Bulk warranty insert schema for API (accepts array)
export const bulkWarrantyInsertSchema = z.object({
  warranties: z.array(z.object({
    serialNumber: z.string().min(1),
    manufacturerSerialNumber: z.string().min(1),
    productDescription: z.string().min(1),
    areaId: z.string().min(1),
    itemId: z.string().min(1),
    warrantyDescription: z.string().min(1),
    startDate: z.string().datetime().or(z.date()).transform(val => typeof val === 'string' ? new Date(val) : val),
    endDate: z.string().datetime().or(z.date()).transform(val => typeof val === 'string' ? new Date(val) : val),
  }))
});

export type Warranty = typeof warranties.$inferSelect;
export type InsertWarranty = z.infer<typeof insertWarrantySchema>;
export type BulkWarrantyInsert = z.infer<typeof bulkWarrantyInsertSchema>;

// API Keys schema for authentication
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  keyHash: text("key_hash").notNull(),
  keyPrefix: text("key_prefix").notNull(), // First 8 chars for identification
  createdBy: integer("created_by").references(() => users.id),
  lastUsedAt: timestamp("last_used_at"),
  expiresAt: timestamp("expires_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  createdAt: true,
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;
