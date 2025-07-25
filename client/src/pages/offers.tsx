import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/product-card";
import OfferProductCard from "@/components/offer-product-card";
import { type Product, type Offer } from "@shared/schema";
import { Star, Clock, Percent, Gift, Package, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";

// Offers Slider Component
function OffersSlider({ offers, products }: { offers: Offer[], products: Product[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % offers.length);
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + offers.length) % offers.length);
  };
  
  // Auto-scroll functionality
  useEffect(() => {
    if (offers.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % offers.length);
      }, 4000); // Change slide every 4 seconds
      
      return () => clearInterval(interval);
    }
  }, [offers.length]);
  
  if (offers.length === 0) return null;
  
  // Get product image for background
  const getOfferProductImage = (offer: Offer) => {
    if (offer.applicableProducts && !offer.applicableProducts.includes("all")) {
      const firstProductId = offer.applicableProducts[0];
      const product = products.find(p => p.id.toString() === firstProductId);
      return product?.imageUrl;
    }
    // Return first product image as fallback
    return products[0]?.imageUrl;
  };
  
  return (
    <div className="relative w-full">
      <div className="overflow-hidden">
        <div 
          className="flex transition-transform duration-700 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {offers.map((offer: Offer) => {
            const backgroundImage = getOfferProductImage(offer);
            return (
              <div key={offer.id} className="w-full flex-shrink-0">
                <div 
                  className="relative overflow-hidden bg-gradient-to-r from-wine to-pink-500 shadow-2xl min-h-[400px] md:min-h-[500px]"
                  style={{
                    backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundBlendMode: 'multiply'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-wine/80 to-pink-500/80"></div>
                  <div className="relative px-8 py-16 md:px-16 md:py-24">
                    <div className="grid md:grid-cols-2 gap-8 items-center max-w-7xl mx-auto">
                      <div className="text-white">
                        <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-8 py-4 mb-8">
                          <span className="text-4xl md:text-5xl font-bold mr-3">
                            {offer.discountValue}{offer.discountType === "percentage" ? "%" : "$"}
                          </span>
                          <span className="text-2xl md:text-3xl font-semibold">OFF</span>
                        </div>
                        <h3 className="font-playfair text-5xl md:text-7xl font-bold mb-6 leading-tight">
                          {offer.title}
                        </h3>
                        <p className="text-xl md:text-3xl text-white/95 mb-8 leading-relaxed font-light">
                          {offer.description}
                        </p>
                        <div className="text-white/80 text-lg">
                          <p className="flex items-center">
                            <Calendar className="w-5 h-5 mr-3" />
                            Valid until: {new Date(offer.validUntil).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-center md:text-right">
                        <Link href="/shop">
                          <Button className="bg-white text-wine hover:bg-gray-100 text-2xl md:text-3xl px-12 py-6 font-bold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 rounded-full">
                            Shop Now
                          </Button>
                        </Link>
                        <p className="text-white/80 text-lg mt-6">
                          *Discount applied automatically at checkout
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {offers.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors z-20 shadow-lg"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors z-20 shadow-lg"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
          
          <div className="flex justify-center mt-8 space-x-3">
            {offers.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  index === currentSlide ? 'bg-wine scale-125' : 'bg-gray-400 hover:bg-gray-500'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function Offers() {
  const { data: products = [], isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: offers = [], isLoading: offersLoading } = useQuery<Offer[]>({
    queryKey: ["/api/offers"],
  });

  // Featured sale products (first 6 products)
  const featuredProducts = products.slice(0, 6);

  if (productsLoading || offersLoading) {
    return (
      <div className="bg-ivory min-h-screen">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wine mx-auto mb-4"></div>
            <p className="text-gray-600">Loading amazing offers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory">
      {/* Offers Slider Section */}
      <section className="w-full">
        {offers.length > 0 ? (
          <OffersSlider offers={offers} products={products} />
        ) : (
          <div className="text-center py-20 bg-gradient-to-b from-ivory to-white">
            <div className="max-w-md mx-auto px-4">
              <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Active Offers
              </h3>
              <p className="text-gray-500 mb-4">
                Check back soon for amazing deals on our beautiful crochet flowers.
              </p>
              <Link href="/shop">
                <Button className="wine-gradient text-white">
                  Browse Full Collection
                </Button>
              </Link>
            </div>
          </div>
        )}
      </section>



      {/* Products in Offers */}
      {offers.some(offer => offer.applicableProducts && !offer.applicableProducts.includes("all")) && (
        <section className="py-16 bg-gradient-to-b from-white to-pink-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-wine mr-3" />
                <h2 className="font-playfair text-4xl font-bold wine">
                  Products on Sale
                </h2>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                These handcrafted items are currently included in our special offers
              </p>
            </div>
            
            {offers
              .filter(offer => offer.applicableProducts && !offer.applicableProducts.includes("all") && offer.isActive)
              .map((offer: Offer) => {
                const offerProducts = products.filter((product: Product) => 
                  offer.applicableProducts?.includes(product.id.toString())
                );
                
                if (offerProducts.length === 0) return null;
                
                return (
                  <div key={offer.id} className="mb-16">
                    <div className="text-center mb-8">
                      <Badge className="bg-gradient-to-r from-wine to-pink-500 text-white text-lg px-4 py-2 mb-4">
                        {offer.discountValue}{offer.discountType === "percentage" ? "%" : "$"} OFF
                      </Badge>
                      <h3 className="font-playfair text-2xl font-bold wine mb-2">
                        {offer.title}
                      </h3>
                      {offer.code && (
                        <p className="text-sm text-gray-600">
                          Use code: <span className="font-mono font-bold text-wine">{offer.code}</span>
                        </p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {offerProducts.slice(0, 6).map((product: Product) => (
                        <div key={product.id} className="relative">
                          <Badge className="absolute top-4 left-4 z-10 bg-gradient-to-r from-wine to-pink-500 text-black font-semibold">
                            {offer.discountValue}{offer.discountType === "percentage" ? "%" : "$"} OFF
                          </Badge>
                          <OfferProductCard product={product} offer={offer} />
                        </div>
                      ))}
                    </div>
                    
                    {offerProducts.length > 6 && (
                      <div className="text-center mt-8">
                        <Link href="/shop">
                          <Button variant="outline" className="border-wine text-wine hover:bg-wine hover:text-white">
                            View All {offerProducts.length} Products in This Offer
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </section>
      )}

      {/* Featured Sale Products */}
      <section className="py-16 bg-gradient-to-b from-white to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl font-bold wine mb-4">
              Featured Sale Items
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Handpicked items perfect for gifting or treating yourself
            </p>
          </div>
          
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <div key={product.id} className="relative">
                  <Badge className="absolute top-4 left-4 z-10 bg-red-500 text-white">
                    Sale
                  </Badge>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
                <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  Sale Items Coming Soon
                </h3>
                <p className="text-gray-500 mb-4">
                  We're preparing amazing deals on our beautiful crochet flowers.
                </p>
                <Link href="/shop">
                  <Button className="wine-gradient text-white">
                    Browse Full Collection
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Signup for Deals */}
      <section className="py-16 bg-wine text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Star className="w-12 h-12 mx-auto mb-6 text-pink-200" />
          <h2 className="font-playfair text-3xl font-bold mb-4">
            Never Miss a Deal
          </h2>
          <p className="text-xl text-pink-100 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about exclusive offers, 
            flash sales, and new product launches.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 border-0 focus:ring-2 focus:ring-pink-300"
            />
            <Button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3">
              Subscribe
            </Button>
          </div>
          <p className="text-sm text-pink-200 mt-4">
            Unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </section>
    </div>
  );
}