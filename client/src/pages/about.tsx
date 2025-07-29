import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import HeroSlider from "@/components/hero-slider";
import { Heart, Users, Award, Truck } from "lucide-react";

export default function About() {
  // About hero slider slides
  const aboutSlides = [
    {
      id: 1,
      title: "About GlintShades",
      subtitle: "Our Story",
      description: "We're passionate about bringing the timeless art of crochet to modern homes through beautiful, handcrafted flower arrangements that last forever.",
      backgroundImage: "/images/WechatIMG1746_1753288338342.webp",
      ctaText: "Our Mission",
      ctaLink: "#mission",
    },
    {
      id: 2,
      title: "Handcrafted Excellence",
      subtitle: "Traditional Artistry",
      description: "Each piece in our collection is meticulously created by skilled artisans who pour their passion into every stitch, celebrating the art of traditional needlework.",
      backgroundImage: "/images/il_1588xN.4851706578_21g4_1753286611661.webp",
      ctaText: "Shop Now",
      ctaLink: "/shop",
    },
    {
      id: 3,
      title: "Premium Quality Materials",
      subtitle: "Crafted to Last",
      description: "We use only the finest soft cotton yarn to ensure durability and beauty that will grace your home for years to come.",
      backgroundImage: "/images/WechatIMG1746_1753286974076.webp",
      ctaText: "Contact Us",
      ctaLink: "/contact",
    }
  ];

  return (
    <div className="bg-ivory">
      {/* Hero Slider */}
      <HeroSlider slides={aboutSlides} autoPlay={true} autoPlayInterval={6000} />

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="/images/WechatIMG1746_1753288338342.webp" 
                alt="Beautiful handcrafted crochet sunflowers in pots showcasing premium craftsmanship" 
                className="rounded-xl shadow-lg" 
              />
            </div>
            <div>
              <h2 className="font-playfair text-4xl font-bold wine mb-6">Crafted with Love, Delivered with Care</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                At GlintShades, we believe in the timeless beauty of handmade craftsmanship. Each crochet flower in our collection 
                is meticulously created by skilled artisans who pour their passion into every stitch.
              </p>
              <p className="text-gray-700 mb-8 leading-relaxed">
                Through our partnership with talented crochet artists, we bring you authentic, high-quality pieces that celebrate 
                the art of traditional needlework while meeting modern aesthetic desires. Every bouquet tells a story of dedication, 
                creativity, and love for the craft.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold dark-pink mb-2">500+</div>
                  <div className="text-gray-600">Happy Customers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold dark-pink mb-2">75+</div>
                  <div className="text-gray-600">Unique Designs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="py-16 bg-warm-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl font-bold wine mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              To preserve and promote the art of crochet while creating beautiful, sustainable floral arrangements 
              that bring joy to homes worldwide.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Heart className="h-8 w-8" />,
                title: "Passion for Craft",
                description: "We celebrate the artistry and skill of traditional crochet techniques, ensuring each piece reflects generations of knowledge."
              },
              {
                icon: <Users className="h-8 w-8" />,
                title: "Supporting Artisans",
                description: "We work directly with skilled crochet artists, providing them with fair compensation and a platform to showcase their talent."
              },
              {
                icon: <Award className="h-8 w-8" />,
                title: "Quality Promise",
                description: "Every piece meets our rigorous quality standards, using premium materials to ensure longevity and beauty."
              },
              {
                icon: <Truck className="h-8 w-8" />,
                title: "Sustainable Choice",
                description: "Our dropshipping model reduces waste while our lasting products offer an eco-friendly alternative to fresh flowers."
              }
            ].map((value, index) => (
              <Card key={index} className="bg-white">
                <CardContent className="p-6 text-center">
                  <div className="wine mb-4 flex justify-center">{value.icon}</div>
                  <h3 className="font-playfair text-xl font-semibold wine mb-3">{value.title}</h3>
                  <p className="text-gray-600 text-sm">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dropshipping Model */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-playfair text-4xl font-bold wine mb-6">Our Business Model</h2>
              <p className="text-gray-700 mb-6 leading-relaxed">
                GlintShades operates as a dropshipping platform, connecting customers directly with skilled artisans 
                who create these beautiful crochet flowers. This model allows us to offer you:
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start space-x-3">
                  <Badge className="bg-wine text-white mt-1">1</Badge>
                  <div>
                    <p className="font-semibold wine">Fresh, Made-to-Order Items</p>
                    <p className="text-gray-600 text-sm">Each piece is crafted after your order, ensuring maximum freshness and quality.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Badge className="bg-wine text-white mt-1">2</Badge>
                  <div>
                    <p className="font-semibold wine">Direct Artist Support</p>
                    <p className="text-gray-600 text-sm">Your purchase directly supports independent crochet artists and their families.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Badge className="bg-wine text-white mt-1">3</Badge>
                  <div>
                    <p className="font-semibold wine">Competitive Pricing</p>
                    <p className="text-gray-600 text-sm">By eliminating middlemen, we offer fair prices for both customers and artists.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <Badge className="bg-wine text-white mt-1">4</Badge>
                  <div>
                    <p className="font-semibold wine">Global Reach</p>
                    <p className="text-gray-600 text-sm">Access authentic handmade items from talented artisans around the world.</p>
                  </div>
                </li>
              </ul>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1606041008023-472dfb5e530f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400" 
                alt="Beautiful arrangement of various crochet flowers showcasing artisan quality" 
                className="rounded-xl shadow-lg" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-16 bg-blush">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-playfair text-4xl font-bold wine mb-4">How It Works</h2>
            <p className="text-lg text-gray-600">From your order to your doorstep</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Browse & Order",
                description: "Explore our curated collection and place your order with your preferred colors and styles."
              },
              {
                step: "02", 
                title: "Artisan Creation",
                description: "Our partner artisans receive your order and begin handcrafting your unique piece with care."
              },
              {
                step: "03",
                title: "Quality Check",
                description: "Each completed item undergoes thorough quality inspection before packaging."
              },
              {
                step: "04",
                title: "Direct Shipping",
                description: "Your beautiful crochet flowers are carefully packaged and shipped directly to you."
              }
            ].map((process, index) => (
              <div key={index} className="text-center">
                <div className="wine-gradient text-white w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {process.step}
                </div>
                <h3 className="font-playfair text-xl font-semibold wine mb-3">{process.title}</h3>
                <p className="text-gray-600 text-sm">{process.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Commitment */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-playfair text-4xl font-bold wine mb-6">Our Commitment to You</h2>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            We're committed to providing you with exceptional handcrafted crochet flowers while supporting 
            the artisan community. Every purchase contributes to preserving this beautiful traditional craft 
            and helps talented artists continue their passion.
          </p>
          <div className="bg-blush p-8 rounded-xl">
            <p className="text-wine font-semibold text-lg italic">
              "At GlintShades, we don't just sell crochet flowers – we share stories, preserve traditions, 
              and create lasting beauty that brings joy to every home."
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
