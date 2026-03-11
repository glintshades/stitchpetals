import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSEO } from "@/hooks/use-seo";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/product-card";
import { HeroBanner } from "@/components/hero-banner";
import { type Product, type Offer, type ProductCategory } from "@shared/schema";
import { Search, Filter } from "lucide-react";

export default function Shop() {
  useSEO({
    title: "Shop Handmade Crochet Flowers Bouquet – Crochet Rose, Tulip, Sunflower for Gift & Decor | GlintShades",
    description: "Shop handmade crochet flowers bouquet, crochet handmade rose flower, crochet handmade tulips flower & crochet handmade sunflower flower. Perfect crochet flower for room decor and gifts.",
    keywords: "handmade crochet flowers bouquet, crochet flower for room decor, crochet flower bouquet for gift, crochet handmade sunflower flower, crochet handmade rose flower, crochet handmade tulips flower, realistic crochet flower bouquet",
    canonical: "/shop",
    ogType: "website",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "GlintShades Shop",
      url: "https://glintshades.replit.app/shop",
      description: "Browse our full collection of handcrafted crochet flower arrangements."
    }
  });

  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const urlCategory = urlParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory || "all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price-low" | "price-high">("name");

  const { data: allProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Fetch categories for filtering
  const { data: adminCategories = [] } = useQuery<ProductCategory[]>({
    queryKey: ["/api/categories"],
  });

  // Fetch active offers
  const { data: offers = [] } = useQuery({
    queryKey: ["/api/offers"],
    queryFn: async () => {
      const response = await fetch("/api/offers");
      if (!response.ok) throw new Error('Failed to fetch offers');
      return response.json();
    },
  });

  // Function to get applicable offer for a product
  const getApplicableOffer = (product: Product): Offer | null => {
    const now = new Date();
    const activeOffers = offers.filter((offer: Offer) => {
      const validFrom = new Date(offer.validFrom);
      const validUntil = new Date(offer.validUntil);
      return offer.isActive && 
             now >= validFrom && 
             now <= validUntil && 
             (!offer.applicableProducts || 
              offer.applicableProducts.includes("all") || 
              offer.applicableProducts.includes(String(product.id)));
    });

    if (activeOffers.length === 0) return null;
    
    // Return the best offer (highest discount value)
    return activeOffers.reduce((best: any, current: any) => 
      parseFloat(current.discountValue) > parseFloat(best.discountValue) ? current : best
    );
  };

  // Get category display name helper function
  const getCategoryDisplayName = (slug: string) => {
    const category = adminCategories.find((cat: any) => cat.slug === slug);
    return category ? category.name : slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');
  };

  // Filter by search
  const matchesSearch = (product: Product) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      (Array.isArray(product.colors) ? 
        product.colors.some(color => color.toLowerCase().includes(searchLower)) :
        String(product.colors || "").toLowerCase().includes(searchLower)
      )
    );
  };

  // Filter by category
  const filteredProducts = allProducts.filter((product: Product) => {
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesCategory && matchesSearch(product);
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price-high":
        return parseFloat(b.price) - parseFloat(a.price);
      case "name":
      default:
        return a.name.localeCompare(b.name);
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-wine border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-wine via-dark-pink to-soft-pink py-16 lg:py-24">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-playfair text-4xl lg:text-6xl font-bold text-white mb-6">
            Handmade Crochet Flowers Bouquet
          </h1>
          <h2 className="font-playfair text-2xl font-semibold text-pink-100 mb-6">Crochet Flower for Room Decor &amp; Gifts</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Shop our <strong>realistic crochet flower bouquet</strong> collection — <strong>crochet handmade rose flower</strong>, <strong>crochet handmade tulips flower</strong>, <strong>crochet handmade sunflower flower</strong> and more. Perfect <strong>crochet flower bouquet for gift</strong> or home decor.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3 text-lg"
            />
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className="py-8 bg-background border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-wrap gap-2">
              <Button
                key="all"
                variant={selectedCategory === "all" ? "default" : "outline"}
                onClick={() => setSelectedCategory("all")}
                className={selectedCategory === "all" ? "bg-wine hover:bg-dark-pink" : "border-wine text-wine hover:bg-wine hover:text-white"}
              >
                All Products
              </Button>
              {adminCategories.filter((cat: any) => cat.isActive).map((category: any) => (
                <Button
                  key={category.slug}
                  variant={selectedCategory === category.slug ? "default" : "outline"}
                  onClick={() => setSelectedCategory(category.slug)}
                  className={selectedCategory === category.slug ? "bg-wine hover:bg-dark-pink" : "border-wine text-wine hover:bg-wine hover:text-white"}
                >
                  {category.name}
                </Button>
              ))}
            </div>
            
            {/* Sort Options */}
            <div className="flex items-center gap-4">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "name" | "price-low" | "price-high")}
                className="border border-gray-300 rounded-md px-3 py-2 bg-white"
              >
                <option value="name">Sort by Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
          
          {/* Active Filters Display */}
          {(searchTerm || selectedCategory !== "all") && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Search: "{searchTerm}"
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSearchTerm("")}
                    className="h-auto p-0 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </Button>
                </Badge>
              )}
              {selectedCategory !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-2">
                  Category: {getCategoryDisplayName(selectedCategory)}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                    className="h-auto p-0 text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </Button>
                </Badge>
              )}
            </div>
          )}
          
          {/* Results count */}
          <div className="mt-4">
            <p className="text-gray-600">
              {filteredProducts.length === allProducts.length 
                ? `Showing all ${allProducts.length} products`
                : `Showing ${filteredProducts.length} of ${allProducts.length} products`
              }
            </p>
          </div>
          
          {/* Clear filters */}
          {(searchTerm || selectedCategory !== "all") && (
            <div className="flex gap-2 mt-4">
              {searchTerm && (
                <Button 
                  variant="outline" 
                  onClick={() => setSearchTerm("")}
                  className="border-wine text-wine hover:bg-wine hover:text-white"
                >
                  Clear Search
                </Button>
              )}
              {selectedCategory !== "all" && (
                <Button 
                  variant="outline"
                  onClick={() => setSelectedCategory("all")}
                  className="border-wine text-wine hover:bg-wine hover:text-white"
                >
                  View All Products
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Categories Overview */}
      {selectedCategory === "all" && !searchTerm && (
        <section className="py-16 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-4xl font-bold wine mb-4">Shop Crochet Flower Bouquet for Gift &amp; Room Decor</h2>
              <p className="text-lg text-gray-600">
                Find exactly what you're looking for in our organized collections
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {adminCategories.filter((cat: any) => cat.isActive).map((category: any) => {
                const categoryProducts = allProducts.filter(p => p.category === category.slug);
                return (
                  <div 
                    key={category.slug}
                    className="group cursor-pointer"
                    onClick={() => setSelectedCategory(category.slug)}
                  >
                    <div className="relative overflow-hidden rounded-xl">
                      <img 
                        src={category.imageUrl || "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
                        alt={category.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      <div className="absolute bottom-4 left-4">
                        <div className="bg-white text-wine px-3 py-1 rounded-full text-sm font-semibold mb-2">
                          {categoryProducts.length} Products
                        </div>
                        <h3 className="font-playfair text-2xl font-bold text-white mb-2">{category.name}</h3>
                        <p className="text-white/90 text-sm">{category.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {sortedProducts.length === 0 ? (
            <div className="text-center py-16">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">No products found</h3>
              <p className="text-gray-600 mb-8">
                {searchTerm || selectedCategory !== "all" 
                  ? "Try adjusting your search or filter criteria"
                  : "Our collection is being updated. Please check back soon!"
                }
              </p>
              {(searchTerm || selectedCategory !== "all") && (
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("all");
                  }}
                  className="bg-wine hover:bg-dark-pink"
                >
                  View All Products
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {sortedProducts.map((product: Product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  offer={getApplicableOffer(product)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}