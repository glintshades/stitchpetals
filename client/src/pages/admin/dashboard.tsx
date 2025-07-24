import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  ShoppingCart, 
  Users, 
  Mail, 
  TrendingUp, 
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";

import type { Order, Product, ContactSubmission } from "@shared/schema";
import AdminProducts from "./products";
import AdminOrders from "./orders";

// Contact submissions component
function ContactsList() {
  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ["/api/admin/contacts"],
    queryFn: async () => {
      const response = await fetch("/api/admin/contacts", {
        headers: { Authorization: "Bearer admin-token" }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading contact messages...</div>;
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No contact messages yet. Messages will appear here when customers submit the contact form.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {contacts.map((contact: ContactSubmission) => (
        <div key={contact.id} className="border border-gray-200 rounded-lg p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold">{contact.subject}</h3>
              <p className="text-sm text-gray-600">{contact.name} - {contact.email}</p>
              <p className="text-sm text-gray-500">
                {new Date(contact.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded">
            {contact.message}
          </p>
        </div>
      ))}
    </div>
  );
}

interface AdminDashboardProps {
  onLogout: () => void;
}

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/admin/orders"],
    queryFn: async () => {
      const response = await fetch("/api/admin/orders", {
        headers: { Authorization: "Bearer admin-token" }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      return response.json();
    },
  });

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["/api/admin/products"],
    queryFn: async () => {
      const response = await fetch("/api/admin/products", {
        headers: { Authorization: "Bearer admin-token" }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
  });

  // Calculate dashboard stats
  const totalOrders = orders.length;
  const pendingOrders = orders.filter((order: Order) => order.status === "pending").length;
  const totalProducts = products.length;
  const totalRevenue = orders.reduce((sum: number, order: Order) => sum + parseFloat(order.totalAmount || "0"), 0);

  return (
    <div className="min-h-screen bg-ivory">
      {/* Header */}
      <header className="bg-white border-b border-soft-pink">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="font-playfair text-2xl font-bold wine">
              Stitched Petals Admin
            </h1>
            <Button
              variant="outline"
              onClick={onLogout}
              className="wine border-wine hover:bg-wine hover:text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold wine">{totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold wine">{pendingOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold wine">{totalProducts}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold wine">${totalRevenue.toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="contacts">Contact Messages</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <AdminOrders />
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <AdminProducts />
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Messages</CardTitle>
                <CardDescription>
                  Customer inquiries and messages
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ContactsList />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>


      </div>
    </div>
  );
}