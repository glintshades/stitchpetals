import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { Package, Calendar, User, MapPin, Phone, Mail, CreditCard, Truck, ExternalLink } from "lucide-react";

type Order = {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  items: Array<{
    productName: string;
    quantity: number;
    selectedColor: string;
    price: string;
  }>;
  subtotalAmount?: string;
  taxAmount?: string;
  totalAmount: string;
  paymentId?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  // Shipping information
  shippingCost?: string;
  shippingMethod?: string;
  trackingNumber?: string;
  shippingLabelUrl?: string;
  shippedAt?: string;
  estimatedDelivery?: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
  updatedAt?: string;
};

export default function AdminOrders() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer admin-token"
        },
      });
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
    },
  });

  const createShipmentMutation = useMutation({
    mutationFn: async ({ orderId, serviceType }: { orderId: number; serviceType?: string }) => {
      const response = await apiRequest("POST", "/api/shipping/create", { orderId, serviceType });
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500";
      case "processing":
        return "bg-blue-500";
      case "shipped":
        return "bg-purple-500";
      case "delivered":
        return "bg-green-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleStatusUpdate = (orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  }

  const handleCreateShipment = (orderId: number, serviceType?: string) => {
    createShipmentMutation.mutate({ orderId, serviceType });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#8B4B6B] mb-2">Order Management</h1>
        <p className="text-gray-600">Manage and track customer orders</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">All Orders ({orders?.length || 0})</h2>
          
          {orders?.map((order) => (
            <Card 
              key={order.id} 
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedOrder?.id === order.id ? 'ring-2 ring-[#8B4B6B]' : ''
              }`}
              onClick={() => setSelectedOrder(order)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold">Order #{order.id}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {order.customerName}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} text-white`}>
                    {getStatusText(order.status)}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-end">
                  <div className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                  <div className="font-semibold text-[#8B4B6B]">
                    ${order.totalAmount}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {(!orders || orders.length === 0) && (
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No orders found</p>
            </div>
          )}
        </div>

        {/* Order Details */}
        <div>
          {selectedOrder ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Order #{selectedOrder.id}</span>
                  <Badge className={`${getStatusColor(selectedOrder.status)} text-white`}>
                    {getStatusText(selectedOrder.status)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Status Update */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Update Order Status</label>
                  <Select
                    value={selectedOrder.status}
                    onValueChange={(value) => handleStatusUpdate(selectedOrder.id, value)}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  {updateStatusMutation.isPending && (
                    <p className="text-sm text-gray-500 mt-1">Updating status...</p>
                  )}
                </div>

                <Separator />

                {/* Customer Information */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Customer & Shipping Details
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3 text-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-3 w-3 text-gray-400" />
                          <span className="font-medium text-gray-700">Customer Name:</span>
                        </div>
                        <span className="ml-5">{selectedOrder.customerName}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span className="font-medium text-gray-700">Email:</span>
                        </div>
                        <span className="ml-5">{selectedOrder.customerEmail}</span>
                      </div>
                    </div>
                    
                    {selectedOrder.customerPhone && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span className="font-medium text-gray-700">Phone:</span>
                        </div>
                        <span className="ml-5">{selectedOrder.customerPhone}</span>
                      </div>
                    )}
                    
                    <div>
                      <div className="flex items-start gap-2 mb-2">
                        <MapPin className="h-3 w-3 text-gray-400 mt-1" />
                        <span className="font-medium text-gray-700">Shipping Address:</span>
                      </div>
                      <span className="ml-5 block">{selectedOrder.shippingAddress}</span>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order Items
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-sm text-gray-600">
                            Color: {item.selectedColor} • Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${item.price}</p>
                          <p className="text-sm text-gray-600">
                            ${(parseFloat(item.price) * item.quantity).toFixed(2)} total
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Order Summary */}
                <div className="space-y-2">
                  <h4 className="font-semibold mb-3">Order Summary</h4>
                  {selectedOrder.subtotalAmount && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Subtotal:</span>
                      <span className="font-medium">${selectedOrder.subtotalAmount}</span>
                    </div>
                  )}
                  {selectedOrder.taxAmount && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Sales Tax (6.67%):</span>
                      <span className="font-medium">${selectedOrder.taxAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center font-semibold text-lg border-t pt-2">
                    <span>Total Amount:</span>
                    <span className="text-[#8B4B6B]">${selectedOrder.totalAmount}</span>
                  </div>
                </div>

                <Separator />

                {/* Payment Information */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Payment Information
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Payment Method:</span>
                      <span className="font-medium capitalize">{selectedOrder.paymentMethod || 'Clover'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Payment Status:</span>
                      <span className={`font-medium capitalize ${
                        selectedOrder.paymentStatus === 'succeeded' ? 'text-green-600' : 
                        selectedOrder.paymentStatus === 'failed' ? 'text-red-600' : 
                        'text-yellow-600'
                      }`}>
                        {selectedOrder.paymentStatus || 'Processing'}
                      </span>
                    </div>
                    {selectedOrder.paymentId && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Payment ID:</span>
                        <span className="font-mono text-xs">{selectedOrder.paymentId}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Shipping Information */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Shipping Management
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    {selectedOrder.trackingNumber ? (
                      // Existing shipment
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Tracking Number:</span>
                          <span className="font-mono text-sm">{selectedOrder.trackingNumber}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Shipping Method:</span>
                          <span className="text-sm">{selectedOrder.shippingMethod || 'FedEx Ground'}</span>
                        </div>
                        {selectedOrder.shippingCost && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Shipping Cost:</span>
                            <span className="text-sm">${selectedOrder.shippingCost}</span>
                          </div>
                        )}
                        {selectedOrder.shippedAt && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Shipped At:</span>
                            <span className="text-sm">{new Date(selectedOrder.shippedAt).toLocaleString()}</span>
                          </div>
                        )}
                        {selectedOrder.estimatedDelivery && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-700">Est. Delivery:</span>
                            <span className="text-sm">{new Date(selectedOrder.estimatedDelivery).toLocaleDateString()}</span>
                          </div>
                        )}
                        {selectedOrder.shippingLabelUrl && (
                          <div className="pt-2">
                            <a 
                              href={selectedOrder.shippingLabelUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm"
                            >
                              <ExternalLink className="h-3 w-3" />
                              View Shipping Label
                            </a>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Create new shipment
                      <div className="space-y-3">
                        <p className="text-sm text-gray-600">No shipment created yet</p>
                        {selectedOrder.status === 'processing' && (
                          <div className="space-y-3">
                            <div>
                              <label className="text-sm font-medium mb-2 block">FedEx Service Type</label>
                              <Select defaultValue="FEDEX_GROUND">
                                <SelectTrigger>
                                  <SelectValue placeholder="Select shipping service" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="FEDEX_GROUND">FedEx Ground</SelectItem>
                                  <SelectItem value="FEDEX_EXPRESS_SAVER">FedEx Express Saver</SelectItem>
                                  <SelectItem value="FEDEX_2_DAY">FedEx 2Day</SelectItem>
                                  <SelectItem value="STANDARD_OVERNIGHT">FedEx Standard Overnight</SelectItem>
                                  <SelectItem value="PRIORITY_OVERNIGHT">FedEx Priority Overnight</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <Button 
                              onClick={() => handleCreateShipment(selectedOrder.id)}
                              disabled={createShipmentMutation.isPending}
                              className="w-full"
                            >
                              {createShipmentMutation.isPending ? 'Creating Shipment...' : 'Create FedEx Shipment'}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3" />
                    Order placed: {new Date(selectedOrder.createdAt).toLocaleString()}
                  </div>
                  {selectedOrder.updatedAt && selectedOrder.updatedAt !== selectedOrder.createdAt && (
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3" />
                      Last updated: {new Date(selectedOrder.updatedAt).toLocaleString()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Select an order to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}