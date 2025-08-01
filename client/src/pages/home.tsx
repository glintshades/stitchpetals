import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ProductCard from "@/components/product-card";
import HeroSlider from "@/components/hero-slider";
import { type Product, type Offer } from "@shared/schema";
import { Star, Heart, Clock, Award, Package } from "lucide-react";
const bannerImage = "/images/il_1588xN.4851706578_21g4_1753286611661.webp";

type ProductCategory = {
  id: number;
  name: string;
  description?: string;
  slug: string;
  imageUrl?: string;
  isActive: boolean;
};

function CategoriesSection() {
  const { data: categories = [], isLoading } = useQuery<ProductCategory[]>({
    queryKey: ["/api/categories"],
  });

  const activeCategories = categories.filter(cat => cat.isActive);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
            <div className="h-72 bg-gray-200"></div>
            <div className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activeCategories.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Link href="/shop?category=bouquets" className="group">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl h-[480px] flex flex-col">
            <div className="h-72 bg-gradient-to-br from-soft-pink to-blush flex items-center justify-center flex-shrink-0">
              <span className="text-7xl">💐</span>
            </div>
            <div className="p-8 pb-12 flex-1 flex flex-col justify-center bg-gradient-to-b from-white to-gray-50">
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Bouquets</h3>
              <p className="text-gray-600">Beautiful arrangements for any occasion</p>
            </div>
          </div>
        </Link>
        
        <Link href="/shop?category=potted" className="group">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl h-[480px] flex flex-col">
            <div className="h-72 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center flex-shrink-0">
              <span className="text-7xl">🪴</span>
            </div>
            <div className="p-8 pb-12 flex-1 flex flex-col justify-center bg-gradient-to-b from-white to-gray-50">
              <h3 className="text-2xl font-semibold text-gray-800 mb-3">Potted Plants</h3>
              <p className="text-gray-600">Charming potted crochet flowers</p>
            </div>
          </div>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto pb-5">
      {activeCategories.map((category) => (
        <Link key={category.id} href={`/shop?category=${category.slug}`} className="group">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl h-[480px] flex flex-col">
            <div className="h-72 relative overflow-hidden flex-shrink-0">
              {category.imageUrl ? (
                <img 
                  src={category.imageUrl} 
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              ) : (
                <div className="h-full bg-gradient-to-br from-soft-pink to-blush flex items-center justify-center">
                  <Package className="w-20 h-20 text-wine" />
                </div>
              )}
            </div>
            <div className="p-8 pb-12 flex-1 flex flex-col justify-center bg-gradient-to-b from-white to-gray-50">
              <h3 className="text-2xl font-semibold text-gray-800 mb-3 text-center">{category.name}</h3>
              <p className="text-gray-600 text-lg mt-[0px] mb-[0px] text-center">{category.description || "Explore our collection"}</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default function Home() {
  const { data: products = [], isLoading } = useQuery<Product[]>({
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

  const featuredProducts = products.slice(0, 4);

  // Hero slider slides - Home page specific images (completely unique from other pages)
  const heroSlides = [
    {
      id: 1,
      title: "Handcrafted Crochet Bouquets That Last Forever",
      subtitle: "Welcome to GlintShades",
      description: "Discover our collection of meticulously handmade crochet flower bouquets. Each piece is crafted with love, using premium soft cotton to create timeless floral arrangements that bring joy to any space.",
      backgroundImage: bannerImage, // Main sunflower bouquet - unique to home
      ctaText: "Shop Collection",
      ctaLink: "/shop",
      ctaSecondaryText: "Learn More",
      ctaSecondaryLink: "/about"
    },
    {
      id: 2,
      title: "Premium Quality Materials",
      subtitle: "Crafted with Excellence",
      description: "Every bouquet is made with the finest soft cotton yarn, ensuring durability and beauty that will last for years. Our skilled artisans pour their passion into each stitch.",
      backgroundImage: "/images/il_1588xN.5094290650_h84a_1753800655973.webp", // Beautiful pink rose bouquet
      ctaText: "View Products",
      ctaLink: "/shop",
      ctaSecondaryText: "Our Story",
      ctaSecondaryLink: "/about"
    },
    {
      id: 3,
      title: "Perfect for Every Occasion",
      subtitle: "Timeless Beauty",
      description: "From weddings to home décor, our crochet flowers bring warmth and elegance to any setting. Create lasting memories with flowers that never fade.",
      backgroundImage: "/images/WechatIMG1746_1753288163170.webp", // Home page unique
      ctaText: "Browse Categories",
      ctaLink: "/shop",
      ctaSecondaryText: "Contact Us",
      ctaSecondaryLink: "/contact"
    }
  ];

  return (
    <div className="bg-ivory">
      {/* Hero Slider */}
      <HeroSlider slides={heroSlides} autoPlay={true} autoPlayInterval={8000} />

      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="font-playfair text-4xl font-bold wine mb-4">Explore Our Collections</h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From elegant bouquets to charming potted arrangements, discover the perfect crochet flowers for every occasion
            </p>
          </div>
          
          <CategoriesSection />
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
              {featuredProducts.map((product) => {
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
            <h3 className="font-playfair text-4xl font-bold wine mb-4">Why Choose GlintShades?</h3>
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

      {/* Newsletter Subscription */}
      <section 
        className="py-16 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(144, 12, 63, 0.85), rgba(219, 39, 119, 0.85)), url('/attached_assets/WechatIMG1746_1753288338342.webp')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="font-playfair text-4xl font-bold text-white mb-4">
            Stay in the Loop ♡
          </h2>
          <p className="text-pink-100 text-lg mb-8 max-w-2xl mx-auto">
            Be the first to know about new collections, special offers, and crochet care tips. 
            Join our community of flower lovers!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-wine focus:outline-none shadow-lg"
            />
            <Button className="bg-white text-wine hover:bg-soft-pink px-8 py-3 font-semibold shadow-lg">
              Subscribe
            </Button>
          </div>
          
          <p className="text-pink-200 text-sm mt-4">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </section>

      {/* Gift Guide */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl font-bold wine mb-4">Perfect for Every Occasion</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Find the ideal crochet flower arrangement for life's special moments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group cursor-pointer">
              <div className="w-24 h-24 bg-gradient-to-br from-soft-pink to-blush rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-4xl">💕</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Weddings</h3>
              <p className="text-gray-600">Elegant bouquets and centerpieces that last forever</p>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="w-24 h-24 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-4xl">🎂</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Birthdays</h3>
              <p className="text-gray-600">Cheerful arrangements to celebrate another year</p>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-4xl">❤️</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Anniversaries</h3>
              <p className="text-gray-600">Romantic gestures that never fade</p>
            </div>

            <div className="text-center group cursor-pointer">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <span className="text-4xl">🏡</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Home Decor</h3>
              <p className="text-gray-600">Beautiful accents to brighten any space</p>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-gradient-to-b from-pink-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl font-bold wine mb-4">From Heart to Home</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              See how we create your beautiful crochet flowers with love and care
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-wine rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">1</span>
                </div>
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-300"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Design</h3>
              <p className="text-gray-600">Each flower is carefully designed with attention to natural beauty and proportions</p>
            </div>

            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-wine rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">2</span>
                </div>
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-300"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Craft</h3>
              <p className="text-gray-600">Skilled artisans hand-crochet each petal using premium soft cotton materials</p>
            </div>

            <div className="text-center">
              <div className="relative">
                <div className="w-16 h-16 bg-wine rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white text-2xl font-bold">3</span>
                </div>
                <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-300"></div>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Arrange</h3>
              <p className="text-gray-600">Flowers are thoughtfully arranged and secured for lasting beauty</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-wine rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl font-bold">4</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Deliver</h3>
              <p className="text-gray-600">Carefully packaged and shipped to bring joy to your doorstep</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl font-bold wine mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Find answers to common questions about our handcrafted crochet flowers
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-pink-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">How long do crochet flowers last?</h3>
              <p className="text-gray-600">
                Our handcrafted crochet flowers are designed to last for years with proper care. Unlike fresh flowers, 
                they won't wilt or fade, making them perfect for permanent displays, weddings, and special occasions.
              </p>
            </div>

            <div className="bg-pink-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">What materials do you use?</h3>
              <p className="text-gray-600">
                We use premium soft cotton yarns in vibrant, fade-resistant colors. All stems are reinforced with 
                wire for easy positioning, and arrangements include decorative vases or pots as specified.
              </p>
            </div>

            <div className="bg-pink-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">How long does it take to make an order?</h3>
              <p className="text-gray-600">
                Each item is handcrafted to order, which typically takes 3-5 business days. This allows us to ensure 
                every flower meets our quality standards before shipping to you.
              </p>
            </div>

            <div className="bg-pink-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Can I customize colors or arrangements?</h3>
              <p className="text-gray-600">
                Yes! We offer custom color combinations and arrangement styles. Contact us with your specific requirements, 
                and we'll work with you to create the perfect piece for your needs.
              </p>
            </div>

            <div className="bg-pink-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">How do I care for my crochet flowers?</h3>
              <p className="text-gray-600">
                Care is simple! Dust gently with a soft brush or blow dryer on cool setting. Avoid direct sunlight 
                for extended periods to prevent fading. For deeper cleaning, spot clean with mild soap and water.
              </p>
            </div>

            <div className="bg-pink-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Do you offer bulk discounts for weddings?</h3>
              <p className="text-gray-600">
                Absolutely! We provide special pricing for wedding orders of 10 or more pieces. Contact us with your 
                wedding details, and we'll create a custom quote for your special day.
              </p>
            </div>

            <div className="bg-pink-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">What if I'm not satisfied with my order?</h3>
              <p className="text-gray-600">
                We stand behind our craftsmanship with a 30-day satisfaction guarantee. If you're not completely happy 
                with your purchase, contact us for a full refund or exchange.
              </p>
            </div>

            <div className="bg-pink-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Do you ship internationally?</h3>
              <p className="text-gray-600">
                Currently, we ship within the United States only. We're working on expanding our shipping options 
                to serve international customers. Please check back soon or contact us for updates.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              Didn't find what you were looking for?
            </p>
            <a 
              href="/contact" 
              className="inline-flex items-center px-6 py-3 bg-wine text-white rounded-lg hover:bg-dark-wine transition-colors"
            >
              Ask Us Anything
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl font-bold wine mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-lg">
              Everything you need to know about our crochet flowers
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-gradient-to-b from-white to-gray-50 rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How long do crochet flowers last?</h3>
              <p className="text-gray-600">With proper care, our crochet flowers will maintain their beauty for years. Unlike fresh flowers, they never wilt or fade when kept away from direct sunlight and moisture.</p>
            </div>

            <div className="bg-gradient-to-b from-white to-gray-50 rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Are your flowers safe for people with allergies?</h3>
              <p className="text-gray-600">Yes! Our crochet flowers are perfect for those with pollen allergies or sensitivities to fresh flowers. They provide all the beauty without any allergens.</p>
            </div>

            <div className="bg-gradient-to-b from-white to-gray-50 rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">How do I clean my crochet flowers?</h3>
              <p className="text-gray-600">Simply use a soft brush or compressed air to gently remove dust. For deeper cleaning, use a slightly damp cloth and allow to air dry completely.</p>
            </div>

            <div className="bg-gradient-to-b from-white to-gray-50 rounded-lg p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Do you offer custom arrangements?</h3>
              <p className="text-gray-600">We'd love to create something special for you! Contact us with your ideas, preferred colors, and occasion details for a personalized quote.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-wine/10 to-pink-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-playfair text-4xl font-bold wine mb-4">
            Ready to Brighten Your Space?
          </h2>
          <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
            Discover the perfect crochet flower arrangement for your home or as a thoughtful gift. 
            Each piece is lovingly handcrafted just for you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <Button className="wine-gradient text-white px-8 py-4 text-lg font-semibold hover:opacity-90 transition-opacity">
                Shop Collection
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" className="border-2 border-wine text-wine px-8 py-4 text-lg font-semibold hover:bg-wine hover:text-white transition-colors">
                Get Custom Quote
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
