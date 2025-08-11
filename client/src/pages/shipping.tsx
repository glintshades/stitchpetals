import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { OrderTracking } from '@/components/shipping/OrderTracking';
import { Truck, Package, Clock, MapPin } from 'lucide-react';

export default function ShippingPage() {
  const [activeTab, setActiveTab] = useState<'services' | 'tracking'>('services');

  const services = [
    {
      code: 'PRIORITY_OVERNIGHT',
      name: 'FedEx Priority Overnight',
      description: 'Next business day by 10:30 AM',
      deliveryTime: '1 business day',
      price: 'From $25.99'
    },
    {
      code: 'STANDARD_OVERNIGHT', 
      name: 'FedEx Standard Overnight',
      description: 'Next business day by 3:00 PM',
      deliveryTime: '1 business day',
      price: 'From $19.99'
    },
    {
      code: 'FEDEX_2_DAY',
      name: 'FedEx 2Day',
      description: 'Second business day',
      deliveryTime: '2 business days',
      price: 'From $12.99'
    },
    {
      code: 'FEDEX_EXPRESS_SAVER',
      name: 'FedEx Express Saver',
      description: 'Third business day',
      deliveryTime: '3 business days',
      price: 'From $9.99'
    },
    {
      code: 'FEDEX_GROUND',
      name: 'FedEx Ground',
      description: '1-5 business days based on distance',
      deliveryTime: '1-5 business days',
      price: 'From $7.99'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-purple-900 dark:text-white mb-4">
              Shipping & Tracking
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Fast, reliable shipping for your crochet flower orders with FedEx integration
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <Button
              onClick={() => setActiveTab('services')}
              variant={activeTab === 'services' ? 'default' : 'outline'}
              className="flex-1"
              data-testid="tab-shipping-services"
            >
              <Truck className="h-4 w-4 mr-2" />
              Shipping Services
            </Button>
            <Button
              onClick={() => setActiveTab('tracking')}
              variant={activeTab === 'tracking' ? 'default' : 'outline'}
              className="flex-1"
              data-testid="tab-order-tracking"
            >
              <Package className="h-4 w-4 mr-2" />
              Order Tracking
            </Button>
          </div>

          {activeTab === 'services' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Available Shipping Options
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {services.map((service) => (
                      <div
                        key={service.code}
                        className="border rounded-lg p-4 hover:border-purple-300 transition-colors"
                        data-testid={`service-${service.code.toLowerCase()}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-2">
                            <h3 className="font-semibold text-lg">{service.name}</h3>
                            <p className="text-gray-600 dark:text-gray-300">{service.description}</p>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-gray-500" />
                              <Badge variant="secondary">{service.deliveryTime}</Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-purple-600">
                              {service.price}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Packaging & Care
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Careful Packaging</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Each crochet flower arrangement is carefully wrapped and cushioned to prevent damage during transit.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Temperature Protection</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Our packaging protects against temperature extremes to maintain product quality.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                      <div>
                        <h4 className="font-medium">Tracking Included</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          All shipments include tracking numbers so you can monitor your order's progress.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'tracking' && (
            <OrderTracking />
          )}
        </div>
      </div>
    </div>
  );
}