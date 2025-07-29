import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SlideContent {
  id: number;
  title: string;
  subtitle?: string;
  description: string;
  backgroundImage: string;
  ctaText?: string;
  ctaLink?: string;
  ctaSecondaryText?: string;
  ctaSecondaryLink?: string;
}

interface HeroSliderProps {
  slides: SlideContent[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export default function HeroSlider({ 
  slides, 
  autoPlay = true, 
  autoPlayInterval = 6000,
  className = ""
}: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (slides.length === 0) return null;

  return (
    <div className={`relative overflow-hidden min-h-[600px] md:min-h-[700px] ${className}`}>
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
            index === currentSlide ? 'translate-x-0' : 
            index < currentSlide ? '-translate-x-full' : 'translate-x-full'
          }`}
          style={{
            backgroundImage: `url(${slide.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Deep purple overlay */}
          <div className="absolute inset-0 bg-[#3e0d57]/60"></div>
          
          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="text-white max-w-3xl">
              {slide.subtitle && (
                <p className="text-lg md:text-xl mb-4 text-white/90 font-medium">
                  {slide.subtitle}
                </p>
              )}
              <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                {slide.title}
              </h1>
              <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed max-w-2xl">
                {slide.description}
              </p>
              {(slide.ctaText || slide.ctaSecondaryText) && (
                <div className="flex flex-col sm:flex-row gap-4">
                  {slide.ctaText && slide.ctaLink && (
                    <a href={slide.ctaLink}>
                      <Button 
                        size="lg" 
                        className="bg-white text-wine hover:bg-white/90 px-8 py-4 text-lg font-semibold shadow-lg transition-all"
                      >
                        {slide.ctaText}
                      </Button>
                    </a>
                  )}
                  {slide.ctaSecondaryText && slide.ctaSecondaryLink && (
                    <a href={slide.ctaSecondaryLink}>
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="border-2 border-white text-white px-8 py-4 text-lg font-semibold hover:bg-white hover:text-wine transition-all"
                      >
                        {slide.ctaSecondaryText}
                      </Button>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all backdrop-blur-sm"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-all backdrop-blur-sm"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {slides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide 
                  ? 'bg-white' 
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}