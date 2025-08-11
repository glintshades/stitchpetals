import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import multer from "multer";
import path from "path";
import { storage } from "./storage";
import { insertCartItemSchema, insertWishlistItemSchema, insertContactSubmissionSchema, insertOrderSchema, insertAdminUserSchema, insertProductSchema, insertOfferSchema, insertUserWithShippingSchema, insertNewsletterSubscriptionSchema } from "@shared/schema";
import { fedexService, type ShippingAddress } from './fedexService';

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
      const shippingParts = order.shippingAddress.split(',').map(part => part.trim());
      
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
        trackingNumber: shipmentResult.trackingNumber,
        shippingLabelUrl: shipmentResult.labelUrl,
        shippingCost: shipmentResult.cost.toString(),
        shippingMethod: serviceType || "FEDEX_GROUND",
        status: "shipped",
        shippedAt: new Date().toISOString(),
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
          validation.errors.push('Invalid ZIP code format. Use 5 digits or 5+4 format (12345 or 12345-6789)');
        }
      }
      
      // State validation for US
      if (country === 'US' && state) {
        const usStates = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
        if (!usStates.includes(state.toUpperCase())) {
          validation.warnings.push('Please verify the state code. Use 2-letter abbreviation (e.g., CA, NY, TX)');
        }
      }
      
      // Address completeness check
      if (!addressLine1 || addressLine1.length < 5) {
        validation.isValid = false;
        validation.errors.push('Street address must be at least 5 characters long');
      }
      
      if (!city || city.length < 2) {
        validation.isValid = false;
        validation.errors.push('City name must be at least 2 characters long');
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
      const isValid = await fedexService.validateConnection();
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

      // Get business shipping address
      const businessAddress = fedexService.getBusinessAddress();

      // Calculate package dimensions based on items
      const totalItems = items.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0);
      let packageType: 'bouquet' | 'potted' | 'single' = 'bouquet';
      
      // Determine package type based on items
      if (totalItems === 1) {
        packageType = 'single';
      } else if (items.some((item: any) => item.name?.toLowerCase().includes('pot'))) {
        packageType = 'potted';
      }

      const packageDimensions = fedexService.getStandardPackageDimensions(packageType);

      // Get shipping rates
      const rates = await fedexService.getShippingRates(
        businessAddress,
        recipientAddress,
        [packageDimensions]
      );

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

  const httpServer = createServer(app);
  return httpServer;
}
