import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product-card";
import { type Product } from "@shared/schema";
import { useSEO } from "@/hooks/use-seo";

export default function Bouquets() {
  useSEO({
    title: "Crochet Flower Bouquets",
    description: "Shop our stunning handcrafted crochet flower bouquets. Beautiful, long-lasting arrangements perfect for weddings, anniversaries, birthdays, and home décor.",
    keywords: "crochet bouquets, handcrafted bouquets, crochet flower bouquet, forever bouquet, wedding bouquet crochet",
    canonical: "/bouquets",
    structuredData: {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Crochet Flower Bouquets",
      url: "https://glintshades.replit.app/bouquets",
      description: "Handcrafted crochet flower bouquets that last forever."
    }
  });

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    select: (data) => data.filter(product => product.category === "bouquets"),
  });

  return (
    <div className="bg-ivory">
      {/* Hero Section */}
      <section className="gradient-bg py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="font-playfair text-5xl md:text-6xl font-bold wine mb-6">
              Crochet Bouquets
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              Discover our stunning collection of handcrafted crochet flower bouquets. Each arrangement 
              is carefully designed to bring lasting beauty and charm to any space.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl font-bold wine mb-4">Bouquet Styles</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From classic roses to vibrant sunflowers, find the perfect arrangement for every occasion
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                title: "Mixed Arrangements",
                description: "Beautiful combinations of different flower types",
                image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
                count: products.filter(p => p.name.toLowerCase().includes("mixed")).length
              },
              {
                title: "Rose Collections",
                description: "Elegant and timeless rose bouquets",
                image: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300",
                count: products.filter(p => p.name.toLowerCase().includes("rose")).length
              },
              {
                title: "Sunflower Designs",
                description: "Bright and cheerful sunflower arrangements",
                image: "https://pixabay.com/get/g2b9f75ffb000cae584e8282bbf2dec45f6bba9676438e8d452bac7b64fcec30f88834c23bb5fd0d33f72f6a4e3dfa0351deadd47ffddfe39a06961f1794af319_1280.jpg",
                count: products.filter(p => p.name.toLowerCase().includes("sunflower")).length
              }
            ].map((category, index) => (
              <div key={index} className="text-center">
                <div className="relative overflow-hidden rounded-xl mb-4">
                  <img 
                    src={category.image} 
                    alt={category.title}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <div className="bg-white text-wine px-3 py-1 rounded-full text-sm font-semibold">
                      {category.count} Available
                    </div>
                  </div>
                </div>
                <h3 className="font-playfair text-xl font-semibold wine mb-2">{category.title}</h3>
                <p className="text-gray-600">{category.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-warm-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl font-bold wine mb-4">All Bouquet Collections</h2>
            <p className="text-lg text-gray-600">
              Browse our complete selection of handcrafted crochet bouquets
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 -m-2.5">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="p-2.5">
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse h-full">
                    <div className="h-48 sm:h-52 md:h-56 bg-gray-200"></div>
                    <div className="p-4 sm:p-5 md:p-6">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 -m-2.5">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌸</div>
              <h3 className="font-playfair text-2xl font-bold wine mb-2">No Bouquets Available</h3>
              <p className="text-gray-600 mb-6">We're working on adding more beautiful bouquets to our collection.</p>
              <Button className="bg-wine hover:bg-dark-pink text-white">
                Check Back Soon
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Care Instructions */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl font-bold wine mb-4">Caring for Your Crochet Bouquet</h2>
            <p className="text-lg text-gray-600">
              Keep your handcrafted flowers looking beautiful for years to come
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-blush p-6 rounded-xl">
              <h3 className="font-playfair text-xl font-semibold wine mb-4">Daily Care</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-wine">•</span>
                  <span>Dust gently with a soft, dry brush or cloth</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-wine">•</span>
                  <span>Keep away from direct sunlight to preserve colors</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-wine">•</span>
                  <span>Rotate occasionally to prevent uneven fading</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-wine">•</span>
                  <span>Avoid placing near heat sources</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-blush p-6 rounded-xl">
              <h3 className="font-playfair text-xl font-semibold wine mb-4">Deep Cleaning</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start space-x-2">
                  <span className="text-wine">•</span>
                  <span>Hand wash in cool water with mild detergent if needed</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-wine">•</span>
                  <span>Gently squeeze out excess water - never wring</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-wine">•</span>
                  <span>Lay flat to dry completely before displaying</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-wine">•</span>
                  <span>Reshape flowers gently while damp if needed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
