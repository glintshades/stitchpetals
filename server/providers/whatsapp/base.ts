export interface WhatsAppMessage {
  to: string; // phone number
  text?: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
}

export interface WhatsAppIncomingMessage {
  from: string; // phone number
  text?: string;
  mediaId?: string; // WhatsApp media ID that needs to be fetched
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  messageId: string;
  timestamp: number;
}

export interface WhatsAppWebhookEvent {
  type: 'message' | 'delivery_status';
  data: WhatsAppIncomingMessage | any;
}

export abstract class WhatsAppProvider {
  abstract sendMessage(message: WhatsAppMessage): Promise<{ success: boolean; messageId?: string; error?: string }>;
  abstract verifyWebhook(body: any, signature: string): boolean;
  abstract parseWebhookEvent(body: any): WhatsAppWebhookEvent | null;
  abstract verifyChallenge(mode: string, verifyToken: string): boolean;
  abstract getMediaUrl(mediaId: string): Promise<{ success: boolean; url?: string; error?: string }>;
  abstract getProviderName(): string;
}