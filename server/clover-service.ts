import crypto from 'crypto';

// Clover API endpoints based on environment
const CLOVER_API_BASE = {
  sandbox: 'https://apisandbox.dev.clover.com',
  production: 'https://api.clover.com'
};

const CLOVER_ECOMM_BASE = {
  sandbox: 'https://scl-sandbox.dev.clover.com',
  production: 'https://scl.clover.com'
};

export class CloverPaymentService {
  private apiKey: string;
  private environment: 'sandbox' | 'production';
  private apiBase: string;
  private ecommBase: string;

  constructor() {
    this.apiKey = process.env.CLOVER_PRIVATE_TOKEN || '';
    this.environment = (process.env.CLOVER_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox';
    this.apiBase = CLOVER_API_BASE[this.environment];
    this.ecommBase = CLOVER_ECOMM_BASE[this.environment];
  }

  /**
   * Create a charge using Clover's Ecommerce API
   */
  async createCharge({
    amount,
    currency = 'USD',
    source,
    description,
    metadata = {}
  }: {
    amount: number; // amount in cents
    currency?: string;
    source: string; // Clover token from frontend
    description?: string;
    metadata?: Record<string, any>;
  }) {
    const url = `${this.ecommBase}/v1/charges`;
    
    const payload = {
      amount,
      currency: currency.toLowerCase(),
      source,
      description,
      metadata
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Clover payment failed: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Retrieve a charge by ID
   */
  async getCharge(chargeId: string) {
    const url = `${this.ecommBase}/v1/charges/${chargeId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Failed to retrieve charge: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a refund for a charge
   */
  async createRefund(chargeId: string, amount?: number) {
    const url = `${this.ecommBase}/v1/charges/${chargeId}/refunds`;
    
    const payload: any = {};
    if (amount) {
      payload.amount = amount;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Refund failed: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Get public configuration for frontend
   */
  getPublicConfig() {
    return {
      environment: this.environment,
      publicToken: process.env.CLOVER_PUBLIC_TOKEN || '',
      apiBase: this.ecommBase
    };
  }
}

export const cloverService = new CloverPaymentService();
