import { 
  users, 
  products, 
  cartItems, 
  contactSubmissions, 
  orders,
  adminUsers,
  type User, 
  type InsertUser, 
  type Product, 
  type InsertProduct, 
  type CartItem, 
  type InsertCartItem, 
  type ContactSubmission, 
  type InsertContactSubmission,
  type Order,
  type InsertOrder,
  type AdminUser,
  type InsertAdminUser
} from "@shared/schema";
import { db } from "./db";
import { eq, ne } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;
  
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  
  // Order management
  getAllOrders(): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Admin management
  getAdminByUsername(username: string): Promise<AdminUser | undefined>;
  createAdmin(admin: InsertAdminUser): Promise<AdminUser>;
  
  // Contact submissions
  getAllContactSubmissions(): Promise<ContactSubmission[]>;
}

export class DatabaseStorage implements IStorage {
  async initializeProducts() {
    // Only run initialization once when setting up the database for the first time
    // Check if this is the first time setup by looking for a specific product name
    const checkProduct = await db.select().from(products).where(eq(products.name, "INITIAL_SETUP_CHECK"));
    if (checkProduct.length > 0) return; // Already initialized
    
    // Check if products already exist (user has added products)
    const existingProducts = await db.select().from(products);
    if (existingProducts.length > 0) {
      // Mark as initialized to prevent future auto-population
      await db.insert(products).values({
        name: "INITIAL_SETUP_CHECK",
        description: "System marker - do not delete",
        price: "0.00",
        category: "stems",
        imageUrl: "/system/marker",
        colors: ["system"],
        stemCount: 1,
        inStock: false,
      });
      return;
    }

    // Insert sample products only on first setup
    const sampleProducts: InsertProduct[] = [
      {
        name: "Crochet Sunflower Bouquet Mixed With Daisy&Tulip - Bouquet Style 1 / Soft Cotton",
        description: "\"Whoever receives this crochet flower bouquet will surely be granted lots of blessing.\"\n\nElevate your space with our enchanting Crochet Sunflower Bouquet, a delightful fusion of radiant sunflowers, delicate daisies, and graceful tulips that exude timeless beauty and charm. Each handcrafted blossom captures the essence of adoration, freshness, elegance, and renewal, adding a splendid touch to your surroundings.\n\nFlower Language for the Entire Bouquet:\nAdoration & Renewal: The sunflowers, daisies, and tulips symbolize adoration, freshness, elegance, and renewal, creating an ambiance of joyful appreciation, sophistication, and a fresh start.\n\nPerfect for Any Occasion:\n• Home Decor: Customize your living space with a bouquet that radiates sentiments of adoration, elegance, and renewal, revitalizing your surroundings\n• Gifts: Share the warmth of adoration, sophistication, and the promise of a new beginning with your loved ones for birthdays, anniversaries, celebrations, or as a heartfelt gesture\n\nProduct Specifications:\n• Materials: Premium Soft Cotton\n• Height: 17\"~18\"\n• Best-Seller on Etsy\n• Fast & Free Shipping Over $9.99\n• 30-Day Free Return & Refund\n\nEnduring Beauty with a Graceful Flourish: Unlike fresh flowers, our Crochet bouquets maintain their beauty forever, requiring no water or maintenance while bringing lasting joy to any space.",
        price: "29.99",
        category: "bouquets",
        imageUrl: "/images/il_1588xN.4851706578_21g4_1753287720446.webp",
        colors: ["Yellow", "Orange", "White"],
        stemCount: 8,
        inStock: true,
      },
      {
        name: "Sapphire Solace Bouquet",
        description: "Handmade Crochet Carnation, Roses & Tulips in Oceanic Blues (6-Stem)",
        price: "89.99",
        category: "bouquets",
        imageUrl: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        colors: ["Blue", "Navy", "Light Blue"],
        stemCount: 6,
        inStock: true,
      },
      {
        name: "Crochet Pink Rose Bouquet",
        description: "3-Stem Bouquet",
        price: "34.99",
        category: "bouquets",
        imageUrl: "https://pixabay.com/get/gc35224e5df4b40e79c6462b44b0ac2e7c7c6f4b96c9ff0abbec63f27205abc72927d78eddeadb35c96b86d2c4530f6bd636bd6e9c0a68df9058358cf66bcafdb_1280.jpg",
        colors: ["Pink", "Light Pink"],
        stemCount: 3,
        inStock: true,
      },
      {
        name: "Velvet Twilight Bouquet",
        description: "Handmade Crochet Lilies, Roses & Tulip in Regal Purples with Emerald Leaf (5-Stem)",
        price: "79.99",
        category: "bouquets",
        imageUrl: "https://pixabay.com/get/g2b9f75ffb000cae584e8282bbf2dec45f6bba9676438e8d452bac7b64fcec30f88834c23bb5fd0d33f72f6a4e3dfa0351deadd47ffddfe39a06961f1794af319_1280.jpg",
        colors: ["Purple", "Emerald"],
        stemCount: 5,
        inStock: true,
      },
      {
        name: "Crochet Carnation Flower Bouquet",
        description: "Pinkish Purple Color",
        price: "44.99",
        category: "bouquets",
        imageUrl: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        colors: ["Pinkish Purple"],
        stemCount: 6,
        inStock: true,
      },
      {
        name: "Handmade Crochet Rose Flower Pot",
        description: "3 Roses, Baby's Breaths, Unique 3-Leaf Design (Pink, Purple, Yellow, Blue)",
        price: "67.99",
        category: "potted",
        imageUrl: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        colors: ["Pink", "Purple", "Yellow", "Blue"],
        stemCount: 3,
        inStock: true,
      },
      {
        name: "Handmade Crochet Daisy Pot",
        description: "7 Daisies in White, Pink, Purple & Blue",
        price: "72.99",
        category: "potted",
        imageUrl: "https://pixabay.com/get/g3f8fedb577b440d9ddd6862aaf69e4008e7a2f29b462a5e464c7e8eaa91ce8ee7bae227e5ded3337fe10b06b9e50bd9636ebefaa2e9e546bc0f6841b78476f41_1280.jpg",
        colors: ["White", "Pink", "Purple", "Blue"],
        stemCount: 7,
        inStock: true,
      },
      {
        name: "Crochet Lily of the Valley Flowers in Pot",
        description: "Large (9 Flowers) | Pink, Purple, Yellow, White",
        price: "84.99",
        category: "potted",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        colors: ["Pink", "Purple", "Yellow", "White"],
        stemCount: 9,
        inStock: true,
      },
      {
        name: "Handmade Crochet Tulip Flower Pot",
        description: "3 Tulips in Purple, Pink, Yellow, Blue, Red",
        price: "59.99",
        category: "potted",
        imageUrl: "https://pixabay.com/get/gb7e835296de08858a1c8e3eee6f5513a8f35682234a7571555caa3e7f4b18e02f31e7daed27a2c0bc3b8b68f6b73f2e4f9f8144a125a443f35be592422b60abd_1280.jpg",
        colors: ["Purple", "Pink", "Yellow", "Blue", "Red"],
        stemCount: 3,
        inStock: true,
      },
      {
        name: "Crochet Sunflower in Pot(2 flowers)",
        description: "Brighten any space with this handmade Crochet Sunflower Pot, featuring two vibrant sunflowers crafted with care and detail. Each bloom is made with soft, high-quality yarn and securely fixed in a beautifully crocheted pot, making it a charming decor piece for desks, shelves, or gift tables. Unlike real flowers, these sunflowers stay fresh forever — no watering needed!\n\nSpecifications:\n• Material: Made from premium soft cotton yarn, ensuring a delicate, handcrafted touch\n• Height: 7.5 inches (17cm~18cm) – Ideal for small spaces, desks, and shelves\n• Handcrafted with Care: Each petal, leaf, and pot is individually crocheted, making every piece one of a kind\n\nPerfect for:\n• Home or office decor\n• Gifting for birthdays, thank-yous, or just because\n• Adding a handmade touch to your space\n\n🌻 Brighten up your space with a forever-blooming sunflower! This crochet sunflower in a pot is a timeless, eco-friendly, and heartfelt gift idea for anyone who loves flowers. Order yours today and bring a little sunshine home! ☀️",
        price: "54.99",
        category: "potted",
        imageUrl: "/images/WechatIMG1746_1753286974076.webp",
        colors: ["Yellow", "Green"],
        stemCount: 2,
        inStock: true,
      },
      {
        name: "Premium Crochet Sunflower Pot Set (2 flowers)",
        description: "Experience the beauty of handcrafted excellence with this Premium Crochet Sunflower Pot Set. Featuring two stunning sunflowers with intricate petal details and realistic brown centers, each positioned in beautifully textured crocheted pots. The professional craftsmanship showcases premium soft cotton yarn worked into lifelike flowers that capture the essence of real sunflowers.\n\nSpecifications:\n• Material: Premium soft cotton yarn with superior texture and durability\n• Height: 7.5 inches (17cm~18cm) per pot\n• Features: Detailed petal work, realistic brown centers, textured pot design\n• Handcrafted Excellence: Each flower individually shaped for natural variation\n\nPerfect for:\n• Premium home decor and interior styling\n• Professional office environments\n• High-quality gifts for special occasions\n• Photography props and display pieces\n\n🌻 This premium set represents the finest in crochet flower artistry, combining traditional techniques with contemporary design for lasting beauty that never fades.",
        price: "64.99",
        category: "potted",
        imageUrl: "/images/WechatIMG1746_1753288163170.webp",
        colors: ["Yellow", "Brown", "Green"],
        stemCount: 2,
        inStock: true,
      },
      {
        name: "Crochet Rose Stems",
        description: "In Special Morandi Colors - Pink, Red, Orange",
        price: "24.99",
        category: "stems",
        imageUrl: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        colors: ["Pink", "Red", "Orange"],
        stemCount: 1,
        inStock: true,
      },
      {
        name: "Crochet Thai Rose Bouquet",
        description: "Single Flower Bouquet, Multiple Colors Available",
        price: "19.99",
        category: "stems",
        imageUrl: "https://pixabay.com/get/g920a6b60ba53b0e1697ce3dd45f72b5cd6787b469dde2176b8852f7751f1712991a111508ded141c424f70e5957aff9de3781110ef7460cb22aa66426f8e5e90_1280.jpg",
        colors: ["Red", "Pink", "Yellow", "White"],
        stemCount: 1,
        inStock: true,
      },
      {
        name: "Earthen Whisper Crochet Bouquet",
        description: "Handmade Crochet Lilies, Roses & Tulips in Brown, Caramel & White (9-Stem)",
        price: "95.99",
        category: "bouquets",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
        colors: ["Brown", "Caramel", "White"],
        stemCount: 9,
        inStock: true,
      },
    ];

    await db.insert(products).values(sampleProducts);
    
    // Mark as initialized
    await db.insert(products).values({
      name: "INITIAL_SETUP_CHECK",
      description: "System marker - do not delete",
      price: "0.00",
      category: "stems",
      imageUrl: "/system/marker",
      colors: ["system"],
      stemCount: 1,
      inStock: false,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserPassword(userId: number, newPassword: string): Promise<void> {
    await db.update(users)
      .set({ password: newPassword })
      .where(eq(users.id, userId));
  }

  async updateUserEmail(userId: number, email: string): Promise<void> {
    await db.update(users)
      .set({ email } as any)
      .where(eq(users.id, userId));
  }

  async getUserOrders(userId: number): Promise<Order[]> {
    // Get user first to match orders by name
    const user = await this.getUser(userId);
    if (!user) return [];
    
    // Return orders that match the user's username (assuming customerName matches username)
    return await db.select().from(orders).where(eq(orders.customerName, user.username));
  }

  async getAllProducts(): Promise<Product[]> {
    await this.initializeProducts(); // Ensure products are initialized
    // Filter out the system marker product
    return await db.select().from(products).where(ne(products.name, "INITIAL_SETUP_CHECK"));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.category, category));
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db.update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    const items = await db.select({
      id: cartItems.id,
      sessionId: cartItems.sessionId,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      selectedColor: cartItems.selectedColor,
      product: products
    })
    .from(cartItems)
    .leftJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.sessionId, sessionId));

    return items.map(item => ({
      id: item.id,
      sessionId: item.sessionId,
      productId: item.productId,
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      product: item.product!
    }));
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItems = await db.select().from(cartItems).where(
      eq(cartItems.sessionId, insertItem.sessionId)
    );
    
    const existingItem = existingItems.find(item => 
      item.productId === insertItem.productId &&
      item.selectedColor === insertItem.selectedColor
    );

    if (existingItem) {
      const [updatedItem] = await db.update(cartItems)
        .set({ quantity: existingItem.quantity + (insertItem.quantity || 1) })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      return updatedItem;
    }

    const [item] = await db.insert(cartItems).values(insertItem).returning();
    return item;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    if (quantity <= 0) {
      await db.delete(cartItems).where(eq(cartItems.id, id));
      return undefined;
    }

    const [updatedItem] = await db.update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedItem || undefined;
  }

  async removeFromCart(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id));
    return true;
  }

  async clearCart(sessionId: string): Promise<boolean> {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
    return true;
  }

  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const [submission] = await db.insert(contactSubmissions).values({
      ...insertSubmission,
      createdAt: new Date().toISOString()
    }).returning();
    return submission;
  }

  // Order management methods
  async getAllOrders(): Promise<Order[]> {
    return await db.select().from(orders);
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date().toISOString() })
      .where(eq(orders.id, id))
      .returning();
    return updatedOrder || undefined;
  }

  // Admin management methods
  async getAdminByUsername(username: string): Promise<AdminUser | undefined> {
    const [admin] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return admin || undefined;
  }

  async createAdmin(admin: InsertAdminUser): Promise<AdminUser> {
    const [newAdmin] = await db.insert(adminUsers).values(admin).returning();
    return newAdmin;
  }

  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    return await db.select().from(contactSubmissions);
  }
}

export const storage = new DatabaseStorage();
