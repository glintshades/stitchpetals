import crypto from 'crypto';

// Clover API endpoints based on environment
const CLOVER_API_BASE = {
  sandbox: 'https://apisandbox.dev.clover.com',
  production: 'https://api.clover.com'
};

export class CloverPaymentService {
  private merchantId: string;
  private apiKey: string;
  private environment: 'sandbox' | 'production';
  private apiBase: string;

  constructor() {
    this.merchantId = process.env.CLOVER_MERCHANT_ID || '';
    this.apiKey = process.env.CLOVER_API_KEY || '';
    this.environment = (process.env.CLOVER_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox';
    this.apiBase = CLOVER_API_BASE[this.environment];
  }

  /**
   * Create a payment using Clover's REST API
   */
  async createPayment({
    amount,
    cardToken,
    description,
    orderId
  }: {
    amount: number; // amount in cents
    cardToken: string; // Clover card token
    description?: string;
    orderId?: string;
  }) {
    const url = `${this.apiBase}/v3/merchants/${this.merchantId}/payments`;
    
    const payload = {
      amount,
      currency: 'usd',
      source: cardToken,
      note: description,
      externalPaymentId: orderId
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
   * Retrieve a payment by ID
   */
  async getPayment(paymentId: string) {
    const url = `${this.apiBase}/v3/merchants/${this.merchantId}/payments/${paymentId}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(`Failed to retrieve payment: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  /**
   * Create a refund for a payment
   */
  async createRefund(paymentId: string, amount?: number) {
    const url = `${this.apiBase}/v3/merchants/${this.merchantId}/payments/${paymentId}/refunds`;
    
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
      merchantId: this.merchantId,
      apiBase: this.apiBase
    };
  }

  /**
   * Create a card token using Clover's tokenization service
   */
  async createCardToken(cardData: {
    number: string;
    exp_month: string;
    exp_year: string;
    cvv: string;
    zip?: string;
  }) {
    const tokenUrl = this.environment === 'sandbox' 
      ? 'https://token-sandbox.dev.clover.com/v1/tokens'
      : 'https://token.clover.com/v1/tokens';
    
    const payload = {
      card: {
        number: cardData.number,
        exp_month: cardData.exp_month,
        exp_year: cardData.exp_year,
        cvv: cardData.cvv,
        zip: cardData.zip
      }
    };

    const response = await fetch(tokenUrl, {
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
      throw new Error(`Card tokenization failed: ${error.message || response.statusText}`);
    }

    return response.json();
  }
}

export const cloverService = new CloverPaymentService();
