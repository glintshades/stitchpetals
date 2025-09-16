import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Send, X, Bot, User, Search, ExternalLink, MessageSquare } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
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

interface LiveChatMessage {
  id: string;
  role: "user" | "agent";
  content: string;
  timestamp: Date;
}

interface LiveChatSession {
  id: number;
  sessionId: string;
  status: string;
}

export default function ProductSearchChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("search");
  const [liveChatSession, setLiveChatSession] = useState<LiveChatSession | null>(null);
  
  // Product search states
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I can help you find information about our crochet flowers. Try asking me about:\n\n• Specific flowers (sunflower, rose, etc.)\n• Product types (bouquet, potted, stems)\n• Prices or categories\n• Care instructions\n\nWhat would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  
  // Live chat states
  const [liveChatMessages, setLiveChatMessages] = useState<LiveChatMessage[]>([
    {
      id: "welcome",
      role: "agent",
      content: "Hello! 👋 I'm here to help you with any questions about our crochet flowers. Your message will be sent directly to our team via WhatsApp, and we'll respond as quickly as possible!",
      timestamp: new Date(),
    },
  ]);
  const [liveChatInput, setLiveChatInput] = useState("");
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);
  const pendingMessageRef = useRef<string | null>(null);
  
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

  // Live chat session creation
  const createSessionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/live-chat/session", {});
      return response.json();
    },
    onSuccess: (data) => {
      setLiveChatSession(data);
      
      // Send any pending message after session creation
      if (pendingMessageRef.current) {
        const messageToSend = pendingMessageRef.current;
        pendingMessageRef.current = null;
        setPendingMessage(null);
        
        // Add optimistic message and send
        const userMessage: LiveChatMessage = {
          id: `temp-${Date.now()}`,
          role: "user",
          content: messageToSend,
          timestamp: new Date(),
        };
        setLiveChatMessages((prev) => [...prev, userMessage]);
        
        // Send to backend directly with the new session
        apiRequest("POST", "/api/live-chat/send", {
          sessionId: data.sessionId,
          message: messageToSend,
        }).catch(() => {
          toast({
            title: "Message Error",
            description: "Couldn't send queued message. Please try again.",
            variant: "destructive",
          });
        });
      }
    },
    onError: () => {
      setPendingMessage(null);
      pendingMessageRef.current = null;
      toast({
        title: "Connection Error",
        description: "Couldn't connect to live chat. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Live chat message sending
  const liveChatMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!liveChatSession) throw new Error("No session");
      const response = await apiRequest("POST", "/api/live-chat/send", {
        sessionId: liveChatSession.sessionId,
        message,
      });
      return response.json();
    },
    onSuccess: () => {
      // Message will appear through polling/real-time updates
      setLiveChatInput("");
    },
    onError: () => {
      toast({
        title: "Message Error",
        description: "Couldn't send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Poll for live chat messages
  const { data: liveChatData } = useQuery({
    queryKey: ["live-chat-messages", liveChatSession?.sessionId],
    queryFn: async () => {
      if (!liveChatSession) return { messages: [] };
      const response = await apiRequest("GET", `/api/live-chat/messages?sessionId=${liveChatSession.sessionId}`);
      return response.json();
    },
    enabled: !!liveChatSession,
    refetchInterval: 3000, // Poll every 3 seconds
  });

  // Update live chat messages from polling using useEffect
  useEffect(() => {
    if (liveChatData?.messages && liveChatSession) {
      const serverMessages = liveChatData.messages.map((msg: any) => ({
        id: msg.id.toString(),
        role: msg.role as "user" | "agent",
        content: msg.content,
        timestamp: new Date(msg.timestamp),
      }));
      
      setLiveChatMessages(currentMessages => {
        // Keep welcome message and reconcile with server messages
        const welcomeMessage = currentMessages[0];
        const optimisticMessages = currentMessages.slice(1).filter(msg => msg.id.startsWith('temp-'));
        const confirmedServerMessages = serverMessages.filter((serverMsg: LiveChatMessage) => 
          !optimisticMessages.some(optMsg => optMsg.content === serverMsg.content)
        );
        
        return [welcomeMessage, ...confirmedServerMessages, ...optimisticMessages];
      });
    }
  }, [liveChatData?.messages, liveChatSession]);

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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Live chat handlers
  const handleLiveChatSend = () => {
    if (!liveChatInput.trim() || liveChatMutation.isPending) return;

    // Create session if it doesn't exist
    if (!liveChatSession) {
      pendingMessageRef.current = liveChatInput;
      setPendingMessage(liveChatInput);
      setLiveChatInput("");
      createSessionMutation.mutate();
      return;
    }

    // Add optimistic user message with temp ID
    const userMessage: LiveChatMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: liveChatInput,
      timestamp: new Date(),
    };
    setLiveChatMessages((prev) => [...prev, userMessage]);

    // Send to backend
    liveChatMutation.mutate(liveChatInput);
  };

  const handleLiveChatKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleLiveChatSend();
    }
  };

  // Initialize live chat session when switching to live chat tab
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "live" && !liveChatSession && !createSessionMutation.isPending) {
      createSessionMutation.mutate();
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
    <Card className="fixed bottom-6 right-6 w-80 max-w-[calc(100vw-3rem)] h-96 max-h-[calc(100vh-3rem)] shadow-xl z-50 bg-white">
      <CardHeader className="bg-wine text-white p-4 rounded-t-lg">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Customer Support
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
        <Tabs value={activeTab} onValueChange={handleTabChange} className="flex flex-col h-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 m-2 mb-0">
            <TabsTrigger value="search" className="flex items-center gap-2" data-testid="tab-product-search">
              <Search className="w-4 h-4" />
              Product Search
            </TabsTrigger>
            <TabsTrigger value="live" className="flex items-center gap-2" data-testid="tab-live-chat">
              <MessageSquare className="w-4 h-4" />
              Live Chat
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="flex-1 flex flex-col m-0">
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
                  onKeyDown={handleKeyDown}
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
          </TabsContent>

          <TabsContent value="live" className="flex-1 flex flex-col m-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {liveChatMessages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div
                      className={`flex gap-2 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                      data-testid={`live-message-${message.role}-${message.id}`}
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
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {message.role === "user" ? (
                            <User className="w-4 h-4" />
                          ) : (
                            <MessageSquare className="w-4 h-4" />
                          )}
                        </div>
                        <div
                          className={`p-3 rounded-lg ${
                            message.role === "user"
                              ? "bg-wine text-white"
                              : "bg-green-50 text-green-800"
                          }`}
                        >
                          <p className="text-sm leading-relaxed whitespace-pre-line">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {(liveChatMutation.isPending || createSessionMutation.isPending || pendingMessage) && (
                  <div className="flex gap-2 justify-start">
                    <div className="flex gap-2 max-w-[85%]">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-100 text-green-600">
                        <MessageSquare className="w-4 h-4 animate-pulse" />
                      </div>
                      <div className="bg-green-50 text-green-800 p-3 rounded-lg">
                        <p className="text-sm">
                          {pendingMessage
                            ? `Queuing message: "${pendingMessage.length > 30 ? pendingMessage.substring(0, 30) + '...' : pendingMessage}"`
                            : createSessionMutation.isPending
                            ? "Connecting to live chat..."
                            : "Sending message to WhatsApp..."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={liveChatInput}
                  onChange={(e) => setLiveChatInput(e.target.value)}
                  onKeyDown={handleLiveChatKeyDown}
                  placeholder="Type your message to our team..."
                  disabled={liveChatMutation.isPending || createSessionMutation.isPending}
                  data-testid="input-live-chat-message"
                />
                <Button
                  onClick={handleLiveChatSend}
                  disabled={!liveChatInput.trim() || liveChatMutation.isPending || createSessionMutation.isPending}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="button-send-live-chat"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}