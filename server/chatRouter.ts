import { generateChatResponse } from './chatService';
import { whatsappManager } from './providers/whatsapp/manager';
import type { IStorage } from './storage';

export interface IncomingMessage {
  fromNumber: string;
  messageText: string;
  messageId: string;
  timestamp: Date;
  messageType?: 'text' | 'image' | 'audio' | 'document';
}

export class ChatRouter {
  constructor(private storage: IStorage) {}

  async processMessage(message: IncomingMessage): Promise<void> {
    try {
      // Get or create chat session
      let session = await this.storage.getChatSession(message.fromNumber, 'whatsapp');
      if (!session) {
        session = await this.storage.createChatSession({
          channel: 'whatsapp',
          externalUserId: message.fromNumber,
          mode: 'bot'
        });
      }

      // Check for duplicate message processing
      const existingMessages = await this.storage.getChatMessages(session.id, 50);
      const duplicate = existingMessages.find(msg => msg.externalMessageId === message.messageId);
      if (duplicate) {
        console.log('Message already processed:', message.messageId);
        return;
      }

      // Store incoming message
      await this.storage.createChatMessage({
        sessionId: session.id,
        role: 'user',
        content: message.messageText,
        externalMessageId: message.messageId
      });

      // Determine response strategy
      if (session.mode === 'agent' || session.mode === 'agent_pending') {
        // Message is part of live chat with agent - don't auto-respond
        console.log('Message sent to live agent queue for session:', session.id);
        return;
      }

      // Check for escalation keywords
      if (this.shouldEscalateToAgent(message.messageText)) {
        await this.escalateToAgent(session.id);
        return;
      }

      // Handle bot response
      await this.generateBotResponse(message, session.id);

    } catch (error) {
      console.error('Chat router processing error:', error);
      // In case of error, try to get or create session for consistent fallback handling
      try {
        let session = await this.storage.getChatSession(message.fromNumber, 'whatsapp');
        if (!session) {
          session = await this.storage.createChatSession({
            channel: 'whatsapp',
            externalUserId: message.fromNumber,
            mode: 'bot'
          });
        }
        await this.sendFallbackMessage(session.id);
      } catch (fallbackError) {
        console.error('Error handling fallback in error case:', fallbackError);
        // As last resort, send directly without persistence
        if (whatsappManager.isConfigured()) {
          try {
            const provider = whatsappManager.getProvider();
            await provider.sendMessage({
              to: message.fromNumber,
              text: "I'm sorry, I'm having trouble right now. Please try again in a moment!"
            });
          } catch (directFallbackError) {
            console.error('Error sending direct fallback message:', directFallbackError);
          }
        }
      }
    }
  }

  private shouldEscalateToAgent(messageText: string): boolean {
    const escalationKeywords = [
      'agent', 'human', 'speak to someone', 'talk to person',
      'help me', 'support', 'problem', 'issue', 'complaint',
      'refund', 'return', 'cancel order', 'urgent'
    ];

    const text = messageText.toLowerCase();
    return escalationKeywords.some(keyword => text.includes(keyword));
  }

  private async escalateToAgent(sessionId: number): Promise<void> {
    try {
      // Update session to indicate agent needed
      await this.storage.updateChatSession(sessionId, {
        mode: 'agent_pending'
      });

      // Send escalation message
      const escalationMessage = 
        "I'm connecting you with one of our customer service agents who can better assist you. " +
        "Please wait a moment while I transfer your conversation. 👥";

      await this.sendMessage(sessionId, escalationMessage, 'assistant');

    } catch (error) {
      console.error('Error escalating to agent:', error);
      await this.sendFallbackMessage(sessionId);
    }
  }

  private async generateBotResponse(message: IncomingMessage, sessionId: number): Promise<void> {
    try {
      // Check if this looks like a product search
      if (this.isProductQuery(message.messageText)) {
        await this.handleProductQuery(message, sessionId);
        return;
      }

      // Generate AI response using existing chatService
      const aiResponse = await generateChatResponse(message.messageText);
      await this.sendMessage(sessionId, aiResponse, 'assistant');

    } catch (error) {
      console.error('Error generating bot response:', error);
      await this.sendFallbackMessage(sessionId);
    }
  }

  private isProductQuery(messageText: string): boolean {
    const productKeywords = [
      'flower', 'bouquet', 'crochet', 'arrangement', 'pot',
      'sunflower', 'rose', 'lily', 'tulip', 'daisy',
      'price', 'cost', 'buy', 'purchase', 'order',
      'show me', 'looking for', 'find', 'search'
    ];

    const text = messageText.toLowerCase();
    return productKeywords.some(keyword => text.includes(keyword));
  }

  private async handleProductQuery(message: IncomingMessage, sessionId: number): Promise<void> {
    try {
      // Use existing search logic from routes
      const products = await this.storage.getAllProducts();
      const query = message.messageText.toLowerCase().trim();
      
      // Basic product filtering
      const matchedProducts = products.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        this.matchesProductKeywords(query, product.name)
      );

      let responseMessage = '';
      
      if (matchedProducts.length > 0) {
        responseMessage = `🌸 I found ${matchedProducts.length} beautiful crochet flower${matchedProducts.length > 1 ? 's' : ''} for you:\n\n`;
        
        // Show top 3 products
        const topProducts = matchedProducts.slice(0, 3);
        topProducts.forEach((product, index) => {
          responseMessage += `${index + 1}. **${product.name}**\n`;
          responseMessage += `   💰 $${product.price}\n`;
          if (product.description) {
            responseMessage += `   📝 ${product.description.substring(0, 100)}...\n`;
          }
          responseMessage += '\n';
        });

        if (matchedProducts.length > 3) {
          responseMessage += `...and ${matchedProducts.length - 3} more! 🌻\n\n`;
        }
        
        responseMessage += "Visit our website to see full details and place an order! 🛒\n";
        responseMessage += "Need help choosing? Just ask me anything! 😊";
      } else {
        responseMessage = 
          "🌸 I couldn't find exact matches for that, but we have many beautiful crochet flowers! " +
          "Try searching for 'sunflower', 'rose bouquet', or 'potted arrangements'. " +
          "Or visit our website to browse our full collection! 🌻";
      }

      await this.sendMessage(sessionId, responseMessage, 'assistant');

    } catch (error) {
      console.error('Error handling product query:', error);
      await this.sendFallbackMessage(sessionId);
    }
  }

  private matchesProductKeywords(query: string, productName: string): boolean {
    const keywords = {
      'sunflower': ['sunflower', 'sun flower'],
      'rose': ['rose', 'roses'],
      'lily': ['lily', 'lilies'],
      'bouquet': ['bouquet', 'bunch', 'arrangement'],
      'pot': ['pot', 'potted', 'planter']
    };

    const productLower = productName.toLowerCase();
    
    for (const [key, variations] of Object.entries(keywords)) {
      if (query.includes(key) && variations.some(variant => productLower.includes(variant))) {
        return true;
      }
    }
    
    return false;
  }

  private async sendMessage(sessionId: number, content: string, role: 'assistant' | 'agent'): Promise<void> {
    try {
      // Store the message
      await this.storage.createChatMessage({
        sessionId,
        role,
        content
      });

      // Send via WhatsApp if provider is configured
      if (whatsappManager.isConfigured()) {
        const session = await this.storage.getChatSessionById(sessionId);
        if (session) {
          const provider = whatsappManager.getProvider();
          await provider.sendMessage({
            to: session.externalUserId,
            text: content
          });
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
    }
  }


  private async sendFallbackMessage(sessionId: number): Promise<void> {
    const fallbackMessage = 
      "I'm sorry, I'm having trouble right now. Please try again in a moment or " +
      "visit our website to browse our beautiful crochet flower collection! 🌸";
    
    try {
      await this.sendMessage(sessionId, fallbackMessage, 'assistant');
    } catch (error) {
      console.error('Error sending fallback message:', error);
    }
  }
}