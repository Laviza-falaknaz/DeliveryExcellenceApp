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
  purchaseOrderNumber: text("purchase_order_number"), // Customer's PO number for reference
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
  isActive: boolean("is_active").notNull().default(true),
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
  waterProvided: integer("water_provided").notNull(), // in liters (charity water provided)
  waterSaved: integer("water_saved").notNull().default(0), // in liters (manufacturing water saved)
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
  image: text("image"), // base64 encoded product image
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRmaItemSchema = createInsertSchema(rmaItems).omit({
  id: true,
  createdAt: true,
});

export type RmaItem = typeof rmaItems.$inferSelect;
export type InsertRmaItem = z.infer<typeof insertRmaItemSchema>;

// RMA Request Log schema (tracks submitted requests before RMA creation)
export const rmaRequestStatusEnum = pgEnum("rma_request_status", [
  "submitted",
  "approved",
  "declined",
]);

export const rmaRequestLogs = pgTable("rma_request_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  requestNumber: text("request_number").notNull().unique(),
  fullName: text("full_name").notNull(),
  companyName: text("company_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  recipientContactNumber: text("recipient_contact_number").notNull(),
  countryOfPurchase: text("country_of_purchase").notNull(),
  numberOfProducts: integer("number_of_products").notNull(),
  productMakeModel: text("product_make_model").notNull(),
  manufacturerSerialNumber: text("manufacturer_serial_number").notNull(),
  inHouseSerialNumber: text("in_house_serial_number").notNull(),
  faultDescription: text("fault_description").notNull(),
  products: json("products").$type<Array<{
    productMakeModel: string;
    manufacturerSerialNumber: string;
    inHouseSerialNumber: string;
    faultDescription: string;
    image?: string; // base64 encoded product image
  }>>(),
  fileAttachment: json("file_attachment").$type<{
    hasAttachment?: boolean;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    productCount?: number;
  } | null>(),
  status: rmaRequestStatusEnum("status").notNull().default("submitted"),
  rmaNumber: text("rma_number"), // Populated when request is approved and RMA is created
  declineReason: text("decline_reason"),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
});

export const insertRmaRequestLogSchema = createInsertSchema(rmaRequestLogs).omit({
  id: true,
  createdAt: true,
});

export type RmaRequestLog = typeof rmaRequestLogs.$inferSelect;
export type InsertRmaRequestLog = z.infer<typeof insertRmaRequestLogSchema>;

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

// Remanufactured tips schema
export const remanufacturedTips = pgTable("remanufactured_tips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  icon: text("icon").notNull().default("ri-information-line"), // Remix icon class
  category: text("category").notNull(), // Setup, Configuration, Maintenance, Important, Verification, Care, etc.
  categoryColor: text("category_color").notNull().default("#08ABAB"), // Hex color code for category theming
  displayOrder: integer("display_order").notNull().default(0), // For sorting
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const insertRemanufacturedTipSchema = createInsertSchema(remanufacturedTips).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type RemanufacturedTip = typeof remanufacturedTips.$inferSelect;
export type InsertRemanufacturedTip = z.infer<typeof insertRemanufacturedTipSchema>;

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
    // Theme settings
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    headingFont?: string;
    bodyFont?: string;
    logoUrl?: string;
    companyName?: string;
    webhookUrl?: string;
    // Admin portal settings
    visibleTabs?: string[]; // Array of tab IDs that should be visible
    rmaNotificationEmails?: string[]; // Email addresses to notify on RMA requests
    rmaWebhookUrl?: string; // Webhook URL for RMA request notifications
    newUserAlertEmails?: string[]; // Email addresses to notify on new user creation
    documentDownloadApiUrl?: string; // External API URL for document downloads
    supportPhoneNumber?: string; // Support phone number for customer contact
    // Sustainability metrics per laptop (in grams for carbon/minerals, liters for water)
    carbonReductionPerLaptop?: number; // in grams (e.g., 316000 for 316 KGS)
    resourcePreservationPerLaptop?: number; // in grams (e.g., 1200000 for 1200 KGS)
    waterSavedPerLaptop?: number; // in liters (e.g., 190000)
    eWasteReductionPercentage?: number; // percentage (e.g., 0 for 0%)
    familiesHelpedPerLaptop?: number; // number of families (e.g., 1)
    treesEquivalentPerLaptop?: number; // number of trees equivalent
    powerAutomateSerialLookupUrl?: string; // Power Automate URL for serial number lookup
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
  "quiz_completed",
  "game_completed",
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

// Key Performance Insights schema - admin-controlled metrics for ESG report
export const keyPerformanceInsights = pgTable("key_performance_insights", {
  id: serial("id").primaryKey(),
  metricKey: text("metric_key").notNull().unique(), // e.g., 'remanufactured_units', 'e_waste_diverted', 'carbon_per_device', 'social_impact_score'
  metricName: text("metric_name").notNull(), // Display name
  metricValue: text("metric_value").notNull(), // String value to allow flexibility (e.g., "X units", "Y kg")
  metricUnit: text("metric_unit"), // Optional unit (e.g., 'units', 'kg', 'score')
  metricCategory: text("metric_category").notNull(), // e.g., 'environmental', 'social', 'governance'
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  description: text("description"), // Optional description for tooltip/help text
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertKeyPerformanceInsightSchema = createInsertSchema(keyPerformanceInsights).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type KeyPerformanceInsight = typeof keyPerformanceInsights.$inferSelect;
export type InsertKeyPerformanceInsight = z.infer<typeof insertKeyPerformanceInsightSchema>;

// Organizational Metrics schema - company-wide aggregated statistics
export const organizationalMetrics = pgTable("organizational_metrics", {
  id: serial("id").primaryKey(),
  metricKey: text("metric_key").notNull().unique(), // 'total_units_deployed'
  metricValue: numeric("metric_value", { precision: 15, scale: 2 }).notNull(), // Numeric value
  metricUnit: text("metric_unit"), // 'units', 'kg', 'liters', etc.
  description: text("description"),
  lastUpdatedBy: integer("last_updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertOrganizationalMetricSchema = createInsertSchema(organizationalMetrics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type OrganizationalMetric = typeof organizationalMetrics.$inferSelect;
export type InsertOrganizationalMetric = z.infer<typeof insertOrganizationalMetricSchema>;

// ESG Targets schema - configurable sustainability goals and targets
export const esgTargets = pgTable("esg_targets", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // 'environmental', 'social', 'governance'
  title: text("title").notNull(),
  targetValue: numeric("target_value", { precision: 15, scale: 2 }).notNull(),
  currentValue: numeric("current_value", { precision: 15, scale: 2 }).notNull().default('0'),
  unit: text("unit").notNull(), // 'units', 'kg', 'families', '%', etc.
  description: text("description"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  startDate: timestamp("start_date").defaultNow(),
  targetDate: timestamp("target_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertEsgTargetSchema = createInsertSchema(esgTargets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type EsgTarget = typeof esgTargets.$inferSelect;
export type InsertEsgTarget = z.infer<typeof insertEsgTargetSchema>;

// Gamification Tiers schema - defines achievement levels (Explorer, Innovator, Vanguard, etc.)
export const gamificationTiers = pgTable("gamification_tiers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(), // e.g., 'Explorer', 'Innovator', 'Vanguard'
  minScore: integer("min_score").notNull(), // Minimum score to reach this tier
  maxScore: integer("max_score"), // Maximum score for this tier (null for highest tier)
  colorAccent: text("color_accent").notNull().default('#08ABAB'), // Hex color for tier branding
  icon: text("icon"), // Icon identifier or URL
  benefits: json("benefits").$type<string[]>().default([]), // List of benefits for reaching this tier
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGamificationTierSchema = createInsertSchema(gamificationTiers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type GamificationTier = typeof gamificationTiers.$inferSelect;
export type InsertGamificationTier = z.infer<typeof insertGamificationTierSchema>;

// Gamification Achievements schema - badges and achievements users can unlock
export const gamificationAchievements = pgTable("gamification_achievements", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // Unique identifier like 'carbon_champion_100'
  name: text("name").notNull(), // Display name: "Carbon Champion"
  description: text("description").notNull(), // What the achievement is for
  icon: text("icon"), // Icon identifier or URL
  category: text("category").notNull(), // 'environmental', 'social', 'governance', 'engagement'
  thresholdType: text("threshold_type").notNull(), // 'carbon_saved', 'water_provided', 'orders_completed', etc.
  thresholdValue: numeric("threshold_value", { precision: 15, scale: 2 }).notNull(), // Target value to unlock
  rewardPoints: integer("reward_points").notNull().default(0), // Points awarded when unlocked
  tierRequired: integer("tier_required").references(() => gamificationTiers.id), // Optional: required tier to see/unlock
  shareCopy: text("share_copy"), // Pre-written text for social sharing
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGamificationAchievementSchema = createInsertSchema(gamificationAchievements).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type GamificationAchievement = typeof gamificationAchievements.$inferSelect;
export type InsertGamificationAchievement = z.infer<typeof insertGamificationAchievementSchema>;

// User Achievement Progress schema - tracks user progress toward achievements
export const userAchievementProgress = pgTable("user_achievement_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => gamificationAchievements.id),
  currentValue: numeric("current_value", { precision: 15, scale: 2 }).notNull().default('0'), // Current progress
  progressPercent: integer("progress_percent").notNull().default(0), // 0-100%
  isUnlocked: boolean("is_unlocked").notNull().default(false),
  unlockedAt: timestamp("unlocked_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserAchievementProgressSchema = createInsertSchema(userAchievementProgress).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type UserAchievementProgress = typeof userAchievementProgress.$inferSelect;
export type InsertUserAchievementProgress = z.infer<typeof insertUserAchievementProgressSchema>;

// Gamification Milestones schema - journey milestones tied to tiers
export const gamificationMilestones = pgTable("gamification_milestones", {
  id: serial("id").primaryKey(),
  tierId: integer("tier_id").references(() => gamificationTiers.id), // Optional: link to tier
  title: text("title").notNull(), // e.g., "First Carbon Offset"
  description: text("description").notNull(),
  icon: text("icon"),
  requiredScore: integer("required_score"), // Score needed to reach this milestone
  orderIndex: integer("order_index").notNull().default(0), // Order in timeline
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGamificationMilestoneSchema = createInsertSchema(gamificationMilestones).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type GamificationMilestone = typeof gamificationMilestones.$inferSelect;
export type InsertGamificationMilestone = z.infer<typeof insertGamificationMilestoneSchema>;

// User Milestone Events schema - tracks when users reach milestones
export const userMilestoneEvents = pgTable("user_milestone_events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  milestoneId: integer("milestone_id").notNull().references(() => gamificationMilestones.id),
  reachedAt: timestamp("reached_at").defaultNow(),
  metadata: json("metadata").$type<Record<string, any>>(), // Additional context data
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserMilestoneEventSchema = createInsertSchema(userMilestoneEvents).omit({
  id: true,
  createdAt: true,
});

export type UserMilestoneEvent = typeof userMilestoneEvents.$inferSelect;
export type InsertUserMilestoneEvent = z.infer<typeof insertUserMilestoneEventSchema>;

// ESG Scores schema - calculated scores for users over time
export const esgScores = pgTable("esg_scores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  period: text("period").notNull(), // e.g., '2025-01', 'all-time', 'current'
  totalScore: integer("total_score").notNull().default(0),
  tierId: integer("tier_id").references(() => gamificationTiers.id),
  breakdown: json("breakdown").$type<{
    carbon: number;
    water: number;
    resources: number;
    social: number;
  }>(), // Score breakdown by pillar
  metadata: json("metadata").$type<Record<string, any>>(), // Additional scoring data
  calculatedAt: timestamp("calculated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEsgScoreSchema = createInsertSchema(esgScores).omit({
  id: true,
  createdAt: true,
});

export type EsgScore = typeof esgScores.$inferSelect;
export type InsertEsgScore = z.infer<typeof insertEsgScoreSchema>;

// Gamification Settings schema - configurable system settings for scoring and features
export const gamificationSettings = pgTable("gamification_settings", {
  id: serial("id").primaryKey(),
  settingKey: text("setting_key").notNull().unique(), // e.g., 'scoring_weights', 'features_enabled'
  settingValue: json("setting_value").$type<any>().notNull(), // JSON value for flexibility
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGamificationSettingSchema = createInsertSchema(gamificationSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type GamificationSetting = typeof gamificationSettings.$inferSelect;
export type InsertGamificationSetting = z.infer<typeof insertGamificationSettingSchema>;

// Impact Equivalency Settings schema - configurable conversion factors for impact visualizations
export const impactEquivalencySettings = pgTable("impact_equivalency_settings", {
  id: serial("id").primaryKey(),
  equivalencyType: text("equivalency_type").notNull().unique(), // 'trees', 'car_miles', 'phone_charges', etc.
  name: text("name").notNull(), // Display name: "Trees Planted"
  description: text("description").notNull(), // e.g., "trees planted"
  conversionFactor: numeric("conversion_factor", { precision: 15, scale: 5 }).notNull(), // Factor to multiply or divide carbon by
  conversionOperation: text("conversion_operation").notNull().default("multiply"), // 'multiply' or 'divide'
  icon: text("icon").notNull(), // Remix icon class e.g., 'ri-plant-line'
  color: text("color").notNull(), // Hex color code e.g., '#22c55e'
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertImpactEquivalencySettingSchema = createInsertSchema(impactEquivalencySettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type ImpactEquivalencySetting = typeof impactEquivalencySettings.$inferSelect;
export type InsertImpactEquivalencySetting = z.infer<typeof insertImpactEquivalencySettingSchema>;

// ESG Measurement Parameters schema - configurable base values for impact calculations
export const esgMeasurementParameters = pgTable("esg_measurement_parameters", {
  id: serial("id").primaryKey(),
  parameterKey: text("parameter_key").notNull().unique(), // 'carbon_per_laptop', 'water_per_laptop', etc.
  parameterName: text("parameter_name").notNull(), // Display name: "Carbon Saved per Laptop"
  parameterValue: numeric("parameter_value", { precision: 15, scale: 2 }).notNull(), // The numeric value
  unit: text("unit").notNull(), // 'kg', 'liters', 'grams', etc.
  category: text("category").notNull(), // 'environmental', 'social'
  description: text("description"), // Help text explaining what this parameter represents
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEsgMeasurementParameterSchema = createInsertSchema(esgMeasurementParameters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type EsgMeasurementParameter = typeof esgMeasurementParameters.$inferSelect;
export type InsertEsgMeasurementParameter = z.infer<typeof insertEsgMeasurementParameterSchema>;
