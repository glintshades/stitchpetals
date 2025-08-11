/**
 * FedEx API Integration Service
 * Provides shipping rates, label generation, and tracking
 */

import axios from 'axios';

// FedEx API Configuration
const FEDEX_CONFIG = {
  BASE_URL: 'https://apis.fedex.com',
  SANDBOX_URL: 'https://apis-sandbox.fedex.com',
  API_VERSION: 'v1'
};

// Use sandbox for development, production for live
const BASE_URL = process.env.NODE_ENV === 'production' 
  ? FEDEX_CONFIG.BASE_URL 
  : FEDEX_CONFIG.SANDBOX_URL;

export interface ShippingAddress {
  streetLines: string[];
  city: string;
  stateOrProvinceCode: string;
  postalCode: string;
  countryCode: string;
  residential?: boolean;
}

export interface ShipmentPackage {
  weight: {
    units: 'LB' | 'KG';
    value: number;
  };
  dimensions: {
    length: number;
    width: number;
    height: number;
    units: 'IN' | 'CM';
  };
}

export interface ShippingRateRequest {
  accountNumber: string;
  requestedShipment: {
    shipper: {
      address: ShippingAddress;
    };
    recipient: {
      address: ShippingAddress;
    };
    packagingType: 'YOUR_PACKAGING' | 'FEDEX_BOX' | 'FEDEX_PAK';
    requestedPackageLineItems: ShipmentPackage[];
  };
}

export interface ShippingRate {
  serviceType: string;
  serviceName: string;
  totalNetCharge: number;
  currency: string;
  transitTime: string;
  deliveryDate?: string;
}

export interface TrackingInfo {
  trackingNumber: string;
  status: string;
  statusDescription: string;
  estimatedDeliveryDate?: string;
  actualDeliveryDate?: string;
  location?: string;
  events: Array<{
    timestamp: string;
    eventType: string;
    eventDescription: string;
    location?: string;
  }>;
}

export class FedExService {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor(
    private apiKey: string = process.env.FEDEX_API_KEY || '',
    private secretKey: string = process.env.FEDEX_SECRET_KEY || '',
    private accountNumber: string = process.env.FEDEX_ACCOUNT_NUMBER || ''
  ) {
    if (!this.apiKey || !this.secretKey || !this.accountNumber) {
      console.error('⚠️  FedEx credentials missing. Please set FEDEX_API_KEY, FEDEX_SECRET_KEY, and FEDEX_ACCOUNT_NUMBER');
    }
  }

  // Get OAuth token for API access
  private async getAccessToken(): Promise<string> {
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/oauth/token`,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.apiKey,
          client_secret: this.secretKey
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      // Token expires in seconds, set expiry 5 minutes early for safety
      this.tokenExpiry = new Date(Date.now() + (response.data.expires_in - 300) * 1000);
      
      console.log('✅ FedEx API token obtained successfully');
      return this.accessToken;
    } catch (error) {
      console.error('❌ Failed to get FedEx access token:', error);
      throw new Error('FedEx authentication failed');
    }
  }

  // Get shipping rates for different service types
  async getShippingRates(
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packages: ShipmentPackage[]
  ): Promise<ShippingRate[]> {
    try {
      const token = await this.getAccessToken();

      const requestPayload = {
        accountNumber: {
          value: this.accountNumber
        },
        requestedShipment: {
          shipper: {
            address: fromAddress
          },
          recipient: {
            address: toAddress
          },
          pickupType: 'USE_SCHEDULED_PICKUP',
          serviceType: 'PRIORITY_OVERNIGHT', // Will get rates for all available services
          packagingType: 'YOUR_PACKAGING',
          requestedPackageLineItems: packages.map(pkg => ({
            weight: pkg.weight,
            dimensions: pkg.dimensions
          }))
        }
      };

      const response = await axios.post(
        `${BASE_URL}/rate/v1/rates/quotes`,
        requestPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-locale': 'en_US'
          }
        }
      );

      const rates: ShippingRate[] = [];
      
      if (response.data.output?.rateReplyDetails) {
        for (const rateDetail of response.data.output.rateReplyDetails) {
          const netCharge = rateDetail.ratedShipmentDetails?.[0]?.totalNetCharge;
          
          if (netCharge) {
            rates.push({
              serviceType: rateDetail.serviceType,
              serviceName: this.getServiceName(rateDetail.serviceType),
              totalNetCharge: parseFloat(netCharge.amount),
              currency: netCharge.currency,
              transitTime: rateDetail.operationalDetail?.transitTime || 'Unknown',
              deliveryDate: rateDetail.operationalDetail?.deliveryDate
            });
          }
        }
      }

      console.log(`✅ Retrieved ${rates.length} shipping rates from FedEx`);
      return rates;
    } catch (error) {
      console.error('❌ Failed to get FedEx shipping rates:', error);
      throw new Error('Failed to calculate shipping rates');
    }
  }

  // Track a shipment by tracking number
  async trackShipment(trackingNumber: string): Promise<TrackingInfo | null> {
    try {
      const token = await this.getAccessToken();

      const response = await axios.post(
        `${BASE_URL}/track/v1/trackingnumbers`,
        {
          includeDetailedScans: true,
          trackingInfo: [
            {
              trackingNumberInfo: {
                trackingNumber: trackingNumber
              }
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-locale': 'en_US'
          }
        }
      );

      const trackingData = response.data.output?.completeTrackResults?.[0]?.trackResults?.[0];
      
      if (!trackingData) {
        return null;
      }

      const events = trackingData.scanEvents?.map((event: any) => ({
        timestamp: event.date,
        eventType: event.eventType,
        eventDescription: event.eventDescription,
        location: event.scanLocation?.city
      })) || [];

      return {
        trackingNumber,
        status: trackingData.latestStatusDetail?.code || 'Unknown',
        statusDescription: trackingData.latestStatusDetail?.description || 'No status available',
        estimatedDeliveryDate: trackingData.estimatedDeliveryTimeWindow?.window?.begins,
        actualDeliveryDate: trackingData.actualDeliveryTimestamp,
        location: trackingData.latestStatusDetail?.scanLocation?.city,
        events
      };
    } catch (error) {
      console.error('❌ Failed to track FedEx shipment:', error);
      throw new Error('Failed to track shipment');
    }
  }

  // Helper method to get human-readable service names
  private getServiceName(serviceType: string): string {
    const serviceNames: Record<string, string> = {
      'PRIORITY_OVERNIGHT': 'FedEx Priority Overnight',
      'STANDARD_OVERNIGHT': 'FedEx Standard Overnight',
      'FIRST_OVERNIGHT': 'FedEx First Overnight',
      'FEDEX_2_DAY': 'FedEx 2Day',
      'FEDEX_2_DAY_AM': 'FedEx 2Day A.M.',
      'FEDEX_EXPRESS_SAVER': 'FedEx Express Saver',
      'FEDEX_GROUND': 'FedEx Ground',
      'GROUND_HOME_DELIVERY': 'FedEx Home Delivery',
      'SMART_POST': 'FedEx SmartPost'
    };

    return serviceNames[serviceType] || serviceType;
  }

  // Validate FedEx API connection
  async validateConnection(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      console.log('✅ FedEx API connection validated successfully');
      return !!token;
    } catch (error) {
      console.error('❌ FedEx API connection validation failed:', error);
      return false;
    }
  }

  // Get default shipping address for your business
  getBusinessAddress(): ShippingAddress {
    return {
      streetLines: ['123 Business St'], // Replace with your business address
      city: 'Business City',
      stateOrProvinceCode: 'CA',
      postalCode: '90210',
      countryCode: 'US',
      residential: false
    };
  }

  // Create standard package dimensions for crochet products
  getStandardPackageDimensions(productType: 'bouquet' | 'potted' | 'single' = 'bouquet'): ShipmentPackage {
    const packages = {
      bouquet: {
        weight: { units: 'LB' as const, value: 2.0 },
        dimensions: { length: 12, width: 8, height: 6, units: 'IN' as const }
      },
      potted: {
        weight: { units: 'LB' as const, value: 3.5 },
        dimensions: { length: 10, width: 10, height: 8, units: 'IN' as const }
      },
      single: {
        weight: { units: 'LB' as const, value: 0.5 },
        dimensions: { length: 8, width: 6, height: 4, units: 'IN' as const }
      }
    };

    return packages[productType];
  }
}

// Export a singleton instance
export const fedexService = new FedExService();