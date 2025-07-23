# Stitched Petals - Crochet Flower E-commerce Platform

## Overview

Stitched Petals is a full-stack e-commerce web application specializing in handcrafted crochet flower arrangements. The platform features a React frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence through Drizzle ORM. The application showcases beautiful crochet bouquets, potted arrangements, and individual stems with a sophisticated design system built on shadcn/ui components.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes (January 2025)

### January 23, 2025
- **Database Integration Completed**: Migrated from in-memory storage to PostgreSQL with full persistence
- **Product Card Enhancement**: Made entire product cards clickable for better user experience
- **Buy Now Feature**: Added "Buy Now" button alongside "Add to Cart" on product detail pages for immediate purchase intent
- **Single Product Pages**: Enhanced product detail pages with dual purchase options and improved interactivity
- **Responsive Design Implementation**: Full website responsive design with consistent 10px padding and uniform product card sizing
- **Cart Functionality Fixed**: Added express-session middleware and fixed cart add/view functionality with database persistence
- **Homepage Banner Update**: Replaced hero banner with user-provided authentic crochet sunflower bouquet image

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens for brand colors
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Session Management**: Express sessions with PostgreSQL session store
- **Request Logging**: Custom middleware for API request tracking
- **Error Handling**: Centralized error handling middleware

### Database Layer
- **Database**: PostgreSQL (configured for Neon serverless)
- **ORM**: Drizzle ORM with TypeScript-first approach
- **Migration System**: Drizzle Kit for schema migrations
- **Schema Validation**: Drizzle-Zod integration for runtime validation

## Key Components

### Data Models
- **Products**: Catalog of crochet items with categories (bouquets, potted, stems), pricing, colors, and inventory
- **Cart Items**: Session-based shopping cart with product associations
- **Users**: Authentication system (schema defined, implementation pending)
- **Contact Submissions**: Customer inquiry management system

### Frontend Components
- **Layout System**: Header with navigation, footer with newsletter signup
- **Product Display**: Product cards with image galleries and color selection, fully clickable navigation
- **Product Detail Pages**: Comprehensive single product pages with image galleries, specifications, and dual purchase options
- **Shopping Cart**: Slide-out sidebar with quantity management
- **Forms**: Contact forms with validation and submission handling
- **UI Components**: Comprehensive set of accessible components (buttons, dialogs, sheets, etc.)

### Backend Services
- **Storage Layer**: Abstracted storage interface with in-memory implementation for development
- **Product API**: CRUD operations for product catalog management
- **Cart API**: Session-based cart management with real-time updates
- **Contact API**: Form submission handling and storage

## Data Flow

### Product Browsing Flow
1. User visits homepage or shop pages
2. Frontend fetches products from `/api/products` endpoint
3. Products are filtered by category and displayed in responsive grid
4. User can view detailed product pages with full specifications

### Shopping Cart Flow
1. User adds items to cart via product cards or detail pages
2. Cart operations are handled through `/api/cart` endpoints
3. Session-based storage associates items with user session
4. Real-time cart updates through React Query invalidation
5. Cart sidebar provides quantity management and checkout preparation

### Contact Form Flow
1. User fills out contact form with validation
2. Form submission posts to `/api/contact` endpoint
3. Submission is stored in database with timestamp
4. User receives confirmation feedback via toast notifications

## External Dependencies

### Core Technologies
- **React Ecosystem**: React, React DOM, React Hook Form, TanStack Query
- **UI Framework**: Radix UI primitives, Lucide React icons, Tailwind CSS
- **Backend**: Express.js, Drizzle ORM, Neon Database connector
- **Development**: Vite, TypeScript, ESBuild for production builds

### Third-Party Services
- **Database Hosting**: Configured for Neon PostgreSQL serverless
- **Session Storage**: PostgreSQL-backed session store
- **Development Tools**: Replit-specific plugins for runtime error handling

### Styling and Design
- **Design System**: Custom CSS variables for consistent theming
- **Typography**: Playfair Display for headings, Inter for body text
- **Color Palette**: Wine, pink, and neutral tones reflecting crochet aesthetic
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## Deployment Strategy

### Development Environment
- **Server**: Express server with Vite middleware for HMR
- **Database**: PostgreSQL with Drizzle migrations
- **Build Process**: TypeScript compilation with module resolution
- **Asset Handling**: Vite handles static assets and client bundling

### Production Build
- **Client**: Vite builds React app to `dist/public` directory
- **Server**: ESBuild bundles server code to `dist/index.js`
- **Database**: Production database via `DATABASE_URL` environment variable
- **Static Serving**: Express serves built React app from public directory

### Configuration Management
- **Environment Variables**: Database URL and session configuration
- **Path Aliases**: TypeScript path mapping for clean imports
- **Module System**: ES modules throughout codebase
- **Session Management**: PostgreSQL session store for production scalability