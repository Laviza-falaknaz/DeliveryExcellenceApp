# Circular Computing Customer Portal

## Overview
The Circular Computing Customer Portal is a full-stack web application providing customers with access to their remanufactured laptop orders, environmental impact tracking, and sustainability contributions. It centralizes order management, warranty services, and customer support, while visualizing environmental benefits like carbon reduction and water conservation through charity partnerships. The platform aims to be a hub for monitoring ecological impact and engaging with sustainability initiatives.

## User Preferences
Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
Built with React and TypeScript using Vite, the frontend employs a component-based architecture. It uses TanStack Query for state management, Wouter for routing, Tailwind CSS with shadcn/ui for styling, and React Hook Form with Zod for forms. Authentication is session-based with protected routes. The design system leverages Tailwind CSS with custom teal/primary colors for branding.

### Backend Architecture
The backend is a REST API developed with Node.js and Express, written in TypeScript. It uses Passport.js with a local strategy and express-session for authentication. API design follows RESTful principles with consistent error handling and logging. Zod schemas are used for request/response validation, shared between frontend and backend.

### Database Design
The application utilizes Replit's built-in PostgreSQL database (Neon-hosted PostgreSQL 16), integrating with Drizzle ORM for type-safe operations. The relational schema includes tables for Users, Orders, EnvironmentalImpact, RMAs, SupportTickets, WaterProjects, CaseStudies, and SystemSettings, among others. Schema management is handled via `npm run db:push`, with automatic seeding on first application start.

### Authentication & Authorization
Session-based authentication uses Passport.js with bcrypt for password hashing. Registration is disabled; users are created by administrators. Route protection is middleware-based, ensuring secure access.

### Environmental Impact Tracking
A core feature, it tracks metrics like carbon saved, water provided, and minerals saved. It includes visualizations such as progress bars and charts, integrating with water projects and case studies to demonstrate real-world impact and gamify engagement.

### Gamification System
The platform includes a comprehensive gamification system with configurable achievements and milestones:

#### Impact Level Achievements
- **Bronze Impact**: Awarded at 5,000kg CO₂ saved (1,500 points)
- **Silver Impact**: Awarded at 25,000kg CO₂ saved (5,000 points, Innovator tier)
- **Gold Impact**: Awarded at 75,000kg CO₂ saved (10,000 points, Vanguard tier)
- **Water Provider**: Awarded when helping 75 families with clean water (3,000 points, Innovator tier)

#### Automatic Achievement Unlocking
Achievements are **automatically unlocked** when users meet the criteria. The system triggers ESG score recalculation and achievement checking after:
- Order creation (user-facing and admin routes)
- Order item addition (user-facing and admin routes)
- Order shipping (when status changes to "shipped")

Each achievement check is error-isolated (wrapped in try/catch) to ensure order creation never fails due to gamification scoring issues. The implementation uses the `scoringService.updateUserESGScore()` function which calculates total environmental impact and unlocks any newly-earned achievements.

#### Shipping Bonus XP
Users automatically receive **+1000 XP** when their order status changes to "shipped". This shipping bonus:
- Is awarded only once per order (tracked in ESG score metadata)
- Updates the user's tier if they reach a new threshold
- Triggers achievement and milestone checks automatically
- Never causes order updates to fail (error-isolated with try/catch)

The shipping bonus is implemented in the `scoringService.awardShippingBonus()` method and is called by both admin order update routes (`/api/crud/orders/:id` and `/api/admin/orders/:id`).

#### Admin Management
All achievements, milestones, and gamification settings are fully configurable via the Admin Panel at `/admin/gamification-management`. Admins can create, edit, and delete achievements, adjusting thresholds, reward points, icons, and active status. The seeding system is idempotent, allowing safe redeployment without data duplication.

## External Dependencies

### Core Technologies
- **Node.js/Express**: Backend framework
- **React**: Frontend framework
- **Replit PostgreSQL**: Built-in database
- **Drizzle ORM**: Type-safe SQL ORM
- **bcryptjs**: Password hashing

### Authentication & Session Management
- **Passport.js**: Authentication middleware
- **express-session**: Session management

### Frontend Libraries
- **TanStack Query**: Server state management
- **React Hook Form**: Form handling
- **Wouter**: Lightweight routing
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library

### Development & Build Tools
- **Vite**: Frontend build tool
- **TypeScript**: Type safety

### UI/UX Libraries
- **Radix UI**: Accessible UI primitives
- **Lucide React**: Icon library
- **Recharts**: Data visualization
- **@zxing/library**: QR code scanning

## Deployment

### Production Deployment Process
The application automatically handles complete database initialization during deployment:

#### 1. Schema Push
On application startup, the database schema is automatically pushed using Drizzle Kit's programmatic API. This creates all necessary tables before seeding begins.

#### 2. Configuration Data Seeding (Automatic)
All admin configuration data is **automatically seeded** in production. This seeding is **idempotent** (can be run multiple times safely without duplicating data):

**Sustainability Configuration:**
- Water Projects (Ethiopia, Rwanda, Uganda initiatives)
- System Settings (password webhook URL, sustainability metrics)
- Organizational Metrics (total units deployed, company-wide carbon/water savings)
- Impact Equivalency Settings (trees, car miles, phone charges, plastic bottles, homes powered, flights offset)
- ESG Measurement Parameters (carbon/water/minerals per laptop, families helped)
- Key Performance Insights (8 KPI metrics across environmental, social, governance categories)

**Gamification Configuration:**
- Gamification Tiers (3 levels: Explorer → Innovator → Vanguard)
- Achievements (14 configurable achievements with points, icons, thresholds)
- Milestones (7 journey milestones from 0 to 10,000 points)
- Gamification Settings (scoring weights, feature toggles, leaderboard config, scoring normalization)

**ESG Reporting:**
- ESG Targets (carbon reduction, water conservation, circular economy, social impact goals)

**Admin Portal Configuration:**
All seeded data can be modified via the admin portal:
- `/admin/sustainability-settings` - ESG parameters and metrics
- `/admin/gamification-management` - Achievements, milestones, settings
- `/admin/water-project-management` - Water project details
- `/admin/kpi-management` - Key performance insights

Any changes made in development via the admin portal should be re-applied in production after deployment.

#### 3. Data NOT Seeded (User/Transactional Data)
The following data is **NEVER automatically seeded** in production:
- Users (except manually created admins)
- Orders and Order Items
- RMAs and RMA Items
- RMA Request Logs
- Environmental Impact Records (tied to orders)
- Support Tickets
- Case Studies (must be added manually)

#### 4. Security & Admin Access
**Default admin user creation is DISABLED in production** for security. The development test user (lavizaniazi2001@gmail.com / admin123) is only created in NODE_ENV=development.

**Production Admin Creation:**
Administrators must be created manually in production using one of these methods:
1. Direct database INSERT via Replit database console
2. SQL query with bcrypt-hashed password
3. Custom admin creation script (recommended)

Example SQL for manual admin creation:
```sql
INSERT INTO users (username, password, name, company, email, phone_number, is_admin, notification_preferences)
VALUES (
  'admin@example.com',
  '$2b$10$[BCRYPT_HASH]',  -- Generate with: bcrypt.hash('password', 10)
  'Admin User',
  'Company Name',
  'admin@example.com',
  '+1234567890',
  true,
  '{"orderUpdates":true,"environmentalImpact":true,"charityUpdates":true,"serviceReminders":true}'::jsonb
);
```

#### 5. Deployment Checklist
- [ ] Review admin portal configurations before deployment
- [ ] Create production admin user manually after first deployment
- [ ] Verify all seeded configuration data via admin portal
- [ ] Test environmental impact calculations
- [ ] Validate gamification system operation
- [ ] Confirm water project data displays correctly

#### 6. Deployment Timeout
Database initialization (schema push + seeding) has a 60-second timeout. Monitor the first production deployment to ensure completion within this window. All seeding operations are optimized to check for existing data before inserting.