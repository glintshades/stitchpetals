import { useState, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { Package, Plus, Edit, Trash2, Calendar, CheckCircle, XCircle, Upload, Image } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ProductCategory = {
  id: number;
  name: string;
  description?: string;
  slug: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
};

export default function AdminCategories() {
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const { data: categories, isLoading } = useQuery<ProductCategory[]>({
    queryKey: ["/api/admin/categories"],
    queryFn: async () => {
      const response = await fetch("/api/admin/categories", {
        headers: { Authorization: "Bearer admin-token" }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      return response.json();
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/admin/upload-image', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer admin-token'
        },
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      return response.json();
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (categoryData: { name: string; description: string; slug: string; imageUrl?: string }) => {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer admin-token"
        },
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) {
        throw new Error('Failed to create category');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      setShowCreateDialog(false);
      setImagePreview(null);
      toast({
        title: "Success",
        description: "Category created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive",
      });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ categoryId, updates }: { categoryId: number; updates: Partial<ProductCategory> }) => {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer admin-token"
        },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        throw new Error('Failed to update category');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      setShowEditDialog(false);
      setSelectedCategory(null);
      setEditImagePreview(null);
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive",
      });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (categoryId: number) => {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer admin-token" }
      });
      if (!response.ok) {
        throw new Error('Failed to delete category');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/categories"] });
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    },
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleImageUpload = async (file: File, isEdit = false) => {
    setUploadingImage(true);
    try {
      const result = await uploadImageMutation.mutateAsync(file);
      if (isEdit) {
        setEditImagePreview(result.imageUrl);
      } else {
        setImagePreview(result.imageUrl);
      }
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file, isEdit);
    }
  };

  const handleCreateCategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const categoryData = {
      name,
      description: formData.get("description") as string,
      slug: formData.get("slug") as string || generateSlug(name),
      imageUrl: imagePreview || undefined,
    };
    createCategoryMutation.mutate(categoryData);
  };

  const handleEditCategory = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedCategory) return;
    
    const formData = new FormData(e.currentTarget);
    const updates = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      slug: formData.get("slug") as string,
      isActive: formData.get("isActive") === "true",
      imageUrl: editImagePreview || selectedCategory.imageUrl,
    };
    updateCategoryMutation.mutate({ categoryId: selectedCategory.id, updates });
  };

  const handleDeleteCategory = (categoryId: number) => {
    if (window.confirm("Are you sure you want to delete this category? This action cannot be undone.")) {
      deleteCategoryMutation.mutate(categoryId);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? "bg-green-500" : "bg-red-500";
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading categories...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#8B4B6B] mb-2">Product Categories</h1>
          <p className="text-gray-600">Organize your products with categories</p>
        </div>
        
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#8B4B6B] hover:bg-[#7A4A5A]">
              <Plus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <Label htmlFor="name">Category Name</Label>
                <Input 
                  id="name" 
                  name="name" 
                  required 
                  placeholder="e.g., Bouquets"
                  onChange={(e) => {
                    const slugInput = document.querySelector('[name="slug"]') as HTMLInputElement;
                    if (slugInput) {
                      slugInput.value = generateSlug(e.target.value);
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  name="description" 
                  placeholder="Category description..."
                />
              </div>
              <div>
                <Label htmlFor="slug">URL Slug</Label>
                <Input 
                  id="slug" 
                  name="slug" 
                  placeholder="auto-generated"
                />
              </div>
              
              {/* Image Upload */}
              <div>
                <Label>Category Image</Label>
                <div className="mt-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, false)}
                    className="hidden"
                  />
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Category preview" 
                        className="w-32 h-32 object-cover rounded border"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingImage}
                      >
                        {uploadingImage ? "Uploading..." : "Change Image"}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploadingImage ? "Uploading..." : "Upload Image"}
                    </Button>
                  )}
                </div>
              </div>
              
              <Button type="submit" disabled={createCategoryMutation.isPending}>
                {createCategoryMutation.isPending ? "Creating..." : "Create Category"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categories List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">All Categories ({categories?.length || 0})</h2>
          
          {categories?.map((category) => (
            <Card 
              key={category.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedCategory?.id === category.id ? 'ring-2 ring-[#8B4B6B]' : ''
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex gap-3">
                    {category.imageUrl && (
                      <img 
                        src={category.imageUrl} 
                        alt={category.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    )}
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        <Package className="h-4 w-4" />
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-600">{category.slug}</p>
                      {category.description && (
                        <p className="text-sm text-gray-500 mt-1">{category.description}</p>
                      )}
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(category.isActive)} text-white`}>
                    {category.isActive ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </>
                    )}
                  </Badge>
                </div>
                
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created: {new Date(category.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}

          {(!categories || categories.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No categories found</p>
              <p className="text-sm">Create your first category to organize products</p>
            </div>
          )}
        </div>

        {/* Category Details */}
        <div>
          {selectedCategory ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{selectedCategory.name}</span>
                  <div className="flex gap-2">
                    <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Category</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleEditCategory} className="space-y-4">
                          <div>
                            <Label htmlFor="edit-name">Category Name</Label>
                            <Input 
                              id="edit-name" 
                              name="name" 
                              defaultValue={selectedCategory.name}
                              required 
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea 
                              id="edit-description" 
                              name="description" 
                              defaultValue={selectedCategory.description || ''}
                            />
                          </div>
                          <div>
                            <Label htmlFor="edit-slug">URL Slug</Label>
                            <Input 
                              id="edit-slug" 
                              name="slug" 
                              defaultValue={selectedCategory.slug}
                              required
                            />
                          </div>
                          
                          {/* Image Upload */}
                          <div>
                            <Label>Category Image</Label>
                            <div className="mt-2">
                              <input
                                ref={editFileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, true)}
                                className="hidden"
                              />
                              {(editImagePreview || selectedCategory.imageUrl) ? (
                                <div className="relative">
                                  <img 
                                    src={editImagePreview || selectedCategory.imageUrl} 
                                    alt="Category preview" 
                                    className="w-32 h-32 object-cover rounded border"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => editFileInputRef.current?.click()}
                                    disabled={uploadingImage}
                                  >
                                    {uploadingImage ? "Uploading..." : "Change Image"}
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => editFileInputRef.current?.click()}
                                  disabled={uploadingImage}
                                >
                                  <Upload className="h-4 w-4 mr-2" />
                                  {uploadingImage ? "Uploading..." : "Upload Image"}
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          <div>
                            <Label htmlFor="edit-status">Status</Label>
                            <Select name="isActive" defaultValue={selectedCategory.isActive.toString()}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="true">Active</SelectItem>
                                <SelectItem value="false">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button type="submit" disabled={updateCategoryMutation.isPending}>
                            {updateCategoryMutation.isPending ? "Updating..." : "Update Category"}
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                    
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteCategory(selectedCategory.id)}
                      disabled={deleteCategoryMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Category Information */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Category Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span>{selectedCategory.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Slug:</span>
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {selectedCategory.slug}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <Badge className={`${getStatusColor(selectedCategory.isActive)} text-white`}>
                        {selectedCategory.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {selectedCategory.description && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                        {selectedCategory.description}
                      </p>
                    </div>
                  </>
                )}

                <Separator />

                {/* Metadata */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span>{new Date(selectedCategory.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Select a category to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}