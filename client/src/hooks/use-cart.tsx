import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { type CartItem, type Product, type InsertCartItem } from "@shared/schema";

type CartItemWithProduct = CartItem & { product: Product };

export function useCart() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const { data: cartItems = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
  });

  const addToCartMutation = useMutation({
    mutationFn: async (item: Omit<InsertCartItem, "sessionId">) => {
      if (!isAuthenticated) {
        throw new Error("Please log in to add items to your cart");
      }
      const response = await apiRequest("POST", "/api/cart", item);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
    },
    onError: (error: Error) => {
      if (error.message.includes("log in")) {
        toast({
          title: "Authentication Required",
          description: "Please log in to add items to your cart.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to add item to cart.",
          variant: "destructive",
        });
      }
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: number; quantity: number }) => {
      if (!isAuthenticated) {
        throw new Error("Please log in to update your cart");
      }
      const response = await apiRequest("PATCH", `/api/cart/${id}`, { quantity });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error: Error) => {
      if (error.message.includes("log in")) {
        toast({
          title: "Authentication Required",
          description: "Please log in to update your cart.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update cart item.",
          variant: "destructive",
        });
      }
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (id: number) => {
      if (!isAuthenticated) {
        throw new Error("Please log in to modify your cart");
      }
      const response = await apiRequest("DELETE", `/api/cart/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      });
    },
    onError: (error: Error) => {
      if (error.message.includes("log in")) {
        toast({
          title: "Authentication Required",
          description: "Please log in to modify your cart.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to remove item from cart.",
          variant: "destructive",
        });
      }
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/cart");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to clear cart.",
        variant: "destructive",
      });
    },
  });

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0
  );

  return {
    cartItems,
    isLoading,
    totalPrice,
    addToCart: addToCartMutation.mutate,
    updateQuantity: updateQuantityMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    clearCart: clearCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
    isUpdating: updateQuantityMutation.isPending,
    isRemoving: removeFromCartMutation.isPending,
  };
}
