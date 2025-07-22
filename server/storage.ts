import { users, products, cartItems, contactSubmissions, type User, type InsertUser, type Product, type InsertProduct, type CartItem, type InsertCartItem, type ContactSubmission, type InsertContactSubmission } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getAllProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;
  
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
}

export class DatabaseStorage implements IStorage {
  async initializeProducts() {
    // Check if products already exist
    const existingProducts = await db.select().from(products);
    if (existingProducts.length > 0) return;

    // Insert sample products
    const sampleProducts: InsertProduct[] = [
      {
        name: "Crochet Sunflower Bouquet Mixed With Daisy&Tulip",
        description: "Bouquet Style 1 / Soft Cotton",
        price: "49.99",
        category: "bouquets",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
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

  async getAllProducts(): Promise<Product[]> {
    await this.initializeProducts(); // Ensure products are initialized
    return await db.select().from(products);
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
}

export const storage = new DatabaseStorage();
