# GlintShades - Crochet Flower E-commerce Platform

## Overview

GlintShades is a full-stack e-commerce web application specializing in handcrafted crochet flower arrangements. The platform features a React frontend with a Node.js/Express backend, utilizing PostgreSQL for data persistence through Drizzle ORM. The application showcases beautiful crochet bouquets, potted arrangements, and individual stems with a sophisticated design system built on shadcn/ui components.

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
- **New Product Addition**: Added "Crochet Sunflower in Pot(2 flowers)" with authentic product image and detailed specifications including material, dimensions, and handcrafted details
- **Product Enhancement**: Updated main sunflower bouquet with comprehensive product description, authentic image, flower language symbolism, and detailed specifications including premium soft cotton materials and dimensions
- **Premium Product Addition**: Added "Premium Crochet Sunflower Pot Set" with professional photography showcasing detailed craftsmanship, premium positioning, and enhanced specifications
- **About Page Enhancement**: Updated "Crafted with Love, Delivered with Care" section with authentic sunflower pot image showcasing premium craftsmanship and product quality

### January 24, 2025
- **Admin Panel Development**: Complete WordPress-style admin panel implemented with authentication, order management, product oversight, and contact message handling
- **Order Management System**: Full order lifecycle management with status tracking (pending, processing, shipped, delivered, cancelled) and detailed order views
- **Checkout Functionality**: Complete checkout process with customer information collection, order creation, and cart clearing
- **Database Schema Extension**: Added orders, admin users, and enhanced contact submissions tables with proper relationships
- **Admin Authentication**: Simple token-based authentication system for admin access (demo credentials: admin/admin123)
- **Dashboard Analytics**: Real-time statistics showing total orders, pending orders, product count, and revenue tracking
- **CRUD Operations Implementation**: Complete Create, Read, Update, Delete functionality for products with form validation, image management, and inventory tracking
- **Product Management**: Full product catalog management with add/edit/delete capabilities, category filtering, and stock status updates
- **Image Upload System**: Drag-and-drop image upload functionality with file validation, preview, and automatic path management
- **Image Path Fix**: Resolved image visibility issues by updating database paths and implementing proper image serving
- **User Management System**: Complete admin user management interface with create, edit, delete, and role management capabilities for system administrators
- **Product Category System**: Full category management system with create, edit, delete functionality and URL slug generation for better product organization
- **Enhanced Admin Panel**: Added Users and Categories tabs to admin dashboard with comprehensive CRUD operations and filtering capabilities
- **Category Image Upload**: Added drag-and-drop image upload functionality to category management with file validation and preview
- **Homepage Category Integration**: Dynamic category display on homepage "Explore Our Collection" section using admin-created categories
- **Contact Form Admin Display**: All contact form submissions now appear in admin panel contact section for better customer inquiry management
- **Product Management Dynamic Categories**: Updated product create/edit forms to use database categories instead of hardcoded options
- **Shop Page Category Integration**: Shop filtering now uses dynamic categories from admin panel with product counts
- **Offers/Sale Page Creation**: New dedicated offers page with promotional deals, discount codes, and featured sale items
- **Navigation Update**: Updated header navigation to Home, About, Shop, Offers, Contact with Little Heart emoji near cart icon
- **Wishlist System Implementation**: Complete wishlist functionality with database persistence, session-based tracking, heart icon interactions on product cards and detail pages, dedicated wishlist page at /wishlist, and wishlist icon in header navigation

### January 25, 2025
- **Complete Website Rebranding**: Successfully rebranded entire website from "Stitched Petals" to "GlintShades" across all files, pages, components, legal documents, email addresses, admin panels, and documentation while maintaining all functionality and design integrity
- **Authentication Requirements for Cart/Wishlist**: Implemented comprehensive authentication system requiring user login for all cart and wishlist operations
- **Client-Side Authentication Guards**: Added authentication checks in cart and wishlist hooks with user-friendly error messages
- **Server-Side Authentication Middleware**: Protected all cart and wishlist API endpoints with requireAuth middleware
- **Enhanced User Experience**: Removed redirect-to-404 issue by showing authentication alerts without page navigation
- **Logout Query Management**: Fixed logout functionality by properly clearing authentication-related queries to prevent page refresh requirements
- **Product Synchronization Across Pages**: Fixed admin product and category mutations to invalidate both admin and public API queries, ensuring immediate updates on home, shop, and offers pages when changes are made in admin panel
- **Offer Integration on Shop Page**: Implemented complete offer application system on shop page, displaying discounted prices, discount badges, and savings calculations for products with active offers
- **Dynamic Pricing Display**: Enhanced ProductCard component to show both original and discounted prices with visual indicators for active promotions across all product listings (home, shop, offers)
- **Admin Offers Form Simplification**: Removed max discount, min order value, and image URL fields from admin offers form with improved 2-column layout
- **Client Offers Page Redesign**: Converted offers display from card format to banner format with gradient backgrounds, enhanced typography, and improved call-to-action buttons
- **Offers Slider Implementation**: Created interactive slider for offer banners with smooth transitions, navigation arrows, dot indicators, and auto-responsive design for better user engagement
- **Admin Offers Form Update**: Removed discount code field from admin offers management form for simplified offer creation
- **Full-Width Auto-Scrolling Banners**: Enhanced offers page with full-width banners featuring product background images, auto-scroll functionality (4-second intervals), and improved visual hierarchy with larger typography and enhanced call-to-action buttons
- **Banner Visual Enhancement**: Updated banner design with centered headings, bold text styling, offer subheadings, date display, background blur/dark effects, and text shadows for improved readability and visual impact
- **Banner Slider Optimization**: Slowed auto-scroll to 8 seconds, zoomed out background images to 120%, reduced dark overlay intensity, and removed shop now button and discount auto-applied text for cleaner presentation
- **Legal Pages Implementation**: Created comprehensive shipping & returns, privacy policy, and terms & conditions pages with professional content and consistent design
- **FAQ Section Addition**: Added detailed FAQ section to home page with 8 common questions about products, materials, care, and policies
- **Footer Navigation Update**: Updated footer with links to new policy pages and FAQ section redirect to home page anchor
- **Authentication Error Message Improvement**: Updated all cart and wishlist error messages to show "Registration Required" instead of "Authentication Required" for better user experience
- **Product Image Gallery Cleanup**: Removed unrelated stock images from product detail pages, now displaying only authentic product images uploaded through admin panel with conditional thumbnail gallery
- **Professional Lightbox Effect**: Enhanced product image viewing with full-screen lightbox featuring navigation controls, keyboard shortcuts (ESC/arrows), image counter, close button, and smooth transitions for professional gallery experience

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