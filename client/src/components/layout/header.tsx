import { Link, useLocation } from "wouter";
import { ShoppingBag, Search, Menu, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { AuthButtons } from "@/components/auth/auth-buttons";
import { useState } from "react";

interface HeaderProps {
  onCartClick: () => void;
}

export default function Header({ onCartClick }: HeaderProps) {
  const [location] = useLocation();
  const { cartItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/shop", label: "Shop" },
    { href: "/offers", label: "Offers" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-wine shadow-sm border-b border-wine/20">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <h1 className="font-playfair text-2xl font-bold text-white cursor-pointer">
                  GlintShades
                </h1>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-6">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <span
                      className={`text-white hover:text-light-pink transition-colors duration-200 cursor-pointer ${
                        location === item.href ? "font-semibold text-light-pink" : ""
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-white hover:text-light-pink hover:bg-white/10">
              <Search className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-1">
              <Link href="/wishlist">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-light-pink hover:bg-white/10"
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/cart">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-light-pink hover:bg-white/10 relative"
                  onClick={onCartClick}
                >
                  <ShoppingBag className="h-5 w-5" />
                  {totalItems > 0 && (
                    <span className="absolute -top-1 -right-1 bg-light-pink text-wine text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                      {totalItems}
                    </span>
                  )}
                </Button>
              </Link>
            </div>
            <div className="hidden md:block">
              <AuthButtons />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:text-light-pink hover:bg-white/10"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/20 pt-4 pb-4">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    className={`text-white hover:text-light-pink transition-colors duration-200 cursor-pointer block py-2 ${
                      location === item.href ? "font-semibold text-light-pink" : ""
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
              <div className="pt-3 border-t border-white/20">
                <AuthButtons />
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
