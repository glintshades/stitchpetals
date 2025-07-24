import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, Truck, CheckCircle, Clock, X } from "lucide-react";

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: string;
  selectedColor?: string;
}

interface Order {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress: string;
  totalAmount: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderItems: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'processing':
      return <Package className="h-4 w-4" />;
    case 'shipped':
      return <Truck className="h-4 w-4" />;
    case 'delivered':
      return <CheckCircle className="h-4 w-4" />;
    case 'cancelled':
      return <X className="h-4 w-4" />;
    default:
      return <Clock className="h-4 w-4" />;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'processing':
      return 'bg-blue-100 text-blue-800';
    case 'shipped':
      return 'bg-purple-100 text-purple-800';
    case 'delivered':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getTrackingSteps = (status: string) => {
  const steps = [
    { key: 'pending', label: 'Order Placed', completed: true },
    { key: 'processing', label: 'Processing', completed: false },
    { key: 'shipped', label: 'Shipped', completed: false },
    { key: 'delivered', label: 'Delivered', completed: false }
  ];

  const statusOrder = ['pending', 'processing', 'shipped', 'delivered'];
  const currentIndex = statusOrder.indexOf(status);

  return steps.map((step, index) => ({
    ...step,
    completed: index <= currentIndex
  }));
};

export default function MyOrders() {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/user/orders"],
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-wine mb-8">My Orders</h1>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-wine mb-8">My Orders</h1>
          <div className="py-12">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 mb-2">No orders yet</h2>
            <p className="text-gray-500">Start shopping to see your orders here!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-wine mb-8">My Orders</h1>
        
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id} className="w-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-wine">Order #{order.id}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={`${getStatusColor(order.status)} flex items-center gap-1`}>
                    {getStatusIcon(order.status)}
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Tracking Progress */}
                {order.status !== 'cancelled' && (
                  <div className="space-y-4">
                    <h3 className="font-semibold text-wine">Order Tracking</h3>
                    <div className="flex items-center justify-between">
                      {getTrackingSteps(order.status).map((step, index) => (
                        <div key={step.key} className="flex flex-col items-center flex-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            step.completed ? 'bg-wine text-white' : 'bg-gray-200 text-gray-400'
                          }`}>
                            {step.completed ? <CheckCircle className="h-4 w-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                          </div>
                          <p className={`text-xs mt-2 text-center ${
                            step.completed ? 'text-wine font-medium' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </p>
                          {index < getTrackingSteps(order.status).length - 1 && (
                            <div className={`absolute h-0.5 w-full top-4 left-1/2 transform -translate-y-1/2 ${
                              step.completed ? 'bg-wine' : 'bg-gray-200'
                            }`} style={{ width: 'calc(100% - 2rem)', marginLeft: '1rem' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <Separator />
                
                {/* Order Items */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-wine">Items Ordered</h3>
                  {order.orderItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center py-2">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        {item.selectedColor && (
                          <p className="text-sm text-gray-600">Color: {item.selectedColor}</p>
                        )}
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">${item.price}</p>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Amount:</span>
                    <span className="text-xl font-bold text-wine">${order.totalAmount}</span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium">Shipping Address:</span> {order.shippingAddress}</p>
                    {order.customerPhone && (
                      <p><span className="font-medium">Phone:</span> {order.customerPhone}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}