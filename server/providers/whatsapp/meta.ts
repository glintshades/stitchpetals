import { WhatsAppProvider, WhatsAppMessage, WhatsAppIncomingMessage, WhatsAppWebhookEvent } from './base.js';
import crypto from 'crypto';

export class MetaWhatsAppProvider extends WhatsAppProvider {
  private accessToken: string;
  private phoneNumberId: string;
  private verifyToken: string;
  private appSecret: string;

  constructor(config: {
    accessToken: string;
    phoneNumberId: string;
    verifyToken: string;
    appSecret: string;
  }) {
    super();
    this.accessToken = config.accessToken;
    this.phoneNumberId = config.phoneNumberId;
    this.verifyToken = config.verifyToken;
    this.appSecret = config.appSecret;
  }

  getProviderName(): string {
    return 'Meta WhatsApp Cloud API';
  }

  async sendMessage(message: WhatsAppMessage): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const url = `https://graph.facebook.com/v20.0/${this.phoneNumberId}/messages`;
      
      let messagePayload: any = {
        messaging_product: 'whatsapp',
        to: message.to,
      };

      if (message.text) {
        messagePayload.type = 'text';
        messagePayload.text = { body: message.text };
      } else if (message.mediaUrl && message.mediaType) {
        messagePayload.type = message.mediaType;
        messagePayload[message.mediaType] = {
          link: message.mediaUrl
        };
      } else {
        return { success: false, error: 'Message must have either text or media content' };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messagePayload)
      });

      const data = await response.json();

      if (response.ok && data.messages) {
        return {
          success: true,
          messageId: data.messages[0].id
        };
      } else {
        return {
          success: false,
          error: data.error?.message || 'Failed to send message'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // IMPORTANT: body must be the raw request body string for signature verification to work
  // Use Express middleware: app.use('/webhook', express.raw({ type: 'application/json' }))
  verifyWebhook(body: string, signature: string): boolean {
    try {
      const expectedSignature = crypto
        .createHmac('sha256', this.appSecret)
        .update(body)
        .digest('hex');
      
      const providedSignature = signature.replace('sha256=', '');
      
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(providedSignature, 'hex')
      );
    } catch (error) {
      return false;
    }
  }

  parseWebhookEvent(body: any): WhatsAppWebhookEvent | null {
    try {
      // Handle webhook verification
      if (body.hub && body.hub.mode === 'subscribe') {
        if (body.hub.verify_token === this.verifyToken) {
          return null; // This is handled by the webhook verification endpoint
        }
      }

      // Parse incoming messages
      if (body.object === 'whatsapp_business_account') {
        const entry = body.entry?.[0];
        if (!entry) return null;

        const changes = entry.changes?.[0];
        if (!changes || changes.field !== 'messages') return null;

        const value = changes.value;
        if (!value) return null;

        // Handle incoming messages
        if (value.messages) {
          const message = value.messages[0];
          const contact = value.contacts?.[0];
          
          if (!message || !contact) return null;

          const incomingMessage: WhatsAppIncomingMessage = {
            from: contact.wa_id,
            messageId: message.id,
            timestamp: parseInt(message.timestamp) * 1000, // Convert to milliseconds
          };

          // Handle text messages
          if (message.type === 'text') {
            incomingMessage.text = message.text.body;
          }
          
          // Handle media messages
          else if (['image', 'video', 'audio', 'document'].includes(message.type)) {
            incomingMessage.mediaType = message.type as any;
            incomingMessage.mediaId = message[message.type]?.id;
          }

          return {
            type: 'message',
            data: incomingMessage
          };
        }

        // Handle delivery status updates
        if (value.statuses) {
          return {
            type: 'delivery_status',
            data: value.statuses[0]
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error parsing WhatsApp webhook event:', error);
      return null;
    }
  }

  verifyChallenge(mode: string, verifyToken: string): boolean {
    return mode === 'subscribe' && verifyToken === this.verifyToken;
  }

  async getMediaUrl(mediaId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const url = `https://graph.facebook.com/v20.0/${mediaId}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      const data = await response.json();

      if (response.ok && data.url) {
        return {
          success: true,
          url: data.url
        };
      } else {
        return {
          success: false,
          error: data.error?.message || 'Failed to get media URL'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}