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
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Facebook, Instagram, Mail } from "lucide-react";

interface LoginDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

export function LoginDialog({ isOpen, onClose, onSwitchToRegister }: LoginDialogProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Logged in successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      onClose();
      setUsername("");
      setPassword("");
    },
    onError: (error: any) => {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const socialLoginMutation = useMutation({
    mutationFn: async (provider: string) => {
      const response = await fetch(`/api/auth/oauth/${provider}`, {
        method: "POST",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Social login failed");
      }

      return response.json();
    },
    onSuccess: (data) => {
      if (data.authUrl) {
        // Redirect to OAuth provider
        window.location.href = data.authUrl;
      }
    },
    onError: (error: any) => {
      toast({
        title: "Social Login Failed",
        description: error.message || "Failed to connect with social media account",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate({ username, password });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Sign In</DialogTitle>
          <DialogDescription>
            Sign in to your account using your credentials or social media.
          </DialogDescription>
        </DialogHeader>
        
        {/* Social Login Options */}
        <div className="space-y-3 px-6 pb-4">
          <div className="grid grid-cols-3 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => socialLoginMutation.mutate('facebook')}
              disabled={socialLoginMutation.isPending}
              className="flex items-center gap-2"
              data-testid="button-facebook-login"
            >
              <Facebook className="h-4 w-4 text-blue-600" />
              Facebook
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => socialLoginMutation.mutate('instagram')}
              disabled={socialLoginMutation.isPending}
              className="flex items-center gap-2"
              data-testid="button-instagram-login"
            >
              <Instagram className="h-4 w-4 text-pink-600" />
              Instagram
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => socialLoginMutation.mutate('google')}
              disabled={socialLoginMutation.isPending}
              className="flex items-center gap-2"
              data-testid="button-email-login"
            >
              <Mail className="h-4 w-4 text-gray-600" />
              Google
            </Button>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="col-span-3"
                placeholder="Enter your username"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="col-span-3"
                placeholder="Enter your password"
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col space-y-2">
            <Button type="submit" disabled={loginMutation.isPending} className="w-full">
              {loginMutation.isPending ? "Signing In..." : "Sign In"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onSwitchToRegister}
              className="w-full"
            >
              Don't have an account? Sign up
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}