import { Link } from "wouter";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import { type Product } from "@shared/schema";
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowLeft,
  Heart,
  CreditCard,
  MapPin,
  Gift,
  Package
} from "lucide-react";
import { formatPrice } from "@/lib/products";

export default function CartPage() {
  const { data: cartItems = [], isLoading } = useQuery<(any & { product: Product })[]>({
    queryKey: ["/api/cart"],
  });
  const { data: savedAddresses = [] } = useQuery<any[]>({
    queryKey: ["/api/addresses"],
    refetchOnWindowFocus: false,
  });
  const { updateQuantity: updateCartQuantity, removeFromCart } = useCart();
  const { toast } = useToast();
  const [itemAddresses, setItemAddresses] = useState<{[key: number]: string}>({});
  const [showMultiShipping, setShowMultiShipping] = useState(false);

  const handleUpdateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
    } else {
      updateCartQuantity({ id: itemId, quantity: newQuantity });
    }
  };

  const handleRemoveItem = (itemId: number) => {
    removeFromCart(itemId);
  };

  const subtotal = cartItems.reduce((sum, item) => {
    return sum + (parseFloat(item.product.price) * item.quantity);
  }, 0);

  // Group items by shipping address
  const groupedItems = cartItems.reduce((groups, item) => {
    const addressKey = itemAddresses[item.id] || 'default';
    if (!groups[addressKey]) {
      groups[addressKey] = [];
    }
    groups[addressKey].push(item);
    return groups;
  }, {} as {[key: string]: any[]});

  const numberOfShipments = Object.keys(groupedItems).length;
  const baseShipping = 9.99;
  const shipping = subtotal > 75 ? (numberOfShipments > 1 ? baseShipping * (numberOfShipments - 1) : 0) : baseShipping * numberOfShipments;
  const tax = subtotal * 0.0667; // 6.67% sales tax
  const total = subtotal + shipping + tax;

  if (isLoading) {
    return (
      <div className="bg-ivory min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white p-6 rounded-xl">
                  <div className="flex space-x-4">
                    <div className="w-24 h-24 bg-gray-200 rounded"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link href="/shop">
            <Button variant="ghost" className="wine hover:bg-soft-pink">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Continue Shopping
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-playfair text-3xl font-bold wine">Shopping Cart</h1>
            <p className="text-gray-600 mt-1">
              {cartItems.length === 0 
                ? "Your cart is empty" 
                : `${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'} in your cart`
              }
            </p>
          </div>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart */
          <div className="text-center py-16">
            <ShoppingCart className="h-24 w-24 text-gray-300 mx-auto mb-6" />
            <h2 className="font-playfair text-2xl font-bold wine mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Looks like you haven't added any beautiful crochet flowers to your cart yet. 
              Browse our collection and find the perfect handmade pieces for you.
            </p>
            <Link href="/shop">
              <Button className="bg-wine hover:bg-dark-pink text-white px-8 py-3">
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {/* Multi-Shipping Toggle */}
              <Card className="bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-wine" />
                      <div>
                        <h3 className="font-semibold wine">Multiple Shipping Addresses</h3>
                        <p className="text-sm text-gray-600">Send items to different addresses (gifts, etc.)</p>
                      </div>
                    </div>
                    <Button
                      variant={showMultiShipping ? "default" : "outline"}
                      onClick={() => setShowMultiShipping(!showMultiShipping)}
                      className={showMultiShipping ? "bg-wine hover:bg-dark-pink" : "border-wine text-wine hover:bg-wine hover:text-white"}
                    >
                      {showMultiShipping ? "Enabled" : "Enable"}
                    </Button>
                  </div>
                  {showMultiShipping && (
                    <div className="mt-3 p-3 bg-soft-pink rounded-lg">
                      <p className="text-sm text-wine">
                        💡 You can now assign different shipping addresses to each item. 
                        {savedAddresses.length === 0 && "Save addresses in checkout to use them here."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {cartItems.map((item) => (
                <Card key={item.id} className="bg-white">
                  <CardContent className="p-6">
                    <div className="flex space-x-4">
                      {/* Product Image */}
                      <Link href={`/product/${item.product.id}`}>
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <Link href={`/product/${item.product.id}`}>
                              <h3 className="font-playfair text-lg font-semibold wine hover:text-dark-pink cursor-pointer transition-colors">
                                {item.product.name}
                              </h3>
                            </Link>
                            <p className="text-gray-600 text-sm mt-1">{item.product.description}</p>
                            {item.selectedColor && (
                              <Badge variant="secondary" className="mt-2">
                                Color: {item.selectedColor}
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Shipping Address Selection */}
                        {showMultiShipping && (
                          <div className="mb-3">
                            <label className="text-sm font-medium mb-2 block flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Ship to:
                            </label>
                            <Select
                              value={itemAddresses[item.id] || 'default'}
                              onValueChange={(value) => {
                                setItemAddresses(prev => ({
                                  ...prev,
                                  [item.id]: value
                                }));
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select shipping address" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="default">
                                  <div className="flex items-center gap-2">
                                    <Package className="h-3 w-3" />
                                    <span>Main order address</span>
                                  </div>
                                </SelectItem>
                                {savedAddresses.map((address) => (
                                  <SelectItem key={address.id} value={address.id.toString()}>
                                    <div className="flex items-center gap-2">
                                      <Gift className="h-3 w-3" />
                                      <div className="text-left">
                                        <div className="font-medium">{address.recipientName}</div>
                                        <div className="text-xs text-gray-500">{address.city}, {address.state}</div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {/* Quantity and Price */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="h-8 w-8"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              className="h-8 w-8"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold dark-pink">
                              {formatPrice((parseFloat(item.product.price) * item.quantity).toString())}
                            </div>
                            {item.quantity > 1 && (
                              <div className="text-sm text-gray-500">
                                {formatPrice(item.product.price)} each
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-white sticky top-8">
                <CardContent className="p-6">
                  <h3 className="font-playfair text-xl font-semibold wine mb-4">Order Summary</h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">{formatPrice(subtotal.toString())}</span>
                    </div>
                    
                    {/* Shipping Details */}
                    {numberOfShipments > 1 ? (
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping ({numberOfShipments} shipments)</span>
                          <span className="font-semibold">{formatPrice(shipping.toString())}</span>
                        </div>
                        <div className="text-xs text-gray-500 pl-4">
                          {Object.entries(groupedItems).map(([addressKey, items], index) => {
                            const shipmentSubtotal = items.reduce((sum, item) => sum + (parseFloat(item.product.price) * item.quantity), 0);
                            const shipmentCost = shipmentSubtotal > 75 && index === 0 ? 0 : baseShipping;
                            const addressName = addressKey === 'default' ? 'Main address' : 
                              savedAddresses.find(addr => addr.id.toString() === addressKey)?.recipientName || `Address ${addressKey}`;
                            return (
                              <div key={addressKey} className="flex justify-between">
                                <span>• {addressName} ({items.length} items)</span>
                                <span>{shipmentCost === 0 ? 'FREE' : formatPrice(shipmentCost.toString())}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping</span>
                        <span className="font-semibold">
                          {shipping === 0 ? (
                            <span className="text-green-600">FREE</span>
                          ) : (
                            formatPrice(shipping.toString())
                          )}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-gray-600">Sales Tax (6.67%)</span>
                      <span className="font-semibold">{formatPrice(tax.toString())}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-lg font-bold">
                      <span className="wine">Total</span>
                      <span className="dark-pink">{formatPrice(total.toString())}</span>
                    </div>
                  </div>

                  {shipping > 0 && numberOfShipments === 1 && (
                    <div className="mt-4 p-3 bg-soft-pink rounded-lg">
                      <p className="text-sm text-wine">
                        Add {formatPrice((75 - subtotal).toString())} more for free shipping!
                      </p>
                    </div>
                  )}
                  
                  {numberOfShipments > 1 && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <Package className="h-3 w-3 inline mr-1" />
                        Multiple shipments: Items will be sent to {numberOfShipments} different addresses.
                        {shipping > baseShipping && " Additional shipping charges apply."}
                      </p>
                    </div>
                  )}

                  <div className="mt-6 space-y-3">
                    <Link href="/checkout">
                      <Button className="w-full bg-wine hover:bg-dark-pink text-white py-3">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Proceed to Checkout
                      </Button>
                    </Link>
                    <Button variant="outline" className="w-full border-wine text-wine hover:bg-wine hover:text-white">
                      <Heart className="h-4 w-4 mr-2" />
                      Save for Later
                    </Button>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 gap-2 text-xs text-gray-600">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Secure 256-bit SSL encryption</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>14-day return policy</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Handmade with love</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}