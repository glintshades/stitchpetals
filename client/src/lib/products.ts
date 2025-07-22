import { type Product } from "@shared/schema";

export const productCategories = {
  bouquets: "Bouquets",
  potted: "Potted Flowers", 
  stems: "Single Stems",
} as const;

export type ProductCategory = keyof typeof productCategories;

export function getCategoryDisplayName(category: string): string {
  return productCategories[category as ProductCategory] || category;
}

export function formatPrice(price: string | number): string {
  const numPrice = typeof price === "string" ? parseFloat(price) : price;
  return `$${numPrice.toFixed(2)}`;
}

export function getProductImageAlt(product: Product): string {
  return `${product.name} - ${product.description}`;
}

export const heroProducts = [
  {
    title: "Sunflower Collection",
    description: "Bright and cheerful sunflower arrangements",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },
  {
    title: "Rose Gardens",
    description: "Classic and elegant rose bouquets",
    image: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
  },
  {
    title: "Mixed Arrangements",
    description: "Beautiful combinations of various flowers",
    image: "https://pixabay.com/get/g2b9f75ffb000cae584e8282bbf2dec45f6bba9676438e8d452bac7b64fcec30f88834c23bb5fd0d33f72f6a4e3dfa0351deadd47ffddfe39a06961f1794af319_1280.jpg"
  }
];
