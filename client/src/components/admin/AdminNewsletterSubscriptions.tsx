import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Mail, Search, Users, UserCheck, UserX, RefreshCw } from "lucide-react";

interface NewsletterSubscription {
  id: number;
  email: string;
  source: string;
  isActive: boolean;
  subscribedAt: string;
  unsubscribedAt: string | null;
}

export function AdminNewsletterSubscriptions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: subscriptions = [], isLoading, error } = useQuery<NewsletterSubscription[]>({
    queryKey: ["/api/admin/newsletter-subscriptions"],
    queryFn: async () => {
      const response = await fetch("/api/admin/newsletter-subscriptions", {
        headers: { Authorization: "Bearer admin-token" }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch newsletter subscriptions');
      }
      return response.json();
    },
  });

  const resubscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/admin/newsletter/resubscribe", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: "Bearer admin-token" 
        },
        body: JSON.stringify({ email })
      });
      if (!response.ok) {
        throw new Error('Failed to resubscribe user');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User has been resubscribed to newsletter",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter-subscriptions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to resubscribe user",
        variant: "destructive",
      });
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (!response.ok) {
        throw new Error('Failed to unsubscribe user');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "User has been unsubscribed from newsletter",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter-subscriptions"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to unsubscribe user",
        variant: "destructive",
      });
    },
  });

  // Filter subscriptions based on search and status
  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = sub.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && sub.isActive) ||
      (filterStatus === "inactive" && !sub.isActive);
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const activeSubscribers = subscriptions.filter(sub => sub.isActive).length;
  const totalSubscribers = subscriptions.length;
  const unsubscribedCount = subscriptions.filter(sub => !sub.isActive).length;

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center text-muted-foreground">
            <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Error loading newsletter subscriptions</p>
            <Button 
              variant="outline" 
              onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletter-subscriptions"] })}
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subscribers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubscribers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSubscribers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
            <UserX className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unsubscribedCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-subscriptions"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            onClick={() => setFilterStatus("all")}
            size="sm"
            data-testid="button-filter-all"
          >
            All ({totalSubscribers})
          </Button>
          <Button
            variant={filterStatus === "active" ? "default" : "outline"}
            onClick={() => setFilterStatus("active")}
            size="sm"
            data-testid="button-filter-active"
          >
            Active ({activeSubscribers})
          </Button>
          <Button
            variant={filterStatus === "inactive" ? "default" : "outline"}
            onClick={() => setFilterStatus("inactive")}
            size="sm"
            data-testid="button-filter-inactive"
          >
            Inactive ({unsubscribedCount})
          </Button>
        </div>
      </div>

      {/* Subscriptions List */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading newsletter subscriptions...</p>
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No newsletter subscriptions found</p>
              {searchTerm && (
                <p className="text-sm mt-2">Try adjusting your search criteria</p>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {filteredSubscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="p-4 flex items-center justify-between hover:bg-muted/50"
                  data-testid={`subscription-row-${subscription.id}`}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">
                        {subscription.email}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge 
                          variant={subscription.isActive ? "default" : "secondary"}
                          className={subscription.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                        >
                          {subscription.isActive ? "Active" : "Unsubscribed"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          From {subscription.source}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Subscribed: {new Date(subscription.subscribedAt).toLocaleDateString()}
                        {subscription.unsubscribedAt && (
                          <span className="ml-2">
                            Unsubscribed: {new Date(subscription.unsubscribedAt).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {subscription.isActive ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => unsubscribeMutation.mutate(subscription.email)}
                        disabled={unsubscribeMutation.isPending}
                        data-testid={`button-unsubscribe-${subscription.id}`}
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        Unsubscribe
                      </Button>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resubscribeMutation.mutate(subscription.email)}
                        disabled={resubscribeMutation.isPending}
                        data-testid={`button-resubscribe-${subscription.id}`}
                      >
                        <UserCheck className="h-4 w-4 mr-1" />
                        Resubscribe
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}