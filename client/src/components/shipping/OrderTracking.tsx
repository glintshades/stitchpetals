import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Package, Truck, MapPin, Clock, Search } from 'lucide-react';

interface TrackingEvent {
  timestamp: string;
  eventType: string;
  eventDescription: string;
  location?: string;
}

interface TrackingInfo {
  trackingNumber: string;
  status: string;
  statusDescription: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  location?: string;
  events: TrackingEvent[];
}

interface OrderTrackingProps {
  initialTrackingNumber?: string;
}

export function OrderTracking({ initialTrackingNumber = '' }: OrderTrackingProps) {
  const [trackingNumber, setTrackingNumber] = useState(initialTrackingNumber);
  const [searchTrackingNumber, setSearchTrackingNumber] = useState('');

  const { data: trackingData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/shipping/track', trackingNumber],
    queryFn: async () => {
      if (!trackingNumber.trim()) return null;
      const response = await fetch(`/api/shipping/track/${encodeURIComponent(trackingNumber)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch tracking information');
      }
      return response.json();
    },
    enabled: !!trackingNumber.trim(),
    retry: 1,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  const handleSearch = () => {
    if (searchTrackingNumber.trim()) {
      setTrackingNumber(searchTrackingNumber.trim());
    }
  };

  const getStatusColor = (status: string): string => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('delivered')) return 'bg-green-500';
    if (statusLower.includes('transit') || statusLower.includes('progress')) return 'bg-blue-500';
    if (statusLower.includes('picked') || statusLower.includes('shipped')) return 'bg-purple-500';
    if (statusLower.includes('exception') || statusLower.includes('delayed')) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const tracking: TrackingInfo | null = trackingData?.tracking || null;

  return (
    <div className="space-y-6" data-testid="order-tracking-container">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Track Your Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter tracking number"
              value={searchTrackingNumber}
              onChange={(e) => setSearchTrackingNumber(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              data-testid="input-tracking-number"
            />
            <Button 
              onClick={handleSearch}
              disabled={!searchTrackingNumber.trim() || isLoading}
              data-testid="button-track-order"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
              Track
            </Button>
          </div>
          
          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg" data-testid="tracking-error">
              <div className="flex items-center gap-2 text-red-600">
                <Package className="h-4 w-4" />
                <span>Tracking information not found</span>
              </div>
              <p className="text-sm text-red-600 mt-1">
                Please check the tracking number and try again, or contact support if you continue to have issues.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {tracking && (
        <Card data-testid="tracking-info-card">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">Tracking #{tracking.trackingNumber}</CardTitle>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={`${getStatusColor(tracking.status)} text-white`}>
                    {tracking.status}
                  </Badge>
                  <span className="text-sm text-gray-600">{tracking.statusDescription}</span>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => refetch()}
                data-testid="button-refresh-tracking"
              >
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Delivery Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tracking.estimatedDeliveryDate && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">Estimated Delivery</div>
                      <div className="text-sm text-gray-600">
                        {new Date(tracking.estimatedDeliveryDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
                
                {tracking.actualDeliveryDate && (
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-green-500" />
                    <div>
                      <div className="text-sm font-medium">Delivered On</div>
                      <div className="text-sm text-gray-600">
                        {new Date(tracking.actualDeliveryDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )}
                
                {tracking.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="text-sm font-medium">Current Location</div>
                      <div className="text-sm text-gray-600">{tracking.location}</div>
                    </div>
                  </div>
                )}
              </div>

              {tracking.events && tracking.events.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      Tracking History
                    </h4>
                    <div className="space-y-3">
                      {tracking.events.map((event, index) => (
                        <div 
                          key={`${event.timestamp}-${index}`}
                          className="flex gap-3 pb-3 border-b border-gray-100 last:border-0"
                          data-testid={`tracking-event-${index}`}
                        >
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{event.eventDescription}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(event.timestamp).toLocaleString()}
                              {event.location && ` • ${event.location}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}