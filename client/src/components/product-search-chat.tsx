import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, Bot, User, Search, ExternalLink } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  products?: ProductResult[];
}

interface ProductResult {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image?: string;
}

export default function ProductSearchChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I can help you find information about our crochet flowers. Try asking me about:\n\n• Specific flowers (sunflower, rose, etc.)\n• Product types (bouquet, potted, stems)\n• Prices or categories\n• Care instructions\n\nWhat would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const { toast } = useToast();

  const searchMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await apiRequest("POST", "/api/search-products", { query });
      return response.json();
    },
    onSuccess: (data) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
        products: data.products || [],
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: () => {
      toast({
        title: "Search Error",
        description: "Sorry, I couldn't search right now. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!inputMessage.trim() || searchMutation.isPending) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    searchMutation.mutate(inputMessage);
    setInputMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-wine hover:bg-dark-pink text-white shadow-lg z-50"
        data-testid="button-open-search-chat"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 h-96 shadow-xl z-50 bg-white">
      <CardHeader className="bg-wine text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5" />
            Product Search
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20"
            data-testid="button-close-search-chat"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex flex-col h-80">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                <div
                  className={`flex gap-2 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                  data-testid={`message-${message.role}-${message.id}`}
                >
                  <div
                    className={`flex gap-2 max-w-[85%] ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === "user"
                          ? "bg-wine text-white"
                          : "bg-gray-100 text-wine"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="w-4 h-4" />
                      ) : (
                        <Bot className="w-4 h-4" />
                      )}
                    </div>
                    <div
                      className={`p-3 rounded-lg ${
                        message.role === "user"
                          ? "bg-wine text-white"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-line">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Show product results */}
                {message.products && message.products.length > 0 && (
                  <div className="ml-10 space-y-2">
                    {message.products.map((product) => (
                      <div
                        key={product.id}
                        className="bg-white border rounded-lg p-3 shadow-sm"
                        data-testid={`product-result-${product.id}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium text-wine text-sm">
                              {product.name}
                            </h4>
                            <p className="text-xs text-gray-600 mt-1">
                              {product.description}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Category: {product.category}
                            </p>
                            <p className="font-bold text-sm text-wine mt-1">
                              ${product.price}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1 h-6 w-6 text-wine hover:bg-wine hover:text-white"
                            onClick={() => window.open(`/product/${product.id}`, '_blank')}
                            data-testid={`view-product-${product.id}`}
                          >
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {searchMutation.isPending && (
              <div className="flex gap-2 justify-start">
                <div className="flex gap-2 max-w-[85%]">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 text-wine">
                    <Search className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-lg">
                    <p className="text-sm">Searching products...</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Search for flowers, bouquets, etc..."
              disabled={searchMutation.isPending}
              data-testid="input-search-message"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || searchMutation.isPending}
              size="sm"
              className="bg-wine hover:bg-dark-pink"
              data-testid="button-send-search"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}