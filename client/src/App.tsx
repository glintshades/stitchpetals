import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CartSidebar from "@/components/cart-sidebar";
import ProductSearchChat from "@/components/product-search-chat";
import { useAnalytics } from "@/hooks/use-analytics";
import Home from "@/pages/home";
import About from "@/pages/about";
import Bouquets from "@/pages/bouquets";
import Shop from "@/pages/shop";
import Offers from "@/pages/offers";
import Contact from "@/pages/contact";
import ShippingPage from "@/pages/shipping";
import Product from "@/pages/product";
import Cart from "@/pages/cart";
import AdminPanel from "@/pages/admin";
import Checkout from "@/pages/checkout";
import MyOrders from "@/pages/my-orders";
import Settings from "@/pages/settings";
import ShippingReturns from "@/pages/shipping-returns";
import PrivacyPolicy from "@/pages/privacy-policy";
import TermsConditions from "@/pages/terms-conditions";
import NotFound from "@/pages/not-found";
import WishlistPage from "@/pages/wishlist";

function Router() {
  useAnalytics();

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/bouquets" component={Bouquets} />
      <Route path="/shop" component={Shop} />
      <Route path="/offers" component={Offers} />
      <Route path="/contact" component={Contact} />
      <Route path="/shipping" component={ShippingPage} />
      <Route path="/product/:id" component={Product} />
      <Route path="/cart" component={Cart} />
      <Route path="/wishlist" component={WishlistPage} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/my-orders" component={MyOrders} />
      <Route path="/settings" component={Settings} />
      <Route path="/shipping-returns" component={ShippingReturns} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-conditions" component={TermsConditions} />
      <Route path="/admin" component={AdminPanel} />
      <Route component={NotFound} />
    </Switch>
  );
}

function useGoogleTools() {
  useEffect(() => {
    fetch("/api/settings/public")
      .then((r) => r.json())
      .then(({ ga4Id, gscVerification }) => {
        if (ga4Id && !document.querySelector(`script[data-ga="${ga4Id}"]`)) {
          const s = document.createElement("script");
          s.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
          s.async = true;
          s.setAttribute("data-ga", ga4Id);
          document.head.appendChild(s);
          const inline = document.createElement("script");
          inline.textContent = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${ga4Id}');`;
          document.head.appendChild(inline);
        }
        if (gscVerification && !document.querySelector('meta[name="google-site-verification"]')) {
          const m = document.createElement("meta");
          m.name = "google-site-verification";
          m.content = gscVerification;
          document.head.appendChild(m);
        }
      })
      .catch(() => {});
  }, []);
}

function App() {
  const [cartOpen, setCartOpen] = useState(false);
  useGoogleTools();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-ivory font-inter">
          <Header onCartClick={() => setCartOpen(true)} />
          <main>
            <Router />
          </main>
          <Footer />
          <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
          <ProductSearchChat />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
