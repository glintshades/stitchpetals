import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/product-card";
import { type Product, type Offer } from "@shared/schema";
import { Search, Filter } from "lucide-react";
import { productCategories, getCategoryDisplayName } from "@/lib/products";

export default function Shop() {
  const [location] = useLocation();
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const urlCategory = urlParams.get('category');
  
  const [selectedCategory, setSelectedCategory] = useState<string>(urlCategory || "all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price-low" | "price-high">("name");

  const { data: allProducts = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
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
      return offer.isActive && now >= validFrom && now <= validUntil;
    });

    // Find the best offer for this product
    for (const offer of activeOffers) {
      if (offer.applicableProducts?.includes("all") || 
          offer.applicableProducts?.includes(product.id.toString())) {
        return offer;
      }
    }
    return null;
  };

  // Filter and sort products
  const filteredProducts = allProducts
    .filter(product => {
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price);
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Fetch categories from database
  const { data: dbCategories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      const response = await fetch("/api/categories");
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  const categories = [
    { value: "all", label: "All Products", count: allProducts.length },
    ...dbCategories
      .filter((cat: any) => cat.isActive)
      .map((cat: any) => ({
        value: cat.slug,
        label: cat.name,
        count: allProducts.filter(p => p.category === cat.slug).length
      }))
  ];

  return (
    <div className="bg-ivory">
      {/* Hero Section */}
      <section className="gradient-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-playfair text-5xl md:text-6xl font-bold wine mb-6">
              Shop Collection
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Discover our complete range of handcrafted crochet flowers. From elegant bouquets to 
              charming potted arrangements, find the perfect piece for your space.
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium wine">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-wine focus:border-transparent"
              >
                <option value="name">Name</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>

            {/* Results count */}
            <div className="text-sm text-gray-600">
              {isLoading ? "Loading..." : `${filteredProducts.length} products found`}
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-6 bg-warm-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.value)}
                className={`flex items-center space-x-2 ${
                  selectedCategory === category.value
                    ? "bg-wine text-white hover:bg-dark-pink"
                    : "border-wine text-wine hover:bg-wine hover:text-white"
                }`}
              >
                <span>{category.label}</span>
                <Badge variant="secondary" className="ml-2">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 -m-2.5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="p-2.5">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse h-full">
                    <div className="h-48 sm:h-52 md:h-56 bg-gray-200"></div>
                    <div className="p-4 sm:p-5 md:p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 -m-2.5">
              {filteredProducts.map((product) => {
                const applicableOffer = getApplicableOffer(product);
                return (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    offer={applicableOffer} 
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="font-playfair text-2xl font-bold wine mb-2">No Products Found</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm 
                  ? `No products match "${searchTerm}". Try adjusting your search terms.`
                  : selectedCategory !== "all" 
                    ? `No products available in ${getCategoryDisplayName(selectedCategory)} category.`
                    : "No products are currently available."
                }
              </p>
              <div className="space-x-4">
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
            </div>
          )}
        </div>
      </section>

      {/* Categories Overview */}
      {selectedCategory === "all" && !searchTerm && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="font-playfair text-4xl font-bold wine mb-4">Shop by Category</h2>
              <p className="text-lg text-gray-600">
                Find exactly what you're looking for in our organized collections
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  category: "bouquets",
                  title: "Bouquets",
                  description: "Mixed flower arrangements perfect for any occasion",
                  image: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
                  count: allProducts.filter(p => p.category === "bouquets").length
                },
                {
                  category: "potted",
                  title: "Potted Flowers",
                  description: "Beautiful arrangements in decorative containers",
                  image: "https://pixabay.com/get/g48b661a150c38e5acc30a8007516d6ec48a1128a09c59dbc2a96db4cb74efff4f4cead1152dbcc8d48000e3737c29bea90066a5010a4ad1dc7126ba5da2dd8da_1280.jpg",
                  count: allProducts.filter(p => p.category === "potted").length
                },
                {
                  category: "stems",
                  title: "Single Stems",
                  description: "Individual flowers perfect for small spaces",
                  image: "https://pixabay.com/get/gf903151dd1f2de135ef6b603105babc6b62b3a44144950fbf04210ddda4dc94aabbdc7fd73e42bce1dee555fcecfaf4dcdd76dc7f685bdb5bb60fcecc52ff94f_1280.jpg",
                  count: allProducts.filter(p => p.category === "stems").length
                }
              ].map((cat) => (
                <div 
                  key={cat.category}
                  className="group cursor-pointer"
                  onClick={() => setSelectedCategory(cat.category)}
                >
                  <div className="relative overflow-hidden rounded-xl">
                    <img 
                      src={cat.image} 
                      alt={cat.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <div className="bg-white text-wine px-3 py-1 rounded-full text-sm font-semibold mb-2">
                        {cat.count} Products
                      </div>
                      <h3 className="font-playfair text-2xl font-bold text-white mb-2">{cat.title}</h3>
                      <p className="text-white/90 text-sm">{cat.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
