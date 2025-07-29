import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

interface CartSidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function CartSidebar({ open, onClose }: CartSidebarProps) {
  const { cartItems, updateQuantity, removeFromCart, totalPrice } = useCart();

  const handleQuantityChange = (id: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
    } else {
      updateQuantity({ id, quantity: newQuantity });
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="font-playfair wine">Shopping Cart</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">Your cart is empty</p>
                <Button onClick={onClose} className="bg-wine hover:bg-dark-wine">
                  Continue Shopping
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex space-x-4">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium wine text-sm">
                        {item.product.name}
                      </h4>
                      {item.selectedColor && (
                        <Badge variant="secondary" className="mt-1">
                          {item.selectedColor}
                        </Badge>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-700"
                          onClick={() => removeFromCart(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm font-medium wine mt-1">
                        ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {cartItems.length > 0 && (
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-4">
                <span className="font-semibold wine">Total:</span>
                <span className="font-bold text-xl dark-pink">${totalPrice.toFixed(2)}</span>
              </div>
              <Button className="w-full bg-wine hover:bg-dark-wine mb-3" onClick={() => window.location.href = '/checkout'}>
                Checkout
              </Button>
              <Button variant="outline" className="w-full" onClick={onClose}>
                Continue Shopping
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
