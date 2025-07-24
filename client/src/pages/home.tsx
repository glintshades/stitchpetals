import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/product-card";
import { type Product } from "@shared/schema";
import { Star, Heart, Clock, Award } from "lucide-react";
const bannerImage = "/images/il_1588xN.4851706578_21g4_1753286611661.webp";

export default function Home() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const featuredProducts = products.slice(0, 4);

  return (
    <div className="bg-ivory">
      {/* Hero Section */}
      <section className="gradient-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-playfair text-5xl md:text-6xl font-bold wine mb-6">
                Handcrafted Crochet Bouquets That Last Forever
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Discover our collection of meticulously handmade crochet flower bouquets. Each piece is crafted with love, 
                using premium soft cotton to create timeless floral arrangements that bring joy to any space.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/shop">
                  <Button className="wine-gradient text-white px-8 py-4 text-lg font-semibold hover:opacity-90 transition-opacity">
                    Shop Collection
                  </Button>
                </Link>
                <Link href="/about">
                  <Button variant="outline" className="border-2 border-wine text-wine px-8 py-4 text-lg font-semibold hover:bg-wine hover:text-white transition-colors">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={bannerImage} 
                  alt="Handmade crochet sunflower bouquet with daisies wrapped in cream paper" 
                  className="w-full h-auto object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-wine/20 to-transparent"></div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white p-4 rounded-xl shadow-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🌸</span>
                  <div>
                    <p className="font-semibold wine">Premium Quality</p>
                    <p className="text-sm text-gray-600">Soft Cotton Materials</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="font-playfair text-4xl font-bold wine mb-4">Explore Our Collections</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From elegant bouquets to charming potted arrangements, discover the perfect crochet flowers for every occasion
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Bouquets",
                description: "Mixed flower arrangements",
                image: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
                href: "/bouquets"
              },
              {
                title: "Potted Flowers",
                description: "Decorative arrangements",
                image: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
                href: "/shop?category=potted"
              },
              {
                title: "Single Stems",
                description: "Individual flowers",
                image: "https://pixabay.com/get/gf903151dd1f2de135ef6b603105babc6b62b3a44144950fbf04210ddda4dc94aabbdc7fd73e42bce1dee555fcecfaf4dcdd76dc7f685bdb5bb60fcecc52ff94f_1280.jpg",
                href: "/shop?category=stems"
              }
            ].map((category, index) => (
              <Link key={index} href={category.href}>
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden rounded-xl">
                    <img 
                      src={category.image} 
                      alt={category.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <h4 className="font-playfair text-2xl font-bold text-white mb-2">{category.title}</h4>
                      <p className="text-white/90">{category.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-warm-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="font-playfair text-4xl font-bold wine mb-4">Featured Products</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Handpicked favorites from our artisan collection
            </p>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 -m-2.5">
              {[...Array(4)].map((_, i) => (
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
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 -m-2.5">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/shop">
              <Button className="wine-gradient text-white px-8 py-3 font-semibold hover:opacity-90 transition-opacity">
                View All Products
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="font-playfair text-4xl font-bold wine mb-4">Why Choose Stitched Petals?</h3>
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: <Heart className="h-8 w-8" />,
                title: "Handcrafted with Love",
                description: "Each piece is carefully made by skilled artisans who pour their heart into every stitch."
              },
              {
                icon: <Clock className="h-8 w-8" />,
                title: "Lasting Beauty",
                description: "Unlike fresh flowers, our crochet creations will beautify your space for years to come."
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: "Premium Materials",
                description: "We use only the finest soft cotton yarns to ensure durability and beauty."
              },
              {
                icon: <Star className="h-8 w-8" />,
                title: "Unique Designs",
                description: "Our exclusive patterns create one-of-a-kind pieces you won't find anywhere else."
              }
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="wine mb-4 flex justify-center">{feature.icon}</div>
                <h4 className="font-playfair text-xl font-semibold wine mb-2">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-blush">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="font-playfair text-4xl font-bold wine mb-4">What Our Customers Say</h3>
            <p className="text-lg text-gray-600">Hear from those who've experienced our handcrafted beauty</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                rating: 5,
                text: "The sunflower bouquet exceeded my expectations! The attention to detail is incredible, and it looks beautiful in my living room.",
                author: "Sarah Johnson",
                verified: true
              },
              {
                rating: 5,
                text: "Perfect gift for my mom's birthday! The purple rose arrangement is stunning and the quality is outstanding.",
                author: "Michael Chen",
                verified: true
              },
              {
                rating: 5,
                text: "I love that these flowers never wilt! The craftsmanship is amazing and they add such warmth to my home.",
                author: "Emma Williams",
                verified: true
              }
            ].map((testimonial, index) => (
              <Card key={index} className="bg-white p-6">
                <CardContent className="p-0">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-gold fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 mb-4">{testimonial.text}</p>
                  <div>
                    <p className="font-semibold wine">{testimonial.author}</p>
                    {testimonial.verified && (
                      <Badge variant="secondary" className="mt-1">Verified Customer</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
