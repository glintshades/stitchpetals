import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Product, type Offer } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/use-wishlist";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";

interface OfferProductCardProps {
  product: Product;
  offer: Offer;
  className?: string;
}

interface ProductVariation {
  id: number;
  productId: number;
  colorName: string;
  colorCode?: string;
  imageUrl: string;
  stockQuantity: number;
  isAvailable: boolean;
}

export default function OfferProductCard({ product, offer, className = "" }: OfferProductCardProps) {
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  const { toggleWishlist, isInWishlist, isAddingToWishlist, isRemovingFromWishlist } = useWishlist();
  const [selectedColor, setSelectedColor] = useState<string>(
    Array.isArray(product.colors) && product.colors.length > 0 ? product.colors[0] : ""
  );
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(product.imageUrl);
  const [hoveredColor, setHoveredColor] = useState<string>("");

  // Fetch product variations for color-specific images
  const { data: variations = [] } = useQuery<ProductVariation[]>({
    queryKey: [`/api/products/${product.id}/variations`],
    queryFn: async () => {
      const response = await fetch(`/api/products/${product.id}/variations`);
      if (!response.ok) return [];
      return response.json();
    },
  });

  // Update image source only when color is explicitly selected (not on hover)
  useEffect(() => {
    if (selectedColor && variations.length > 0) {
      const variation = variations.find(v => 
        v.colorName.toLowerCase() === selectedColor.toLowerCase()
      );
      if (variation && variation.imageUrl) {
        setImageSrc(variation.imageUrl);
        setImageError(false);
        return;
      }
    }
    // Fallback to default product image
    setImageSrc(product.imageUrl);
    setImageError(false);
  }, [selectedColor, variations, product.imageUrl]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      quantity: 1,
      selectedColor: selectedColor || undefined,
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const colors = Array.isArray(product.colors) ? product.colors : [];
  
  // Calculate discounted price
  const originalPrice = parseFloat(product.price.toString());
  const discountValue = parseFloat(offer.discountValue.toString());
  const discountAmount = offer.discountType === "percentage" 
    ? (originalPrice * discountValue) / 100
    : discountValue;
  const discountedPrice = Math.max(0, originalPrice - discountAmount);

  return (
    <div className="p-2.5">
      <Link href={`/product/${product.id}`}>
        <Card className={`bg-white rounded-xl shadow-lg overflow-hidden product-hover cursor-pointer transition-transform hover:scale-105 h-full flex flex-col ${className}`}>
          <div className="relative">
            <div className="w-full h-48 sm:h-52 md:h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
              {imageSrc && imageSrc !== '/system/marker' && !imageError ? (
                <img
                  src={imageSrc}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  crossOrigin="anonymous"
                  onError={(e) => {
                    console.error(`Image failed to load: ${imageSrc}`);
                    // Try fallback URL without cache busting if the error is not a 404
                    const img = e.target as HTMLImageElement;
                    if (img.src.includes('?')) {
                      img.src = img.src.split('?')[0];
                    } else {
                      setImageError(true);
                    }
                  }}
                  onLoad={() => {
                    // Reset error state on successful load
                    setImageError(false);
                  }}
                />
              ) : (
                <div className="text-gray-400 text-center p-4 bg-gradient-to-br from-soft-pink to-blush">
                  <div className="text-wine font-semibold text-lg">🌸</div>
                  <div className="text-sm text-wine mt-1">Crochet Flower</div>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`absolute top-3 right-3 w-10 h-10 rounded-full bg-white/80 hover:bg-white ${
                isInWishlist(product.id) ? 'text-red-500' : 'text-gray-400'
              } hover:text-red-500 transition-colors shadow-sm`}
              onClick={handleWishlistToggle}
              disabled={isAddingToWishlist || isRemovingFromWishlist}
            >
              <Heart 
                className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} 
              />
            </Button>
          </div>
          <CardContent className="p-4 sm:p-5 md:p-6 flex-1 flex flex-col">
            <div className="flex-1">
              <h4 className="font-playfair text-lg font-semibold wine mb-2 hover:text-dark-pink transition-colors line-clamp-2">
                {product.name}
              </h4>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {product.stemCount && (
                  <Badge variant="secondary">
                    {product.stemCount} {product.stemCount === 1 ? "Stem" : "Stems"}
                  </Badge>
                )}
                
                {colors.length > 0 && (
                  <>
                    {colors.map((color) => (
                      <Badge 
                        key={color} 
                        variant="outline" 
                        className={`border-wine text-wine hover:bg-wine hover:text-white transition-colors cursor-pointer text-xs interactive-element ${
                          selectedColor === color ? 'bg-wine text-white' : ''
                        }`}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedColor(color);
                        }}

                      >
                        {color}
                      </Badge>
                    ))}
                  </>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-auto">
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-bold text-green-600">${discountedPrice.toFixed(2)}</span>
                  <span className="text-sm text-gray-500 line-through">${originalPrice.toFixed(2)}</span>
                </div>
                <span className="text-xs text-green-600 font-medium">
                  Save ${discountAmount.toFixed(2)}
                </span>
              </div>
              <Button 
                onClick={handleAddToCart}
                className="bg-wine text-white hover:bg-dark-wine transition-colors w-full sm:w-auto text-sm px-4 py-2"
                disabled={!product.inStock}
              >
                {!product.inStock ? "Out of Stock" : !isAuthenticated ? "Sign In to Purchase" : "Add to Cart"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}