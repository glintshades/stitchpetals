import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, User } from "lucide-react";

interface RegisterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterDialog({ isOpen, onClose, onSwitchToLogin }: RegisterDialogProps) {
  // Basic account info
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Shipping info toggle
  const [includeShipping, setIncludeShipping] = useState(false);
  
  // Shipping address fields
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddressLine1, setShippingAddressLine1] = useState("");
  const [shippingAddressLine2, setShippingAddressLine2] = useState("");
  const [shippingCity, setShippingCity] = useState("");
  const [shippingState, setShippingState] = useState("");
  const [shippingZipCode, setShippingZipCode] = useState("");
  const [shippingCountry, setShippingCountry] = useState("US");
  const [shippingDeliveryInstructions, setShippingDeliveryInstructions] = useState("");
  const [setAsDefault, setSetAsDefault] = useState(true); // Default to true for first address
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: async (userData: any) => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Account created successfully! You are now logged in.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onClose();
      // Reset all form fields
      setUsername("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setIncludeShipping(false);
      setShippingName("");
      setShippingPhone("");
      setShippingAddressLine1("");
      setShippingAddressLine2("");
      setShippingCity("");
      setShippingState("");
      setShippingZipCode("");
      setShippingCountry("US");
      setShippingDeliveryInstructions("");
      setSetAsDefault(true);
    },
    onError: (error: any) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }

    // Validate shipping info if included
    if (includeShipping) {
      if (!shippingName.trim() || !shippingPhone.trim() || !shippingAddressLine1.trim() || 
          !shippingCity.trim() || !shippingState.trim() || !shippingZipCode.trim()) {
        toast({
          title: "Error",
          description: "Please fill in all required shipping fields",
          variant: "destructive",
        });
        return;
      }
    }

    const userData = {
      username,
      password,
      email: email.trim() || undefined,
      ...(includeShipping && {
        shippingName,
        shippingPhone,
        shippingAddressLine1,
        shippingAddressLine2: shippingAddressLine2.trim() || undefined,
        shippingCity,
        shippingState,
        shippingZipCode,
        shippingCountry,
        shippingDeliveryInstructions: shippingDeliveryInstructions.trim() || undefined,
        setAsDefault,
      })
    };

    registerMutation.mutate(userData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Create Account</DialogTitle>
          <DialogDescription>
            Join GlintShades to track your orders and save your preferences.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto">
          {/* Account Information */}
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="register-username" className="text-right">
                  Username *
                </Label>
                <Input
                  id="register-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="col-span-3"
                  placeholder="Choose a username"
                  data-testid="input-username"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="register-email" className="text-right">
                  Email
                </Label>
                <Input
                  id="register-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="col-span-3"
                  placeholder="your@email.com (optional)"
                  data-testid="input-email"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="register-password" className="text-right">
                  Password *
                </Label>
                <Input
                  id="register-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="col-span-3"
                  placeholder="Create a password"
                  data-testid="input-password"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="confirm-password" className="text-right">
                  Confirm *
                </Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="col-span-3"
                  placeholder="Confirm your password"
                  data-testid="input-confirm-password"
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Information Toggle */}
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox
              id="include-shipping"
              checked={includeShipping}
              onCheckedChange={(checked) => setIncludeShipping(checked as boolean)}
              data-testid="checkbox-include-shipping"
            />
            <Label htmlFor="include-shipping" className="text-sm font-medium">
              Add shipping address to my profile
            </Label>
          </div>

          {/* Shipping Information */}
          {includeShipping && (
            <Card className="mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Default Shipping Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="shipping-name" className="text-right">
                    Full Name *
                  </Label>
                  <Input
                    id="shipping-name"
                    value={shippingName}
                    onChange={(e) => setShippingName(e.target.value)}
                    className="col-span-3"
                    placeholder="Recipient full name"
                    data-testid="input-shipping-name"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="shipping-phone" className="text-right">
                    Phone *
                  </Label>
                  <Input
                    id="shipping-phone"
                    value={shippingPhone}
                    onChange={(e) => setShippingPhone(e.target.value)}
                    className="col-span-3"
                    placeholder="(555) 123-4567"
                    data-testid="input-shipping-phone"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="shipping-address1" className="text-right">
                    Address *
                  </Label>
                  <Input
                    id="shipping-address1"
                    value={shippingAddressLine1}
                    onChange={(e) => setShippingAddressLine1(e.target.value)}
                    className="col-span-3"
                    placeholder="Street address"
                    data-testid="input-shipping-address1"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="shipping-address2" className="text-right">
                    Address 2
                  </Label>
                  <Input
                    id="shipping-address2"
                    value={shippingAddressLine2}
                    onChange={(e) => setShippingAddressLine2(e.target.value)}
                    className="col-span-3"
                    placeholder="Apt, suite, etc. (optional)"
                    data-testid="input-shipping-address2"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="shipping-city" className="text-right">
                    City *
                  </Label>
                  <Input
                    id="shipping-city"
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    className="col-span-3"
                    placeholder="City"
                    data-testid="input-shipping-city"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid grid-cols-2 items-center gap-2">
                    <Label htmlFor="shipping-state" className="text-right">
                      State *
                    </Label>
                    <Input
                      id="shipping-state"
                      value={shippingState}
                      onChange={(e) => setShippingState(e.target.value)}
                      placeholder="State"
                      data-testid="input-shipping-state"
                    />
                  </div>
                  <div className="grid grid-cols-2 items-center gap-2">
                    <Label htmlFor="shipping-zip" className="text-right">
                      ZIP *
                    </Label>
                    <Input
                      id="shipping-zip"
                      value={shippingZipCode}
                      onChange={(e) => setShippingZipCode(e.target.value)}
                      placeholder="ZIP code"
                      data-testid="input-shipping-zip"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="shipping-instructions" className="text-right">
                    Instructions
                  </Label>
                  <Input
                    id="shipping-instructions"
                    value={shippingDeliveryInstructions}
                    onChange={(e) => setShippingDeliveryInstructions(e.target.value)}
                    className="col-span-3"
                    placeholder="Delivery instructions (optional)"
                    data-testid="input-shipping-instructions"
                  />
                </div>
                
                {/* Set as Default Address Option */}
                <div className="flex items-center space-x-2 pt-4 border-t">
                  <Checkbox
                    id="set-as-default"
                    checked={setAsDefault}
                    onCheckedChange={(checked) => setSetAsDefault(checked as boolean)}
                    data-testid="checkbox-set-as-default"
                  />
                  <Label htmlFor="set-as-default" className="text-sm font-medium">
                    Set as my default shipping address
                  </Label>
                </div>
              </CardContent>
            </Card>
          )}
          <DialogFooter className="flex flex-col space-y-2">
            <Button type="submit" disabled={registerMutation.isPending} className="w-full">
              {registerMutation.isPending ? "Creating Account..." : "Create Account"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onSwitchToLogin}
              className="w-full"
            >
              Already have an account? Sign in
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}