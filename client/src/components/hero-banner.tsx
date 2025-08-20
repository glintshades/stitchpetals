import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface HeroBannerProps {
  title: string;
  subtitle?: string;
  description: string;
  backgroundImage: string;
  ctaText?: string;
  ctaLink?: string;
  ctaSecondaryText?: string;
  ctaSecondaryLink?: string;
  height?: string;
}

export function HeroBanner({
  title,
  subtitle,
  description,
  backgroundImage,
  ctaText,
  ctaLink,
  ctaSecondaryText,
  ctaSecondaryLink,
  height = "h-[60vh]"
}: HeroBannerProps) {
  return (
    <div className={`relative ${height} overflow-hidden`}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        {/* Deep purple overlay */}
        <div className="absolute inset-0 bg-[#3e0d57]/60"></div>
        
        {/* Content */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="text-white max-w-3xl">
            {subtitle && (
              <p className="text-lg md:text-xl mb-4 text-white/90 font-medium">
                {subtitle}
              </p>
            )}
            <h1 className="font-playfair text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              {title}
            </h1>
            <p className="text-lg md:text-xl mb-8 text-white/90 leading-relaxed max-w-2xl">
              {description}
            </p>
            {(ctaText || ctaSecondaryText) && (
              <div className="flex flex-col sm:flex-row gap-4">
                {ctaText && ctaLink && (
                  <Link href={ctaLink}>
                    <Button 
                      size="lg" 
                      className="bg-white text-wine hover:bg-white/90 px-8 py-4 text-lg font-semibold shadow-lg transition-all"
                      data-testid="hero-cta-button"
                    >
                      {ctaText}
                    </Button>
                  </Link>
                )}
                {ctaSecondaryText && ctaSecondaryLink && (
                  <Link href={ctaSecondaryLink}>
                    <Button 
                      variant="outline" 
                      size="lg"
                      className="border-2 border-white text-white px-8 py-4 text-lg font-semibold hover:bg-white hover:text-[#3e0d57] transition-all shadow-lg backdrop-blur-sm bg-white/10"
                      data-testid="hero-secondary-cta-button"
                    >
                      {ctaSecondaryText}
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}