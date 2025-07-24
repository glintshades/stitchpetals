import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/hooks/use-cart";
import { ArrowLeft, CreditCard, Package, Truck } from "lucide-react";
import { Link, useLocation } from "wouter";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerEmail: z.string().email("Please enter a valid email"),
  customerPhone: z.string().optional(),
  shippingAddress: z.string().min(10, "Please enter a complete shipping address"),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { cartItems, clearCart } = useCart();
  const queryClient = useQueryClient();

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      shippingAddress: "",
    },
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to create order");
      }
      return response.json();
    },
    onSuccess: async (order) => {
      toast({
        title: "Order Placed Successfully!",
        description: `Your order #${order.id} has been placed. We'll send you updates via email.`,
      });
      await clearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Order Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + (parseFloat(item.product.price) * item.quantity);
  }, 0);

  const onSubmit = (data: CheckoutForm) => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Please add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    const orderItems = cartItems.map(item => ({
      productId: item.productId,
      productName: item.product.name,
      quantity: item.quantity,
      selectedColor: item.selectedColor,
      price: item.product.price,
    }));

    const orderData = {
      ...data,
      totalAmount: totalAmount.toFixed(2),
      orderItems,
    };

    createOrderMutation.mutate(orderData);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-ivory py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-playfair wine mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Add some beautiful crochet flowers to get started!</p>
          <Link href="/shop">
            <Button className="bg-wine hover:bg-dark-pink">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link href="/cart">
            <Button variant="ghost" className="wine hover:text-dark-pink">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
          </Link>
          <h1 className="font-playfair text-4xl font-bold wine mt-4">Checkout</h1>
          <p className="text-gray-600">Complete your order for beautiful handcrafted flowers</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Shipping Information
              </CardTitle>
              <CardDescription>
                Please provide your shipping details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="customerName">Full Name</Label>
                  <Input
                    id="customerName"
                    {...form.register("customerName")}
                    placeholder="Enter your full name"
                  />
                  {form.formState.errors.customerName && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.customerName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customerEmail">Email Address</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    {...form.register("customerEmail")}
                    placeholder="your.email@example.com"
                  />
                  {form.formState.errors.customerEmail && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.customerEmail.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="customerPhone">Phone Number (Optional)</Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    {...form.register("customerPhone")}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div>
                  <Label htmlFor="shippingAddress">Shipping Address</Label>
                  <Input
                    id="shippingAddress"
                    {...form.register("shippingAddress")}
                    placeholder="123 Main St, City, State 12345"
                  />
                  {form.formState.errors.shippingAddress && (
                    <p className="text-sm text-red-600 mt-1">
                      {form.formState.errors.shippingAddress.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-wine hover:bg-dark-pink"
                  disabled={createOrderMutation.isPending}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  {createOrderMutation.isPending ? "Processing..." : `Place Order - $${totalAmount.toFixed(2)}`}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>
                Review your items before placing the order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start border-b border-gray-100 pb-4">
                  <div className="flex gap-3">
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-medium text-sm">{item.product.name}</h4>
                      <p className="text-sm text-gray-600">Color: {item.selectedColor}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${(parseFloat(item.product.price) * item.quantity).toFixed(2)}</p>
                  </div>
                </div>
              ))}
              
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center text-lg font-semibold wine">
                  <span>Total</span>
                  <span>${totalAmount.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  Free shipping on all orders. Handcrafted with love and delivered with care.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}