import { WhatsAppProvider } from './base.js';
import { MetaWhatsAppProvider } from './meta.js';

export interface WhatsAppConfig {
  provider: 'meta' | 'twilio';
  meta?: {
    accessToken: string;
    phoneNumberId: string;
    verifyToken: string;
    appSecret: string;
  };
  twilio?: {
    accountSid: string;
    authToken: string;
    phoneNumber: string;
  };
}

export class WhatsAppManager {
  private provider: WhatsAppProvider | null = null;
  private config: WhatsAppConfig | null = null;

  constructor(config?: WhatsAppConfig) {
    if (config) {
      this.configure(config);
    }
  }

  configure(config: WhatsAppConfig): void {
    this.config = config;
    this.provider = this.createProvider(config);
  }

  private createProvider(config: WhatsAppConfig): WhatsAppProvider {
    switch (config.provider) {
      case 'meta':
        if (!config.meta) {
          throw new Error('Meta WhatsApp configuration is required when provider is "meta"');
        }
        return new MetaWhatsAppProvider({
          accessToken: config.meta.accessToken,
          phoneNumberId: config.meta.phoneNumberId,
          verifyToken: config.meta.verifyToken,
          appSecret: config.meta.appSecret,
        });

      case 'twilio':
        // TODO: Implement Twilio provider when needed
        throw new Error('Twilio WhatsApp provider is not yet implemented');

      default:
        throw new Error(`Unknown WhatsApp provider: ${config.provider}`);
    }
  }

  getProvider(): WhatsAppProvider {
    if (!this.provider) {
      throw new Error('WhatsApp provider is not configured. Call configure() first.');
    }
    return this.provider;
  }

  isConfigured(): boolean {
    return this.provider !== null;
  }

  getProviderName(): string {
    return this.provider?.getProviderName() || 'Not configured';
  }
}

// Singleton instance
export const whatsappManager = new WhatsAppManager();

// Auto-configure from environment variables if available
const autoConfig = (): WhatsAppConfig | null => {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
  const appSecret = process.env.WHATSAPP_APP_SECRET;

  if (accessToken && phoneNumberId && verifyToken && appSecret) {
    return {
      provider: 'meta',
      meta: {
        accessToken,
        phoneNumberId,
        verifyToken,
        appSecret,
      },
    };
  }

  return null;
};

// Try to auto-configure on startup
const config = autoConfig();
if (config) {
  try {
    whatsappManager.configure(config);
    console.log(`WhatsApp provider configured: ${whatsappManager.getProviderName()}`);
  } catch (error) {
    console.warn('Failed to auto-configure WhatsApp provider:', error);
  }
}