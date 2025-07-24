import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Product } from "@shared/schema";
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
  className?: string;
}

export default function ProductCard({ product, className = "" }: ProductCardProps) {
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

  return (
    <div className="p-2.5"> {/* 10px padding around each card */}
      <Link href={`/product/${product.id}`}>
        <Card className={`bg-white rounded-xl shadow-lg overflow-hidden product-hover cursor-pointer transition-transform hover:scale-105 h-full flex flex-col ${className}`}>
          <div className="relative">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-48 sm:h-52 md:h-56 object-cover"
            />
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
              
              {product.stemCount && (
                <Badge variant="secondary" className="mb-3">
                  {product.stemCount} {product.stemCount === 1 ? "Stem" : "Stems"}
                </Badge>
              )}
              
              {colors.length > 1 && (
                <div className="mb-4" onClick={(e) => e.stopPropagation()}>
                  <label className="text-sm font-medium wine mb-2 block">Color:</label>
                  <Select value={selectedColor} onValueChange={handleSelectChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-auto">
              <span className="text-xl sm:text-2xl font-bold dark-pink">${product.price}</span>
              <Button 
                onClick={handleAddToCart}
                className="bg-wine text-white hover:bg-dark-pink transition-colors w-full sm:w-auto text-sm px-4 py-2"
                disabled={!product.inStock}
              >
                {product.inStock ? "Add to Cart" : "Out of Stock"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
