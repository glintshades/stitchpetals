import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Truck, Clock, Package } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface ShippingRate {
  serviceType: string;
  serviceName: string;
  totalNetCharge: number;
  currency: string;
  transitTime: string;
  deliveryDate?: string;
}

interface ShippingRatesProps {
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  items: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
  }>;
  onRateSelect: (rate: ShippingRate) => void;
  selectedRate?: ShippingRate;
}

export function ShippingRates({ 
  shippingAddress, 
  items, 
  onRateSelect, 
  selectedRate 
}: ShippingRatesProps) {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // Check FedEx connection status
  const { data: connectionData } = useQuery({
    queryKey: ['/api/shipping/test'],
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get shipping rates
  const { data: ratesData, isLoading: ratesLoading, error: ratesError } = useQuery({
    queryKey: ['/api/shipping/rates', shippingAddress, items],
    queryFn: async () => {
      const response = await apiRequest('/api/shipping/rates', {
        method: 'POST',
        body: { shippingAddress, items }
      });
      return response;
    },
    enabled: !!shippingAddress.street && !!shippingAddress.city && !!shippingAddress.state && !!shippingAddress.zipCode && items.length > 0,
    retry: 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  useEffect(() => {
    if (connectionData?.status === 'connected') {
      setConnectionStatus('connected');
    } else if (connectionData?.status === 'error' || ratesError) {
      setConnectionStatus('error');
    }
  }, [connectionData, ratesError]);

  if (connectionStatus === 'checking') {
    return (
      <Card data-testid="shipping-rates-loading">
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Connecting to FedEx shipping services...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (connectionStatus === 'error') {
    return (
      <Card data-testid="shipping-rates-error">
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-red-600">
              <Package className="h-5 w-5" />
              <span>Shipping service temporarily unavailable</span>
            </div>
            <p className="text-sm text-gray-600">
              Please contact support or try again later. We'll calculate shipping costs for your order.
            </p>
            <Button 
              variant="outline" 
              onClick={() => window.location.reload()}
              data-testid="button-retry-shipping"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (ratesLoading) {
    return (
      <Card data-testid="shipping-rates-calculating">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Calculating shipping rates...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const rates = ratesData?.rates || [];

  if (rates.length === 0) {
    return (
      <Card data-testid="shipping-rates-unavailable">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Shipping Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <p className="text-gray-600">No shipping rates available for this address.</p>
            <p className="text-sm text-gray-500">Please verify your address or contact support.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="shipping-rates-container">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Shipping Options
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rates.map((rate: ShippingRate, index: number) => (
            <div
              key={`${rate.serviceType}-${index}`}
              className={`
                border rounded-lg p-4 cursor-pointer transition-all
                ${selectedRate?.serviceType === rate.serviceType 
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                  : 'border-gray-200 hover:border-gray-300'
                }
              `}
              onClick={() => onRateSelect(rate)}
              data-testid={`shipping-option-${rate.serviceType.toLowerCase()}`}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-medium">{rate.serviceName}</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-3 w-3" />
                    <span>{rate.transitTime}</span>
                    {rate.deliveryDate && (
                      <Badge variant="secondary" className="text-xs">
                        Delivery: {new Date(rate.deliveryDate).toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    ${rate.totalNetCharge.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">{rate.currency}</div>
                </div>
              </div>
              
              {selectedRate?.serviceType === rate.serviceType && (
                <div className="mt-2 pt-2 border-t border-purple-200">
                  <div className="flex items-center gap-2 text-sm text-purple-600">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Selected shipping method</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Package className="h-3 w-3" />
            <span>
              Packages will be carefully prepared for safe delivery of your crochet flowers
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}