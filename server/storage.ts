import { users, products, cartItems, contactSubmissions, type User, type InsertUser, type Product, type InsertProduct, type CartItem, type InsertCartItem, type ContactSubmission, type InsertContactSubmission } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private contactSubmissions: Map<number, ContactSubmission>;
  private currentUserId: number;
  private currentProductId: number;
  private currentCartItemId: number;
  private currentContactId: number;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.contactSubmissions = new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentCartItemId = 1;
    this.currentContactId = 1;
    
    this.initializeProducts();
  }

  private initializeProducts() {
    const sampleProducts: (Omit<Product, 'id'> & { id?: number })[] = [
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

    sampleProducts.forEach(product => {
      const id = this.currentProductId++;
      this.products.set(id, { ...product, id } as Product);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.category === category);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async getCartItems(sessionId: string): Promise<(CartItem & { product: Product })[]> {
    const items = Array.from(this.cartItems.values()).filter(item => item.sessionId === sessionId);
    return items.map(item => {
      const product = this.products.get(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      return { ...item, product };
    });
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.sessionId === insertItem.sessionId && 
              item.productId === insertItem.productId &&
              item.selectedColor === insertItem.selectedColor
    );

    if (existingItem) {
      const updatedItem = { ...existingItem, quantity: existingItem.quantity + insertItem.quantity };
      this.cartItems.set(existingItem.id, updatedItem);
      return updatedItem;
    }

    const id = this.currentCartItemId++;
    const item: CartItem = { ...insertItem, id };
    this.cartItems.set(id, item);
    return item;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;
    
    if (quantity <= 0) {
      this.cartItems.delete(id);
      return undefined;
    }

    const updatedItem = { ...item, quantity };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const itemsToDelete = Array.from(this.cartItems.entries())
      .filter(([_, item]) => item.sessionId === sessionId)
      .map(([id, _]) => id);
    
    itemsToDelete.forEach(id => this.cartItems.delete(id));
    return true;
  }

  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const id = this.currentContactId++;
    const submission: ContactSubmission = { 
      ...insertSubmission, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.contactSubmissions.set(id, submission);
    return submission;
  }
}

export const storage = new MemStorage();
