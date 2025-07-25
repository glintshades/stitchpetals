import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/product-card";
import OfferProductCard from "@/components/offer-product-card";
import { type Product, type Offer } from "@shared/schema";
import { Star, Clock, Percent, Gift, Package, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

// Offers Slider Component
function OffersSlider({ offers }: { offers: Offer[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % offers.length);
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + offers.length) % offers.length);
  };
  
  if (offers.length === 0) return null;
  
  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        >
          {offers.map((offer: Offer) => (
            <div key={offer.id} className="w-full flex-shrink-0">
              <div className="relative overflow-hidden bg-gradient-to-r from-wine to-pink-500 shadow-2xl">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative px-8 py-12 md:px-16 md:py-16">
                  <div className="grid md:grid-cols-2 gap-8 items-center">
                    <div className="text-white">
                      <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-6 py-3 mb-6">
                        <span className="text-3xl font-bold mr-2">
                          {offer.discountValue}{offer.discountType === "percentage" ? "%" : "$"}
                        </span>
                        <span className="text-xl font-semibold">OFF</span>
                      </div>
                      <h3 className="font-playfair text-4xl md:text-5xl font-bold mb-4">
                        {offer.title}
                      </h3>
                      <p className="text-xl md:text-2xl text-white/90 mb-6 leading-relaxed">
                        {offer.description}
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 items-start">
                        {offer.code && (
                          <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-4 border border-white/20">
                            <p className="text-sm text-white/80 mb-1">Use Code:</p>
                            <p className="font-bold text-2xl font-mono tracking-wider">
                              {offer.code}
                            </p>
                          </div>
                        )}
                        <div className="text-white/80 text-sm space-y-1">
                          <p className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            Valid until: {new Date(offer.validUntil).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-center md:text-right">
                      <Link href="/shop">
                        <Button className="bg-white text-wine hover:bg-gray-100 text-xl px-8 py-4 font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105">
                          Shop Now
                        </Button>
                      </Link>
                      <p className="text-white/70 text-sm mt-4">
                        *Discount applied automatically at checkout
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {offers.length > 1 && (
        <>
          <button 
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors z-10"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors z-10"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
          
          <div className="flex justify-center mt-6 space-x-2">
            {offers.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index === currentSlide ? 'bg-wine' : 'bg-gray-300'
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
      <section className="py-16 bg-gradient-to-b from-ivory to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Percent className="w-12 h-12 text-wine mr-3" />
              <h1 className="font-playfair text-5xl md:text-6xl font-bold wine">
                Special Offers
              </h1>
            </div>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed mb-8">
              Don't miss out on our amazing deals! Save big on handcrafted crochet flowers 
              with exclusive discounts and limited-time offers.
            </p>
            <div className="flex items-center justify-center gap-6">
              <div className="flex items-center text-wine">
                <Clock className="w-5 h-5 mr-2" />
                <span className="font-semibold">Limited Time Only</span>
              </div>
              <div className="flex items-center text-wine">
                <Gift className="w-5 h-5 mr-2" />
                <span className="font-semibold">Free Shipping on Orders $50+</span>
              </div>
            </div>
          </div>
          
          {offers.length > 0 ? (
            <OffersSlider offers={offers} />
          ) : (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg shadow-md p-8 max-w-md mx-auto">
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
        </div>
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