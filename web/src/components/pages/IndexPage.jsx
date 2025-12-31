import { useState, useCallback } from "react";
import ChatPanel from "@/components/ChatPanel";
import ChatInput from "@/components/ChatInput";
import { MessageSquare } from "lucide-react";

const Index = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const formatTime = () => {
    return new Date().toLocaleTimeString([], { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const simulateAIResponse = useCallback(async (userMessage) => {
    setIsLoading(true);
    
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));
    
    const responses = [
      "That's an interesting point! Let me think about that...",
      "I understand what you're asking. Here's my perspective on this.",
      "Great question! Based on my analysis, I would suggest...",
      "Thanks for sharing that. I'd be happy to help you explore this further.",
      "I've processed your message. Here's what I think would work best.",
    ];
    
    const aiMessage = {
      id: generateId(),
      content: responses[Math.floor(Math.random() * responses.length)],
      isUser: false,
      timestamp: formatTime(),
    };
    
    setMessages((prev) => [...prev, aiMessage]);
    setIsLoading(false);
  }, []);

  const handleSend = useCallback((content) => {
    const userMessage = {
      id: generateId(),
      content,
      isUser: true,
      timestamp: formatTime(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    simulateAIResponse(content);
  }, [simulateAIResponse]);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 md:px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
          <MessageSquare className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">AI Assistant</h1>
          <p className="text-xs text-muted-foreground">Always here to help</p>
        </div>
      </header>

      {/* Chat Panel */}
      <ChatPanel messages={messages} isLoading={isLoading} />

      {/* Input */}
      <ChatInput onSend={handleSend} disabled={isLoading} />
    </div>
  );
};

export default Index;
