import { Link } from "wouter";
import { Facebook, Instagram, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Footer() {
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
      setEmail("");
    }
  };

  return (
    <footer className="bg-wine text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <h4 className="font-playfair text-2xl font-bold mb-4">Stitched Petals</h4>
            <p className="text-white/80 mb-4">
              Creating beautiful, lasting memories through handcrafted crochet artistry.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-white/80 hover:text-white">
                <Mail className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div>
            <h5 className="font-semibold text-lg mb-4">Shop</h5>
            <ul className="space-y-2 text-white/80">
              <li>
                <Link href="/shop">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    All Products
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/bouquets">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Bouquets
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/shop?category=potted">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Potted Flowers
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/shop?category=stems">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Single Stems
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold text-lg mb-4">Support</h5>
            <ul className="space-y-2 text-white/80">
              <li>
                <Link href="/contact">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Contact Us
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/shipping-returns">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Shipping & Returns
                  </span>
                </Link>
              </li>
              <li>
                <a href="/#faq">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    FAQ
                  </span>
                </a>
              </li>
              <li>
                <Link href="/terms-conditions">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Terms & Conditions
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy">
                  <span className="hover:text-white transition-colors cursor-pointer">
                    Privacy Policy
                  </span>
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h5 className="font-semibold text-lg mb-4">Newsletter</h5>
            <p className="text-white/80 mb-4">
              Subscribe to get updates on new products and special offers.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-gray-800"
              />
              <Button type="submit" className="w-full bg-dark-pink hover:bg-deep-rose">
                Subscribe
              </Button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/80">
            &copy; 2024 Stitched Petals. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
