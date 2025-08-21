import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    shippingName: "",
    shippingPhone: "",
    shippingAddressLine1: "",
    shippingAddressLine2: "",
    shippingCity: "",
    shippingState: "",
    shippingZipCode: "",
    shippingCountry: "US",
    shippingDeliveryInstructions: "",
    setAsDefault: true,
  });

  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  const registerMutation = useMutation({
    mutationFn: async (userData: typeof formData) => {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Registration successful!",
        description: "Your account has been created and you are now logged in.",
      });
      window.location.href = "/";
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.username || !formData.password || !formData.email) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate(formData);
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle data-testid="text-page-title">Create Account</CardTitle>
            <CardDescription>
              Create your account and optionally add your default shipping information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Account Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleChange("username", e.target.value)}
                      data-testid="input-username"
                      disabled={registerMutation.isPending}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      data-testid="input-email"
                      disabled={registerMutation.isPending}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    data-testid="input-password"
                    disabled={registerMutation.isPending}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Minimum 6 characters
                  </p>
                </div>
              </div>

              {/* Shipping Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Default Shipping Information (Optional)</h3>
                <p className="text-sm text-muted-foreground">
                  Add your shipping address now to save time during checkout
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="shippingName">Recipient Name</Label>
                    <Input
                      id="shippingName"
                      type="text"
                      value={formData.shippingName}
                      onChange={(e) => handleChange("shippingName", e.target.value)}
                      data-testid="input-shipping-name"
                      disabled={registerMutation.isPending}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shippingPhone">Phone Number</Label>
                    <Input
                      id="shippingPhone"
                      type="tel"
                      value={formData.shippingPhone}
                      onChange={(e) => handleChange("shippingPhone", e.target.value)}
                      data-testid="input-shipping-phone"
                      disabled={registerMutation.isPending}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="shippingAddressLine1">Street Address</Label>
                  <Input
                    id="shippingAddressLine1"
                    type="text"
                    value={formData.shippingAddressLine1}
                    onChange={(e) => handleChange("shippingAddressLine1", e.target.value)}
                    data-testid="input-shipping-address1"
                    disabled={registerMutation.isPending}
                  />
                </div>

                <div>
                  <Label htmlFor="shippingAddressLine2">Apartment, suite, etc. (optional)</Label>
                  <Input
                    id="shippingAddressLine2"
                    type="text"
                    value={formData.shippingAddressLine2}
                    onChange={(e) => handleChange("shippingAddressLine2", e.target.value)}
                    data-testid="input-shipping-address2"
                    disabled={registerMutation.isPending}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="shippingCity">City</Label>
                    <Input
                      id="shippingCity"
                      type="text"
                      value={formData.shippingCity}
                      onChange={(e) => handleChange("shippingCity", e.target.value)}
                      data-testid="input-shipping-city"
                      disabled={registerMutation.isPending}
                    />
                  </div>
                  <div>
                    <Label htmlFor="shippingState">State</Label>
                    <Input
                      id="shippingState"
                      type="text"
                      value={formData.shippingState}
                      onChange={(e) => handleChange("shippingState", e.target.value)}
                      data-testid="input-shipping-state"
                      disabled={registerMutation.isPending}
                      maxLength={2}
                      placeholder="CA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="shippingZipCode">ZIP Code</Label>
                    <Input
                      id="shippingZipCode"
                      type="text"
                      value={formData.shippingZipCode}
                      onChange={(e) => handleChange("shippingZipCode", e.target.value)}
                      data-testid="input-shipping-zip"
                      disabled={registerMutation.isPending}
                      maxLength={10}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="shippingDeliveryInstructions">Delivery Instructions (optional)</Label>
                  <Input
                    id="shippingDeliveryInstructions"
                    type="text"
                    value={formData.shippingDeliveryInstructions}
                    onChange={(e) => handleChange("shippingDeliveryInstructions", e.target.value)}
                    data-testid="input-delivery-instructions"
                    disabled={registerMutation.isPending}
                    placeholder="Leave at door, call when arrived, etc."
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                data-testid="button-register"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/login">
                  <span className="text-primary hover:underline cursor-pointer" data-testid="link-login">
                    Sign in here
                  </span>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}