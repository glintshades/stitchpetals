import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Product } from "@shared/schema";
import { useCart } from "@/hooks/use-cart";
import { useState } from "react";
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
  const [selectedColor, setSelectedColor] = useState<string>(
    Array.isArray(product.colors) && product.colors.length > 0 ? product.colors[0] : ""
  );

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      quantity: 1,
      selectedColor: selectedColor || undefined,
    });
  };

  const colors = Array.isArray(product.colors) ? product.colors : [];

  return (
    <Card className={`bg-white rounded-xl shadow-lg overflow-hidden product-hover ${className}`}>
      <Link href={`/product/${product.id}`}>
        <div className="cursor-pointer">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-48 object-cover"
          />
        </div>
      </Link>
      <CardContent className="p-6">
        <Link href={`/product/${product.id}`}>
          <h4 className="font-playfair text-lg font-semibold wine mb-2 cursor-pointer hover:text-dark-pink transition-colors">
            {product.name}
          </h4>
        </Link>
        <p className="text-gray-600 text-sm mb-4">{product.description}</p>
        
        {product.stemCount && (
          <Badge variant="secondary" className="mb-3">
            {product.stemCount} {product.stemCount === 1 ? "Stem" : "Stems"}
          </Badge>
        )}
        
        {colors.length > 1 && (
          <div className="mb-4">
            <label className="text-sm font-medium wine mb-2 block">Color:</label>
            <Select value={selectedColor} onValueChange={setSelectedColor}>
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
        
        <div className="flex justify-between items-center">
          <span className="text-2xl font-bold dark-pink">${product.price}</span>
          <Button 
            onClick={handleAddToCart}
            className="bg-wine text-white hover:bg-dark-pink transition-colors"
            disabled={!product.inStock}
          >
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
