import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus, Package, Eye, EyeOff, Palette, X } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { apiRequest } from "@/lib/queryClient";
import type { Product, ProductVariation } from "@shared/schema";

type ProductCategory = {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
};

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string().min(1, "Price is required"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().min(1, "Image is required").refine((val) => {
    return val.startsWith('http') || val.startsWith('https') || val.startsWith('/images/') || val.startsWith('data:') || val.includes('image-');
  }, "Please provide a valid image URL or upload an image"),
  colors: z.string().optional().default("Mixed"),
  stemCount: z.number().min(1, "Stem count must be at least 1"),
  inStock: z.boolean(),
  isVisible: z.boolean(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function AdminProducts() {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [variationsDialogOpen, setVariationsDialogOpen] = useState(false);
  const [selectedProductForVariations, setSelectedProductForVariations] = useState<Product | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["/api/admin/products"],
    queryFn: async () => {
      const response = await fetch("/api/admin/products", {
        headers: { Authorization: "Bearer admin-token" }
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    },
  });

  const { data: categories = [] } = useQuery<ProductCategory[]>({
    queryKey: ["/api/admin/categories"],
    queryFn: async () => {
      const response = await fetch("/api/admin/categories", {
        headers: { Authorization: "Bearer admin-token" }
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      return response.json();
    },
  });

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      category: "",
      imageUrl: "",
      colors: "Mixed",
      stemCount: 1,
      inStock: true,
      isVisible: true,
    },
  });

  const createProductMutation = useMutation({
    mutationFn: async (productData: any) => {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: "Bearer admin-token"
        },
        body: JSON.stringify({
          ...productData,
          colors: productData.colors ? productData.colors.split(",").map((c: string) => c.trim()) : ["Mixed"],
        }),
      });
      if (!response.ok) throw new Error("Failed to create product");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Product created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, ...productData }: any) => {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: "Bearer admin-token"
        },
        body: JSON.stringify({
          ...productData,
          colors: productData.colors ? productData.colors.split(",").map((c: string) => c.trim()) : ["Mixed"],
        }),
      });
      if (!response.ok) throw new Error("Failed to update product");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Product updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      form.reset();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer admin-token" }
      });
      if (!response.ok) throw new Error("Failed to delete product");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Product deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isVisible }: { id: number; isVisible: boolean }) => {
      const response = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: "Bearer admin-token"
        },
        body: JSON.stringify({ isVisible }),
      });
      if (!response.ok) throw new Error("Failed to update product visibility");
      return response.json();
    },
    onSuccess: (_, variables) => {
      toast({ 
        title: "Success", 
        description: `Product ${variables.isVisible ? 'shown' : 'hidden'} successfully`
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products"] });
      queryClient.invalidateQueries({ queryKey: ["/api/products"] });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl || "",
      colors: Array.isArray(product.colors) ? product.colors.join(", ") : String(product.colors || ""),
      stemCount: product.stemCount || 1,
      inStock: product.inStock,
      isVisible: product.isVisible !== false, // Default to true if undefined
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: ProductForm) => {
    console.log('🚀 FORM ACTUALLY SUBMITTED!');
    console.log('Form submission data:', data);
    console.log('Form errors:', form.formState.errors);
    console.log('Image URL value:', data.imageUrl);
    console.log('Form is valid:', form.formState.isValid);
    
    if (editingProduct) {
      console.log('Updating product:', editingProduct.id);
      updateProductMutation.mutate({ id: editingProduct.id, ...data });
    } else {
      console.log('Creating new product');
      createProductMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleToggleVisibility = (product: Product) => {
    const newVisibility = !product.isVisible;
    toggleVisibilityMutation.mutate({ 
      id: product.id, 
      isVisible: newVisibility 
    });
  };

  const handleManageVariations = (product: Product) => {
    setSelectedProductForVariations(product);
    setVariationsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingProduct(null);
    form.reset({
      name: "",
      description: "",
      price: "0",
      category: "",
      imageUrl: "",
      colors: "Mixed",
      stemCount: 1,
      inStock: true,
      isVisible: true,
    });
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading products...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Product Management</h2>
          <p className="text-gray-600">Manage your product catalog</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-wine hover:bg-dark-pink">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Edit Product" : "Add New Product"}
              </DialogTitle>
              <DialogDescription>
                {editingProduct ? "Update product information" : "Create a new product for your catalog"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" {...form.register("name")} />
                  {form.formState.errors.name && (
                    <p className="text-red-600 text-sm mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="price">Price ($)</Label>
                  <Input id="price" {...form.register("price")} placeholder="29.99" />
                  {form.formState.errors.price && (
                    <p className="text-red-600 text-sm mt-1">{form.formState.errors.price.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" {...form.register("description")} rows={4} />
                {form.formState.errors.description && (
                  <p className="text-red-600 text-sm mt-1">{form.formState.errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={form.watch("category")} onValueChange={(value) => form.setValue("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(cat => cat.isActive).map((category) => (
                        <SelectItem key={category.id} value={category.slug}>
                          {category.name}
                        </SelectItem>
                      ))}
                      {categories.filter(cat => cat.isActive).length === 0 && (
                        <SelectItem value="" disabled>No active categories available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.category && (
                    <p className="text-red-600 text-sm mt-1">{form.formState.errors.category.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="stemCount">Stem Count</Label>
                  <Input 
                    id="stemCount" 
                    type="number" 
                    min="1"
                    {...form.register("stemCount", { valueAsNumber: true })} 
                  />
                  {form.formState.errors.stemCount && (
                    <p className="text-red-600 text-sm mt-1">{form.formState.errors.stemCount.message}</p>
                  )}
                </div>
              </div>

              <div>
                <ImageUpload
                  onImageUpload={(imageUrl) => form.setValue("imageUrl", imageUrl)}
                  currentImageUrl={form.watch("imageUrl")}
                  label="Product Image"
                />
                {form.formState.errors.imageUrl && (
                  <p className="text-red-600 text-sm mt-1">{form.formState.errors.imageUrl.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="colors">Colors (comma-separated)</Label>
                <Input id="colors" {...form.register("colors")} placeholder="Pink, Purple, Yellow" />
                {form.formState.errors.colors && (
                  <p className="text-red-600 text-sm mt-1">{form.formState.errors.colors.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="inStock"
                    checked={form.watch("inStock")}
                    onChange={(e) => form.setValue("inStock", e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="inStock">In Stock</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isVisible"
                    checked={form.watch("isVisible")}
                    onChange={(e) => form.setValue("isVisible", e.target.checked)}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="isVisible">Visible in Product Listing</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-wine hover:bg-dark-pink"
                  disabled={createProductMutation.isPending || updateProductMutation.isPending}
                >
                  {editingProduct ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {products.map((product: Product) => (
          <Card key={product.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex space-x-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    {product.imageUrl && product.imageUrl !== '/system/marker' ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-400 text-xs text-center p-2">No Image</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <Badge variant="secondary">{product.category}</Badge>
                      <span className="text-sm text-gray-500">{product.stemCount} stems</span>
                      <span className="font-semibold text-wine">${product.price}</span>
                      {product.inStock ? (
                        <Badge className="bg-green-100 text-green-800">In Stock</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>
                      )}
                      {product.isVisible !== false ? (
                        <Badge className="bg-blue-100 text-blue-800">Visible</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Hidden</Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(Array.isArray(product.colors) ? product.colors : [product.colors]).map((color, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {color}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleVisibility(product)}
                    disabled={toggleVisibilityMutation.isPending}
                    title={product.isVisible !== false ? "Hide from website" : "Show on website"}
                    data-testid={`button-toggle-visibility-${product.id}`}
                  >
                    {product.isVisible !== false ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleManageVariations(product)}
                    title="Manage color variations"
                    data-testid={`button-variations-${product.id}`}
                  >
                    <Palette className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    data-testid={`button-edit-${product.id}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    disabled={deleteProductMutation.isPending}
                    data-testid={`button-delete-${product.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">Get started by adding your first product</p>
            <Button onClick={openCreateDialog} className="bg-wine hover:bg-dark-pink">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Product Variations Management Dialog */}
      <ProductVariationsManager
        product={selectedProductForVariations}
        open={variationsDialogOpen}
        onOpenChange={setVariationsDialogOpen}
      />
    </div>
  );
}

// Product Variations Manager Component
interface ProductVariationsManagerProps {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const variationSchema = z.object({
  colorName: z.string().min(1, "Color name is required"),
  colorCode: z.string().optional(),
  imageUrl: z.string().min(1, "Image is required"),
  stockQuantity: z.number().min(0, "Stock must be 0 or greater"),
  isAvailable: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

type VariationForm = z.infer<typeof variationSchema>;

function ProductVariationsManager({ product, open, onOpenChange }: ProductVariationsManagerProps) {
  const [editingVariation, setEditingVariation] = useState<ProductVariation | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<VariationForm>({
    resolver: zodResolver(variationSchema),
    defaultValues: {
      colorName: "",
      colorCode: "",
      imageUrl: "",
      stockQuantity: 0,
      isAvailable: true,
      sortOrder: 0,
    },
  });

  // Fetch variations for the selected product
  const { data: variations = [], isLoading } = useQuery({
    queryKey: ["/api/admin/products", product?.id, "variations"],
    enabled: !!product?.id && open,
  });

  // Create variation mutation
  const createVariationMutation = useMutation({
    mutationFn: async (data: VariationForm) => {
      const response = await apiRequest("POST", `/api/admin/products/${product!.id}/variations`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products", product?.id, "variations"] });
      toast({ title: "Success", description: "Color variation created successfully" });
      form.reset();
      setEditingVariation(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create variation", variant: "destructive" });
    },
  });

  // Update variation mutation
  const updateVariationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<VariationForm> }) => {
      const response = await apiRequest("PATCH", `/api/admin/variations/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products", product?.id, "variations"] });
      toast({ title: "Success", description: "Variation updated successfully" });
      form.reset();
      setEditingVariation(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update variation", variant: "destructive" });
    },
  });

  // Delete variation mutation
  const deleteVariationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest("DELETE", `/api/admin/variations/${id}`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/products", product?.id, "variations"] });
      toast({ title: "Success", description: "Variation deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete variation", variant: "destructive" });
    },
  });

  const handleSubmit = (data: VariationForm) => {
    if (editingVariation) {
      updateVariationMutation.mutate({ id: editingVariation.id, data });
    } else {
      createVariationMutation.mutate(data);
    }
  };

  const handleEdit = (variation: ProductVariation) => {
    setEditingVariation(variation);
    form.reset({
      colorName: variation.colorName,
      colorCode: variation.colorCode || "",
      imageUrl: variation.imageUrl,
      stockQuantity: variation.stockQuantity,
      isAvailable: variation.isAvailable,
      sortOrder: variation.sortOrder,
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this variation?")) {
      deleteVariationMutation.mutate(id);
    }
  };

  const resetForm = () => {
    form.reset();
    setEditingVariation(null);
  };

  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Color Variations - {product.name}</DialogTitle>
          <DialogDescription>
            Manage different color variations for this product with specific images
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              {editingVariation ? "Edit Variation" : "Add New Variation"}
            </h3>
            
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="colorName">Color Name *</Label>
                <Input
                  id="colorName"
                  {...form.register("colorName")}
                  placeholder="e.g., Deep Purple, Sunset Pink"
                />
                {form.formState.errors.colorName && (
                  <p className="text-red-600 text-sm mt-1">{form.formState.errors.colorName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="colorCode">Color Code (Optional)</Label>
                <Input
                  id="colorCode"
                  {...form.register("colorCode")}
                  placeholder="#FF5733"
                />
              </div>

              <div>
                <ImageUpload
                  onImageUpload={(imageUrl) => form.setValue("imageUrl", imageUrl)}
                  currentImageUrl={form.watch("imageUrl")}
                  label="Variation Image *"
                />
                {form.formState.errors.imageUrl && (
                  <p className="text-red-600 text-sm mt-1">{form.formState.errors.imageUrl.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    min="0"
                    {...form.register("stockQuantity", { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    min="0"
                    {...form.register("sortOrder", { valueAsNumber: true })}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isAvailable"
                  {...form.register("isAvailable")}
                  className="rounded"
                />
                <Label htmlFor="isAvailable">Available for purchase</Label>
              </div>

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={createVariationMutation.isPending || updateVariationMutation.isPending}
                  className="bg-wine hover:bg-dark-pink"
                >
                  {editingVariation ? "Update Variation" : "Add Variation"}
                </Button>
                {editingVariation && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel Edit
                  </Button>
                )}
              </div>
            </form>
          </div>

          {/* Variations List */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Variations ({variations.length})</h3>
            
            {isLoading ? (
              <div className="text-center py-4">Loading variations...</div>
            ) : variations.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {variations.map((variation: ProductVariation) => (
                  <Card key={variation.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex space-x-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={variation.imageUrl}
                            alt={variation.colorName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{variation.colorName}</h4>
                          {variation.colorCode && (
                            <div className="flex items-center space-x-2 mt-1">
                              <div
                                className="w-4 h-4 rounded border"
                                style={{ backgroundColor: variation.colorCode }}
                              />
                              <span className="text-sm text-gray-600">{variation.colorCode}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                            <span>Stock: {variation.stockQuantity}</span>
                            <span>Order: {variation.sortOrder}</span>
                            <Badge variant={variation.isAvailable ? "default" : "secondary"}>
                              {variation.isAvailable ? "Available" : "Unavailable"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(variation)}
                          data-testid={`button-edit-variation-${variation.id}`}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(variation.id)}
                          disabled={deleteVariationMutation.isPending}
                          data-testid={`button-delete-variation-${variation.id}`}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Palette className="h-12 w-12 mx-auto mb-3" />
                <p>No color variations yet</p>
                <p className="text-sm">Add the first variation to get started</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}