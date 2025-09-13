import { pgTable, text, serial, integer, boolean, decimal, jsonb, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  role: text("role").notNull().default("user"), // "user" or "admin"
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: text("last_login"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

// Product categories table
export const productCategories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  slug: text("slug").notNull().unique(),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: integer("category_id").references(() => productCategories.id),
  category: text("category").notNull(), // Keep for backward compatibility
  imageUrl: text("image_url").notNull(),
  colors: jsonb("colors").default([]).notNull(), // array of available colors
  stemCount: integer("stem_count"), // number of stems/flowers
  inStock: boolean("in_stock").default(true).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(), // admin can hide products from listing
});

// New table for product color variations with specific images
export const productVariations = pgTable("product_variations", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  colorName: text("color_name").notNull(), // e.g., "Pink", "Purple", "Mixed"
  colorCode: text("color_code"), // optional hex color code for display
  imageUrl: text("image_url").notNull(), // specific image for this color variation
  stockQuantity: integer("stock_quantity").default(0).notNull(),
  isAvailable: boolean("is_available").default(true).notNull(),
  sortOrder: integer("sort_order").default(0).notNull(), // for admin to control display order
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull().default(1),
  selectedColor: text("selected_color"),
  variationId: integer("variation_id").references(() => productVariations.id), // link to specific color variation
});

export const wishlistItems = pgTable("wishlist_items", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  productId: integer("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
}, (table) => ({
  // Unique constraint to prevent duplicate wishlist items for same session
  sessionProductUnique: uniqueIndex("session_product_unique").on(table.sessionId, table.productId),
}));

export const contactSubmissions = pgTable("contact_submissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  shippingAddress: text("shipping_address").notNull(),
  subtotalAmount: decimal("subtotal_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  taxAmount: decimal("tax_amount", { precision: 10, scale: 2 }).notNull().default("0.00"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }),
  shippingMethod: text("shipping_method"),
  trackingNumber: text("tracking_number"),
  shippingLabelUrl: text("shipping_label_url"),
  shippedAt: text("shipped_at"),
  estimatedDelivery: text("estimated_delivery"),
  status: text("status").notNull().default("pending"), // pending, processing, shipped, delivered, cancelled
  orderItems: jsonb("order_items").notNull(), // array of items in the order
  paymentId: text("payment_id"), // Clover payment/charge ID
  paymentStatus: text("payment_status"), // payment status from Clover
  paymentMethod: text("payment_method").default("clover"), // payment method used
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

// New table for individual shipments within an order
export const orderShipments = pgTable("order_shipments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id, { onDelete: "cascade" }),
  recipientName: text("recipient_name").notNull(),
  recipientPhone: text("recipient_phone"),
  shippingAddress: text("shipping_address").notNull(),
  orderItems: jsonb("order_items").notNull(), // array of items for this shipment
  subtotalAmount: decimal("subtotal_amount", { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal("shipping_cost", { precision: 10, scale: 2 }),
  shippingMethod: text("shipping_method"),
  trackingNumber: text("tracking_number"),
  shippingLabelUrl: text("shipping_label_url"),
  shippedAt: text("shipped_at"),
  estimatedDelivery: text("estimated_delivery"),
  giftMessage: text("gift_message"),
  status: text("status").notNull().default("pending"), // pending, processing, shipped, delivered
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("admin"), // admin, super_admin
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
});

export const offers = pgTable("offers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  discountType: text("discount_type").notNull(), // "percentage" or "fixed"
  discountValue: decimal("discount_value", { precision: 10, scale: 2 }).notNull(),
  code: text("code").unique(),
  minOrderValue: decimal("min_order_value", { precision: 10, scale: 2 }),
  maxDiscount: decimal("max_discount", { precision: 10, scale: 2 }),
  validFrom: text("valid_from").notNull(),
  validUntil: text("valid_until").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  applicableProducts: text("applicable_products").array(), // array of product IDs or "all"
  imageUrl: text("image_url"),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const savedAddresses = pgTable("saved_addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }), // For registered users
  sessionId: text("session_id"), // For guest users (nullable now)
  name: text("name").notNull(), // Address nickname like "Home", "Work", "Mom's House"
  recipientName: text("recipient_name").notNull(),
  phone: text("phone").notNull(),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  country: text("country").notNull().default("US"),
  deliveryInstructions: text("delivery_instructions"),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: text("created_at").notNull().default(new Date().toISOString()),
  updatedAt: text("updated_at").notNull().default(new Date().toISOString()),
});

export const newsletterSubscriptions = pgTable("newsletter_subscriptions", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  isActive: boolean("is_active").notNull().default(true),
  subscribedAt: text("subscribed_at").notNull().default(new Date().toISOString()),
  unsubscribedAt: text("unsubscribed_at"),
  source: text("source").default("website"), // where they subscribed from
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProductSchema = createInsertSchema(products).pick({
  name: true,
  description: true,
  price: true,
  category: true,
  imageUrl: true,
  colors: true,
  stemCount: true,
  inStock: true,
  isVisible: true,
});

export const insertProductVariationSchema = createInsertSchema(productVariations).pick({
  productId: true,
  colorName: true,
  colorCode: true,
  imageUrl: true,
  stockQuantity: true,
  isAvailable: true,
  sortOrder: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  sessionId: true,
  productId: true,
  quantity: true,
  selectedColor: true,
  variationId: true,
});

export const insertWishlistItemSchema = createInsertSchema(wishlistItems).pick({
  sessionId: true,
  productId: true,
});

export const insertContactSubmissionSchema = createInsertSchema(contactSubmissions).pick({
  name: true,
  email: true,
  subject: true,
  message: true,
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  customerName: true,
  customerEmail: true,
  customerPhone: true,
  subtotalAmount: true,
  taxAmount: true,
  totalAmount: true,
  status: true,
  paymentId: true,
  paymentStatus: true,
  paymentMethod: true,
  shippingAddress: true,
  shippingCost: true,
  shippingMethod: true,
  orderItems: true,
}).extend({
  // Convert string fields to proper types for validation
  subtotalAmount: z.string(),
  taxAmount: z.string(), 
  totalAmount: z.string(),
  shippingCost: z.string().optional(),
  orderItems: z.array(z.object({
    productId: z.number(),
    productName: z.string(),
    quantity: z.number(),
    selectedColor: z.string().optional(),
    price: z.number(),
  })),
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).pick({
  username: true,
  email: true,
  password: true,
  role: true,
});

export const insertOfferSchema = createInsertSchema(offers).pick({
  title: true,
  description: true,
  discountType: true,
  discountValue: true,
  code: true,
  minOrderValue: true,
  maxDiscount: true,
  validFrom: true,
  validUntil: true,
  isActive: true,
  applicableProducts: true,
  imageUrl: true,
});

export const insertSavedAddressSchema = createInsertSchema(savedAddresses).pick({
  userId: true,
  sessionId: true,
  name: true,
  recipientName: true,
  phone: true,
  addressLine1: true,
  addressLine2: true,
  city: true,
  state: true,
  zipCode: true,
  country: true,
  deliveryInstructions: true,
  isDefault: true,
});

export const insertNewsletterSubscriptionSchema = createInsertSchema(newsletterSubscriptions).pick({
  email: true,
  source: true,
});

// Enhanced user registration schema with optional shipping info
export const insertUserWithShippingSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
}).extend({
  // Optional shipping address during registration
  shippingName: z.string().optional(),
  shippingPhone: z.string().optional(),
  shippingAddressLine1: z.string().optional(),
  shippingAddressLine2: z.string().optional(),
  shippingCity: z.string().optional(),
  shippingState: z.string().optional(),
  shippingZipCode: z.string().optional(),
  shippingCountry: z.string().optional(),
  shippingDeliveryInstructions: z.string().optional(),
  setAsDefault: z.boolean().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ProductCategory = typeof productCategories.$inferSelect;
export type InsertProductCategory = typeof productCategories.$inferInsert;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertWishlistItem = z.infer<typeof insertWishlistItemSchema>;
export type ContactSubmission = typeof contactSubmissions.$inferSelect;
export type InsertContactSubmission = z.infer<typeof insertContactSubmissionSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;
export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type Offer = typeof offers.$inferSelect;
export type InsertOffer = z.infer<typeof insertOfferSchema>;
export type SavedAddress = typeof savedAddresses.$inferSelect;
export type InsertSavedAddress = z.infer<typeof insertSavedAddressSchema>;
export type InsertUserWithShipping = z.infer<typeof insertUserWithShippingSchema>;
export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
export type InsertNewsletterSubscription = z.infer<typeof insertNewsletterSubscriptionSchema>;
export type ProductVariation = typeof productVariations.$inferSelect;
export type InsertProductVariation = z.infer<typeof insertProductVariationSchema>;
