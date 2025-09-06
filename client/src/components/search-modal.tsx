import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { Link } from "wouter";
import { type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Filter products based on search term
  const filteredProducts = allProducts.filter((product: Product) => {
    if (!searchTerm) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      product.name.toLowerCase().includes(searchLower) ||
      product.description.toLowerCase().includes(searchLower) ||
      (Array.isArray(product.colors) ? 
        product.colors.some(color => color.toLowerCase().includes(searchLower)) :
        String(product.colors || "").toLowerCase().includes(searchLower)
      )
    );
  });

  // Clear search when modal opens
  useEffect(() => {
    if (open) {
      setSearchTerm("");
    }
  }, [open]);

  const handleProductClick = () => {
    onOpenChange(false);
    setSearchTerm("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center space-x-2">
            <Search className="h-5 w-5 text-gray-500" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-0 text-lg focus-visible:ring-0 px-0 h-12"
              autoFocus
              data-testid="input-search"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
              data-testid="button-close-search"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6 pb-6">
          {searchTerm && (
            <div className="border-t pt-4">
              {filteredProducts.length > 0 ? (
                <div className="space-y-1 max-h-96 overflow-y-auto">
                  <p className="text-sm text-gray-600 mb-3">
                    {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                  </p>
                  {filteredProducts.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      onClick={handleProductClick}
                    >
                      <div className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                           data-testid={`search-result-${product.id}`}>
                        <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">
                            {product.name}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-semibold text-wine">
                              ${product.price}
                            </span>
                            {product.category && (
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {product.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center">
                  <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No products found for "{searchTerm}"</p>
                  <p className="text-sm text-gray-400 mt-1">Try different keywords</p>
                </div>
              )}
            </div>
          )}

          {!searchTerm && (
            <div className="py-8 text-center border-t">
              <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Start typing to search products</p>
              <p className="text-sm text-gray-400 mt-1">Search by name, description, or color</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}