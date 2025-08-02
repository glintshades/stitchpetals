import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { insertCartItemSchema, insertWishlistItemSchema, insertContactSubmissionSchema, insertOrderSchema, insertAdminUserSchema, insertProductSchema, insertOfferSchema } from "@shared/schema";

// Configure multer for image uploads
const storage_config = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'client/public/images/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage_config,
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
    
    // Check both mimetype and file extension
    const isValidMimeType = allowedMimeTypes.includes(file.mimetype);
    const isValidExtension = allowedExtensions.includes(fileExtension);
    
    if (isValidMimeType || isValidExtension) {
      cb(null, true);
    } else {
      console.log('Rejected file - mimetype:', file.mimetype, 'extension:', fileExtension);
      cb(new Error('Only image files are allowed! Supported formats: JPEG, PNG, WebP, GIF'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve uploaded images
  app.use('/images', express.static(path.join(process.cwd(), 'client/public/images')));
  
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
        res.json(products);
      } else {
        const products = await storage.getAllProducts();
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

  // Public Categories API
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Cart API
  app.get("/api/cart", requireAuth, async (req, res) => {
    try {
      const sessionId = (req as any).sessionID || 'default-session';
      const cartItems = await storage.getCartItems(sessionId);
      res.json(cartItems);
    } catch (error) {
      console.error("Cart fetch error:", error);
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post("/api/cart", requireAuth, async (req, res) => {
    try {
      const sessionId = (req as any).sessionID || 'default-session';
      const cartItemData = { ...req.body, sessionId };
      console.log("Adding to cart:", cartItemData);
      const validatedData = insertCartItemSchema.parse(cartItemData);
      const cartItem = await storage.addToCart(validatedData);
      res.json(cartItem);
    } catch (error) {
      console.error("Cart add error:", error);
      res.status(400).json({ message: "Failed to add item to cart", error: String(error) });
    }
  });

  app.patch("/api/cart/:id", requireAuth, async (req, res) => {
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

  app.delete("/api/cart/:id", requireAuth, async (req, res) => {
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

  app.delete("/api/cart", requireAuth, async (req, res) => {
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
  app.get("/api/wishlist", requireAuth, async (req, res) => {
    try {
      const sessionId = (req as any).sessionID || 'default-session';
      const items = await storage.getWishlistItems(sessionId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch wishlist items" });
    }
  });

  app.post("/api/wishlist", requireAuth, async (req, res) => {
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

  app.delete("/api/wishlist/:productId", requireAuth, async (req, res) => {
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
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Create new user
      const newUser = await storage.createUser({ username, password });
      
      // Set session
      (req as any).session.userId = newUser.id;
      (req as any).session.user = newUser;
      
      res.json({ id: newUser.id, username: newUser.username });
    } catch (error) {
      console.error("Registration error:", error);
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

  // Image upload endpoint
  app.post("/api/admin/upload-image", requireAdmin, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      
      const imageUrl = `/images/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
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

  // Process payment with Clover
  app.post("/api/payment/process", async (req, res) => {
    try {
      const { paymentToken, amount, currency = 'USD', description, metadata = {} } = req.body;
      
      if (!paymentToken || !amount) {
        return res.status(400).json({ message: "Payment token and amount are required" });
      }

      // Process payment with Clover
      const paymentResult = await cloverService.createCharge({
        amount, // amount in cents
        currency,
        source: paymentToken,
        description,
        metadata
      });

      res.json({
        success: true,
        paymentId: paymentResult.id,
        amount: paymentResult.amount,
        status: paymentResult.status,
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
  app.get("/api/payment/:chargeId", async (req, res) => {
    try {
      const { chargeId } = req.params;
      const charge = await cloverService.getCharge(chargeId);
      res.json(charge);
    } catch (error: any) {
      console.error('Error getting payment status:', error);
      res.status(400).json({ message: error.message || "Failed to get payment status" });
    }
  });

  // Process refund
  app.post("/api/payment/:chargeId/refund", requireAdmin, async (req, res) => {
    try {
      const { chargeId } = req.params;
      const { amount } = req.body; // optional partial refund amount
      
      const refund = await cloverService.createRefund(chargeId, amount);
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
        case 'charge.succeeded':
          // Payment successful
          console.log('Payment succeeded:', event.data.id);
          break;
        case 'charge.failed':
          // Payment failed
          console.log('Payment failed:', event.data.id);
          break;
        case 'refund.created':
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

  const httpServer = createServer(app);
  return httpServer;
}
