import { Link, useLocation } from "wouter";
import { ShoppingBag, Search, Menu, LogIn, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

interface HeaderProps {
  onCartClick: () => void;
}

export default function Header({ onCartClick }: HeaderProps) {
  const [location] = useLocation();
  const { cartItems } = useCart();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About" },
    { href: "/bouquets", label: "Crochet Bouquets" },
    { href: "/shop", label: "Shop" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-ivory shadow-sm border-b border-soft-pink">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <Link href="/">
                <h1 className="font-playfair text-2xl font-bold wine cursor-pointer">
                  Stitched Petals
                </h1>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-6">
                {navItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <span
                      className={`wine hover:text-dark-pink transition-colors duration-200 cursor-pointer ${
                        location === item.href ? "font-semibold" : ""
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
            {isAuthenticated && (
              <>
                <Button variant="ghost" size="icon" className="wine hover:text-dark-pink">
                  <Search className="h-5 w-5" />
                </Button>
                <Link href="/cart">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="wine hover:text-dark-pink relative"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {totalItems > 0 && (
                      <span className="absolute -top-1 -right-1 bg-dark-pink text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                  </Button>
                </Link>
              </>
            )}
            
            {!isLoading && (
              <>
                {isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    {user?.profileImageUrl ? (
                      <img
                        src={user.profileImageUrl}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover border-2 border-wine/20"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-wine/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-wine" />
                      </div>
                    )}
                    <span className="hidden sm:inline text-sm text-wine font-medium">
                      {user?.firstName || user?.email?.split('@')[0] || 'User'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLogout}
                      className="border-wine text-wine hover:bg-wine hover:text-white"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleLogin}
                    className="bg-wine hover:bg-wine/90 text-white"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                )}
              </>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden wine hover:text-dark-pink"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-soft-pink pt-4 pb-4">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <span
                    className={`wine hover:text-dark-pink transition-colors duration-200 cursor-pointer block py-2 ${
                      location === item.href ? "font-semibold" : ""
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
