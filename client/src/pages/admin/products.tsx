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
import { Pencil, Trash2, Plus, Package } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import type { Product } from "@shared/schema";

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
  imageUrl: z.string().min(1, "Image is required"),
  colors: z.string().min(1, "At least one color is required"),
  stemCount: z.number().min(1, "Stem count must be at least 1"),
  inStock: z.boolean(),
});

type ProductForm = z.infer<typeof productSchema>;

export default function AdminProducts() {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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
      colors: "",
      stemCount: 1,
      inStock: true,
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
          colors: productData.colors.split(",").map((c: string) => c.trim()),
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
          colors: productData.colors.split(",").map((c: string) => c.trim()),
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
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: ProductForm) => {
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id, ...data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(id);
    }
  };

  const openCreateDialog = () => {
    setEditingProduct(null);
    form.reset();
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
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerHTML = '<div class="text-gray-400 text-xs text-center p-2">No Image</div>';
                        }}
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
                    onClick={() => handleEdit(product)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(product.id)}
                    disabled={deleteProductMutation.isPending}
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
    </div>
  );
}