import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Flower, Gift, Star, LogIn } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-wine/5 via-ivory to-blush/10">
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Flower className="w-16 h-16 text-wine animate-pulse" />
              <Heart className="w-6 h-6 text-blush absolute -top-1 -right-1 animate-bounce" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-playfair text-wine mb-6 leading-tight">
            Stitched Petals
          </h1>
          
          <p className="text-xl md:text-2xl text-charcoal/80 mb-8 max-w-3xl mx-auto leading-relaxed">
            Handcrafted crochet flowers that bloom forever. Each piece is lovingly made to bring timeless beauty to your space.
          </p>
          
          <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
            <Button 
              onClick={handleLogin}
              size="lg" 
              className="bg-wine hover:bg-wine/90 text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Sign In to Shop
            </Button>
            
            <Button 
              variant="outline" 
              size="lg"
              className="border-wine text-wine hover:bg-wine hover:text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 opacity-20 animate-float">
          <Flower className="w-12 h-12 text-blush" />
        </div>
        <div className="absolute top-40 right-16 opacity-20 animate-float-delay">
          <Gift className="w-10 h-10 text-wine" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-20 animate-float">
          <Star className="w-8 h-8 text-charcoal" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-playfair text-wine text-center mb-12">
            Why Choose Stitched Petals?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6 text-center bg-white/60 backdrop-blur-sm border-wine/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 mx-auto mb-4 bg-wine/10 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-wine" />
              </div>
              <h3 className="text-xl font-playfair text-wine mb-3">Handcrafted with Love</h3>
              <p className="text-charcoal/70 leading-relaxed">
                Each flower is carefully crocheted by skilled artisans using premium soft cotton yarn, ensuring every piece is unique and special.
              </p>
            </Card>

            <Card className="p-6 text-center bg-white/60 backdrop-blur-sm border-wine/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 mx-auto mb-4 bg-blush/20 rounded-full flex items-center justify-center">
                <Flower className="w-8 h-8 text-blush" />
              </div>
              <h3 className="text-xl font-playfair text-wine mb-3">Forever Blooming</h3>
              <p className="text-charcoal/70 leading-relaxed">
                Unlike fresh flowers, our crochet bouquets maintain their beauty forever without water or maintenance.
              </p>
            </Card>

            <Card className="p-6 text-center bg-white/60 backdrop-blur-sm border-wine/10 hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
              <div className="w-16 h-16 mx-auto mb-4 bg-wine/10 rounded-full flex items-center justify-center">
                <Gift className="w-8 h-8 text-wine" />
              </div>
              <h3 className="text-xl font-playfair text-wine mb-3">Perfect Gifts</h3>
              <p className="text-charcoal/70 leading-relaxed">
                Ideal for birthdays, anniversaries, home decor, or any special occasion that deserves a thoughtful, lasting gift.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Collection Preview */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-playfair text-wine mb-12">
            Our Collections
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="group cursor-pointer">
              <div className="aspect-square bg-gradient-to-br from-wine/20 to-blush/20 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Flower className="w-20 h-20 text-wine group-hover:animate-pulse" />
              </div>
              <h3 className="text-2xl font-playfair text-wine mb-2">Bouquets</h3>
              <p className="text-charcoal/70">Stunning arrangements for any occasion</p>
            </div>

            <div className="group cursor-pointer">
              <div className="aspect-square bg-gradient-to-br from-blush/20 to-wine/20 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <div className="relative">
                  <Flower className="w-20 h-20 text-blush group-hover:animate-pulse" />
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-4 bg-wine/30 rounded-full"></div>
                </div>
              </div>
              <h3 className="text-2xl font-playfair text-wine mb-2">Potted</h3>
              <p className="text-charcoal/70">Beautiful arrangements in decorative pots</p>
            </div>

            <div className="group cursor-pointer">
              <div className="aspect-square bg-gradient-to-br from-wine/20 to-charcoal/10 rounded-2xl mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Flower className="w-20 h-20 text-wine group-hover:animate-pulse transform rotate-12" />
              </div>
              <h3 className="text-2xl font-playfair text-wine mb-2">Individual Stems</h3>
              <p className="text-charcoal/70">Single flowers for minimalist elegance</p>
            </div>
          </div>

          <Button 
            onClick={handleLogin}
            size="lg" 
            className="bg-wine hover:bg-wine/90 text-white px-8 py-4 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Sign In to Explore Collection
          </Button>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 bg-gradient-to-r from-wine/10 to-blush/10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-playfair text-wine mb-6">
            Ready to Bring Beauty Home?
          </h2>
          <p className="text-xl text-charcoal/80 mb-8 leading-relaxed">
            Join thousands of customers who have discovered the joy of forever-blooming flowers. 
            Sign in to start shopping our exclusive collection.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg" 
            className="bg-wine hover:bg-wine/90 text-white px-12 py-4 text-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            <LogIn className="w-6 h-6 mr-2" />
            Get Started
          </Button>
        </div>
      </section>
    </div>
  );
}