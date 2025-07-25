import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Trash2, Calendar, Percent, DollarSign, Package } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { type Offer, type InsertOffer, type Product } from "@shared/schema";

interface OfferFormData {
  title: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: string;
  code: string;
  minOrderValue: string;
  maxDiscount: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicableProducts: string[];
  imageUrl: string;
}

const initialFormData: OfferFormData = {
  title: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  code: "",
  minOrderValue: "",
  maxDiscount: "",
  validFrom: "",
  validUntil: "",
  isActive: true,
  applicableProducts: ["all"],
  imageUrl: "",
};

export default function AdminOffers() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  const [formData, setFormData] = useState<OfferFormData>(initialFormData);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: offers = [], isLoading } = useQuery({
    queryKey: ["/api/admin/offers"],
    queryFn: async () => {
      const response = await fetch("/api/admin/offers", {
        headers: { Authorization: "Bearer admin-token" }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch offers');
      }
      return response.json();
    },
  });

  const { data: products = [] } = useQuery({
    queryKey: ["/api/products"],
    queryFn: async () => {
      const response = await fetch("/api/products");
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: OfferFormData) => {
      const offerData: InsertOffer = {
        ...data,
        discountValue: data.discountValue,
        minOrderValue: data.minOrderValue || null,
        maxDiscount: data.maxDiscount || null,
        imageUrl: data.imageUrl || null,
      };
      return await apiRequest("POST", "/api/admin/offers", offerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offers"] });
      setIsDialogOpen(false);
      setFormData(initialFormData);
      toast({
        title: "Success",
        description: "Offer created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create offer",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<OfferFormData> }) => {
      return await apiRequest("PATCH", `/api/admin/offers/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offers"] });
      setIsDialogOpen(false);
      setEditingOffer(null);
      setFormData(initialFormData);
      toast({
        title: "Success",
        description: "Offer updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update offer",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/offers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/offers"] });
      toast({
        title: "Success",
        description: "Offer deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete offer",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingOffer) {
      updateMutation.mutate({ id: editingOffer.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (offer: Offer) => {
    setEditingOffer(offer);
    setFormData({
      title: offer.title,
      description: offer.description,
      discountType: offer.discountType as "percentage" | "fixed",
      discountValue: offer.discountValue,
      code: offer.code || "",
      minOrderValue: offer.minOrderValue || "",
      maxDiscount: offer.maxDiscount || "",
      validFrom: offer.validFrom,
      validUntil: offer.validUntil,
      isActive: offer.isActive,
      applicableProducts: offer.applicableProducts || ["all"],
      imageUrl: offer.imageUrl || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this offer?")) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingOffer(null);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading offers...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Offers Management</h2>
          <p className="text-gray-600">Create and manage promotional offers and discount codes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-wine hover:bg-dark-wine text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Offer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingOffer ? "Edit Offer" : "Add New Offer"}</DialogTitle>
              <DialogDescription>
                Create promotional offers to boost sales and customer engagement
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Offer Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Winter Sale 2024"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="code">Discount Code</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., WINTER20"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the offer details..."
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="discountType">Discount Type *</Label>
                  <Select 
                    value={formData.discountType} 
                    onValueChange={(value: "percentage" | "fixed") => 
                      setFormData({ ...formData, discountType: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                      <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="discountValue">Discount Value *</Label>
                  <Input
                    id="discountValue"
                    type="number"
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder={formData.discountType === "percentage" ? "20" : "10.00"}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="maxDiscount">Max Discount ($)</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    step="0.01"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="50.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="minOrderValue">Min Order Value ($)</Label>
                  <Input
                    id="minOrderValue"
                    type="number"
                    step="0.01"
                    value={formData.minOrderValue}
                    onChange={(e) => setFormData({ ...formData, minOrderValue: e.target.value })}
                    placeholder="25.00"
                  />
                </div>
                <div>
                  <Label htmlFor="validFrom">Valid From *</Label>
                  <Input
                    id="validFrom"
                    type="datetime-local"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="validUntil">Valid Until *</Label>
                  <Input
                    id="validUntil"
                    type="datetime-local"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/offer-banner.jpg"
                />
              </div>

              <div>
                <Label>Applicable Products</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="all-products"
                      name="applicableProducts"
                      checked={formData.applicableProducts.includes("all")}
                      onChange={() => setFormData({ ...formData, applicableProducts: ["all"] })}
                    />
                    <Label htmlFor="all-products">Apply to all products</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="specific-products"
                      name="applicableProducts"
                      checked={!formData.applicableProducts.includes("all")}
                      onChange={() => setFormData({ ...formData, applicableProducts: [] })}
                    />
                    <Label htmlFor="specific-products">Apply to specific products</Label>
                  </div>
                  
                  {!formData.applicableProducts.includes("all") && (
                    <div className="ml-6 space-y-2 max-h-48 overflow-y-auto border rounded-lg p-3">
                      <p className="text-sm text-gray-600 mb-2">Select products for this offer:</p>
                      {products.map((product: Product) => (
                        <div key={product.id} className="flex items-start space-x-2">
                          <input
                            type="checkbox"
                            id={`product-${product.id}`}
                            checked={formData.applicableProducts.includes(product.id.toString())}
                            onChange={(e) => {
                              const productId = product.id.toString();
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  applicableProducts: [...formData.applicableProducts, productId]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  applicableProducts: formData.applicableProducts.filter(id => id !== productId)
                                });
                              }
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <Label 
                              htmlFor={`product-${product.id}`} 
                              className="text-sm font-normal cursor-pointer block"
                            >
                              <div className="flex items-center space-x-2">
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.name}
                                  className="w-8 h-8 rounded object-cover flex-shrink-0"
                                />
                                <div className="min-w-0 flex-1">
                                  <p className="font-medium truncate">{product.name}</p>
                                  <p className="text-xs text-gray-500">${product.price}</p>
                                </div>
                              </div>
                            </Label>
                          </div>
                        </div>
                      ))}
                      {products.length === 0 && (
                        <p className="text-sm text-gray-500">No products available</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active Offer</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-wine hover:bg-dark-wine text-white"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingOffer ? "Update Offer" : "Create Offer"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {offers.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500">No offers yet. Create your first promotional offer!</p>
            </CardContent>
          </Card>
        ) : (
          offers.map((offer: Offer) => (
            <Card key={offer.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {offer.title}
                      <Badge variant={offer.isActive ? "default" : "secondary"}>
                        {offer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {offer.description}
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(offer)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(offer.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    {offer.discountType === "percentage" ? (
                      <Percent className="h-4 w-4 text-green-600" />
                    ) : (
                      <DollarSign className="h-4 w-4 text-green-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium">Discount</p>
                      <p className="text-sm text-gray-600">
                        {offer.discountValue}{offer.discountType === "percentage" ? "%" : "$"}
                      </p>
                    </div>
                  </div>
                  
                  {offer.code && (
                    <div>
                      <p className="text-sm font-medium">Code</p>
                      <p className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
                        {offer.code}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Valid From</p>
                      <p className="text-sm text-gray-600">
                        {new Date(offer.validFrom).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-red-600" />
                    <div>
                      <p className="text-sm font-medium">Valid Until</p>
                      <p className="text-sm text-gray-600">
                        {new Date(offer.validUntil).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                
                {(offer.minOrderValue || offer.maxDiscount || offer.applicableProducts) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex flex-col space-y-2">
                      {(offer.minOrderValue || offer.maxDiscount) && (
                        <div className="flex space-x-4 text-sm text-gray-600">
                          {offer.minOrderValue && (
                            <span>Min Order: ${offer.minOrderValue}</span>
                          )}
                          {offer.maxDiscount && (
                            <span>Max Discount: ${offer.maxDiscount}</span>
                          )}
                        </div>
                      )}
                      
                      {offer.applicableProducts && (
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <Package className="h-4 w-4 text-purple-600" />
                            <p className="text-sm font-medium">Applicable Products</p>
                          </div>
                          {offer.applicableProducts.includes("all") ? (
                            <Badge variant="secondary" className="text-xs">
                              All Products
                            </Badge>
                          ) : (
                            <div className="flex flex-wrap gap-1">
                              {offer.applicableProducts
                                .map(productId => products.find((p: Product) => p.id.toString() === productId))
                                .filter(Boolean)
                                .slice(0, 3)
                                .map((product: Product) => (
                                  <Badge key={product.id} variant="outline" className="text-xs">
                                    {product.name}
                                  </Badge>
                                ))}
                              {offer.applicableProducts.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{offer.applicableProducts.length - 3} more
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}