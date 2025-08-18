import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Product, type Offer } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useState } from "react";
import { Heart } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductCardProps {
  product: Product;
  offer?: Offer | null;
  className?: string;
}

export default function ProductCard({ product, offer, className = "" }: ProductCardProps) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist, isAddingToWishlist, isRemovingFromWishlist } = useWishlist();
  const [selectedColor, setSelectedColor] = useState<string>(
    Array.isArray(product.colors) && product.colors.length > 0 ? product.colors[0] : ""
  );

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      productId: product.id,
      quantity: 1,
      selectedColor: selectedColor || undefined,
    });
  };

  const handleSelectChange = (value: string, e?: Event) => {
    if (e) {
      e.stopPropagation();
    }
    setSelectedColor(value);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const colors = Array.isArray(product.colors) ? product.colors : [];

  // Calculate discounted price if offer exists
  const originalPrice = parseFloat(product.price.toString());
  let discountedPrice = originalPrice;
  let hasDiscount = false;

  if (offer) {
    const discountValue = parseFloat(offer.discountValue.toString());
    const discountAmount = offer.discountType === "percentage" 
      ? (originalPrice * discountValue) / 100
      : discountValue;
    discountedPrice = Math.max(0, originalPrice - discountAmount);
    hasDiscount = discountedPrice < originalPrice;
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="button"]') || target.closest('.interactive-element')) {
      return;
    }
    
    // Navigate to product page
    window.location.href = `/product/${product.id}`;
  };

  return (
    <div className="p-2.5"> {/* 10px padding around each card */}
      <Card 
        className={`bg-white rounded-xl shadow-lg overflow-hidden product-hover cursor-pointer transition-transform hover:scale-105 h-full flex flex-col ${className}`}
        onClick={handleCardClick}
        data-testid={`product-card-${product.id}`}
      >
        <div className="relative">
          {hasDiscount && (
            <Badge className="absolute top-3 left-3 z-10 bg-gradient-to-r from-wine to-blush text-white font-semibold">
              {offer?.discountValue}{offer?.discountType === "percentage" ? "%" : "$"} OFF
            </Badge>
          )}
          <div className="w-full h-48 sm:h-52 md:h-56 bg-gray-100 flex items-center justify-center overflow-hidden">
            {product.imageUrl && product.imageUrl !== '/system/marker' ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onLoad={() => console.log(`Image loaded: ${product.imageUrl}`)}
                onError={(e) => {
                  console.error(`Image failed to load: ${product.imageUrl}`);
                  console.error('Error:', e);
                }}
              />
            ) : (
              <div className="text-gray-400 text-center p-4">
                <div className="text-sm">No image available</div>
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
            data-testid={`wishlist-button-${product.id}`}
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
                      className="border-wine text-wine hover:bg-wine hover:text-white transition-colors cursor-pointer text-xs interactive-element"
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
              {hasDiscount ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-bold dark-pink">${discountedPrice.toFixed(2)}</span>
                    <span className="text-sm text-gray-500 line-through">${originalPrice.toFixed(2)}</span>
                  </div>
                  <span className="text-xs text-green-600 font-semibold">
                    Save ${(originalPrice - discountedPrice).toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-xl sm:text-2xl font-bold dark-pink">${originalPrice.toFixed(2)}</span>
              )}
            </div>
            <Button 
              onClick={handleAddToCart}
              className="bg-wine text-white hover:bg-dark-wine transition-colors w-full sm:w-auto text-sm px-4 py-2"
              disabled={!product.inStock}
              data-testid={`add-to-cart-${product.id}`}
            >
              {product.inStock ? "Add to Cart" : "Out of Stock"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
