import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useSEO } from "@/hooks/use-seo";
import { Calendar, User, Tag, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BlogPost } from "@shared/schema";

export default function Blog() {
  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog"],
  });

  useSEO({
    title: "Blog - Crochet Flower Tips, Ideas & Inspiration",
    description: "Explore our blog for crochet flower care tips, gift ideas, DIY inspiration, and the latest updates from GlintShades handmade flower studio.",
    keywords: "crochet flower blog, handmade flower tips, crochet bouquet ideas, flower care guide, GlintShades blog",
    canonical: "/blog",
    ogType: "website",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "Blog",
      name: "GlintShades Blog",
      description: "Crochet flower tips, ideas, and inspiration from GlintShades",
      url: "https://glintshades.com/blog",
      publisher: {
        "@type": "Organization",
        name: "GlintShades",
        url: "https://glintshades.com",
      },
    },
  });

  return (
    <div className="min-h-screen bg-ivory">
      <section className="bg-gradient-to-b from-[#fdeff2] to-ivory py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold wine mb-4">
            Our Blog
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Tips, ideas, and inspiration for crochet flower lovers. Learn about flower care, 
            gift ideas, and the art of handmade crochet arrangements.
          </p>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="grid md:grid-cols-2 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No blog posts yet. Check back soon for new content!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group h-full">
                  {post.coverImageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={post.coverImageUrl}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h2 className="font-playfair text-xl font-semibold wine mb-2 group-hover:underline">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {post.authorName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(post.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                    {post.tags && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.split(",").slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag.trim()}
                          </Badge>
                        ))}
                      </div>
                    )}
                    <span className="inline-flex items-center text-sm font-medium wine group-hover:gap-2 transition-all">
                      Read More <ArrowRight className="h-4 w-4 ml-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
