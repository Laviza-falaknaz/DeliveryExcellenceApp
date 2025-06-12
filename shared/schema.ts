import { pgTable, text, serial, integer, boolean, timestamp, json, foreignKey, pgEnum } from "drizzle-orm/pg-core";
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
  totalAmount: integer("total_amount").notNull(),
  savedAmount: integer("saved_amount").notNull(),
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
  unitPrice: integer("unit_price").notNull(),
  totalPrice: integer("total_price").notNull(),
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
  orderId: integer("order_id").notNull().references(() => orders.id),
  rmaNumber: text("rma_number").notNull().unique(),
  reason: text("reason").notNull(),
  status: rmaStatusEnum("status").notNull().default("requested"),
  requestDate: timestamp("request_date").defaultNow(),
  completionDate: timestamp("completion_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertRmaSchema = createInsertSchema(rmas).omit({
  id: true,
  createdAt: true,
});

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

// Delivery Timeline
export const deliveryTimelines = pgTable("delivery_timelines", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  orderPlaced: boolean("order_placed").default(false),
  customerSuccessCallBooked: boolean("customer_success_call_booked").default(false),
  rateYourExperience: boolean("rate_your_experience").default(false),
  customerSuccessIntroCall: boolean("customer_success_intro_call").default(false),
  orderInProgress: boolean("order_in_progress").default(false),
  orderBeingBuilt: boolean("order_being_built").default(false),
  qualityChecks: boolean("quality_checks").default(false),
  readyForDelivery: boolean("ready_for_delivery").default(false),
  orderDelivered: boolean("order_delivered").default(false),
  rateYourProduct: boolean("rate_your_product").default(false),
  customerSuccessCallBookedPost: boolean("customer_success_call_booked_post").default(false),
  customerSuccessCheckIn: boolean("customer_success_check_in").default(false),
  orderCompleted: boolean("order_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertDeliveryTimelineSchema = createInsertSchema(deliveryTimelines).omit({
  id: true,
  createdAt: true,
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
