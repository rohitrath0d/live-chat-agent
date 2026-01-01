import { useState, useCallback, useEffect, useRef } from "react";
import ChatPanel from "@/components/chat-interface/ChatPanel";
import ChatInput from "@/components/chat-interface/ChatInput";
import { MessageSquare } from "lucide-react";

// Generate a unique session ID
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
};

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);

  // Store the addUserMessage function from ChatPanel
  const chatPanelRef = useRef(null);

  // Initialize session ID on mount
  useEffect(() => {
    // Check if session already exists in localStorage
    let storedSessionId = localStorage.getItem("chatSessionId");
    if (!storedSessionId) {
      storedSessionId = generateSessionId();
      localStorage.setItem("chatSessionId", storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  // Callback from ChatPanel when it's ready with its methods
  const handleChatPanelReady = useCallback((methods) => {
    chatPanelRef.current = methods;
  }, []);

  // Handler for when user sends a message
  const handleMessageSent = useCallback((content) => {
    if (chatPanelRef.current?.addUserMessage) {
      chatPanelRef.current.addUserMessage(content);
    }
  }, []);

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
      <ChatPanel
        sessionId={sessionId}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        onReady={handleChatPanelReady}
      />

      {/* Input */}
      <ChatInput
        sessionId={sessionId}
        setIsLoading={setIsLoading}
        disabled={isLoading}
        onMessageSent={handleMessageSent}
      />
    </div>
  );
};

export default Index;

