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
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface RegisterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function RegisterDialog({ isOpen, onClose, onSwitchToLogin }: RegisterDialogProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: async (userData: { username: string; password: string }) => {
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
      setUsername("");
      setPassword("");
      setConfirmPassword("");
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
        description: "Please fill in all fields",
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

    registerMutation.mutate({ username, password });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Account</DialogTitle>
          <DialogDescription>
            Join GlintShades to track your orders and save your preferences.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="register-username" className="text-right">
                Username
              </Label>
              <Input
                id="register-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="col-span-3"
                placeholder="Choose a username"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="register-password" className="text-right">
                Password
              </Label>
              <Input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                placeholder="Create a password"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="confirm-password" className="text-right">
                Confirm
              </Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="col-span-3"
                placeholder="Confirm your password"
              />
            </div>
          </div>
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