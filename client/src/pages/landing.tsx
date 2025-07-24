import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Heart, Flower, Gift, Star, LogIn, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

const backgroundSlides = [
  {
    id: 1,
    gradient: "bg-gradient-to-br from-wine/10 via-ivory to-blush/15",
    overlay: "bg-gradient-to-t from-wine/20 via-transparent to-blush/10"
  },
  {
    id: 2,
    gradient: "bg-gradient-to-bl from-blush/15 via-ivory to-wine/10",
    overlay: "bg-gradient-to-b from-blush/20 via-transparent to-wine/10"
  },
  {
    id: 3,
    gradient: "bg-gradient-to-tr from-wine/8 via-blush/12 to-ivory",
    overlay: "bg-gradient-to-br from-wine/15 via-transparent to-blush/20"
  },
  {
    id: 4,
    gradient: "bg-gradient-to-tl from-ivory via-wine/12 to-blush/10",
    overlay: "bg-gradient-to-t from-ivory/30 via-transparent to-wine/15"
  }
];

export default function Landing() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  // Auto-advance slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % backgroundSlides.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % backgroundSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + backgroundSlides.length) % backgroundSlides.length);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Slider */}
      <div className="absolute inset-0">
        {backgroundSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
          >
            <div className={`absolute inset-0 ${slide.gradient}`} />
            <div className={`absolute inset-0 ${slide.overlay}`} />
            
            {/* Floating decorative elements */}
            <div className={`absolute top-20 left-16 opacity-30 transition-all duration-1000 ${
              index === currentSlide ? 'animate-float' : 'translate-y-10 opacity-0'
            }`}>
              <Flower className="w-16 h-16 text-wine" />
            </div>
            <div className={`absolute top-40 right-20 opacity-25 transition-all duration-1000 delay-300 ${
              index === currentSlide ? 'animate-float-delay' : 'translate-y-10 opacity-0'
            }`}>
              <Heart className="w-12 h-12 text-blush" />
            </div>
            <div className={`absolute bottom-32 left-24 opacity-20 transition-all duration-1000 delay-500 ${
              index === currentSlide ? 'animate-float' : 'translate-y-10 opacity-0'
            }`}>
              <Gift className="w-14 h-14 text-wine" />
            </div>
            <div className={`absolute top-60 right-32 opacity-15 transition-all duration-1000 delay-700 ${
              index === currentSlide ? 'animate-float-delay' : 'translate-y-10 opacity-0'
            }`}>
              <Star className="w-10 h-10 text-charcoal" />
            </div>
          </div>
        ))}
      </div>

      {/* Slider Controls */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
        <div className="flex space-x-2">
          {backgroundSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-wine scale-125' 
                  : 'bg-wine/30 hover:bg-wine/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-3 transition-all duration-300 group"
      >
        <ChevronLeft className="w-6 h-6 text-wine group-hover:scale-110 transition-transform" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-full p-3 transition-all duration-300 group"
      >
        <ChevronRight className="w-6 h-6 text-wine group-hover:scale-110 transition-transform" />
      </button>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Flower className="w-20 h-20 text-wine animate-pulse drop-shadow-lg" />
              <Heart className="w-8 h-8 text-blush absolute -top-2 -right-2 animate-bounce drop-shadow-md" />
            </div>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-playfair text-wine mb-8 leading-tight drop-shadow-sm bg-white/10 backdrop-blur-sm rounded-2xl py-4 px-8 inline-block">
            Stitched Petals
          </h1>
          
          <p className="text-xl md:text-2xl text-charcoal/90 mb-8 max-w-3xl mx-auto leading-relaxed bg-white/20 backdrop-blur-sm rounded-xl py-4 px-6">
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
        <section className="py-20 px-4 bg-white/20 backdrop-blur-sm">
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
    </div>
  );
}