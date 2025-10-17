import { getConnection, sql } from './db';
import {
  User, InsertUser,
  Order, InsertOrder,
  OrderItem, InsertOrderItem,
  OrderUpdate, InsertOrderUpdate,
  EnvironmentalImpact, InsertEnvironmentalImpact,
  Rma, InsertRma,
  WaterProject, InsertWaterProject,
  SupportTicket, InsertSupportTicket,
  CaseStudy, InsertCaseStudy,
  DeliveryTimeline, InsertDeliveryTimeline
} from "@shared/schema";
import { IStorage } from './storage';

export class SqlStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM users WHERE id = @id');
    
    if (result.recordset.length === 0) return undefined;
    return this.mapUser(result.recordset[0]);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM users WHERE username = @username');
    
    if (result.recordset.length === 0) return undefined;
    return this.mapUser(result.recordset[0]);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM users WHERE email = @email');
    
    if (result.recordset.length === 0) return undefined;
    return this.mapUser(result.recordset[0]);
  }

  async createUser(user: InsertUser): Promise<User> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('username', sql.NVarChar, user.username)
      .input('password', sql.NVarChar, user.password)
      .input('name', sql.NVarChar, user.name)
      .input('company', sql.NVarChar, user.company)
      .input('email', sql.NVarChar, user.email)
      .input('phoneNumber', sql.NVarChar, user.phoneNumber || null)
      .input('notificationPreferences', sql.NVarChar, JSON.stringify(user.notificationPreferences))
      .query(`
        INSERT INTO users (username, password, name, company, email, phone_number, notification_preferences)
        OUTPUT INSERTED.*
        VALUES (@username, @password, @name, @company, @email, @phoneNumber, @notificationPreferences)
      `);
    
    return this.mapUser(result.recordset[0]);
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const pool = await getConnection();
    const setClauses: string[] = [];
    const request = pool.request().input('id', sql.Int, id);

    if (data.username) {
      setClauses.push('username = @username');
      request.input('username', sql.NVarChar, data.username);
    }
    if (data.password) {
      setClauses.push('password = @password');
      request.input('password', sql.NVarChar, data.password);
    }
    if (data.name) {
      setClauses.push('name = @name');
      request.input('name', sql.NVarChar, data.name);
    }
    if (data.company) {
      setClauses.push('company = @company');
      request.input('company', sql.NVarChar, data.company);
    }
    if (data.email) {
      setClauses.push('email = @email');
      request.input('email', sql.NVarChar, data.email);
    }
    if (data.phoneNumber !== undefined) {
      setClauses.push('phone_number = @phoneNumber');
      request.input('phoneNumber', sql.NVarChar, data.phoneNumber);
    }
    if (data.notificationPreferences) {
      setClauses.push('notification_preferences = @notificationPreferences');
      request.input('notificationPreferences', sql.NVarChar, JSON.stringify(data.notificationPreferences));
    }

    if (setClauses.length === 0) return this.getUser(id);

    const result = await request.query(`
      UPDATE users
      SET ${setClauses.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

    if (result.recordset.length === 0) return undefined;
    return this.mapUser(result.recordset[0]);
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM orders WHERE id = @id');
    
    if (result.recordset.length === 0) return undefined;
    return this.mapOrder(result.recordset[0]);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('orderNumber', sql.NVarChar, orderNumber)
      .query('SELECT * FROM orders WHERE order_number = @orderNumber');
    
    if (result.recordset.length === 0) return undefined;
    return this.mapOrder(result.recordset[0]);
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT * FROM orders WHERE user_id = @userId ORDER BY order_date DESC');
    
    return result.recordset.map(row => this.mapOrder(row));
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('orderNumber', sql.NVarChar, order.orderNumber)
      .input('userId', sql.Int, order.userId)
      .input('status', sql.NVarChar, order.status)
      .input('totalAmount', sql.Int, order.totalAmount)
      .input('savedAmount', sql.Int, order.savedAmount)
      .input('orderDate', sql.DateTime2, order.orderDate || new Date())
      .input('estimatedDelivery', sql.DateTime2, order.estimatedDelivery || null)
      .input('trackingNumber', sql.NVarChar, order.trackingNumber || null)
      .input('shippingAddress', sql.NVarChar, order.shippingAddress ? JSON.stringify(order.shippingAddress) : null)
      .query(`
        INSERT INTO orders (order_number, user_id, status, total_amount, saved_amount, order_date, estimated_delivery, tracking_number, shipping_address)
        OUTPUT INSERTED.*
        VALUES (@orderNumber, @userId, @status, @totalAmount, @savedAmount, @orderDate, @estimatedDelivery, @trackingNumber, @shippingAddress)
      `);
    
    return this.mapOrder(result.recordset[0]);
  }

  async updateOrder(id: number, data: Partial<Order>): Promise<Order | undefined> {
    const pool = await getConnection();
    const setClauses: string[] = [];
    const request = pool.request().input('id', sql.Int, id);

    if (data.status) {
      setClauses.push('status = @status');
      request.input('status', sql.NVarChar, data.status);
    }
    if (data.totalAmount !== undefined) {
      setClauses.push('total_amount = @totalAmount');
      request.input('totalAmount', sql.Int, data.totalAmount);
    }
    if (data.savedAmount !== undefined) {
      setClauses.push('saved_amount = @savedAmount');
      request.input('savedAmount', sql.Int, data.savedAmount);
    }
    if (data.estimatedDelivery !== undefined) {
      setClauses.push('estimated_delivery = @estimatedDelivery');
      request.input('estimatedDelivery', sql.DateTime2, data.estimatedDelivery);
    }
    if (data.trackingNumber !== undefined) {
      setClauses.push('tracking_number = @trackingNumber');
      request.input('trackingNumber', sql.NVarChar, data.trackingNumber);
    }
    if (data.shippingAddress) {
      setClauses.push('shipping_address = @shippingAddress');
      request.input('shippingAddress', sql.NVarChar, JSON.stringify(data.shippingAddress));
    }

    if (setClauses.length === 0) return this.getOrder(id);

    const result = await request.query(`
      UPDATE orders
      SET ${setClauses.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

    if (result.recordset.length === 0) return undefined;
    return this.mapOrder(result.recordset[0]);
  }

  // Order items operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('orderId', sql.Int, orderId)
      .query('SELECT * FROM order_items WHERE order_id = @orderId');
    
    return result.recordset.map(row => this.mapOrderItem(row));
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('orderId', sql.Int, orderItem.orderId)
      .input('productName', sql.NVarChar, orderItem.productName)
      .input('productDescription', sql.NVarChar, orderItem.productDescription)
      .input('quantity', sql.Int, orderItem.quantity)
      .input('unitPrice', sql.Int, orderItem.unitPrice)
      .input('totalPrice', sql.Int, orderItem.totalPrice)
      .input('imageUrl', sql.NVarChar, orderItem.imageUrl || null)
      .query(`
        INSERT INTO order_items (order_id, product_name, product_description, quantity, unit_price, total_price, image_url)
        OUTPUT INSERTED.*
        VALUES (@orderId, @productName, @productDescription, @quantity, @unitPrice, @totalPrice, @imageUrl)
      `);
    
    return this.mapOrderItem(result.recordset[0]);
  }

  // Order updates operations
  async getOrderUpdates(orderId: number): Promise<OrderUpdate[]> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('orderId', sql.Int, orderId)
      .query('SELECT * FROM order_updates WHERE order_id = @orderId ORDER BY timestamp DESC');
    
    return result.recordset.map(row => this.mapOrderUpdate(row));
  }

  async createOrderUpdate(orderUpdate: InsertOrderUpdate): Promise<OrderUpdate> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('orderId', sql.Int, orderUpdate.orderId)
      .input('status', sql.NVarChar, orderUpdate.status)
      .input('message', sql.NVarChar, orderUpdate.message)
      .input('timestamp', sql.DateTime2, orderUpdate.timestamp || new Date())
      .query(`
        INSERT INTO order_updates (order_id, status, message, timestamp)
        OUTPUT INSERTED.*
        VALUES (@orderId, @status, @message, @timestamp)
      `);
    
    return this.mapOrderUpdate(result.recordset[0]);
  }

  // Environmental impact operations
  async getEnvironmentalImpactByUserId(userId: number): Promise<EnvironmentalImpact[]> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT * FROM environmental_impact WHERE user_id = @userId');
    
    return result.recordset.map(row => this.mapEnvironmentalImpact(row));
  }

  async getEnvironmentalImpactByOrderId(orderId: number): Promise<EnvironmentalImpact | undefined> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('orderId', sql.Int, orderId)
      .query('SELECT * FROM environmental_impact WHERE order_id = @orderId');
    
    if (result.recordset.length === 0) return undefined;
    return this.mapEnvironmentalImpact(result.recordset[0]);
  }

  async createEnvironmentalImpact(impact: InsertEnvironmentalImpact): Promise<EnvironmentalImpact> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('userId', sql.Int, impact.userId)
      .input('orderId', sql.Int, impact.orderId || null)
      .input('carbonSaved', sql.Int, impact.carbonSaved)
      .input('waterProvided', sql.Int, impact.waterProvided)
      .input('mineralsSaved', sql.Int, impact.mineralsSaved)
      .input('treesEquivalent', sql.Int, impact.treesEquivalent)
      .input('familiesHelped', sql.Int, impact.familiesHelped)
      .query(`
        INSERT INTO environmental_impact (user_id, order_id, carbon_saved, water_provided, minerals_saved, trees_equivalent, families_helped)
        OUTPUT INSERTED.*
        VALUES (@userId, @orderId, @carbonSaved, @waterProvided, @mineralsSaved, @treesEquivalent, @familiesHelped)
      `);
    
    return this.mapEnvironmentalImpact(result.recordset[0]);
  }

  async getTotalEnvironmentalImpact(userId: number): Promise<{
    carbonSaved: number;
    waterProvided: number;
    mineralsSaved: number;
    treesEquivalent: number;
    familiesHelped: number;
  }> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query(`
        SELECT 
          ISNULL(SUM(carbon_saved), 0) as carbonSaved,
          ISNULL(SUM(water_provided), 0) as waterProvided,
          ISNULL(SUM(minerals_saved), 0) as mineralsSaved,
          ISNULL(SUM(trees_equivalent), 0) as treesEquivalent,
          ISNULL(SUM(families_helped), 0) as familiesHelped
        FROM environmental_impact
        WHERE user_id = @userId
      `);
    
    return result.recordset[0];
  }

  // RMA operations
  async getRma(id: number): Promise<Rma | undefined> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM rmas WHERE id = @id');
    
    if (result.recordset.length === 0) return undefined;
    return this.mapRma(result.recordset[0]);
  }

  async getRmasByUserId(userId: number): Promise<Rma[]> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT * FROM rmas WHERE user_id = @userId ORDER BY request_date DESC');
    
    return result.recordset.map(row => this.mapRma(row));
  }

  async createRma(rma: InsertRma): Promise<Rma> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('rmaNumber', sql.NVarChar, rma.rmaNumber)
      .input('userId', sql.Int, rma.userId)
      .input('orderId', sql.Int, rma.orderId)
      .input('status', sql.NVarChar, rma.status)
      .input('reason', sql.NVarChar, rma.reason)
      .input('notes', sql.NVarChar, rma.notes || null)
      .input('requestDate', sql.DateTime2, rma.requestDate || new Date())
      .input('resolutionDate', sql.DateTime2, rma.resolutionDate || null)
      .query(`
        INSERT INTO rmas (rma_number, user_id, order_id, status, reason, notes, request_date, resolution_date)
        OUTPUT INSERTED.*
        VALUES (@rmaNumber, @userId, @orderId, @status, @reason, @notes, @requestDate, @resolutionDate)
      `);
    
    return this.mapRma(result.recordset[0]);
  }

  async updateRma(id: number, data: Partial<Rma>): Promise<Rma | undefined> {
    const pool = await getConnection();
    const setClauses: string[] = [];
    const request = pool.request().input('id', sql.Int, id);

    if (data.status) {
      setClauses.push('status = @status');
      request.input('status', sql.NVarChar, data.status);
    }
    if (data.notes !== undefined) {
      setClauses.push('notes = @notes');
      request.input('notes', sql.NVarChar, data.notes);
    }
    if (data.resolutionDate !== undefined) {
      setClauses.push('resolution_date = @resolutionDate');
      request.input('resolutionDate', sql.DateTime2, data.resolutionDate);
    }

    if (setClauses.length === 0) return this.getRma(id);

    const result = await request.query(`
      UPDATE rmas
      SET ${setClauses.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

    if (result.recordset.length === 0) return undefined;
    return this.mapRma(result.recordset[0]);
  }

  // Water project operations
  async getWaterProjects(): Promise<WaterProject[]> {
    const pool = await getConnection();
    const result = await pool.request()
      .query('SELECT * FROM water_projects ORDER BY created_at DESC');
    
    return result.recordset.map(row => this.mapWaterProject(row));
  }

  async getWaterProject(id: number): Promise<WaterProject | undefined> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM water_projects WHERE id = @id');
    
    if (result.recordset.length === 0) return undefined;
    return this.mapWaterProject(result.recordset[0]);
  }

  async createWaterProject(project: InsertWaterProject): Promise<WaterProject> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('name', sql.NVarChar, project.name)
      .input('location', sql.NVarChar, project.location)
      .input('description', sql.NVarChar, project.description)
      .input('peopleImpacted', sql.Int, project.peopleImpacted)
      .input('waterProvided', sql.Int, project.waterProvided)
      .input('imageUrl', sql.NVarChar, project.imageUrl || null)
      .query(`
        INSERT INTO water_projects (name, location, description, people_impacted, water_provided, image_url)
        OUTPUT INSERTED.*
        VALUES (@name, @location, @description, @peopleImpacted, @waterProvided, @imageUrl)
      `);
    
    return this.mapWaterProject(result.recordset[0]);
  }

  // Support ticket operations
  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM support_tickets WHERE id = @id');
    
    if (result.recordset.length === 0) return undefined;
    return this.mapSupportTicket(result.recordset[0]);
  }

  async getSupportTicketsByUserId(userId: number): Promise<SupportTicket[]> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT * FROM support_tickets WHERE user_id = @userId ORDER BY created_at DESC');
    
    return result.recordset.map(row => this.mapSupportTicket(row));
  }

  async createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket> {
    const pool = await getConnection();
    
    // Generate ticket number
    const countResult = await pool.request()
      .query('SELECT COUNT(*) as count FROM support_tickets');
    const ticketNumber = `ST-${String(countResult.recordset[0].count + 1).padStart(4, '0')}`;

    const result = await pool.request()
      .input('ticketNumber', sql.NVarChar, ticketNumber)
      .input('userId', sql.Int, ticket.userId)
      .input('orderId', sql.Int, ticket.orderId || null)
      .input('subject', sql.NVarChar, ticket.subject)
      .input('description', sql.NVarChar, ticket.description)
      .input('status', sql.NVarChar, ticket.status)
      .input('priority', sql.NVarChar, ticket.priority)
      .input('category', sql.NVarChar, ticket.category)
      .query(`
        INSERT INTO support_tickets (ticket_number, user_id, order_id, subject, description, status, priority, category)
        OUTPUT INSERTED.*
        VALUES (@ticketNumber, @userId, @orderId, @subject, @description, @status, @priority, @category)
      `);
    
    return this.mapSupportTicket(result.recordset[0]);
  }

  async updateSupportTicket(id: number, data: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const pool = await getConnection();
    const setClauses: string[] = ['updated_at = GETDATE()'];
    const request = pool.request().input('id', sql.Int, id);

    if (data.status) {
      setClauses.push('status = @status');
      request.input('status', sql.NVarChar, data.status);
    }
    if (data.priority) {
      setClauses.push('priority = @priority');
      request.input('priority', sql.NVarChar, data.priority);
    }

    const result = await request.query(`
      UPDATE support_tickets
      SET ${setClauses.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

    if (result.recordset.length === 0) return undefined;
    return this.mapSupportTicket(result.recordset[0]);
  }

  // Case study operations
  async getCaseStudy(id: number): Promise<CaseStudy | undefined> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM case_studies WHERE id = @id');
    
    if (result.recordset.length === 0) return undefined;
    return this.mapCaseStudy(result.recordset[0]);
  }

  async getCaseStudiesByUserId(userId: number): Promise<CaseStudy[]> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .query('SELECT * FROM case_studies WHERE user_id = @userId ORDER BY created_at DESC');
    
    return result.recordset.map(row => this.mapCaseStudy(row));
  }

  async createCaseStudy(caseStudy: InsertCaseStudy): Promise<CaseStudy> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('userId', sql.Int, caseStudy.userId)
      .input('organisationName', sql.NVarChar, caseStudy.organisationName)
      .input('contactName', sql.NVarChar, caseStudy.contactName)
      .input('contactEmail', sql.NVarChar, caseStudy.contactEmail)
      .input('industry', sql.NVarChar, caseStudy.industry)
      .input('devicesPurchased', sql.Int, caseStudy.devicesPurchased)
      .input('story', sql.NVarChar, caseStudy.story)
      .input('impactAchieved', sql.NVarChar, caseStudy.impactAchieved || null)
      .query(`
        INSERT INTO case_studies (user_id, organisation_name, contact_name, contact_email, industry, devices_purchased, story, impact_achieved)
        OUTPUT INSERTED.*
        VALUES (@userId, @organisationName, @contactName, @contactEmail, @industry, @devicesPurchased, @story, @impactAchieved)
      `);
    
    return this.mapCaseStudy(result.recordset[0]);
  }

  async updateCaseStudy(id: number, data: Partial<CaseStudy>): Promise<CaseStudy | undefined> {
    const pool = await getConnection();
    const setClauses: string[] = [];
    const request = pool.request().input('id', sql.Int, id);

    if (data.approved !== undefined) {
      setClauses.push('approved = @approved');
      request.input('approved', sql.Bit, data.approved ? 1 : 0);
    }
    if (data.featured !== undefined) {
      setClauses.push('featured = @featured');
      request.input('featured', sql.Bit, data.featured ? 1 : 0);
    }

    if (setClauses.length === 0) return this.getCaseStudy(id);

    const result = await request.query(`
      UPDATE case_studies
      SET ${setClauses.join(', ')}
      OUTPUT INSERTED.*
      WHERE id = @id
    `);

    if (result.recordset.length === 0) return undefined;
    return this.mapCaseStudy(result.recordset[0]);
  }

  // Delivery timeline operations
  async getDeliveryTimeline(orderId: number): Promise<DeliveryTimeline | undefined> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('orderId', sql.Int, orderId)
      .query('SELECT * FROM delivery_timelines WHERE order_id = @orderId');
    
    if (result.recordset.length === 0) return undefined;
    return this.mapDeliveryTimeline(result.recordset[0]);
  }

  async createDeliveryTimeline(timeline: InsertDeliveryTimeline): Promise<DeliveryTimeline> {
    const pool = await getConnection();
    const result = await pool.request()
      .input('orderId', sql.Int, timeline.orderId)
      .query(`
        INSERT INTO delivery_timelines (order_id, order_placed)
        OUTPUT INSERTED.*
        VALUES (@orderId, 1)
      `);
    
    return this.mapDeliveryTimeline(result.recordset[0]);
  }

  async updateDeliveryTimeline(orderId: number, data: Partial<DeliveryTimeline>): Promise<DeliveryTimeline | undefined> {
    const pool = await getConnection();
    const setClauses: string[] = ['updated_at = GETDATE()'];
    const request = pool.request().input('orderId', sql.Int, orderId);

    const booleanFields = [
      'orderPlaced', 'customerSuccessCallBooked', 'rateYourExperience',
      'customerSuccessIntroCall', 'orderInProgress', 'orderBeingBuilt',
      'qualityChecks', 'readyForDelivery', 'orderDelivered',
      'rateYourProduct', 'customerSuccessCallBookedPost',
      'customerSuccessCheckIn', 'orderCompleted'
    ];

    booleanFields.forEach(field => {
      if (data[field as keyof DeliveryTimeline] !== undefined) {
        const snakeField = field.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        setClauses.push(`${snakeField} = @${field}`);
        request.input(field, sql.Bit, data[field as keyof DeliveryTimeline] ? 1 : 0);
      }
    });

    const result = await request.query(`
      UPDATE delivery_timelines
      SET ${setClauses.join(', ')}
      OUTPUT INSERTED.*
      WHERE order_id = @orderId
    `);

    if (result.recordset.length === 0) return undefined;
    return this.mapDeliveryTimeline(result.recordset[0]);
  }

  // Mapper functions to convert snake_case DB fields to camelCase
  private mapUser(row: any): User {
    return {
      id: row.id,
      username: row.username,
      password: row.password,
      name: row.name,
      company: row.company,
      email: row.email,
      phoneNumber: row.phone_number,
      notificationPreferences: row.notification_preferences ? JSON.parse(row.notification_preferences) : null,
      createdAt: row.created_at
    };
  }

  private mapOrder(row: any): Order {
    return {
      id: row.id,
      orderNumber: row.order_number,
      userId: row.user_id,
      status: row.status,
      totalAmount: row.total_amount,
      savedAmount: row.saved_amount,
      orderDate: row.order_date,
      estimatedDelivery: row.estimated_delivery,
      trackingNumber: row.tracking_number,
      shippingAddress: row.shipping_address ? JSON.parse(row.shipping_address) : null,
      createdAt: row.created_at
    };
  }

  private mapOrderItem(row: any): OrderItem {
    return {
      id: row.id,
      orderId: row.order_id,
      productName: row.product_name,
      productDescription: row.product_description,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      totalPrice: row.total_price,
      imageUrl: row.image_url,
      createdAt: row.created_at
    };
  }

  private mapOrderUpdate(row: any): OrderUpdate {
    return {
      id: row.id,
      orderId: row.order_id,
      status: row.status,
      message: row.message,
      timestamp: row.timestamp,
      createdAt: row.created_at
    };
  }

  private mapEnvironmentalImpact(row: any): EnvironmentalImpact {
    return {
      id: row.id,
      userId: row.user_id,
      orderId: row.order_id,
      carbonSaved: row.carbon_saved,
      waterProvided: row.water_provided,
      mineralsSaved: row.minerals_saved,
      treesEquivalent: row.trees_equivalent,
      familiesHelped: row.families_helped,
      createdAt: row.created_at
    };
  }

  private mapRma(row: any): Rma {
    return {
      id: row.id,
      rmaNumber: row.rma_number,
      userId: row.user_id,
      orderId: row.order_id,
      status: row.status,
      reason: row.reason,
      notes: row.notes,
      requestDate: row.request_date,
      resolutionDate: row.resolution_date,
      createdAt: row.created_at
    };
  }

  private mapWaterProject(row: any): WaterProject {
    return {
      id: row.id,
      name: row.name,
      location: row.location,
      description: row.description,
      peopleImpacted: row.people_impacted,
      waterProvided: row.water_provided,
      imageUrl: row.image_url,
      createdAt: row.created_at
    };
  }

  private mapSupportTicket(row: any): SupportTicket {
    return {
      id: row.id,
      ticketNumber: row.ticket_number,
      userId: row.user_id,
      orderId: row.order_id,
      subject: row.subject,
      description: row.description,
      status: row.status,
      priority: row.priority,
      category: row.category,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapCaseStudy(row: any): CaseStudy {
    return {
      id: row.id,
      userId: row.user_id,
      organisationName: row.organisation_name,
      contactName: row.contact_name,
      contactEmail: row.contact_email,
      industry: row.industry,
      devicesPurchased: row.devices_purchased,
      story: row.story,
      impactAchieved: row.impact_achieved,
      approved: !!row.approved,
      featured: !!row.featured,
      createdAt: row.created_at
    };
  }

  private mapDeliveryTimeline(row: any): DeliveryTimeline {
    return {
      id: row.id,
      orderId: row.order_id,
      orderPlaced: !!row.order_placed,
      customerSuccessCallBooked: !!row.customer_success_call_booked,
      rateYourExperience: !!row.rate_your_experience,
      customerSuccessIntroCall: !!row.customer_success_intro_call,
      orderInProgress: !!row.order_in_progress,
      orderBeingBuilt: !!row.order_being_built,
      qualityChecks: !!row.quality_checks,
      readyForDelivery: !!row.ready_for_delivery,
      orderDelivered: !!row.order_delivered,
      rateYourProduct: !!row.rate_your_product,
      customerSuccessCallBookedPost: !!row.customer_success_call_booked_post,
      customerSuccessCheckIn: !!row.customer_success_check_in,
      orderCompleted: !!row.order_completed,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }
}
