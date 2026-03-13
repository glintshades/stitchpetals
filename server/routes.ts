import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import multer from "multer";
import path from "path";
import fs from "fs";
import { storage } from "./storage";
import { insertCartItemSchema, insertWishlistItemSchema, insertContactSubmissionSchema, insertOrderSchema, insertAdminUserSchema, insertProductSchema, insertOfferSchema, insertUserWithShippingSchema, insertNewsletterSubscriptionSchema, insertAgentAssignmentSchema, insertChatMessageSchema, liveChatSessionResponseSchema, liveChatSendMessageSchema, liveChatGetMessagesSchema } from "@shared/schema";
import { z } from "zod";
import { fedexService, type ShippingAddress } from './fedexService';
import { Storage } from '@google-cloud/storage';
import { Client } from '@replit/object-storage';
import { whatsappManager } from './providers/whatsapp/index';
import sharp from 'sharp';

// Configure multer for memory storage (needed for App Storage)
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/gif'
    ];
    
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    // SECURITY: Require BOTH mimetype AND file extension to match (prevent spoofed uploads)
    const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
    const isValidExtension = allowedExtensions.includes(fileExtension);
    
    if (isValidMimeType && isValidExtension) {
      cb(null, true);
    } else {
      console.log('Rejected file - mimetype:', file.mimetype, 'extension:', fileExtension);
      cb(new Error('Only image files are allowed! Both mimetype and extension must be valid. Supported formats: JPEG, PNG, WebP, GIF'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded images through API endpoint to avoid Vite conflicts
  app.get('/images/*', async (req, res) => {
    try {
      const imagePath = (req.params as any)['0']; // Get the path after /images/
      
      // SECURITY: Normalize path and ensure it stays within images directory
      const baseDir = path.resolve(process.cwd(), 'client/public/images');
      const resolvedPath = path.resolve(baseDir, imagePath);
      
      // Prevent path traversal attacks
      if (!resolvedPath.startsWith(baseDir)) {
        console.log(`[IMAGE] Path traversal attempt blocked: ${imagePath}`);
        return res.status(400).json({ error: 'Invalid file path' });
      }
      
      console.log(`[IMAGE] Request: ${req.url}, Resolved Path: ${resolvedPath}`);
      
      // Check if file exists
      if (!fs.existsSync(resolvedPath)) {
        console.log(`[IMAGE] File not found: ${resolvedPath}`);
        return res.status(404).json({ error: 'Image not found' });
      }
      
      // Set proper headers for images
      const ext = path.extname(resolvedPath).toLowerCase();
      const mimeTypes: { [key: string]: string } = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.webp': 'image/webp',
        '.gif': 'image/gif',
      };
      
      const contentType = mimeTypes[ext] || 'application/octet-stream';
      
      // Get file stats for proper Content-Length and Last-Modified
      const stats = fs.statSync(resolvedPath);
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', stats.size.toString());
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day cache
      res.setHeader('Last-Modified', stats.mtime.toUTCString());
      res.setHeader('ETag', `"${stats.mtime.getTime()}-${stats.size}"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Accept-Ranges', 'bytes');
      
      console.log(`[IMAGE] Serving: ${imagePath} as ${contentType}`);
      
      // Stream the file
      const fileStream = fs.createReadStream(resolvedPath);
      fileStream.on('error', (error) => {
        console.error(`[IMAGE] Stream error for ${resolvedPath}:`, error);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to stream image' });
        }
      });
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error serving image:', error);
      res.status(500).json({ error: 'Failed to serve image' });
    }
  });

  // Serve public objects from object storage
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    
    try {
      // Get the bucket from environment
      const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
      if (!bucketId) {
        console.log('[CLOUD] Object storage not configured');
        return res.status(500).json({ error: "Object storage not configured" });
      }

      // Initialize cloud storage
      const cloudStorage = new Storage();
      const bucket = cloudStorage.bucket(bucketId);
      const file = bucket.file(`public/${filePath}`);

      console.log(`[CLOUD] Request: /public-objects/${filePath}, Bucket: ${bucketId}`);

      // Check if file exists
      const [exists] = await file.exists();
      if (!exists) {
        console.log(`[CLOUD] File not found: public/${filePath}`);
        return res.status(404).json({ error: "File not found" });
      }

      // Get file metadata
      const [metadata] = await file.getMetadata();
      
      // Set appropriate headers
      res.set({
        'Content-Type': metadata.contentType || 'application/octet-stream',
        'Content-Length': metadata.size,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Accept-Ranges': 'bytes'
      });

      console.log(`[CLOUD] Serving: ${filePath} as ${metadata.contentType}`);

      // Stream the file to the response
      const stream = file.createReadStream();
      
      stream.on('error', (err) => {
        console.error('[CLOUD] Stream error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Error streaming file" });
        }
      });

      stream.pipe(res);
      
    } catch (error) {
      console.error("[CLOUD] Error serving public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });
  
  // Setup session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: false, // Set to true for HTTPS in production
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // User authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    next();
  };

  // Admin middleware for authentication (simplified for demo)
  const requireAdmin = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== 'Bearer admin-token') {
      return res.status(401).json({ message: "Unauthorized access" });
    }
    next();
  };
  // Products API
  app.get("/api/products", async (req, res) => {
    try {
      const category = req.query.category as string;
      if (category) {
        const products = await storage.getProductsByCategory(category);
        // Filter visible products for public API
        const visibleProducts = products.filter(p => p.isVisible !== false);
        res.json(visibleProducts);
      } else {
        // Use visible products for public API
        const products = await storage.getVisibleProducts();
        res.json(products);
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Public product variations endpoint
  app.get("/api/products/:id/variations", async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const variations = await storage.getProductVariations(productId);
      // Only return available variations for public API
      const availableVariations = variations.filter(v => v.isAvailable);
      res.json(availableVariations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product variations" });
    }
  });

  // Public Categories API - Only return active categories for guests
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      // Only return active categories for public API
      const activeCategories = categories.filter(cat => cat.isActive);
      res.json(activeCategories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Cart API - Require authentication for modifications, allow reading for guest checkout
  app.get("/api/cart", async (req, res) => {
    try {
      const sessionId = (req as any).sessionID || 'default-session';
      const cartItems = await storage.getCartItems(sessionId);
      res.json(cartItems);
    } catch (error) {
      console.error("Cart fetch error:", error);
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const sessionId = (req as any).sessionID || 'default-session';
      const cartItemData = { ...req.body, sessionId };
      console.log("Adding to cart:", cartItemData);
      const validatedData = insertCartItemSchema.parse(cartItemData);
      const cartItem = await storage.addToCart(validatedData);
      res.status(201).json(cartItem);
    } catch (error) {
      console.error("Cart add error:", error);
      res.status(400).json({ message: "Failed to add item to cart", error: String(error) });
    }
  });

  app.patch("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(id, quantity);
      if (!cartItem && quantity > 0) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(cartItem);
    } catch (error) {
      res.status(400).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.removeFromCart(id);
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  app.delete("/api/cart", async (req, res) => {
    try {
      const sessionId = (req as any).sessionID || 'default-session';
      await storage.clearCart(sessionId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      console.error("Cart clear error:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Wishlist API
  app.get("/api/wishlist", async (req, res) => {
    try {
      const sessionId = (req as any).sessionID || 'default-session';
      const items = await storage.getWishlistItems(sessionId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wishlist items" });
    }
  });

  app.post("/api/wishlist", async (req, res) => {
    try {
      const sessionId = (req as any).sessionID || 'default-session';
      const result = insertWishlistItemSchema.safeParse({
        sessionId: sessionId,
        productId: req.body.productId,
      });

      if (!result.success) {
        return res.status(400).json({ 
          message: "Invalid wishlist item data",
          errors: result.error.issues 
        });
      }

      const wishlistItem = await storage.addToWishlist(result.data);
      res.status(201).json(wishlistItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to add item to wishlist" });
    }
  });

  app.delete("/api/wishlist/:productId", async (req, res) => {
    try {
      const sessionId = (req as any).sessionID || 'default-session';
      const productId = parseInt(req.params.productId);
      if (isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }

      const success = await storage.removeFromWishlist(sessionId, productId);
      if (success) {
        res.json({ message: "Item removed from wishlist" });
      } else {
        res.status(404).json({ message: "Item not found in wishlist" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to remove item from wishlist" });
    }
  });

  // Contact form API
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSubmissionSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      res.json({ message: "Contact form submitted successfully", id: submission.id });
    } catch (error) {
      res.status(400).json({ message: "Failed to submit contact form" });
    }
  });

  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      // Validate input using schema
      const validatedData = insertUserWithShippingSchema.parse(req.body);
      
      const { username, password, email } = validatedData;
      
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create new user
      const newUser = await storage.createUser({ username, password, email });
      
      // Create shipping address if provided
      const hasShippingInfo = validatedData.shippingName && validatedData.shippingPhone && 
                              validatedData.shippingAddressLine1 && validatedData.shippingCity && 
                              validatedData.shippingState && validatedData.shippingZipCode;
      
      if (hasShippingInfo) {
        await storage.createSavedAddress({
          userId: newUser.id,
          sessionId: null,
          name: "Default Address",
          recipientName: validatedData.shippingName!,
          phone: validatedData.shippingPhone!,
          addressLine1: validatedData.shippingAddressLine1!,
          addressLine2: validatedData.shippingAddressLine2 || null,
          city: validatedData.shippingCity!,
          state: validatedData.shippingState!,
          zipCode: validatedData.shippingZipCode!,
          country: validatedData.shippingCountry || "US",
          deliveryInstructions: validatedData.shippingDeliveryInstructions || null,
          isDefault: validatedData.setAsDefault || true, // Use provided value or default to true
        });
      }
      
      // Set session
      (req as any).session.userId = newUser.id;
      (req as any).session.user = newUser;
      
      res.json({ id: newUser.id, username: newUser.username, email: newUser.email });
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid input data" });
      }
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Find user
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Set session
      (req as any).session.userId = user.id;
      (req as any).session.user = user;
      
      res.json({ id: user.id, username: user.username });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to log in" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    (req as any).session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Failed to log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/user', (req, res) => {
    if ((req as any).session?.user) {
      const user = (req as any).session.user;
      res.json({ id: user.id, username: user.username });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // User orders route
  app.get('/api/user/orders', async (req, res) => {
    if (!(req as any).session?.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const userId = (req as any).session.user.id;
      const orders = await storage.getUserOrders(userId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Update user password
  app.post('/api/auth/update-password', async (req, res) => {
    if (!(req as any).session?.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { currentPassword, newPassword } = req.body;
      const userId = (req as any).session.user.id;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Both current and new passwords are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }

      // Verify current password
      const user = await storage.getUser(userId);
      if (!user || user.password !== currentPassword) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }

      // Update password
      await storage.updateUserPassword(userId, newPassword);
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ message: "Failed to update password" });
    }
  });

  // Update user email
  app.post('/api/auth/update-email', async (req, res) => {
    if (!(req as any).session?.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    try {
      const { email } = req.body;
      const userId = (req as any).session.user.id;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Update email
      await storage.updateUserEmail(userId, email);
      
      res.json({ message: "Email updated successfully" });
    } catch (error) {
      console.error("Error updating email:", error);
      res.status(500).json({ message: "Failed to update email" });
    }
  });



  // Admin - Orders API
  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getAllOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/admin/orders/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.patch("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  // Admin - Create order from cart (checkout simulation)
  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: "Failed to create order" });
    }
  });

  // Admin - User Management API
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const { username, email, password, role } = req.body;
      
      const user = await storage.createUser({
        username,
        password,
      });
      
      // Remove password from response
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error) {
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updates = req.body;
      
      const updatedUser = await storage.updateUser(userId, updates);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password: _, ...userResponse } = updatedUser;
      res.json(userResponse);
    } catch (error) {
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const deleted = await storage.deleteUser(userId);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Get user's shipping addresses (Admin only)
  app.get("/api/admin/users/:id/addresses", requireAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Verify user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const addresses = await storage.getSavedAddresses(undefined, userId);
      res.json(addresses);
    } catch (error) {
      console.error("Error fetching user addresses:", error);
      res.status(500).json({ message: "Failed to fetch user addresses" });
    }
  });

  // Admin - Category Management API
  app.get("/api/admin/categories", requireAdmin, async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/admin/categories", requireAdmin, async (req, res) => {
    try {
      const category = await storage.createCategory(req.body);
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.patch("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const updatedCategory = await storage.updateCategory(categoryId, req.body);
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(updatedCategory);
    } catch (error) {
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    try {
      const categoryId = parseInt(req.params.id);
      const deleted = await storage.deleteCategory(categoryId);
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({ message: "Category deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Admin - Products management
  app.get("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      const products = await storage.getAllProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ message: "Invalid product data" });
    }
  });

  app.patch("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const product = await storage.updateProduct(id, updates);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(400).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Product variations management
  app.get("/api/admin/products/:id/variations", requireAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      const variations = await storage.getProductVariations(productId);
      res.json(variations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch product variations" });
    }
  });

  app.post("/api/admin/products/:id/variations", requireAdmin, async (req, res) => {
    try {
      const productId = parseInt(req.params.id);
      console.log("Creating variation with data:", { ...req.body, productId });
      const variation = await storage.createProductVariation({
        ...req.body,
        productId
      });
      res.status(201).json(variation);
    } catch (error: any) {
      console.error("Variation creation error:", error);
      res.status(400).json({ message: "Failed to create variation", error: error.message });
    }
  });

  app.patch("/api/admin/variations/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const variation = await storage.updateProductVariation(id, req.body);
      if (!variation) {
        return res.status(404).json({ message: "Variation not found" });
      }
      res.json(variation);
    } catch (error) {
      res.status(400).json({ message: "Failed to update variation" });
    }
  });

  app.delete("/api/admin/variations/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteProductVariation(id);
      if (!deleted) {
        return res.status(404).json({ message: "Variation not found" });
      }
      res.json({ message: "Variation deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete variation" });
    }
  });

  // Image upload endpoint - uses persistent object storage with compression
  app.post("/api/admin/upload-image", requireAdmin, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      
      const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
      
      if (bucketId) {
        // Primary: Upload to persistent Replit App Storage
        try {
          // Validate image buffer with Sharp metadata
          let metadata;
          try {
            metadata = await sharp(req.file.buffer).metadata();
          } catch (metadataError) {
            console.error('Invalid image file - metadata extraction failed:', metadataError);
            return res.status(400).json({ message: "Invalid image file format" });
          }
          
          const originalSize = req.file.buffer.length;
          console.log(`📷 Original image: ${metadata.width}x${metadata.height}, ${metadata.format}, ${(originalSize / 1024).toFixed(2)} KB`);
          
          let compressedBuffer: Buffer;
          let outputFormat: string;
          
          // Set up Sharp with security limits and optimization
          const sharpInstance = sharp(req.file.buffer, { 
            animated: true,
            limitInputPixels: 40e6 // Prevent decompression bomb attacks
          })
            .rotate() // Auto-rotate based on EXIF orientation
            .resize({ 
              width: 2000, 
              height: 2000, 
              fit: 'inside', 
              withoutEnlargement: true 
            }) // Limit max dimensions
            .removeMetadata(); // Strip EXIF data to reduce size
          
          // Determine output format and compress accordingly
          const inputFormat = req.file.mimetype;
          
          if (inputFormat.includes('png')) {
            // For PNG images, convert to WebP for better compression
            compressedBuffer = await sharpInstance
              .webp({ quality: 82, effort: 5, alphaQuality: 80 })
              .toBuffer();
            outputFormat = '.webp';
          } else if (inputFormat.includes('gif')) {
            // For GIF, preserve animation and optimize
            compressedBuffer = await sharp(req.file.buffer, { animated: true })
              .gif({ effort: 7 })
              .toBuffer();
            outputFormat = '.gif';
          } else {
            // For JPEG/WebP, optimize and convert to WebP for better compression
            compressedBuffer = await sharpInstance
              .webp({ quality: 82, effort: 5, alphaQuality: 80 })
              .toBuffer();
            outputFormat = '.webp';
          }
          
          const compressedSize = compressedBuffer.length;
          const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
          console.log(`🗜️ Compressed: ${(compressedSize / 1024).toFixed(2)} KB (${compressionRatio}% reduction), format: ${outputFormat}`);
          
          // Generate filename with appropriate extension
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const filename = req.file.fieldname + '-' + uniqueSuffix + outputFormat;
          
          const client = new Client({ bucketId });
          const cloudPath = `images/${filename}`;
          
          const uploadResult = await client.uploadFromBytes(
            cloudPath,
            compressedBuffer
          );
          
          if (uploadResult.ok) {
            // Return a server route URL instead of direct cloud URL
            const serverImageUrl = `/api/images/${filename}`;
            console.log(`✅ Compressed image uploaded to persistent storage: ${cloudPath}`);
            res.json({ imageUrl: serverImageUrl });
            return;
          } else {
            console.error(`❌ Upload failed:`, uploadResult.error);
            return res.status(500).json({ message: "Upload to cloud storage failed", error: uploadResult.error });
          }
          
        } catch (cloudError) {
          console.error('App Storage upload failed:', cloudError);
          return res.status(500).json({ message: "Cloud storage upload failed" });
        }
      } else {
        return res.status(500).json({ message: "App Storage not configured" });
      }
      
    } catch (error) {
      console.error('Image upload error:', error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Admin - Contact submissions
  app.get("/api/admin/contacts", requireAdmin, async (req, res) => {
    try {
      const contacts = await storage.getAllContactSubmissions();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch contact submissions" });
    }
  });

  app.delete("/api/admin/contacts/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteContactSubmission(id);
      res.json({ message: "Contact submission deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete contact submission" });
    }
  });

  // Debug: List App Storage contents  
  app.get("/api/debug/storage", async (req, res) => {
    try {
      const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
      console.log("🔍 DEBUG: App Storage bucket ID:", bucketId);
      
      if (!bucketId) {
        console.log("❌ App Storage not configured");
        return res.json({ error: "App Storage not configured" });
      }
      
      const client = new Client({ bucketId });
      console.log("🔍 DEBUG: Created App Storage client");
      
      const result = await client.list();
      console.log("🔍 DEBUG: List result:", result);
      
      if (result.ok) {
        console.log("✅ App Storage contents:", result.value);
        res.json({ 
          bucketId,
          objects: result.value,
          message: "App Storage contents listed successfully"
        });
      } else {
        console.log("❌ Failed to list storage:", result.error);
        res.json({ 
          error: "Failed to list storage contents",
          details: result.error 
        });
      }
    } catch (error) {
      console.log("❌ Storage debug error:", error);
      res.json({ error: "Storage debug failed", details: error });
    }
  });

  // Serve images from App Storage
  app.get("/api/images/:filename", async (req, res) => {
    try {
      const bucketId = process.env.DEFAULT_OBJECT_STORAGE_BUCKET_ID;
      const filename = req.params.filename;
      
      if (bucketId) {
        try {
          const client = new Client({ bucketId });
          const cloudPath = `images/${filename}`;
          
          const result = await client.downloadAsBytes(cloudPath);
          if (result.ok) {
            const [buffer] = result.value;
            
            // Set appropriate content type
            const ext = path.extname(filename).toLowerCase();
            const contentType = ext === '.webp' ? 'image/webp' :
                               ext === '.png' ? 'image/png' :
                               ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                               ext === '.gif' ? 'image/gif' : 'application/octet-stream';
                               
            res.set('Content-Type', contentType);
            res.set('Cache-Control', 'public, max-age=86400'); // 1 day cache
            res.set('Access-Control-Allow-Origin', '*');
            res.send(buffer);
            return;
          }
        } catch (cloudError) {
          console.error(`Cloud storage fetch failed for ${filename}:`, cloudError);
          return res.status(404).json({ message: "Image not found in cloud storage" });
        }
      } else {
        return res.status(500).json({ message: "App Storage not configured" });
      }
      
    } catch (error) {
      console.error('Image serve error:', error);
      res.status(404).json({ message: "Image not found" });
    }
  });

  // Newsletter subscription endpoints
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const subscriptionData = insertNewsletterSubscriptionSchema.parse(req.body);
      const subscription = await storage.createNewsletterSubscription(subscriptionData);
      res.status(201).json({ 
        message: "Successfully subscribed to newsletter!",
        subscription 
      });
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      res.status(400).json({ message: "Invalid subscription data or email already subscribed" });
    }
  });

  app.post("/api/newsletter/unsubscribe", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const success = await storage.unsubscribeNewsletter(email);
      if (success) {
        res.json({ message: "Successfully unsubscribed from newsletter" });
      } else {
        res.status(404).json({ message: "Email not found in subscription list" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to unsubscribe from newsletter" });
    }
  });

  // Admin - Newsletter subscriptions management
  app.get("/api/admin/newsletter-subscriptions", requireAdmin, async (req, res) => {
    try {
      const subscriptions = await storage.getAllNewsletterSubscriptions();
      res.json(subscriptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch newsletter subscriptions" });
    }
  });

  app.post("/api/admin/newsletter/resubscribe", requireAdmin, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      
      const success = await storage.resubscribeNewsletter(email);
      if (success) {
        res.json({ message: "Successfully resubscribed user to newsletter" });
      } else {
        res.status(404).json({ message: "Email not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to resubscribe user" });
    }
  });

  // WhatsApp webhook endpoints
  // GET endpoint for webhook verification
  app.get("/api/whatsapp/webhook", (req, res) => {
    try {
      const mode = req.query['hub.mode'] as string;
      const verifyToken = req.query['hub.verify_token'] as string;
      const challenge = req.query['hub.challenge'] as string;

      if (!whatsappManager.isConfigured()) {
        return res.status(503).json({ error: "WhatsApp provider not configured" });
      }

      const provider = whatsappManager.getProvider();
      
      if (provider.verifyChallenge(mode as string, verifyToken as string)) {
        res.status(200).send(challenge);
      } else {
        res.status(403).send('Forbidden');
      }
    } catch (error) {
      console.error('WhatsApp webhook verification error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // POST endpoint for receiving messages (raw body parsing handled globally for signature verification)
  app.post("/api/whatsapp/webhook", async (req, res) => {
    try {
      if (!whatsappManager.isConfigured()) {
        return res.status(503).json({ error: "WhatsApp provider not configured" });
      }

      const provider = whatsappManager.getProvider();
      const signature = req.headers['x-hub-signature-256'] as string;
      const rawBody = req.body.toString();

      // Verify webhook signature
      if (!signature || !provider.verifyWebhook(rawBody, signature)) {
        console.warn('WhatsApp webhook signature verification failed');
        return res.status(403).json({ error: "Forbidden - invalid signature" });
      }

      // Parse the webhook event
      const body = JSON.parse(rawBody);
      const event = provider.parseWebhookEvent(body);

      if (event && event.type === 'message') {
        // Acknowledge receipt immediately (required for WhatsApp webhook reliability)
        res.status(200).json({ status: "received" });
        
        // Process message asynchronously to avoid webhook timeouts
        setImmediate(async () => {
          try {
            const { ChatRouter } = await import('./chatRouter');
            const chatRouter = new ChatRouter(storage);
            
            await chatRouter.processMessage({
              fromNumber: event.data.from,
              messageText: event.data.text || '',
              messageId: event.data.messageId,
              timestamp: new Date(),
              messageType: 'text'
            });
          } catch (error) {
            console.error('Async chat processing error:', error);
          }
        });
      } else {
        // Acknowledge other event types
        res.status(200).json({ status: "acknowledged" });
      }
    } catch (error) {
      console.error('WhatsApp webhook processing error:', error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Product Search Chat endpoint
  app.post('/api/search-products', async (req, res) => {
    try {
      const { query } = req.body;
      
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ error: 'Search query is required' });
      }

      const searchQuery = query.toLowerCase().trim();
      
      // Get all products and categories for search
      const products = await storage.getAllProducts();
      const categories = await storage.getAllCategories();
      
      // Smart search logic
      let matchedProducts = [];
      let responseMessage = "";

      // Keyword mapping for better search
      const keywords = {
        'sunflower': ['sunflower', 'sun flower'],
        'rose': ['rose', 'roses'],
        'bouquet': ['bouquet', 'bouquets', 'arrangement', 'arrangements'],
        'pot': ['pot', 'potted', 'planter', 'container'],
        'crochet': ['crochet', 'crocheted', 'handmade', 'handcrafted'],
        'flower': ['flower', 'flowers', 'floral'],
        'price': ['price', 'cost', 'how much', 'expensive', 'cheap'],
        'care': ['care', 'maintenance', 'clean', 'wash', 'maintain'],
        'gift': ['gift', 'present', 'surprise']
      };

      // Handle specific queries
      if (searchQuery.includes('price') || searchQuery.includes('cost') || searchQuery.includes('how much')) {
        // Price inquiry
        const cheapest = products.reduce((min, p) => p.price < min.price ? p : min, products[0]);
        const mostExpensive = products.reduce((max, p) => p.price > max.price ? p : max, products[0]);
        
        responseMessage = `Our crochet flowers range from $${cheapest?.price} to $${mostExpensive?.price}. Here are some options:`;
        matchedProducts = products.slice(0, 3);
      }
      else if (searchQuery.includes('care') || searchQuery.includes('clean') || searchQuery.includes('maintenance')) {
        // Care instructions
        responseMessage = `Great news! Our crochet flowers are very low maintenance:\n\n• No watering needed - they last forever!\n• Dust gently with a soft brush\n• Store in a dry place\n• Machine washable on gentle cycle if needed\n\nHere are some of our popular items:`;
        matchedProducts = products.slice(0, 3);
      }
      else {
        // Product search
        matchedProducts = products.filter(product => {
          const productText = `${product.name} ${product.description}`.toLowerCase();
          
          // Direct keyword match
          if (productText.includes(searchQuery)) {
            return true;
          }
          
          // Keyword mapping match
          for (const [key, synonyms] of Object.entries(keywords)) {
            if (synonyms.some(synonym => searchQuery.includes(synonym))) {
              if (productText.includes(key) || synonyms.some(syn => productText.includes(syn))) {
                return true;
              }
            }
          }
          
          return false;
        });

        // Category-based search
        const matchedCategory = categories.find(cat => 
          cat.name.toLowerCase().includes(searchQuery) ||
          searchQuery.includes(cat.name.toLowerCase())
        );

        if (matchedCategory && matchedProducts.length === 0) {
          matchedProducts = products.filter(p => p.categoryId === matchedCategory.id);
        }

        // Generate appropriate message
        if (matchedProducts.length > 0) {
          responseMessage = `Found ${matchedProducts.length} product(s) matching "${query}":`;
        } else {
          responseMessage = `I couldn't find specific products for "${query}". Here are some popular crochet flowers you might like:`;
          matchedProducts = products.slice(0, 3);
        }
      }

      // Prepare product results with category info
      const productResults = matchedProducts.slice(0, 5).map(product => {
        const category = categories.find(c => c.id === product.categoryId);
        return {
          id: product.id,
          name: product.name,
          description: product.description || 'Beautiful handcrafted crochet flower',
          price: product.price,
          category: category?.name || 'Crochet Flowers',
          image: product.imageUrl
        };
      });

      res.json({
        message: responseMessage,
        products: productResults
      });
    } catch (error) {
      console.error('Product search error:', error);
      
      // Fallback response
      res.json({
        message: "I'm having trouble searching right now, but I'd love to help! Our collection includes beautiful crochet flower bouquets, potted arrangements, and individual stems. All handcrafted and lasting forever!",
        products: []
      });
    }
  });

  // Public Offers API (for users to view)
  app.get("/api/offers", async (req, res) => {
    try {
      const offers = await storage.getActiveOffers();
      res.json(offers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch offers" });
    }
  });

  // Admin - Offers management
  app.get("/api/admin/offers", requireAdmin, async (req, res) => {
    try {
      const offers = await storage.getAllOffers();
      res.json(offers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch offers" });
    }
  });

  app.post("/api/admin/offers", requireAdmin, async (req, res) => {
    try {
      const offerData = insertOfferSchema.parse(req.body);
      const offer = await storage.createOffer(offerData);
      res.status(201).json(offer);
    } catch (error) {
      console.error("Create offer error:", error);
      res.status(400).json({ message: "Invalid offer data" });
    }
  });

  app.patch("/api/admin/offers/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const offer = await storage.updateOffer(id, updates);
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }
      res.json(offer);
    } catch (error) {
      res.status(400).json({ message: "Failed to update offer" });
    }
  });

  app.delete("/api/admin/offers/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteOffer(id);
      if (!success) {
        return res.status(404).json({ message: "Offer not found" });
      }
      res.json({ message: "Offer deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete offer" });
    }
  });

  // Payment Routes
  const { cloverService } = await import('./clover-service');

  // Get Clover configuration for frontend
  app.get("/api/payment/clover-config", (req, res) => {
    try {
      const config = cloverService.getPublicConfig();
      res.json(config);
    } catch (error) {
      console.error('Error getting Clover config:', error);
      res.status(500).json({ message: "Payment configuration not available" });
    }
  });

  // Tokenize card data
  app.post("/api/payment/tokenize", async (req, res) => {
    try {
      const { number, exp_month, exp_year, cvv, zip } = req.body;
      
      if (!number || !exp_month || !exp_year || !cvv) {
        return res.status(400).json({ message: "All card fields are required" });
      }

      // Create card token using Clover
      const tokenResult = await cloverService.createCardToken({
        number,
        exp_month,
        exp_year,
        cvv,
        zip
      });

      res.json(tokenResult);
    } catch (error: any) {
      console.error('Card tokenization error:', error);
      res.status(400).json({ 
        message: error.message || "Card tokenization failed" 
      });
    }
  });

  // Process payment with Clover
  app.post("/api/payment/process", async (req, res) => {
    try {
      const { paymentToken, amount, description, orderId } = req.body;
      
      if (!paymentToken || !amount) {
        return res.status(400).json({ message: "Payment token and amount are required" });
      }

      // Process payment with Clover REST API
      const paymentResult = await cloverService.createPayment({
        amount, // amount in cents
        cardToken: paymentToken,
        description,
        orderId
      });

      res.json({
        success: true,
        paymentId: paymentResult.id,
        amount: paymentResult.amount,
        status: paymentResult.result,
        chargeId: paymentResult.id
      });
    } catch (error: any) {
      console.error('Payment processing error:', error);
      res.status(400).json({ 
        success: false,
        message: error.message || "Payment processing failed" 
      });
    }
  });

  // Get payment status
  app.get("/api/payment/:paymentId", async (req, res) => {
    try {
      const { paymentId } = req.params;
      const payment = await cloverService.getPayment(paymentId);
      res.json(payment);
    } catch (error: any) {
      console.error('Error getting payment status:', error);
      res.status(400).json({ message: error.message || "Failed to get payment status" });
    }
  });

  // Process refund
  app.post("/api/payment/:paymentId/refund", requireAdmin, async (req, res) => {
    try {
      const { paymentId } = req.params;
      const { amount } = req.body; // optional partial refund amount
      
      const refund = await cloverService.createRefund(paymentId, amount);
      res.json(refund);
    } catch (error: any) {
      console.error('Refund error:', error);
      res.status(400).json({ message: error.message || "Refund failed" });
    }
  });

  // Webhook endpoint for Clover payment notifications
  app.post("/api/payment/webhook", express.raw({ type: 'application/json' }), (req, res) => {
    try {
      const signature = req.headers['clover-signature'] as string;
      const webhookSecret = process.env.CLOVER_WEBHOOK_SECRET;
      
      if (webhookSecret && signature) {
        const isValid = cloverService.verifyWebhookSignature(
          req.body.toString(),
          signature,
          webhookSecret
        );
        
        if (!isValid) {
          return res.status(401).json({ message: "Invalid webhook signature" });
        }
      }

      const event = JSON.parse(req.body.toString());
      console.log('Clover webhook received:', event.type, event.data);
      
      // Handle different webhook events
      switch (event.type) {
        case 'payment_created':
          // Payment successful
          console.log('Payment succeeded:', event.data.id);
          break;
        case 'payment_failed':
          // Payment failed
          console.log('Payment failed:', event.data.id);
          break;
        case 'refund_created':
          // Refund processed
          console.log('Refund created:', event.data.id);
          break;
        default:
          console.log('Unhandled webhook event:', event.type);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(400).json({ message: "Webhook processing failed" });
    }
  });

  // FedEx Shipping Routes
  const fedexService = (await import('./fedex-service')).default;

  // Get shipping rates
  app.post("/api/shipping/rates", async (req, res) => {
    try {
      const { fromZip, fromCountry, toZip, toCountry, weight, length, width, height } = req.body;
      
      if (!fromZip || !toZip || !weight) {
        return res.status(400).json({ message: "fromZip, toZip, and weight are required" });
      }

      const rates = await fedexService.getRates({
        fromZip,
        fromCountry: fromCountry || 'US',
        toZip,
        toCountry: toCountry || 'US',
        weight,
        length,
        width,
        height
      });

      res.json(rates);
    } catch (error: any) {
      console.error('Error getting shipping rates:', error);
      res.status(500).json({ message: error.message || "Failed to get shipping rates" });
    }
  });

  // Create shipment
  app.post("/api/shipping/create", requireAdmin, async (req, res) => {
    try {
      const { orderId, serviceType } = req.body;
      
      if (!orderId) {
        return res.status(400).json({ message: "orderId is required" });
      }

      // Get order details
      const order = await storage.getOrder(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      // Parse shipping address
      // Note: shippingAddress is stored in orderShipments table, not orders table
      const shippingParts: string[] = []; // TODO: Get from orderShipments table
      
      // Create shipment data
      const shipmentData = {
        shipper: {
          name: "GlintShades Store",
          company: "GlintShades",
          phone: "555-123-4567",
          address1: "123 Business St",
          city: "Business City",
          state: "CA",
          zip: "90210",
          country: "US"
        },
        recipient: {
          name: order.customerName,
          phone: order.customerPhone || "",
          address1: shippingParts[0] || "",
          city: shippingParts[1] || "",
          state: shippingParts[2] || "",
          zip: shippingParts[3] || "",
          country: "US"
        },
        weight: 2, // Default weight in pounds
        serviceType: serviceType || "FEDEX_GROUND"
      };

      const shipmentResult = await fedexService.createShipment(shipmentData);

      // Update order with shipping information
      await storage.updateOrder(orderId, {
        status: "shipped",
        updatedAt: new Date().toISOString()
      });

      res.json({
        success: true,
        trackingNumber: shipmentResult.trackingNumber,
        labelUrl: shipmentResult.labelUrl,
        cost: shipmentResult.cost
      });
    } catch (error: any) {
      console.error('Error creating shipment:', error);
      res.status(500).json({ message: error.message || "Failed to create shipment" });
    }
  });

  // Track shipment
  app.get("/api/shipping/track/:trackingNumber", async (req, res) => {
    try {
      const { trackingNumber } = req.params;
      const trackingResult = await fedexService.trackShipment(trackingNumber);
      res.json(trackingResult);
    } catch (error: any) {
      console.error('Error tracking shipment:', error);
      res.status(500).json({ message: error.message || "Failed to track shipment" });
    }
  });

  // Validate FedEx credentials (admin only)
  app.get("/api/shipping/validate", requireAdmin, async (req, res) => {
    try {
      const isValid = await fedexService.validateCredentials();
      res.json({ valid: isValid });
    } catch (error) {
      res.json({ valid: false });
    }
  });

  // Address validation endpoint
  app.post("/api/address/validate", async (req, res) => {
    try {
      const { addressLine1, city, state, zipCode, country } = req.body;
      
      // Basic validation
      const validation = {
        isValid: true,
        suggestions: [],
        errors: [],
        warnings: []
      };
      
      // ZIP code format validation
      if (country === 'US') {
        const zipRegex = /^\d{5}(-\d{4})?$/;
        if (!zipRegex.test(zipCode)) {
          validation.isValid = false;
          (validation.errors as string[]).push('Invalid ZIP code format. Use 5 digits or 5+4 format (12345 or 12345-6789)');
        }
      }
      
      // State validation for US
      if (country === 'US' && state) {
        const usStates = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
        if (!usStates.includes(state.toUpperCase())) {
          (validation.warnings as string[]).push('Please verify the state code. Use 2-letter abbreviation (e.g., CA, NY, TX)');
        }
      }
      
      // Address completeness check
      if (!addressLine1 || addressLine1.length < 5) {
        validation.isValid = false;
        (validation.errors as string[]).push('Street address must be at least 5 characters long');
      }
      
      if (!city || city.length < 2) {
        validation.isValid = false;
        (validation.errors as string[]).push('City name must be at least 2 characters long');
      }
      
      res.json(validation);
    } catch (error) {
      console.error('Address validation error:', error);
      res.status(500).json({ error: 'Address validation failed' });
    }
  });

  // Saved addresses endpoints
  app.get("/api/addresses", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      const sessionId = req.sessionID;
      
      const addresses = await storage.getSavedAddresses(sessionId, userId);
      res.json(addresses);
    } catch (error) {
      console.error('Error fetching saved addresses:', error);
      res.status(500).json({ error: 'Failed to fetch addresses' });
    }
  });

  app.post("/api/addresses", async (req, res) => {
    try {
      const userId = (req as any).session?.userId;
      const sessionId = req.sessionID;
      
      const addressData = {
        ...req.body,
        userId: userId || null,
        sessionId: userId ? null : sessionId, // Use sessionId only for guests
      };
      
      const address = await storage.createSavedAddress(addressData);
      res.json(address);
    } catch (error) {
      console.error('Error creating saved address:', error);
      res.status(500).json({ error: 'Failed to save address' });
    }
  });

  app.put("/api/addresses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const address = await storage.updateSavedAddress(id, req.body);
      if (!address) {
        return res.status(404).json({ error: 'Address not found' });
      }
      res.json(address);
    } catch (error) {
      console.error('Error updating saved address:', error);
      res.status(500).json({ error: 'Failed to update address' });
    }
  });

  app.delete("/api/addresses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteSavedAddress(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Address not found' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting saved address:', error);
      res.status(500).json({ error: 'Failed to delete address' });
    }
  });

  // Database Backup Routes
  app.post("/api/admin/backup", requireAdmin, async (req, res) => {
    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        tables: {} as Record<string, any[]>,
        metadata: {
          totalRecords: 0,
          backupSize: '0KB'
        }
      };

      // Backup all tables
      try {
        backupData.tables.users = await storage.getAllUsers();
        backupData.tables.saved_addresses = await storage.getAllAddresses();
        backupData.tables.products = await storage.getAllProducts();
        backupData.tables.categories = await storage.getAllCategories();
        backupData.tables.orders = await storage.getAllOrders();
        backupData.tables.contact_submissions = await storage.getAllContactSubmissions();
        backupData.tables.admin_users = await storage.getAllAdminUsers();
        backupData.tables.offers = await storage.getAllOffers();

        // Calculate total records
        backupData.metadata.totalRecords = Object.values(backupData.tables)
          .reduce((sum, table) => sum + table.length, 0);

        // Calculate backup size (approximate)
        const backupString = JSON.stringify(backupData);
        backupData.metadata.backupSize = `${Math.round(backupString.length / 1024)}KB`;

        console.log(`Created backup with ${backupData.metadata.totalRecords} total records`);
        res.json(backupData);
      } catch (storageError) {
        console.error('Backup storage error:', storageError);
        res.status(500).json({ message: "Failed to access database tables" });
      }
    } catch (error) {
      console.error('Backup error:', error);
      res.status(500).json({ message: "Failed to create backup" });
    }
  });

  // Internal backup endpoint (for scripts) - localhost only
  app.post("/api/internal/backup", async (req, res) => {
    // Only allow from localhost for security
    const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    if (clientIp !== '127.0.0.1' && clientIp !== '::1' && !clientIp?.includes('127.0.0.1')) {
      return res.status(403).json({ message: "Access denied - localhost only" });
    }

    try {
      const backupData = {
        timestamp: new Date().toISOString(),
        tables: {} as Record<string, any[]>,
        metadata: {
          totalRecords: 0,
          backupSize: '0KB'
        }
      };

      // Backup all tables  
      backupData.tables.users = await storage.getAllUsers();
      backupData.tables.saved_addresses = await storage.getAllAddresses();
      backupData.tables.products = await storage.getAllProducts();
      backupData.tables.categories = await storage.getAllCategories();
      backupData.tables.orders = await storage.getAllOrders();
      backupData.tables.contact_submissions = await storage.getAllContactSubmissions();
      backupData.tables.admin_users = await storage.getAllAdminUsers();
      backupData.tables.offers = await storage.getAllOffers();

      // Calculate metadata
      backupData.metadata.totalRecords = Object.values(backupData.tables)
        .reduce((sum, table) => sum + table.length, 0);

      const backupString = JSON.stringify(backupData);
      backupData.metadata.backupSize = `${Math.round(backupString.length / 1024)}KB`;

      console.log(`✅ Internal backup created: ${backupData.metadata.totalRecords} records, ${backupData.metadata.backupSize}`);
      res.json(backupData);
    } catch (error) {
      console.error('Internal backup error:', error);
      res.status(500).json({ message: "Backup failed" });
    }
  });

  // FedEx Shipping Integration Routes
  
  // Validate FedEx API connection
  app.get("/api/shipping/test", async (req, res) => {
    try {
      const isValid = await fedexService.validateCredentials();
      if (isValid) {
        res.json({ 
          status: 'connected',
          message: 'FedEx API connection successful',
          services: ['rate_calculation', 'tracking', 'label_generation']
        });
      } else {
        res.status(500).json({ 
          status: 'error',
          message: 'FedEx API connection failed' 
        });
      }
    } catch (error) {
      console.error('FedEx connection test failed:', error);
      res.status(500).json({ 
        status: 'error',
        message: 'FedEx API connection test failed' 
      });
    }
  });

  // Calculate shipping rates for checkout
  app.post("/api/shipping/rates", async (req, res) => {
    try {
      const { shippingAddress, items } = req.body;
      
      if (!shippingAddress || !items || !Array.isArray(items)) {
        return res.status(400).json({ 
          error: 'Missing required fields: shippingAddress and items' 
        });
      }

      // Convert user address to FedEx format
      const recipientAddress: ShippingAddress = {
        streetLines: [shippingAddress.street],
        city: shippingAddress.city,
        stateOrProvinceCode: shippingAddress.state,
        postalCode: shippingAddress.zipCode,
        countryCode: 'US',
        residential: true
      };

      // Get business shipping address (hardcoded for now)
      const businessAddress = {
        streetLines: ['123 Business St'],
        city: 'Business City',
        stateOrProvinceCode: 'CA',
        postalCode: '90210',
        countryCode: 'US',
        residential: false
      };

      // Calculate package dimensions based on items
      const totalItems = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
      let packageType: 'bouquet' | 'potted' | 'single' = 'bouquet';
      
      // Determine package type based on items
      if (totalItems === 1) {
        packageType = 'single';
      } else if (items.some((item: any) => item.name?.toLowerCase().includes('pot'))) {
        packageType = 'potted';
      }

      // Get standard package dimensions (hardcoded for now)
      const packageDimensions = {
        length: packageType === 'potted' ? 12 : packageType === 'single' ? 8 : 10,
        width: packageType === 'potted' ? 12 : packageType === 'single' ? 8 : 10,
        height: packageType === 'potted' ? 10 : packageType === 'single' ? 6 : 8,
        weight: totalItems * 0.5 // 0.5 lb per item
      };

      // Get shipping rates
      const rates = await fedexService.getRates({
        fromZip: businessAddress.postalCode,
        fromCountry: businessAddress.countryCode,
        toZip: recipientAddress.postalCode,
        toCountry: recipientAddress.countryCode,
        weight: packageDimensions.weight,
        length: packageDimensions.length,
        width: packageDimensions.width,
        height: packageDimensions.height
      });

      console.log(`✅ Calculated ${rates.length} shipping rates for order`);
      res.json({ rates });
    } catch (error) {
      console.error('Failed to calculate shipping rates:', error);
      res.status(500).json({ 
        error: 'Failed to calculate shipping rates',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Track shipment by tracking number
  app.get("/api/shipping/track/:trackingNumber", async (req, res) => {
    try {
      const { trackingNumber } = req.params;
      
      if (!trackingNumber) {
        return res.status(400).json({ error: 'Tracking number is required' });
      }

      const trackingInfo = await fedexService.trackShipment(trackingNumber);
      
      if (!trackingInfo) {
        return res.status(404).json({ 
          error: 'Tracking information not found for this number' 
        });
      }

      console.log(`✅ Retrieved tracking info for ${trackingNumber}`);
      res.json({ tracking: trackingInfo });
    } catch (error) {
      console.error('Failed to track shipment:', error);
      res.status(500).json({ 
        error: 'Failed to track shipment',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Get available shipping services
  app.get("/api/shipping/services", async (req, res) => {
    try {
      const services = [
        {
          code: 'PRIORITY_OVERNIGHT',
          name: 'FedEx Priority Overnight',
          description: 'Next business day by 10:30 AM',
          deliveryTime: '1 business day'
        },
        {
          code: 'STANDARD_OVERNIGHT', 
          name: 'FedEx Standard Overnight',
          description: 'Next business day by 3:00 PM',
          deliveryTime: '1 business day'
        },
        {
          code: 'FEDEX_2_DAY',
          name: 'FedEx 2Day',
          description: 'Second business day',
          deliveryTime: '2 business days'
        },
        {
          code: 'FEDEX_EXPRESS_SAVER',
          name: 'FedEx Express Saver',
          description: 'Third business day',
          deliveryTime: '3 business days'
        },
        {
          code: 'FEDEX_GROUND',
          name: 'FedEx Ground',
          description: '1-5 business days based on distance',
          deliveryTime: '1-5 business days'
        }
      ];

      res.json({ services });
    } catch (error) {
      console.error('Failed to get shipping services:', error);
      res.status(500).json({ error: 'Failed to get shipping services' });
    }
  });

  // Chat API for AI-powered customer support
  app.post("/api/chat", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Message is required" });
      }

      // Import the chat service
      const { generateChatResponse } = await import('./chatService');
      const response = await generateChatResponse(message);
      
      res.json({ response });
    } catch (error) {
      console.error('Chat API error:', error);
      res.status(500).json({ 
        error: "Failed to generate response",
        response: "I'm sorry, I'm having trouble responding right now. Please try again in a moment or browse our beautiful crochet flower collection on the website."
      });
    }
  });

  // Live Chat API endpoints - Routes messages to owner's WhatsApp
  app.post("/api/live-chat/session", async (req, res) => {
    try {
      // Create or get existing live chat session for web channel
      const sessionId = req.session.id || `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const externalUserId = sessionId;
      
      // Check if session already exists
      let chatSession = await storage.getChatSession(externalUserId, "web");
      
      if (!chatSession) {
        // Create new session
        chatSession = await storage.createChatSession({
          channel: "web",
          externalUserId,
          mode: "agent_pending",
        });
      }
      
      // Return response matching frontend interface expectations
      const response = {
        id: chatSession.id,
        sessionId: chatSession.id.toString(),
        status: chatSession.mode 
      };
      
      res.json(response);
    } catch (error) {
      console.error('Live chat session creation error:', error);
      res.status(500).json({ 
        error: "Failed to create live chat session" 
      });
    }
  });

  app.get("/api/live-chat/messages", async (req, res) => {
    try {
      // Validate query parameters using Zod
      const validationResult = liveChatGetMessagesSchema.safeParse(req.query);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request parameters",
          details: validationResult.error.issues
        });
      }

      const sessionIdNumber = parseInt(validationResult.data.sessionId);
      
      // Get chat session to verify it exists and is a web session
      const chatSession = await storage.getChatSessionById(sessionIdNumber);
      if (!chatSession || chatSession.channel !== "web") {
        return res.status(404).json({ error: "Session not found" });
      }

      // Get messages for the session
      const messages = await storage.getChatMessages(sessionIdNumber, 100);
      
      res.json({ 
        messages: messages.map(msg => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.createdAt
        }))
      });
    } catch (error) {
      console.error('Live chat messages retrieval error:', error);
      res.status(500).json({ 
        error: "Failed to retrieve messages" 
      });
    }
  });

  app.post("/api/live-chat/send", async (req, res) => {
    try {
      // Validate request body using Zod
      const validationResult = liveChatSendMessageSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request data",
          details: validationResult.error.issues
        });
      }

      const { sessionId, message } = validationResult.data;

      // Get chat session
      const chatSession = await storage.getChatSessionById(sessionId);
      if (!chatSession || chatSession.channel !== "web") {
        return res.status(404).json({ error: "Session not found" });
      }

      // Save user message to database
      const userMessage = await storage.createChatMessage({
        sessionId: chatSession.id,
        role: "user", 
        content: message,
      });

      // Forward message to owner's WhatsApp if configured
      const ownerWhatsAppId = process.env.OWNER_WHATSAPP_ID;
      if (ownerWhatsAppId && whatsappManager.isConfigured()) {
        try {
          // Format message for WhatsApp with session identifier
          const whatsappMessage = `🌸 New Live Chat Message [SID:${chatSession.id}]\n\nFrom: Website Customer\nMessage: ${message}\n\nReply to this message to respond to the customer.`;
          
          const provider = whatsappManager.getProvider();
          await provider.sendMessage({
            to: ownerWhatsAppId,
            text: whatsappMessage
          });
          
          // Update session mode to indicate message sent to agent
          await storage.updateChatSession(chatSession.id, { 
            mode: "agent_pending" 
          });
        } catch (whatsappError) {
          console.error('Failed to forward message to WhatsApp:', whatsappError);
          // Don't fail the request - message is saved in database
        }
      }

      res.json({ 
        success: true,
        messageId: userMessage.id 
      });
    } catch (error) {
      console.error('Live chat send error:', error);
      res.status(500).json({ 
        error: "Failed to send message" 
      });
    }
  });

  // OAuth authentication routes
  app.post("/api/auth/oauth/:provider", async (req, res) => {
    try {
      const { provider } = req.params;
      const { getAuthUrl, isProviderConfigured } = await import('./oauthService');
      
      if (!isProviderConfigured(provider)) {
        return res.status(400).json({ 
          error: `${provider} OAuth is not configured`,
          message: `To enable ${provider} login, please configure the OAuth settings in your environment variables.`
        });
      }

      const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/oauth/${provider}/callback`;
      const authUrl = getAuthUrl(provider, redirectUri);
      
      res.json({ authUrl });
    } catch (error) {
      console.error('OAuth initiation error:', error);
      res.status(500).json({ 
        error: "Failed to initiate OAuth",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // OAuth callback routes
  app.get("/api/auth/oauth/:provider/callback", async (req, res) => {
    try {
      const { provider } = req.params;
      const { code, state, error } = req.query;

      if (error) {
        return res.redirect(`/?auth_error=${encodeURIComponent(String(error))}`);
      }

      if (!code) {
        return res.redirect('/?auth_error=missing_code');
      }

      const { exchangeCodeForToken, getUserInfo } = await import('./oauthService');
      const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/oauth/${provider}/callback`;
      
      // Exchange code for access token
      const tokenData = await exchangeCodeForToken(provider, code as string, redirectUri);
      const userInfo = await getUserInfo(provider, tokenData.access_token);
      
      // Create or find user account
      const socialUser = {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        provider: provider
      };
      
      // Check if user exists by social ID or email
      let user = await storage.getUserBySocialId(provider, socialUser.id);
      
      if (!user && socialUser.email) {
        // Try to find by email
        user = await storage.getUserByEmail(socialUser.email);
        if (user) {
          // Link social account to existing user
          await storage.linkSocialAccount(user.id, provider, socialUser.id);
        }
      }
      
      if (!user) {
        // Create new user account
        const username = socialUser.name?.replace(/\s+/g, '').toLowerCase() || `${provider}_user_${Date.now()}`;
        user = await storage.createSocialUser({
          username,
          email: socialUser.email,
          provider,
          socialId: socialUser.id,
          socialData: userInfo
        });
      }
      
      // Set session
      (req as any).session.userId = user.id;
      (req as any).session.user = user;
      
      // Redirect to home with success
      res.redirect('/?auth_success=1');
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`/?auth_error=${encodeURIComponent('authentication_failed')}`);
    }
  });

  // ========== AGENT CHAT MANAGEMENT APIs ==========
  
  // Get pending chat sessions awaiting agent assignment
  app.get('/api/admin/chat/queue', requireAdmin, async (req, res) => {
    try {
      const sessions = await storage.getPendingChatSessions();
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching chat queue:', error);
      res.status(500).json({ error: "Failed to fetch pending chat sessions" });
    }
  });

  // Get chat sessions assigned to a specific agent
  app.get('/api/admin/chat/agent/:agentId', requireAdmin, async (req, res) => {
    try {
      const agentId = parseInt(req.params.agentId);
      if (isNaN(agentId)) {
        return res.status(400).json({ error: "Invalid agent ID" });
      }
      
      const sessions = await storage.getAgentChatSessions(agentId);
      res.json(sessions);
    } catch (error) {
      console.error('Error fetching agent chat sessions:', error);
      res.status(500).json({ error: "Failed to fetch agent sessions" });
    }
  });

  // Assign an agent to a chat session
  app.post('/api/admin/chat/assign', requireAdmin, async (req, res) => {
    try {
      // Validate request body with Zod
      const assignmentData = insertAgentAssignmentSchema.parse(req.body);
      const { sessionId, agentUserId } = assignmentData;
      
      // Check if session exists and is in valid state for assignment
      const session = await storage.getChatSessionById(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Chat session not found" });
      }
      
      if (session.mode !== 'agent_pending') {
        return res.status(400).json({ error: "Session must be in agent_pending mode for assignment" });
      }
      
      // Check if assignment already exists
      const existingAssignment = await storage.getAgentAssignment(sessionId);
      if (existingAssignment) {
        return res.status(400).json({ error: "Session already has an agent assignment" });
      }
      
      // Update session mode to agent_assigned
      const updatedSession = await storage.updateChatSession(sessionId, { 
        mode: 'agent_assigned' 
      });
      
      if (!updatedSession) {
        return res.status(500).json({ error: "Failed to update session" });
      }
      
      // Create agent assignment
      const assignment = await storage.createAgentAssignment({
        sessionId,
        agentUserId,
        assignedAt: new Date(),
        status: 'active'
      });
      
      res.json({ session: updatedSession, assignment });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error('Error assigning agent:', error);
      res.status(500).json({ error: "Failed to assign agent" });
    }
  });

  // Get conversation history for a chat session
  app.get('/api/admin/chat/:sessionId/messages', requireAdmin, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      if (isNaN(sessionId)) {
        return res.status(400).json({ error: "Invalid session ID" });
      }
      
      // Verify session exists
      const session = await storage.getChatSessionById(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Chat session not found" });
      }
      
      // Get messages with optional limit for pagination
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const messages = await storage.getChatMessages(sessionId, limit);
      res.json(messages);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      res.status(500).json({ error: "Failed to fetch conversation history" });
    }
  });

  // Send message as agent
  app.post('/api/admin/chat/:sessionId/send', requireAdmin, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      if (isNaN(sessionId)) {
        return res.status(400).json({ error: "Invalid session ID" });
      }
      
      // Validate request body with Zod
      const messageData = insertChatMessageSchema.extend({
        agentUserId: z.number()
      }).parse({
        ...req.body,
        sessionId,
        role: 'assistant',
        externalMessageId: `agent_${Date.now()}_${Math.random().toString(36).substring(2)}`
      });
      
      // Get session info and validate
      const session = await storage.getChatSessionById(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Chat session not found" });
      }
      
      if (session.mode !== 'agent_assigned') {
        return res.status(400).json({ error: "Session must be assigned to an agent to send messages" });
      }
      
      // Verify agent is assigned to this session
      const assignment = await storage.getAgentAssignment(sessionId);
      if (!assignment || assignment.agentUserId !== messageData.agentUserId) {
        return res.status(403).json({ error: "Agent not assigned to this session" });
      }
      
      // Store the message from agent
      const chatMessage = await storage.createChatMessage({
        sessionId: messageData.sessionId,
        role: messageData.role,
        content: messageData.content,
        externalMessageId: messageData.externalMessageId,
        timestamp: new Date()
      });
      
      // Send via WhatsApp if session is WhatsApp channel
      if (session.channel === 'whatsapp' && whatsappManager.isConfigured()) {
        try {
          const provider = whatsappManager.getProvider();
          await provider.sendMessage({
            to: session.externalUserId,
            text: messageData.content
          });
        } catch (providerError) {
          console.error('WhatsApp send error:', providerError);
          return res.status(500).json({ error: "Failed to send message via WhatsApp" });
        }
      }
      
      res.json({ message: chatMessage });
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Invalid request data", details: error.errors });
      }
      console.error('Error sending agent message:', error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  // Update chat session status
  app.put('/api/admin/chat/:sessionId/status', requireAdmin, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      if (isNaN(sessionId)) {
        return res.status(400).json({ error: "Invalid session ID" });
      }
      
      const { mode } = req.body;
      const validModes = ['bot', 'agent_pending', 'agent_assigned', 'closed'];
      
      if (!mode || !validModes.includes(mode)) {
        return res.status(400).json({ error: "Valid mode is required (bot, agent_pending, agent_assigned, closed)" });
      }
      
      // Get current session to validate state transition
      const currentSession = await storage.getChatSessionById(sessionId);
      if (!currentSession) {
        return res.status(404).json({ error: "Chat session not found" });
      }
      
      // Validate allowed state transitions
      const currentMode = currentSession.mode;
      const invalidTransitions = {
        'closed': ['bot', 'agent_pending', 'agent_assigned'], // Can't reopen closed sessions
        'agent_assigned': mode === 'agent_pending' ? ['agent_pending'] : [] // Can't go back to pending if assigned
      };
      
      if (invalidTransitions[currentMode]?.includes(mode)) {
        return res.status(400).json({ 
          error: `Invalid state transition from ${currentMode} to ${mode}` 
        });
      }
      
      const updatedSession = await storage.updateChatSession(sessionId, { mode });
      if (!updatedSession) {
        return res.status(500).json({ error: "Failed to update session" });
      }
      
      res.json(updatedSession);
    } catch (error) {
      console.error('Error updating session status:', error);
      res.status(500).json({ error: "Failed to update session status" });
    }
  });

  // Analytics tracking endpoint (called from frontend)
  app.post("/api/track", async (req, res) => {
    try {
      const { path, referrer, sessionId } = req.body;
      const userAgent = req.headers["user-agent"] || "";
      const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "";

      // Classify traffic source from referrer
      const classifySource = (ref: string): string => {
        if (!ref) return "direct";
        const url = ref.toLowerCase();
        const searchEngines = ["google.", "bing.", "yahoo.", "duckduckgo.", "yandex.", "baidu.", "ecosia.", "ask.com", "aol.com"];
        const socialNetworks = ["facebook.", "instagram.", "twitter.", "t.co", "tiktok.", "pinterest.", "linkedin.", "youtube.", "reddit.", "snapchat.", "whatsapp."];
        if (searchEngines.some(s => url.includes(s))) return "organic";
        if (socialNetworks.some(s => url.includes(s))) return "social";
        return "referral";
      };

      const trafficSource = classifySource(referrer || "");

      // Geolocate IP asynchronously (don't block response)
      let country: string | undefined;
      let city: string | undefined;

      const isLocalIp = !ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.");

      if (!isLocalIp) {
        try {
          const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=country,city,status`, { signal: AbortSignal.timeout(2000) });
          if (geoRes.ok) {
            const geo = await geoRes.json() as any;
            if (geo.status === "success") {
              country = geo.country;
              city = geo.city;
            }
          }
        } catch {
          // Geo lookup failed silently
        }
      }

      await storage.trackPageView({ path, referrer, trafficSource, country, city, sessionId, userAgent });
      res.json({ ok: true });
    } catch (error) {
      console.error("Analytics tracking error:", error);
      res.json({ ok: false });
    }
  });

  // Analytics admin endpoints
  app.get("/api/admin/analytics/overview", requireAdmin, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const data = await storage.getAnalyticsOverview(days);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to get analytics overview" });
    }
  });

  app.get("/api/admin/analytics/traffic-sources", requireAdmin, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const data = await storage.getTrafficSources(days);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to get traffic sources" });
    }
  });

  app.get("/api/admin/analytics/top-pages", requireAdmin, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const data = await storage.getTopPages(days);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to get top pages" });
    }
  });

  app.get("/api/admin/analytics/by-country", requireAdmin, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const data = await storage.getVisitorsByCountry(days);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to get country data" });
    }
  });

  app.get("/api/admin/analytics/by-day", requireAdmin, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const data = await storage.getVisitorsByDay(days);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to get daily data" });
    }
  });

  app.get("/api/admin/analytics/by-city", requireAdmin, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const data = await storage.getVisitorsByCity(days);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to get city data" });
    }
  });

  app.get("/api/admin/analytics/search-keywords", requireAdmin, async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const data = await storage.getSearchKeywords(days);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to get keyword data" });
    }
  });

  // Site settings
  app.get("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ error: "Failed to get settings" });
    }
  });

  app.post("/api/admin/settings", requireAdmin, async (req, res) => {
    try {
      const { key, value } = req.body;
      if (!key) return res.status(400).json({ error: "Key is required" });
      await storage.setSetting(key, value || "");
      res.json({ ok: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to save setting" });
    }
  });

  // Public endpoint to get site settings (for GA4 injection etc)
  app.get("/api/settings/public", async (req, res) => {
    try {
      const ga4Id = await storage.getSetting("ga4_measurement_id");
      const gscVerification = await storage.getSetting("gsc_verification");
      res.json({ ga4Id, gscVerification });
    } catch (error) {
      res.json({ ga4Id: null, gscVerification: null });
    }
  });

  // Sitemap.xml - dynamically generated for better crawlability
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const BASE_URL = "https://glintshades.com";
      const products = await storage.getAllProducts();
      const categories = await storage.getAllCategories();
      const now = new Date().toISOString().split("T")[0];

      const staticPages = [
        { url: "/", priority: "1.0", changefreq: "daily" },
        { url: "/shop", priority: "0.9", changefreq: "daily" },
        { url: "/bouquets", priority: "0.9", changefreq: "daily" },
        { url: "/offers", priority: "0.8", changefreq: "daily" },
        { url: "/about", priority: "0.7", changefreq: "monthly" },
        { url: "/contact", priority: "0.7", changefreq: "monthly" },
        { url: "/shipping-returns", priority: "0.5", changefreq: "monthly" },
        { url: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
        { url: "/terms-conditions", priority: "0.3", changefreq: "yearly" },
      ];

      const staticUrls = staticPages.map(page => `
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join("");

      const categoryUrls = (categories as any[])
        .filter((c: any) => c.isActive !== false && c.slug)
        .map((c: any) => `
  <url>
    <loc>${BASE_URL}/shop?category=${encodeURIComponent(c.slug)}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join("");

      const keywordPages = [
        "handmade+crochet+flowers+bouquet",
        "realistic+crochet+flower+bouquet",
        "crochet+flower+bouquet+for+gift",
        "crochet+handmade+rose+flower",
        "crochet+handmade+tulips+flower",
        "crochet+handmade+sunflower+flower",
      ].map(q => `
  <url>
    <loc>${BASE_URL}/shop?q=${q}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join("");

      const productUrls = (products as any[])
        .filter((p: any) => p.isActive !== false)
        .map((p: any) => {
          const imageUrl = p.imageUrl && !p.imageUrl.includes('/system/')
            ? p.imageUrl.startsWith('http') ? p.imageUrl : `${BASE_URL}${p.imageUrl}`
            : null;
          const imageTag = imageUrl ? `
    <image:image>
      <image:loc>${imageUrl}</image:loc>
      <image:title>${(p.name || "Handmade Crochet Flower").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</image:title>
      <image:caption>${(p.description ? p.description.slice(0, 100) : "Handmade crochet flower bouquet crafted with love").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</image:caption>
    </image:image>` : "";
          return `
  <url>
    <loc>${BASE_URL}/product/${p.id}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>${imageTag}
  </url>`;
        }).join("");

      const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${staticUrls}
${categoryUrls}
${keywordPages}
${productUrls}
</urlset>`;

      res.setHeader("Content-Type", "application/xml");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
