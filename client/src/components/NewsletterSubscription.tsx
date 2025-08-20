import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function NewsletterSubscription() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { toast } = useToast();

  const subscriptionMutation = useMutation({
    mutationFn: async (email: string) => {
      console.log("Attempting to subscribe email:", email);
      const response = await apiRequest("POST", "/api/newsletter/subscribe", {
        email,
        source: "website"
      });
      console.log("Subscription response:", response);
      return response;
    },
    onSuccess: (response) => {
      console.log("Subscription successful:", response);
      setIsSubmitted(true);
      setEmail("");
      toast({
        title: "Success!",
        description: "You've been successfully subscribed to our newsletter.",
        duration: 5000,
      });
    },
    onError: (error: any) => {
      console.error("Subscription error:", error);
      toast({
        title: "Subscription Error",
        description: error.message || "Failed to subscribe. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    subscriptionMutation.mutate(email);
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
        <div className="text-center">
          <div className="text-4xl mb-2">✉️</div>
          <p className="text-white text-lg font-semibold">Thank you for subscribing!</p>
          <p className="text-pink-100 text-sm mt-2">
            You'll receive our latest updates and special offers.
          </p>
        </div>
        <Button 
          onClick={() => setIsSubmitted(false)}
          variant="outline"
          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
        >
          Subscribe Another Email
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
      <input
        type="email"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-wine focus:outline-none shadow-lg"
        data-testid="input-newsletter-email"
        disabled={subscriptionMutation.isPending}
      />
      <Button 
        type="submit"
        className="bg-white text-wine hover:bg-soft-pink px-8 py-3 font-semibold shadow-lg disabled:opacity-50"
        disabled={subscriptionMutation.isPending}
        data-testid="button-newsletter-subscribe"
      >
        {subscriptionMutation.isPending ? "Subscribing..." : "Subscribe"}
      </Button>
    </form>
  );
}