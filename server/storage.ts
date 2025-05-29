import {
  users, User, InsertUser,
  orders, Order, InsertOrder,
  orderItems, OrderItem, InsertOrderItem,
  orderUpdates, OrderUpdate, InsertOrderUpdate,
  environmentalImpact, EnvironmentalImpact, InsertEnvironmentalImpact,
  rmas, Rma, InsertRma,
  waterProjects, WaterProject, InsertWaterProject,
  supportTickets, SupportTicket, InsertSupportTicket,
  caseStudies, CaseStudy, InsertCaseStudy
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;

  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrderByNumber(orderNumber: string): Promise<Order | undefined>;
  getOrdersByUserId(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, data: Partial<Order>): Promise<Order | undefined>;

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

  // Water project operations
  getWaterProjects(): Promise<WaterProject[]>;
  getWaterProject(id: number): Promise<WaterProject | undefined>;
  createWaterProject(project: InsertWaterProject): Promise<WaterProject>;

  // Support ticket operations
  getSupportTicket(id: number): Promise<SupportTicket | undefined>;
  getSupportTicketsByUserId(userId: number): Promise<SupportTicket[]>;
  createSupportTicket(ticket: InsertSupportTicket): Promise<SupportTicket>;
  updateSupportTicket(id: number, data: Partial<SupportTicket>): Promise<SupportTicket | undefined>;

  // Case study operations
  getCaseStudy(id: number): Promise<CaseStudy | undefined>;
  getCaseStudiesByUserId(userId: number): Promise<CaseStudy[]>;
  createCaseStudy(caseStudy: InsertCaseStudy): Promise<CaseStudy>;
  updateCaseStudy(id: number, data: Partial<CaseStudy>): Promise<CaseStudy | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private orderUpdates: Map<number, OrderUpdate>;
  private environmentalImpacts: Map<number, EnvironmentalImpact>;
  private rmas: Map<number, Rma>;
  private waterProjects: Map<number, WaterProject>;
  private supportTickets: Map<number, SupportTicket>;
  private caseStudies: Map<number, CaseStudy>;

  private currentUserId: number;
  private currentOrderId: number;
  private currentOrderItemId: number;
  private currentOrderUpdateId: number;
  private currentEnvironmentalImpactId: number;
  private currentRmaId: number;
  private currentWaterProjectId: number;
  private currentSupportTicketId: number;
  private currentCaseStudyId: number;

  constructor() {
    this.users = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.orderUpdates = new Map();
    this.environmentalImpacts = new Map();
    this.rmas = new Map();
    this.waterProjects = new Map();
    this.supportTickets = new Map();
    this.caseStudies = new Map();

    this.currentUserId = 1;
    this.currentOrderId = 1;
    this.currentOrderItemId = 1;
    this.currentOrderUpdateId = 1;
    this.currentEnvironmentalImpactId = 1;
    this.currentRmaId = 1;
    this.currentWaterProjectId = 1;
    this.currentSupportTicketId = 1;
    this.currentCaseStudyId = 1;

    // Initialize with sample water projects
    this.seedWaterProjects();
  }

  private seedWaterProjects() {
    const projects: InsertWaterProject[] = [
      {
        name: "Ethiopia Clean Water Initiative",
        location: "Ethiopia",
        description: "This project is providing clean water access to rural communities in Ethiopia, focusing on sustainable well construction and community education on water management.",
        peopleImpacted: 1200,
        waterProvided: 3000000,
        imageUrl: "/attached_assets/Ethiopia.png",
      },
      {
        name: "Rwanda Clean Water Project",
        location: "Rwanda",
        description: "Building sustainable water infrastructure in rural Rwanda to provide clean drinking water and improve sanitation facilities.",
        peopleImpacted: 850,
        waterProvided: 1850000,
        imageUrl: "/attached_assets/Rwanda.png",
      },
      {
        name: "Uganda Rainwater Harvesting",
        location: "Uganda",
        description: "Implementing rainwater harvesting systems to collect and store clean water for communities in drought-prone regions of Uganda.",
        peopleImpacted: 730,
        waterProvided: 1450000,
        imageUrl: "/attached_assets/Uganda.png",
      }
    ];

    projects.forEach(project => {
      this.createWaterProject(project);
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrderByNumber(orderNumber: string): Promise<Order | undefined> {
    return Array.from(this.orders.values()).find(
      (order) => order.orderNumber === orderNumber,
    );
  }

  async getOrdersByUserId(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(
      (order) => order.userId === userId,
    ).sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const createdAt = new Date();
    const order: Order = { ...insertOrder, id, createdAt };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: number, data: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updatedOrder = { ...order, ...data };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order items operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values()).filter(
      (item) => item.orderId === orderId,
    );
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const createdAt = new Date();
    const orderItem: OrderItem = { ...insertOrderItem, id, createdAt };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  // Order updates operations
  async getOrderUpdates(orderId: number): Promise<OrderUpdate[]> {
    return Array.from(this.orderUpdates.values())
      .filter(update => update.orderId === orderId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createOrderUpdate(insertOrderUpdate: InsertOrderUpdate): Promise<OrderUpdate> {
    const id = this.currentOrderUpdateId++;
    const createdAt = new Date();
    const orderUpdate: OrderUpdate = { ...insertOrderUpdate, id, createdAt };
    this.orderUpdates.set(id, orderUpdate);
    return orderUpdate;
  }

  // Environmental impact operations
  async getEnvironmentalImpactByUserId(userId: number): Promise<EnvironmentalImpact[]> {
    return Array.from(this.environmentalImpacts.values()).filter(
      (impact) => impact.userId === userId,
    );
  }

  async getEnvironmentalImpactByOrderId(orderId: number): Promise<EnvironmentalImpact | undefined> {
    return Array.from(this.environmentalImpacts.values()).find(
      (impact) => impact.orderId === orderId,
    );
  }

  async createEnvironmentalImpact(insertImpact: InsertEnvironmentalImpact): Promise<EnvironmentalImpact> {
    const id = this.currentEnvironmentalImpactId++;
    const createdAt = new Date();
    const impact: EnvironmentalImpact = { ...insertImpact, id, createdAt };
    this.environmentalImpacts.set(id, impact);
    return impact;
  }

  async getTotalEnvironmentalImpact(userId: number): Promise<{
    carbonSaved: number;
    waterProvided: number;
    mineralsSaved: number;
    treesEquivalent: number;
    familiesHelped: number;
  }> {
    const impacts = await this.getEnvironmentalImpactByUserId(userId);
    const totals = impacts.reduce((acc, impact) => {
      return {
        carbonSaved: acc.carbonSaved + impact.carbonSaved,
        waterProvided: acc.waterProvided + impact.waterProvided,
        mineralsSaved: acc.mineralsSaved + impact.mineralsSaved,
        treesEquivalent: acc.treesEquivalent + impact.treesEquivalent,
        familiesHelped: acc.familiesHelped + impact.familiesHelped,
      };
    }, {
      carbonSaved: 0,
      waterProvided: 0,
      mineralsSaved: 0,
      treesEquivalent: 0,
      familiesHelped: 0,
    });

    return totals;
  }

  // RMA operations
  async getRma(id: number): Promise<Rma | undefined> {
    return this.rmas.get(id);
  }

  async getRmasByUserId(userId: number): Promise<Rma[]> {
    return Array.from(this.rmas.values()).filter(
      (rma) => rma.userId === userId,
    );
  }

  async createRma(insertRma: InsertRma): Promise<Rma> {
    const id = this.currentRmaId++;
    const createdAt = new Date();
    const rma: Rma = { ...insertRma, id, createdAt };
    this.rmas.set(id, rma);
    return rma;
  }

  async updateRma(id: number, data: Partial<Rma>): Promise<Rma | undefined> {
    const rma = this.rmas.get(id);
    if (!rma) return undefined;

    const updatedRma = { ...rma, ...data };
    this.rmas.set(id, updatedRma);
    return updatedRma;
  }

  // Water project operations
  async getWaterProjects(): Promise<WaterProject[]> {
    return Array.from(this.waterProjects.values());
  }

  async getWaterProject(id: number): Promise<WaterProject | undefined> {
    return this.waterProjects.get(id);
  }

  async createWaterProject(insertProject: InsertWaterProject): Promise<WaterProject> {
    const id = this.currentWaterProjectId++;
    const createdAt = new Date();
    const project: WaterProject = { ...insertProject, id, createdAt };
    this.waterProjects.set(id, project);
    return project;
  }

  // Support ticket operations
  async getSupportTicket(id: number): Promise<SupportTicket | undefined> {
    return this.supportTickets.get(id);
  }

  async getSupportTicketsByUserId(userId: number): Promise<SupportTicket[]> {
    return Array.from(this.supportTickets.values()).filter(
      (ticket) => ticket.userId === userId,
    );
  }

  async createSupportTicket(insertTicket: InsertSupportTicket): Promise<SupportTicket> {
    const id = this.currentSupportTicketId++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const ticketNumber = `ST-${String(id).padStart(4, '0')}`;
    const ticket: SupportTicket = { ...insertTicket, id, ticketNumber, createdAt, updatedAt };
    this.supportTickets.set(id, ticket);
    return ticket;
  }

  async updateSupportTicket(id: number, data: Partial<SupportTicket>): Promise<SupportTicket | undefined> {
    const ticket = this.supportTickets.get(id);
    if (!ticket) return undefined;

    const updatedAt = new Date();
    const updatedTicket = { ...ticket, ...data, updatedAt };
    this.supportTickets.set(id, updatedTicket);
    return updatedTicket;
  }

  // Case study operations
  async getCaseStudy(id: number): Promise<CaseStudy | undefined> {
    return this.caseStudies.get(id);
  }

  async getCaseStudiesByUserId(userId: number): Promise<CaseStudy[]> {
    return Array.from(this.caseStudies.values()).filter(
      (caseStudy) => caseStudy.userId === userId,
    );
  }

  async createCaseStudy(insertCaseStudy: InsertCaseStudy): Promise<CaseStudy> {
    const id = this.currentCaseStudyId++;
    const createdAt = new Date();
    const caseStudy: CaseStudy = { 
      ...insertCaseStudy, 
      id, 
      approved: false, 
      featured: false, 
      createdAt 
    };
    this.caseStudies.set(id, caseStudy);
    return caseStudy;
  }

  async updateCaseStudy(id: number, data: Partial<CaseStudy>): Promise<CaseStudy | undefined> {
    const caseStudy = this.caseStudies.get(id);
    if (!caseStudy) return undefined;

    const updatedCaseStudy = { ...caseStudy, ...data };
    this.caseStudies.set(id, updatedCaseStudy);
    return updatedCaseStudy;
  }
}

export const storage = new MemStorage();
