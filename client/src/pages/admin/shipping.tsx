import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Package, Truck, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

export default function AdminShippingPage() {
  const [testAddress, setTestAddress] = useState({
    street: '123 Main St',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90210'
  });
  const [trackingNumber, setTrackingNumber] = useState('');

  // Test FedEx connection
  const { data: connectionData, isLoading: connectionLoading, refetch: refetchConnection } = useQuery({
    queryKey: ['/api/shipping/test'],
    retry: 1,
    staleTime: 2 * 60 * 1000,
  });

  // Get shipping rates
  const ratesMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/shipping/rates', {
        method: 'POST',
        body: {
          shippingAddress: testAddress,
          items: [
            { id: 1, name: 'Test Crochet Bouquet', price: 29.99, quantity: 1 }
          ]
        }
      });
    },
  });

  // Track shipment
  const trackingMutation = useMutation({
    mutationFn: async (trackingNum: string) => {
      const response = await fetch(`/api/shipping/track/${encodeURIComponent(trackingNum)}`);
      if (!response.ok) throw new Error('Failed to track shipment');
      return response.json();
    },
  });

  const testRates = () => {
    ratesMutation.mutate();
  };

  const testTracking = () => {
    if (trackingNumber.trim()) {
      trackingMutation.mutate(trackingNumber.trim());
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-shipping-page">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">FedEx Shipping Integration</h1>
        <Button
          onClick={() => refetchConnection()}
          disabled={connectionLoading}
          variant="outline"
          data-testid="button-refresh-connection"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Connection Status */}
      <Card data-testid="connection-status-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            FedEx API Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {connectionLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Checking connection...</span>
            </div>
          ) : connectionData?.status === 'connected' ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Connected Successfully</span>
              </div>
              <p className="text-sm text-gray-600">{connectionData.message}</p>
              <div className="flex gap-2">
                {connectionData.services?.map((service: string) => (
                  <Badge key={service} variant="secondary">
                    {service.replace('_', ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-red-600">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Connection Failed</span>
              </div>
              <Alert>
                <AlertDescription>
                  FedEx API connection failed. Please check your API credentials and try again.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rate Testing */}
      <Card data-testid="rate-testing-card">
        <CardHeader>
          <CardTitle>Test Shipping Rates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="Street Address"
                value={testAddress.street}
                onChange={(e) => setTestAddress({ ...testAddress, street: e.target.value })}
                data-testid="input-test-street"
              />
              <Input
                placeholder="City"
                value={testAddress.city}
                onChange={(e) => setTestAddress({ ...testAddress, city: e.target.value })}
                data-testid="input-test-city"
              />
              <Input
                placeholder="State"
                value={testAddress.state}
                onChange={(e) => setTestAddress({ ...testAddress, state: e.target.value })}
                data-testid="input-test-state"
              />
              <Input
                placeholder="Zip Code"
                value={testAddress.zipCode}
                onChange={(e) => setTestAddress({ ...testAddress, zipCode: e.target.value })}
                data-testid="input-test-zipcode"
              />
            </div>
            
            <Button
              onClick={testRates}
              disabled={ratesMutation.isPending}
              data-testid="button-test-rates"
            >
              {ratesMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Truck className="h-4 w-4 mr-2" />
              )}
              Calculate Shipping Rates
            </Button>

            {ratesMutation.data && (
              <div className="mt-4 space-y-2">
                <h4 className="font-medium">Available Rates:</h4>
                {ratesMutation.data.rates?.map((rate: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded">
                    <div>
                      <span className="font-medium">{rate.serviceName}</span>
                      <div className="text-sm text-gray-600">{rate.transitTime}</div>
                    </div>
                    <span className="font-bold">${rate.totalNetCharge?.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            {ratesMutation.error && (
              <Alert>
                <AlertDescription>
                  Rate calculation failed: {(ratesMutation.error as Error).message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tracking Testing */}
      <Card data-testid="tracking-testing-card">
        <CardHeader>
          <CardTitle>Test Shipment Tracking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter tracking number (e.g., 1234567890123)"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                data-testid="input-tracking-number"
              />
              <Button
                onClick={testTracking}
                disabled={trackingMutation.isPending || !trackingNumber.trim()}
                data-testid="button-test-tracking"
              >
                {trackingMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Package className="h-4 w-4" />
                )}
                Track
              </Button>
            </div>

            {trackingMutation.data && (
              <div className="mt-4 p-4 border rounded">
                <h4 className="font-medium mb-2">Tracking Results:</h4>
                <div className="space-y-2">
                  <div>Status: <Badge>{trackingMutation.data.tracking?.status}</Badge></div>
                  <div>Description: {trackingMutation.data.tracking?.statusDescription}</div>
                  {trackingMutation.data.tracking?.location && (
                    <div>Location: {trackingMutation.data.tracking.location}</div>
                  )}
                </div>
              </div>
            )}

            {trackingMutation.error && (
              <Alert>
                <AlertDescription>
                  Tracking failed: {(trackingMutation.error as Error).message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}