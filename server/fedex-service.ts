import axios from 'axios';

// FedEx API Configuration
const FEDEX_CONFIG = {
  sandbox: {
    authUrl: 'https://apis-sandbox.fedex.com/oauth/token',
    baseUrl: 'https://apis-sandbox.fedex.com'
  },
  production: {
    authUrl: 'https://apis.fedex.com/oauth/token',
    baseUrl: 'https://apis.fedex.com'
  }
};

// Token storage
let accessToken: string | null = null;
let tokenExpiration: number | null = null;

export interface ShippingAddress {
  name: string;
  company?: string;
  phone?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface ShipmentData {
  shipper: ShippingAddress;
  recipient: ShippingAddress;
  weight: number; // in pounds
  length?: number; // in inches
  width?: number; // in inches
  height?: number; // in inches
  serviceType?: string;
  packageType?: string;
}

export interface RateRequest {
  fromZip: string;
  fromCountry: string;
  toZip: string;
  toCountry: string;
  weight: number; // in pounds
  length?: number;
  width?: number;
  height?: number;
}

export interface ShippingRate {
  service: string;
  serviceName: string;
  cost: number;
  currency: string;
  transitTime?: number;
  deliveryDate?: string;
}

export interface ShipmentResult {
  trackingNumber: string;
  labelUrl: string;
  cost: number;
  currency: string;
}

export interface TrackingResult {
  trackingNumber: string;
  status: string;
  statusCode: string;
  location?: string;
  estimatedDelivery?: string;
  scanEvents?: Array<{
    date: string;
    description: string;
    location?: string;
  }>;
}

class FedExService {
  private environment: string;
  private config: typeof FEDEX_CONFIG.sandbox;

  constructor() {
    this.environment = process.env.FEDEX_ENVIRONMENT || 'sandbox';
    this.config = FEDEX_CONFIG[this.environment as keyof typeof FEDEX_CONFIG];
  }

  // Get OAuth Access Token
  private async getAccessToken(): Promise<string> {
    if (accessToken && tokenExpiration && Date.now() < tokenExpiration) {
      return accessToken;
    }

    try {
      const params = new URLSearchParams();
      params.append('grant_type', 'client_credentials');
      params.append('client_id', process.env.FEDEX_API_KEY!);
      params.append('client_secret', process.env.FEDEX_SECRET_KEY!);

      const response = await axios.post(
        this.config.authUrl,
        params,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      accessToken = response.data.access_token;
      // Token expires in 3600 seconds (1 hour) - refresh 5 minutes early
      tokenExpiration = Date.now() + (3600 - 300) * 1000;

      return accessToken!;
    } catch (error) {
      console.error('Failed to get FedEx access token:', error);
      throw new Error('Failed to authenticate with FedEx API');
    }
  }

  // Get shipping rates
  async getRates(rateRequest: RateRequest): Promise<ShippingRate[]> {
    const token = await this.getAccessToken();

    const payload = {
      accountNumber: {
        value: process.env.FEDEX_ACCOUNT_NUMBER!
      },
      requestedShipment: {
        rateRequestType: ["ACCOUNT"],
        shipper: {
          address: {
            postalCode: rateRequest.fromZip,
            countryCode: rateRequest.fromCountry
          }
        },
        recipient: {
          address: {
            postalCode: rateRequest.toZip,
            countryCode: rateRequest.toCountry
          }
        },
        pickupType: "DROPOFF_AT_FEDEX_LOCATION",
        rateRequestTypes: ["ACCOUNT"],
        requestedPackageLineItems: [{
          weight: {
            units: "LB",
            value: rateRequest.weight
          },
          ...(rateRequest.length && rateRequest.width && rateRequest.height && {
            dimensions: {
              length: rateRequest.length,
              width: rateRequest.width,
              height: rateRequest.height,
              units: "IN"
            }
          })
        }]
      }
    };

    try {
      const response = await axios.post(
        `${this.config.baseUrl}/rate/v1/rates/quotes`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.output.rateReplyDetails.map((rate: any) => ({
        service: rate.serviceType,
        serviceName: this.getServiceName(rate.serviceType),
        cost: parseFloat(rate.ratedShipmentDetails[0].totalNetCharge),
        currency: rate.ratedShipmentDetails[0].currency,
        transitTime: rate.commit?.transitTime,
        deliveryDate: rate.commit?.dateDetail?.dayOfWeek
      }));
    } catch (error: any) {
      console.error('FedEx rate request failed:', error.response?.data);
      throw new Error(`Failed to get shipping rates: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  // Create shipment
  async createShipment(shipmentData: ShipmentData): Promise<ShipmentResult> {
    const token = await this.getAccessToken();

    const payload = {
      labelResponseOptions: "URL_ONLY",
      requestedShipment: {
        shipper: {
          contact: {
            personName: shipmentData.shipper.name,
            phoneNumber: shipmentData.shipper.phone || '',
            companyName: shipmentData.shipper.company || ''
          },
          address: {
            streetLines: [shipmentData.shipper.address1],
            ...(shipmentData.shipper.address2 && { streetLines: [shipmentData.shipper.address1, shipmentData.shipper.address2] }),
            city: shipmentData.shipper.city,
            stateOrProvinceCode: shipmentData.shipper.state,
            postalCode: shipmentData.shipper.zip,
            countryCode: shipmentData.shipper.country
          }
        },
        recipients: [{
          contact: {
            personName: shipmentData.recipient.name,
            phoneNumber: shipmentData.recipient.phone || '',
            companyName: shipmentData.recipient.company || ''
          },
          address: {
            streetLines: [shipmentData.recipient.address1],
            ...(shipmentData.recipient.address2 && { streetLines: [shipmentData.recipient.address1, shipmentData.recipient.address2] }),
            city: shipmentData.recipient.city,
            stateOrProvinceCode: shipmentData.recipient.state,
            postalCode: shipmentData.recipient.zip,
            countryCode: shipmentData.recipient.country
          }
        }],
        shipDatestamp: new Date().toISOString().split('T')[0],
        serviceType: shipmentData.serviceType || "FEDEX_GROUND",
        packagingType: shipmentData.packageType || "YOUR_PACKAGING",
        pickupType: "USE_SCHEDULED_PICKUP",
        blockInsightVisibility: false,
        shippingChargesPayment: {
          paymentType: "SENDER"
        },
        labelSpecification: {
          imageType: "PDF",
          labelStockType: "PAPER_4X6"
        },
        requestedPackageLineItems: [{
          weight: {
            units: "LB",
            value: shipmentData.weight
          },
          ...(shipmentData.length && shipmentData.width && shipmentData.height && {
            dimensions: {
              length: shipmentData.length,
              width: shipmentData.width,
              height: shipmentData.height,
              units: "IN"
            }
          })
        }]
      },
      accountNumber: {
        value: process.env.FEDEX_ACCOUNT_NUMBER!
      }
    };

    try {
      const response = await axios.post(
        `${this.config.baseUrl}/ship/v1/shipments`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const shipment = response.data.output.transactionShipments[0];
      
      return {
        trackingNumber: shipment.masterTrackingNumber,
        labelUrl: shipment.pieceResponses[0].packageDocuments[0].url,
        cost: parseFloat(shipment.shipmentRating.totalNetCharge),
        currency: shipment.shipmentRating.currency
      };
    } catch (error: any) {
      console.error('FedEx shipment creation failed:', error.response?.data);
      throw new Error(`Failed to create shipment: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  // Track shipment
  async trackShipment(trackingNumber: string): Promise<TrackingResult> {
    const token = await this.getAccessToken();

    try {
      const response = await axios.post(
        `${this.config.baseUrl}/track/v1/trackingnumbers`,
        {
          trackingInfo: [{
            trackingNumberInfo: {
              trackingNumber: trackingNumber
            }
          }],
          includeDetailedScans: true
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const trackResult = response.data.output.completeTrackResults[0].trackResults[0];

      return {
        trackingNumber: trackingNumber,
        status: trackResult.latestStatusDetail.description,
        statusCode: trackResult.latestStatusDetail.code,
        location: trackResult.latestStatusDetail.scanLocation?.city,
        estimatedDelivery: trackResult.estimatedDeliveryTimeWindow?.window.begins,
        scanEvents: trackResult.scanEvents?.map((event: any) => ({
          date: event.date,
          description: event.eventDescription,
          location: event.scanLocation?.city
        }))
      };
    } catch (error: any) {
      console.error('FedEx tracking failed:', error.response?.data);
      throw new Error(`Failed to track shipment: ${error.response?.data?.errors?.[0]?.message || error.message}`);
    }
  }

  // Helper method to get human-readable service names
  private getServiceName(serviceType: string): string {
    const serviceNames: { [key: string]: string } = {
      'FEDEX_GROUND': 'FedEx Ground',
      'FEDEX_EXPRESS_SAVER': 'FedEx Express Saver',
      'FEDEX_2_DAY': 'FedEx 2Day',
      'FEDEX_2_DAY_AM': 'FedEx 2Day A.M.',
      'STANDARD_OVERNIGHT': 'FedEx Standard Overnight',
      'PRIORITY_OVERNIGHT': 'FedEx Priority Overnight',
      'FIRST_OVERNIGHT': 'FedEx First Overnight'
    };
    
    return serviceNames[serviceType] || serviceType;
  }

  // Validate API credentials
  async validateCredentials(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export default new FedExService();