import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import CartSidebar from "@/components/cart-sidebar";
import Home from "@/pages/home";
import About from "@/pages/about";
import Bouquets from "@/pages/bouquets";
import Shop from "@/pages/shop";
import Offers from "@/pages/offers";
import Contact from "@/pages/contact";
import Product from "@/pages/product";
import Cart from "@/pages/cart";
import AdminPanel from "@/pages/admin";
import Checkout from "@/pages/checkout";
import MyOrders from "@/pages/my-orders";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/bouquets" component={Bouquets} />
      <Route path="/shop" component={Shop} />
      <Route path="/offers" component={Offers} />
      <Route path="/contact" component={Contact} />
      <Route path="/product/:id" component={Product} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/my-orders" component={MyOrders} />
      <Route path="/settings" component={Settings} />
      <Route path="/admin" component={AdminPanel} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [cartOpen, setCartOpen] = useState(false);

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
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
