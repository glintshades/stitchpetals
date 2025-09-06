import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, X, ArrowRight, Tag } from "lucide-react";
import { Link } from "wouter";
import { type Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const { data: allProducts = [] } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Enhanced search algorithm with ranking
  const filteredProducts = allProducts
    .map((product: Product) => {
      if (!searchTerm) return null;
      const searchLower = searchTerm.toLowerCase();
      let score = 0;
      let matches: string[] = [];
      
      // Exact name match gets highest score
      if (product.name.toLowerCase() === searchLower) {
        score += 100;
        matches.push('exact name match');
      }
      // Name starts with search term
      else if (product.name.toLowerCase().startsWith(searchLower)) {
        score += 80;
        matches.push('name starts with');
      }
      // Name contains search term
      else if (product.name.toLowerCase().includes(searchLower)) {
        score += 60;
        matches.push('name contains');
      }
      
      // Description contains search term
      if (product.description.toLowerCase().includes(searchLower)) {
        score += 30;
        matches.push('description');
      }
      
      // Colors match
      const colors = Array.isArray(product.colors) ? product.colors : 
        product.colors ? [String(product.colors)] : [];
      colors.forEach(color => {
        if (color.toLowerCase().includes(searchLower)) {
          score += 20;
          matches.push('color');
        }
      });
      
      // Category match
      if (product.category && product.category.toLowerCase().includes(searchLower)) {
        score += 40;
        matches.push('category');
      }
      
      return score > 0 ? { ...product, searchScore: score, searchMatches: matches } : null;
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.searchScore - a.searchScore)
    .slice(0, 8); // Limit to 8 results for better UX

  // Clear search when modal opens and focus input
  useEffect(() => {
    if (open) {
      setSearchTerm("");
      setSelectedIndex(-1);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);
  
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredProducts.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > -1 ? prev - 1 : -1);
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        const product = filteredProducts[selectedIndex];
        if (product) {
          window.location.href = `/product/${product.id}`;
          handleProductClick();
        }
      } else if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, selectedIndex, filteredProducts, onOpenChange]);

  const handleProductClick = () => {
    onOpenChange(false);
    setSearchTerm("");
    setSelectedIndex(-1);
  };
  
  // Highlight matching text
  const highlightText = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text;
    const regex = new RegExp(`(${searchTerm.trim()})`, 'gi');
    const parts = text.split(regex);
    return (
      <span>
        {parts.map((part, index) => 
          regex.test(part) ? (
            <mark key={index} className="bg-yellow-200 text-gray-900 rounded px-1">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] p-0 gap-0">
        <VisuallyHidden>
          <DialogTitle>Search Products</DialogTitle>
          <DialogDescription>
            Search through our collection of crochet flowers and arrangements
          </DialogDescription>
        </VisuallyHidden>
        
        <DialogHeader className="p-6 pb-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-wine/10 rounded-lg">
              <Search className="h-5 w-5 text-wine" />
            </div>
            <Input
              ref={inputRef}
              placeholder="Search products, colors, or categories..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedIndex(-1);
              }}
              className="border-0 text-lg focus-visible:ring-0 px-0 h-12 placeholder:text-gray-400"
              data-testid="input-search"
            />
          </div>
          
          {searchTerm && (
            <div className="flex items-center justify-between text-sm text-gray-500 mt-2">
              <span>{filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''} found</span>
              <span className="text-xs">Use ↑↓ to navigate, Enter to select, Esc to close</span>
            </div>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {searchTerm ? (
            <div className="h-full">
              {filteredProducts.length > 0 ? (
                <div 
                  ref={resultsRef}
                  className="max-h-[60vh] overflow-y-auto"
                >
                  {filteredProducts.map((product: any, index) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      onClick={handleProductClick}
                    >
                      <div 
                        className={`flex items-center space-x-4 p-4 cursor-pointer transition-all duration-200 border-l-4 ${
                          selectedIndex === index 
                            ? 'bg-wine/5 border-wine shadow-sm' 
                            : 'hover:bg-gray-50 border-transparent'
                        }`}
                        data-testid={`search-result-${product.id}`}
                      >
                        <div className="w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                              {highlightText(product.name, searchTerm)}
                            </h3>
                            <ArrowRight className={`h-4 w-4 text-gray-400 ml-2 transition-transform ${
                              selectedIndex === index ? 'translate-x-1' : ''
                            }`} />
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {highlightText(product.description.substring(0, 100) + (product.description.length > 100 ? '...' : ''), searchTerm)}
                          </p>
                          <div className="flex items-center justify-between mt-3">
                            <span className="font-bold text-xl text-wine">
                              ${product.price}
                            </span>
                            <div className="flex items-center space-x-2">
                              {product.category && (
                                <Badge variant="secondary" className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {product.category}
                                </Badge>
                              )}
                              {product.searchMatches && product.searchMatches.length > 0 && (
                                <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                                  {product.searchMatches[0]}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
                  <p className="text-gray-500 mb-1">No results for "{searchTerm}"</p>
                  <p className="text-sm text-gray-400">Try adjusting your search terms or browse our categories</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="w-24 h-24 bg-wine/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-10 w-10 text-wine" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Search our collection</h3>
              <p className="text-gray-500 mb-1">Find the perfect crochet flowers for any occasion</p>
              <p className="text-sm text-gray-400">Search by name, description, color, or category</p>
              
              <div className="flex flex-wrap justify-center gap-2 mt-6">
                {['sunflower', 'rose', 'bouquet', 'pink', 'white', 'potted'].map((term) => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm(term)}
                    className="text-xs hover:bg-wine hover:text-white border-wine/20"
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}