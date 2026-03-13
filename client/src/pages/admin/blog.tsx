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
import { Pencil, Trash2, Plus, FileText, Eye, EyeOff } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import type { BlogPost } from "@shared/schema";

const blogPostSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters").regex(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens"),
  content: z.string().min(50, "Content must be at least 50 characters"),
  excerpt: z.string().optional(),
  coverImageUrl: z.string().optional(),
  keywords: z.string().optional(),
  tags: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: z.enum(["draft", "published"]),
  authorName: z.string().min(1, "Author name is required"),
});

type BlogPostForm = z.infer<typeof blogPostSchema>;

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 80)
    .replace(/-$/, "");
}

export default function AdminBlog() {
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["/api/admin/blog"],
    queryFn: async () => {
      const response = await fetch("/api/admin/blog", {
        headers: { Authorization: "Bearer admin-token" },
      });
      if (!response.ok) throw new Error("Failed to fetch blog posts");
      return response.json();
    },
  });

  const form = useForm<BlogPostForm>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      coverImageUrl: "",
      keywords: "",
      tags: "",
      metaTitle: "",
      metaDescription: "",
      status: "draft",
      authorName: "GlintShades",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: BlogPostForm) => {
      const response = await fetch("/api/admin/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin-token",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Failed to create blog post");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Blog post created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: BlogPostForm & { id: number }) => {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer admin-token",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update blog post");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Blog post updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
      setIsDialogOpen(false);
      setEditingPost(null);
      form.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: "DELETE",
        headers: { Authorization: "Bearer admin-token" },
      });
      if (!response.ok) throw new Error("Failed to delete blog post");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Blog post deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/blog"] });
      queryClient.invalidateQueries({ queryKey: ["/api/blog"] });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    form.reset({
      title: post.title,
      slug: post.slug,
      content: post.content,
      excerpt: post.excerpt || "",
      coverImageUrl: post.coverImageUrl || "",
      keywords: post.keywords || "",
      tags: post.tags || "",
      metaTitle: post.metaTitle || "",
      metaDescription: post.metaDescription || "",
      status: post.status as "draft" | "published",
      authorName: post.authorName,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: BlogPostForm) => {
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      deleteMutation.mutate(id);
    }
  };

  const openCreateDialog = () => {
    setEditingPost(null);
    form.reset({
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      coverImageUrl: "",
      keywords: "",
      tags: "",
      metaTitle: "",
      metaDescription: "",
      status: "draft",
      authorName: "GlintShades",
    });
    setIsDialogOpen(true);
  };

  const watchTitle = form.watch("title");

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading blog posts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold">Blog Management</h2>
          <p className="text-gray-600">Create and manage blog posts for content marketing</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} className="bg-wine hover:bg-dark-pink">
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPost ? "Edit Blog Post" : "Create New Blog Post"}</DialogTitle>
              <DialogDescription>
                {editingPost ? "Update blog post content and settings" : "Write a new blog post for your website"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    {...form.register("title")}
                    onChange={(e) => {
                      form.setValue("title", e.target.value);
                      if (!editingPost) {
                        form.setValue("slug", generateSlug(e.target.value));
                      }
                    }}
                  />
                  {form.formState.errors.title && (
                    <p className="text-red-600 text-sm mt-1">{form.formState.errors.title.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="slug">URL Slug</Label>
                  <Input id="slug" {...form.register("slug")} />
                  {form.formState.errors.slug && (
                    <p className="text-red-600 text-sm mt-1">{form.formState.errors.slug.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt (short summary)</Label>
                <Textarea id="excerpt" {...form.register("excerpt")} rows={2} placeholder="Brief summary shown on blog listing page..." />
              </div>

              <div>
                <Label htmlFor="content">Content (HTML supported)</Label>
                <Textarea id="content" {...form.register("content")} rows={12} placeholder="Write your blog post content here. HTML tags are supported for formatting..." />
                {form.formState.errors.content && (
                  <p className="text-red-600 text-sm mt-1">{form.formState.errors.content.message}</p>
                )}
              </div>

              <div>
                <ImageUpload
                  onImageUpload={(url) => form.setValue("coverImageUrl", url)}
                  currentImageUrl={form.watch("coverImageUrl")}
                  label="Cover Image"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="keywords">SEO Keywords (comma-separated)</Label>
                  <Input id="keywords" {...form.register("keywords")} placeholder="crochet flowers, handmade bouquet, gift ideas" />
                </div>
                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input id="tags" {...form.register("tags")} placeholder="crochet, bouquet, gift, handmade" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="metaTitle">Meta Title (for SEO)</Label>
                  <Input id="metaTitle" {...form.register("metaTitle")} placeholder="Leave blank to use post title" />
                </div>
                <div>
                  <Label htmlFor="metaDescription">Meta Description (for SEO)</Label>
                  <Input id="metaDescription" {...form.register("metaDescription")} placeholder="Leave blank to use excerpt" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={form.watch("status")} onValueChange={(v) => form.setValue("status", v as "draft" | "published")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="authorName">Author Name</Label>
                  <Input id="authorName" {...form.register("authorName")} />
                  {form.formState.errors.authorName && (
                    <p className="text-red-600 text-sm mt-1">{form.formState.errors.authorName.message}</p>
                  )}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-wine hover:bg-dark-pink"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingPost ? "Update Post" : "Create Post"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">
            <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No blog posts yet</p>
            <p className="text-sm mt-1">Create your first blog post to start content marketing</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {posts.map((post: BlogPost) => (
            <Card key={post.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex space-x-4 flex-1">
                    {post.coverImageUrl && (
                      <div className="w-24 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img src={post.coverImageUrl} alt={post.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg truncate">{post.title}</h3>
                      {post.excerpt && (
                        <p className="text-gray-600 text-sm mt-1 line-clamp-2">{post.excerpt}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <Badge className={post.status === "published" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                          {post.status === "published" ? "Published" : "Draft"}
                        </Badge>
                        <span className="text-sm text-gray-500">by {post.authorName}</span>
                        <span className="text-sm text-gray-400">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-400">/blog/{post.slug}</span>
                      </div>
                      {post.tags && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {post.tags.split(",").map((tag, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {tag.trim()}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2 ml-4">
                    {post.status === "published" && (
                      <Button variant="outline" size="sm" onClick={() => window.open(`/blog/${post.slug}`, "_blank")} title="Preview">
                        <Eye className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => handleEdit(post)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                      onClick={() => handleDelete(post.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
