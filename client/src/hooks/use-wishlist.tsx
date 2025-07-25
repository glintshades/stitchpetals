import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { type Product } from "@shared/schema";

interface WishlistItemWithProduct {
  id: number;
  sessionId: string;
  productId: number;
  createdAt: string;
  product: Product;
}

export function useWishlist() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();

  // Get wishlist items
  const { data: wishlistItems = [], isLoading } = useQuery<WishlistItemWithProduct[]>({
    queryKey: ["/api/wishlist"],
    retry: false,
  });

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: number) => {
      if (!isAuthenticated) {
        throw new Error("Please log in to add items to your wishlist");
      }
      return await apiRequest("POST", "/api/wishlist", { productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Added to Wishlist",
        description: "Item has been added to your wishlist!",
      });
    },
    onError: (error: Error) => {
      if (error.message.includes("log in")) {
        toast({
          title: "Authentication Required",
          description: "Please log in to add items to your wishlist.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1500);
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to add item to wishlist",
          variant: "destructive",
        });
      }
    },
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: number) => {
      if (!isAuthenticated) {
        throw new Error("Please log in to modify your wishlist");
      }
      return await apiRequest("DELETE", `/api/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Removed from Wishlist",
        description: "Item has been removed from your wishlist",
      });
    },
    onError: (error: Error) => {
      if (error.message.includes("log in")) {
        toast({
          title: "Authentication Required",
          description: "Please log in to modify your wishlist.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1500);
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to remove item from wishlist",
          variant: "destructive",
        });
      }
    },
  });

  // Helper functions
  const addToWishlist = (productId: number) => {
    addToWishlistMutation.mutate(productId);
  };

  const removeFromWishlist = (productId: number) => {
    removeFromWishlistMutation.mutate(productId);
  };

  const isInWishlist = (productId: number) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  const toggleWishlist = (productId: number) => {
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  return {
    wishlistItems,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    isAddingToWishlist: addToWishlistMutation.isPending,
    isRemovingFromWishlist: removeFromWishlistMutation.isPending,
  };
}