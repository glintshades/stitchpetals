import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { type WishlistItem, type Product } from "@shared/schema";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";
import { Heart, ShoppingCart, ArrowLeft } from "lucide-react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice, getCategoryDisplayName } from "@/lib/products";

type WishlistItemWithProduct = WishlistItem & { product: Product };

export default function WishlistPage() {
  const { data: wishlistItems = [], isLoading } = useQuery<WishlistItemWithProduct[]>({
    queryKey: ["/api/wishlist"],
  });

  const { removeFromWishlist, isRemovingFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [selectedColors, setSelectedColors] = useState<{ [key: number]: string }>({});

  const handleRemoveFromWishlist = (productId: number) => {
    removeFromWishlist(productId);
  };

  const handleAddToCart = (product: Product) => {
    const colors = Array.isArray(product.colors) ? product.colors : [];
    const selectedColor = selectedColors[product.id] || (colors.length > 0 ? colors[0] : "");
    
    addToCart({
      productId: product.id,
      quantity: 1,
      selectedColor: selectedColor || undefined,
    });
  };

  const handleColorChange = (productId: number, color: string) => {
    setSelectedColors(prev => ({
      ...prev,
      [productId]: color
    }));
  };

  if (isLoading) {
    return (
      <div className="bg-ivory min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4">
                  <div className="h-48 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ivory min-h-screen">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/shop">
                <Button variant="ghost" className="wine hover:bg-soft-pink mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Shop
                </Button>
              </Link>
              <h1 className="font-playfair text-3xl md:text-4xl font-bold wine">
                My Wishlist ❤️
              </h1>
              {wishlistItems.length > 0 && (
                <p className="text-gray-600 mt-2">
                  {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved for later
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {wishlistItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">💐</div>
            <h2 className="font-playfair text-2xl font-bold wine mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Save your favorite crochet flowers by clicking the heart icon on any product
            </p>
            <Link href="/shop">
              <Button className="bg-wine hover:bg-dark-pink text-white">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              const product = item.product;
              const colors = Array.isArray(product.colors) ? product.colors : [];
              const selectedColor = selectedColors[product.id] || (colors.length > 0 ? colors[0] : "");

              return (
                <Card key={item.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="relative">
                    <Link href={`/product/${product.id}`}>
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-48 object-cover cursor-pointer hover:scale-105 transition-transform"
                        loading="lazy"
                        decoding="async"
                      />
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-red-500 hover:text-red-600 transition-colors shadow-sm"
                      onClick={() => handleRemoveFromWishlist(product.id)}
                      disabled={isRemovingFromWishlist}
                    >
                      <Heart className="h-5 w-5 fill-current" />
                    </Button>
                  </div>

                  <CardContent className="p-4 flex flex-col flex-grow">
                    <div className="flex-grow">
                      <Link href={`/product/${product.id}`}>
                        <h3 className="font-semibold text-gray-900 mb-2 hover:wine cursor-pointer line-clamp-2">
                          {product.name}
                        </h3>
                      </Link>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold wine">
                          {formatPrice(product.price)}
                        </span>
                        <Badge 
                          variant={product.inStock ? "default" : "secondary"}
                          className={product.inStock ? "bg-green-100 text-green-800" : ""}
                        >
                          {product.inStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                        <span>{getCategoryDisplayName(product.category)}</span>
                        <span>{product.stemCount} {product.stemCount === 1 ? 'stem' : 'stems'}</span>
                      </div>

                      {colors.length > 0 && (
                        <div className="mb-4">
                          <Label className="text-sm font-medium text-gray-700 mb-2 block">
                            Color:
                          </Label>
                          <Select 
                            value={selectedColor} 
                            onValueChange={(value) => handleColorChange(product.id, value)}
                          >
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

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        disabled={!product.inStock}
                        className="flex-1 bg-wine hover:bg-dark-pink text-white disabled:bg-gray-300"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}