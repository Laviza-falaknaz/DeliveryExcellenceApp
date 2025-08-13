# Circular Computing Customer Portal

## Overview

The Circular Computing Customer Portal is a full-stack web application designed to provide customers with comprehensive access to their remanufactured laptop orders, environmental impact tracking, and sustainability initiatives. The platform serves as a centralized hub for customers to monitor their contributions to environmental conservation through the purchase of remanufactured IT equipment, while providing complete order management and support capabilities.

The application emphasizes environmental impact visualization, showing users how their laptop purchases contribute to carbon reduction, water conservation through charity partnerships, and mineral resource savings. It integrates with charity: water projects to demonstrate real-world impact and includes comprehensive order tracking, warranty management, and customer support features.

## Recent Updates (August 2025)

### Warranty Claim System Implementation
- **Comprehensive RMA Request Form**: Successfully implemented a full-featured warranty claim form at `/warranty-claim` with all requested fields including contact information, billing/delivery addresses, product details, fault descriptions, and file upload capabilities for CSV/Excel documentation. Updated branding from "Warranty Claim Form" to "New RMA Request" throughout the interface.
- **RMA Integration**: Updated the RMA tracking system to redirect users to the new warranty claim form instead of external troubleshooting sites, providing a seamless internal workflow.
- **QR Code Support**: Enhanced Warranty & Troubleshooting, RMA pages, and New RMA Request form with QR code scanning functionality supporting URLs, JSON data, and direct serial number formats. Scanner automatically populates manufacturer serial number field.
- **Navigation Updates**: Changed "Environmental Impact" to "Your Impact" across all navigation elements and page headings as requested. Updated sidebar styling to maintain black text for all navigation items including active states.

### Document Management & Educational Content (August 2025)
- **Orders Table Enhancement**: Added Packing List (PDF) and Hashcodes (CSV/Excel) columns to "Your Orders" table with download functionality for account manager uploaded documents. Maintained consistent teal branding and professional styling.
- **Remanufactured Explained Tab**: Successfully implemented comprehensive educational tab under Warranty & Troubleshooting section explaining remanufacturing process, environmental benefits, quality standards, and business advantages. Includes working external links to product catalog and contact pages.
- **Setup Tips Carousel**: Added interactive carousel-style component to Remanufactured Explained page featuring 6 mini blog tips covering battery calibration, driver updates, storage optimization, warranty registration, performance testing, and thermal management. Includes navigation controls, dot indicators, and smooth transitions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React with TypeScript, utilizing Vite as the build tool and development server. The application follows a component-based architecture with:

- **UI Framework**: React with TypeScript for type safety and modern development practices
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design system
- **Forms**: React Hook Form with Zod validation for robust form handling
- **Authentication**: Session-based authentication with protected routes

The frontend is organized into pages, components, and hooks, with shared utilities and type definitions. The design system uses Tailwind CSS with custom color schemes emphasizing teal/primary colors to align with sustainability branding.

### Backend Architecture
The backend follows a REST API architecture built on Node.js with Express:

- **Framework**: Express.js with TypeScript for type-safe server development
- **Authentication**: Passport.js with local strategy and express-session for session management
- **API Design**: RESTful endpoints with consistent error handling and logging middleware
- **Validation**: Zod schemas for request/response validation shared between frontend and backend
- **Session Storage**: Memory store for development with configurable session management

The server implements comprehensive logging, error handling, and serves both API endpoints and static assets including the built frontend application.

### Database Design
The application uses PostgreSQL with Drizzle ORM for type-safe database operations:

- **ORM**: Drizzle ORM with migration support and schema management
- **Schema Design**: Relational database design with proper foreign key relationships
- **Key Entities**: Users, Orders, OrderItems, OrderUpdates, EnvironmentalImpact, RMAs, SupportTickets, WaterProjects, CaseStudies, DeliveryTimelines
- **Data Types**: Comprehensive type definitions with JSON fields for complex data structures like notification preferences

The database schema supports the full customer lifecycle from order placement through delivery and ongoing support, with detailed tracking of environmental impact metrics.

### Authentication & Authorization
The application implements session-based authentication with the following approach:

- **Strategy**: Local username/password authentication via Passport.js
- **Session Management**: Express-session with configurable storage and security settings
- **Route Protection**: Middleware-based route protection with redirect handling
- **User Management**: Complete user registration, login, and profile management

### External Service Integration
The platform integrates with several external services and resources:

- **Asset Management**: Static asset serving for images and attachments via Express middleware
- **Charity Integration**: Visual integration with charity: water projects and impact tracking
- **External Links**: Deep integration with Circular Computing's main website and external warranty systems
- **Email Services**: Placeholder integration for notification systems

### Environmental Impact Tracking
A core feature of the application is comprehensive environmental impact tracking:

- **Metrics**: Carbon saved, water provided, minerals saved, trees equivalent, families helped
- **Visualization**: Progress bars, charts, and milestone tracking
- **Integration**: Connection to water projects and case studies showing real-world impact
- **Gamification**: Milestone-based progress tracking to encourage continued engagement

The architecture prioritizes scalability, maintainability, and user experience while emphasizing the environmental mission of remanufactured computing equipment.

## External Dependencies

### Core Technologies
- **Node.js/Express**: Backend framework with TypeScript support
- **React**: Frontend framework with Vite build tooling
- **PostgreSQL**: Primary database with Neon Database serverless hosting
- **Drizzle ORM**: Type-safe database operations and migrations

### Authentication & Session Management
- **Passport.js**: Authentication middleware with local strategy
- **express-session**: Session management with memory store
- **connect-pg-simple**: PostgreSQL session store option

### Frontend Libraries
- **TanStack Query**: Server state management and caching
- **React Hook Form**: Form handling with Zod validation
- **Wouter**: Lightweight routing
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library built on Radix UI primitives
- **Framer Motion**: Animation library for enhanced UX

### Development & Build Tools
- **Vite**: Frontend build tool and development server
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind integration

### UI/UX Libraries
- **Radix UI**: Accessible UI primitives for complex components
- **Lucide React**: Icon library for consistent iconography
- **Recharts**: Data visualization and charting library
- **date-fns**: Date manipulation and formatting utilities

### Specialized Libraries
- **@zxing/library**: QR code scanning for warranty lookup
- **class-variance-authority**: Utility for component variant management
- **cmdk**: Command palette and search functionality
- **next-themes**: Theme management system