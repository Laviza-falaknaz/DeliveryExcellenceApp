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
The application automatically handles database initialization during deployment:

1. **Schema Push**: On application startup, the schema is automatically pushed to the database using Drizzle Kit's programmatic API. This ensures all tables (including ESG measurement parameters and impact equivalency settings) are created before seeding.

2. **Data Seeding**: After schema push, the application seeds essential data:
   - Water projects
   - System settings (password webhook, sustainability metrics)
   - Organizational metrics
   - Impact equivalency settings (trees, car miles, phone charges, etc.)
   - ESG measurement parameters (carbon, water, minerals per laptop)
   - Gamification data
   - ESG targets

3. **Security**: Default admin user creation is **disabled in production** for security. Admin users must be created manually using database tools or an admin creation script.

### Manual Admin User Creation
In production, administrators must be created manually through direct database access or a dedicated admin creation endpoint. The default development credentials (lavizaniazi2001@gmail.com / admin123) are never created in production environments.

### Deployment Timeout
Database initialization (schema push + seeding) has a 60-second timeout. Monitor first production deployment to ensure completion within this window.