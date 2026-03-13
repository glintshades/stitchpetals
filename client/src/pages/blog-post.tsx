import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { Calendar, User, Tag, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { BlogPost } from "@shared/schema";

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  const slug = params?.slug;

  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: ["/api/blog", slug],
    queryFn: async () => {
      const response = await fetch(`/api/blog/${slug}`);
      if (!response.ok) throw new Error("Blog post not found");
      return response.json();
    },
    enabled: !!slug,
  });

  useSEO({
    title: post ? (post.metaTitle || post.title) : "Blog Post",
    description: post ? (post.metaDescription || post.excerpt || post.content.substring(0, 160)) : "",
    keywords: post?.keywords || "",
    canonical: `/blog/${slug}`,
    ogType: "article",
    ogImage: post?.coverImageUrl || undefined,
    structuredData: post
      ? {
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: post.title,
          description: post.excerpt || post.content.substring(0, 160),
          image: post.coverImageUrl || undefined,
          author: {
            "@type": "Person",
            name: post.authorName,
          },
          publisher: {
            "@type": "Organization",
            name: "GlintShades",
            url: "https://glintshades.com",
          },
          datePublished: post.createdAt,
          dateModified: post.updatedAt,
          mainEntityOfPage: {
            "@type": "WebPage",
            "@id": `https://glintshades.com/blog/${post.slug}`,
          },
          keywords: post.keywords || undefined,
        }
      : undefined,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory">
        <div className="max-w-3xl mx-auto px-4 py-16">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8" />
            <div className="h-64 bg-gray-200 rounded mb-8" />
            <div className="space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-playfair text-3xl font-bold wine mb-4">Post Not Found</h1>
          <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist or has been removed.</p>
          <Link href="/blog">
            <span className="inline-flex items-center gap-2 text-wine hover:underline cursor-pointer">
              <ArrowLeft className="h-4 w-4" />
              Back to Blog
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      {post.coverImageUrl && (
        <div className="w-full h-64 md:h-80 overflow-hidden">
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <article className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/blog">
          <span className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-wine mb-6 cursor-pointer transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </span>
        </Link>

        <h1 className="font-playfair text-3xl md:text-4xl font-bold wine mb-4">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-6 pb-6 border-b border-soft-pink">
          <span className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {post.authorName}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        <div
          className="prose prose-lg max-w-none 
            prose-headings:font-playfair prose-headings:text-[#3e0d57]
            prose-a:text-[#3e0d57] prose-a:underline
            prose-img:rounded-lg prose-img:mx-auto
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-li:text-gray-700
            prose-strong:text-[#3e0d57]
            mb-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.tags && (
          <div className="border-t border-soft-pink pt-6 mt-8">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-gray-500" />
              {post.tags.split(",").map((tag, i) => (
                <Badge key={i} variant="outline" className="text-sm">
                  {tag.trim()}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 bg-[#fdeff2] rounded-xl p-8 text-center">
          <h3 className="font-playfair text-xl font-semibold wine mb-2">
            Love Handmade Flowers?
          </h3>
          <p className="text-gray-600 mb-4">
            Browse our collection of beautiful handcrafted crochet flower arrangements.
          </p>
          <Link href="/shop">
            <span className="inline-block bg-wine text-white px-6 py-2.5 rounded-lg hover:bg-dark-pink transition-colors cursor-pointer font-medium">
              Shop Now
            </span>
          </Link>
        </div>
      </article>
    </div>
  );
}
