import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCart } from "@/hooks/use-cart";
import { useWishlist } from "@/hooks/use-wishlist";
import { useToast } from "@/hooks/use-toast";
import ProductCard from "@/components/product-card";
import { type Product } from "@shared/schema";
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Minus, 
  Plus, 
  Star,
  Truck,
  Shield,
  RotateCcw,
  Palette,
  ZoomIn,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { getCategoryDisplayName, formatPrice } from "@/lib/products";

export default function ProductPage() {
  const params = useParams();
  const productId = parseInt(params.id || "0");
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist, isAddingToWishlist, isRemovingFromWishlist } = useWishlist();
  const { toast } = useToast();
  
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const relatedProducts = allProducts
    .filter(p => p.id !== productId && p.category === product?.category)
    .slice(0, 4);

  const handleAddToCart = () => {
    if (!product) return;
    
    const colors = Array.isArray(product.colors) ? product.colors : [];
    if (colors.length > 1 && !selectedColor) {
      toast({
        title: "Please select a color",
        variant: "destructive",
      });
      return;
    }

    addToCart({
      productId: product.id,
      quantity,
      selectedColor: selectedColor || undefined,
    });
  };

  const handleBuyNow = () => {
    if (!product) return;
    
    const colors = Array.isArray(product.colors) ? product.colors : [];
    if (colors.length > 1 && !selectedColor) {
      toast({
        title: "Please select a color",
        variant: "destructive",
      });
      return;
    }

    // Add to cart first
    addToCart({
      productId: product.id,
      quantity,
      selectedColor: selectedColor || undefined,
    });

    // Show checkout message (since we don't have a full checkout system)
    toast({
      title: "Ready for Checkout!",
      description: "Item added to cart. Check your cart to proceed with purchase.",
      duration: 3000,
    });
  };

  if (isLoading) {
    return (
      <div className="bg-ivory min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-4">
                <div className="aspect-square bg-gray-200 rounded-xl"></div>
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
                  ))}
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="bg-ivory min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">🌸</div>
            <h1 className="font-playfair text-3xl font-bold wine mb-4">Product Not Found</h1>
            <p className="text-gray-600 mb-8">The product you're looking for doesn't exist or has been removed.</p>
            <Link href="/shop">
              <Button className="bg-wine hover:bg-dark-pink text-white">
                Return to Shop
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const colors = Array.isArray(product.colors) ? product.colors : [];
  const productImages = [product.imageUrl].filter(Boolean); // Only show actual product image

  // Set initial color if not set
  if (!selectedColor && colors.length > 0) {
    setSelectedColor(colors[0]);
  }

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isZoomOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          setIsZoomOpen(false);
          break;
        case 'ArrowLeft':
          if (productImages.length > 1) {
            setSelectedImageIndex(prev => 
              prev === 0 ? productImages.length - 1 : prev - 1
            );
          }
          break;
        case 'ArrowRight':
          if (productImages.length > 1) {
            setSelectedImageIndex(prev => 
              prev === productImages.length - 1 ? 0 : prev + 1
            );
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isZoomOpen, productImages.length]);

  return (
    <div className="bg-ivory">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-2 text-sm">
            <Link href="/">
              <span className="text-gray-500 hover:wine cursor-pointer">Home</span>
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/shop">
              <span className="text-gray-500 hover:wine cursor-pointer">Shop</span>
            </Link>
            <span className="text-gray-400">/</span>
            <Link href={`/shop?category=${product.category}`}>
              <span className="text-gray-500 hover:wine cursor-pointer">
                {getCategoryDisplayName(product.category)}
              </span>
            </Link>
            <span className="text-gray-400">/</span>
            <span className="wine font-medium">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link href="/shop">
          <Button variant="ghost" className="wine hover:bg-soft-pink">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Button>
        </Link>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <Dialog open={isZoomOpen} onOpenChange={setIsZoomOpen}>
              <DialogTrigger asChild>
                <div className="aspect-square overflow-hidden rounded-xl bg-white shadow-lg cursor-zoom-in hover:opacity-95 transition-opacity relative group">
                  <img
                    src={productImages[selectedImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-xl flex items-center justify-center">
                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-all duration-200" />
                  </div>
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-[95vw] w-full max-h-[95vh] p-0 bg-black/95 border-0 overflow-hidden">
                <div className="relative w-full h-[95vh] flex items-center justify-center">
                  {/* Close Button */}
                  <button
                    onClick={() => setIsZoomOpen(false)}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>

                  {/* Navigation Arrows - Only show if multiple images */}
                  {productImages.length > 1 && (
                    <>
                      <button
                        onClick={() => setSelectedImageIndex(prev => 
                          prev === 0 ? productImages.length - 1 : prev - 1
                        )}
                        className="absolute left-4 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronLeft className="h-6 w-6" />
                      </button>
                      <button
                        onClick={() => setSelectedImageIndex(prev => 
                          prev === productImages.length - 1 ? 0 : prev + 1
                        )}
                        className="absolute right-16 z-10 p-3 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                      >
                        <ChevronRight className="h-6 w-6" />
                      </button>
                    </>
                  )}

                  {/* Main Image */}
                  <img
                    src={productImages[selectedImageIndex]}
                    alt={product.name}
                    className="max-w-full max-h-full object-contain cursor-zoom-out"
                    onClick={() => setIsZoomOpen(false)}
                  />

                  {/* Image Counter - Only show if multiple images */}
                  {productImages.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-sm rounded-full">
                      {selectedImageIndex + 1} / {productImages.length}
                    </div>
                  )}

                  {/* Product Title */}
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="text-sm opacity-80">{product.name}</p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setIsZoomOpen(true);
                    }}
                    className={`aspect-square overflow-hidden rounded-lg border-2 transition-colors cursor-zoom-in hover:opacity-90 ${
                      selectedImageIndex === index ? "border-wine" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <Badge className="bg-wine text-white mb-2">
                    {getCategoryDisplayName(product.category)}
                  </Badge>
                  <h1 className="font-playfair text-3xl md:text-4xl font-bold wine">
                    {product.name}
                  </h1>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`${
                      isInWishlist(product.id) ? 'text-red-500' : 'wine'
                    } hover:bg-soft-pink`}
                    onClick={() => toggleWishlist(product.id)}
                    disabled={isAddingToWishlist || isRemovingFromWishlist}
                  >
                    <Heart className={`h-5 w-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </Button>
                  <Button variant="ghost" size="icon" className="wine hover:bg-soft-pink">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-gold fill-current" />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">(47 reviews)</span>
                </div>
                {product.stemCount && (
                  <Badge variant="secondary">
                    {product.stemCount} {product.stemCount === 1 ? "Stem" : "Stems"}
                  </Badge>
                )}
              </div>

              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                {product.description}
              </p>

              <div className="text-3xl font-bold dark-pink mb-8">
                {formatPrice(product.price)}
              </div>
            </div>

            {/* Color Selection */}
            {colors.length > 1 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Palette className="h-4 w-4 wine" />
                  <Label className="font-semibold wine">Color:</Label>
                  {selectedColor && (
                    <span className="text-gray-600">{selectedColor}</span>
                  )}
                </div>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="w-full focus:ring-wine focus:border-wine">
                    <SelectValue placeholder="Select a color" />
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

            {/* Quantity Selection */}
            <div className="space-y-3">
              <Label className="font-semibold wine">Quantity:</Label>
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Purchase Buttons */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  variant="outline"
                  className="w-full py-4 text-lg font-semibold border-wine text-wine hover:bg-wine hover:text-white transition-colors"
                >
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </Button>
                
                <Button
                  onClick={handleBuyNow}
                  disabled={!product.inStock}
                  className="w-full wine-gradient text-white py-4 text-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  {product.inStock ? "Buy Now" : "Out of Stock"}
                </Button>
              </div>
              
              {product.inStock && (
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Total: <span className="font-semibold dark-pink">
                      {formatPrice((parseFloat(product.price) * quantity).toString())}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Product Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: <Truck className="h-5 w-5" />,
                  title: "Free Shipping",
                  description: "On orders over $75"
                },
                {
                  icon: <Shield className="h-5 w-5" />,
                  title: "Quality Guarantee",
                  description: "Handcrafted excellence"
                },
                {
                  icon: <RotateCcw className="h-5 w-5" />,
                  title: "Easy Returns",
                  description: "14-day return policy"
                }
              ].map((feature, index) => (
                <Card key={index} className="border-soft-pink">
                  <CardContent className="p-4 text-center">
                    <div className="wine mb-2 flex justify-center">{feature.icon}</div>
                    <h4 className="font-semibold wine text-sm mb-1">{feature.title}</h4>
                    <p className="text-xs text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <Separator className="my-16" />

        {/* Product Details Tabs */}
        <div className="space-y-8">
          <h2 className="font-playfair text-3xl font-bold wine text-center">Product Details</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="font-playfair text-xl font-semibold wine mb-4">Specifications</h3>
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-600">Category:</dt>
                    <dd className="wine">{getCategoryDisplayName(product.category)}</dd>
                  </div>
                  {product.stemCount && (
                    <div className="flex justify-between">
                      <dt className="font-medium text-gray-600">Stem Count:</dt>
                      <dd className="wine">{product.stemCount}</dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-600">Material:</dt>
                    <dd className="wine">Premium Soft Cotton</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-600">Colors Available:</dt>
                    <dd className="wine">{colors.length > 0 ? colors.join(", ") : "Standard"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium text-gray-600">Handmade:</dt>
                    <dd className="wine">Yes</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-6">
                <h3 className="font-playfair text-xl font-semibold wine mb-4">Care Instructions</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start space-x-2">
                    <span className="wine">•</span>
                    <span>Dust regularly with a soft, dry brush</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="wine">•</span>
                    <span>Keep away from direct sunlight</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="wine">•</span>
                    <span>Hand wash gently if needed</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="wine">•</span>
                    <span>Lay flat to dry completely</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="wine">•</span>
                    <span>Store in a dry, cool place</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <>
            <Separator className="my-16" />
            <div className="space-y-8">
              <div className="text-center">
                <h2 className="font-playfair text-3xl font-bold wine mb-4">You Might Also Like</h2>
                <p className="text-gray-600">More beautiful crochet flowers from the same collection</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 -m-2.5">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
              
              <div className="text-center">
                <Link href={`/shop?category=${product.category}`}>
                  <Button variant="outline" className="border-wine text-wine hover:bg-wine hover:text-white">
                    View All {getCategoryDisplayName(product.category)}
                  </Button>
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
