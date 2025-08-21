# GlintShades - Crochet Flower E-commerce Platform

## Overview
GlintShades is a full-stack e-commerce web application specializing in handcrafted crochet flower arrangements. The platform showcases beautiful crochet bouquets, potted arrangements, and individual stems with a sophisticated design. It includes a complete e-commerce flow from product browsing, cart management, to checkout, along with a comprehensive admin panel for order, product, user, and category management. The project features user account registration with default shipping address options and clear address selection during checkout. A database backup system ensures data protection during deployments.

## User Preferences
Preferred communication style: Simple, everyday language.
Image behavior: Images should not change automatically on hover; only change when colors are explicitly clicked/selected.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter
- **State Management**: TanStack Query (React Query) for server state
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **Form Handling**: React Hook Form with Zod validation
- **UI/UX Decisions**: Deep purple (#3e0d57), light pink (#fdeff2), and soft pink (#ea9999) color scheme. Features responsive design, full-screen lightbox for product images, interactive offer sliders, and dynamically integrated categories and offers across the site. Hero sliders and static banners are used for visual appeal on main pages.

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with JSON responses
- **Session Management**: Express sessions with PostgreSQL session store
- **Error Handling**: Centralized error handling middleware
- **Core Features**: Authentication system, comprehensive admin panel for managing orders, products (with CRUD, image upload, inventory), users, and categories. Includes a wishlist system and contact message handling.
- **Shipping Integration**: FedEx API integration for shipping rate calculation, tracking, and label generation

### Database Layer
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with TypeScript-first approach
- **Migration System**: Drizzle Kit for schema migrations
- **Schema Validation**: Drizzle-Zod integration

### Data Models
- Products, Cart Items, Users, Orders, Contact Submissions, Admin Users, Categories.

## External Dependencies

### Core Technologies
- **React Ecosystem**: React, React DOM, React Hook Form, TanStack Query
- **UI Framework**: Radix UI primitives, Lucide React icons, Tailwind CSS
- **Backend**: Express.js, Drizzle ORM
- **Development**: Vite, TypeScript, ESBuild

### Third-Party Services
- **Database Hosting**: Neon PostgreSQL serverless
- **Session Storage**: PostgreSQL-backed session store
- **Shipping Provider**: FedEx API for shipping rates and tracking

### Data Protection & Deployment
- **User Data Persistence**: Automatic preservation in PostgreSQL during redeployments
- **Backup System**: Pre-deployment backup scripts in `scripts/` directory
- **User Registration**: Enhanced with default shipping address collection
- **Checkout Flow**: Radio button selection between saved and new addresses
- **Address Management**: Default address indicators with star (★) symbols