import { useEffect, useRef, useState, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from "./ChatMessage";
import TypingIndicator from "../ui/TypingIndicator";
import { fetchChatHistory, onSocketMessage, onSocketStream, onSocketError } from "@/utils/api";
import { toast } from "sonner";


const ChatPanel = ({ sessionId, isLoading, setIsLoading, onReady }) => {
  const scrollRef = useRef(null);
  const bottomRef = useRef(null);
  const [messages, setMessages] = useState([]);

  // Function to add a user message to the chat
  const addUserMessage = useCallback((content) => {
    const newMessage = {
      id: `user_${Date.now()}`,
      content,
      isUser: true,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  // Expose addUserMessage to parent component
  useEffect(() => {
    if (onReady) {
      onReady({ addUserMessage });
    }
  }, [onReady, addUserMessage]);

  // Ref to track the current streaming message ID
  const streamingMessageIdRef = useRef(null);

  // Subscribe to socket messages for AI responses
  useEffect(() => {
    if (!sessionId) return;

    console.log('Setting up socket subscription for session:', sessionId);

    // Handle streaming chunks
    const unsubscribeStream = onSocketStream((data) => {
      if (data.sessionId === sessionId) {
        console.log('Received stream chunk:', data.chunk);

        if (!streamingMessageIdRef.current) {
          // First chunk - create new AI message
          const messageId = `ai_${Date.now()}`;
          streamingMessageIdRef.current = messageId;

          const aiMessage = {
            id: messageId,
            content: data.chunk,
            isUser: false,
            timestamp: new Date().toISOString(),
            isStreaming: true,
          };
          setMessages((prev) => [...prev, aiMessage]);
        } else {
          // Subsequent chunks - append to existing message
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === streamingMessageIdRef.current
                ? { ...msg, content: msg.content + data.chunk }
                : msg
            )
          );
        }
      }
    });

    // Handle complete message
    const unsubscribeMessage = onSocketMessage((data) => {
      console.log('Received complete message:', data);

      if (data.sessionId === sessionId) {
        // Mark streaming as complete and update with final content
        if (streamingMessageIdRef.current) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === streamingMessageIdRef.current
                ? { ...msg, content: data.message, isStreaming: false }
                : msg
            )
          );
          streamingMessageIdRef.current = null;
        } else {
          // No streaming occurred, add complete message
          const aiMessage = {
            id: `ai_${Date.now()}`,
            content: data.message,
            isUser: false,
            timestamp: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, aiMessage]);
        }
        setIsLoading(false);
      }
    });

    const unsubscribeError = onSocketError((data) => {
      console.error('Socket error:', data.error);
      toast.error(data.error || 'Something went wrong');
      streamingMessageIdRef.current = null;
      setIsLoading(false);
    });

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeStream();
      unsubscribeMessage();
      unsubscribeError();
    };
  }, [sessionId, setIsLoading]);

  // Fetch chat history when the component mounts
  useEffect(() => {
    const getHistory = async () => {
      // Skip if sessionId hasn't been initialized yet
      if (!sessionId) {
        return;
      }

      const history = await fetchChatHistory(sessionId);
      setMessages(history);
    };

    getHistory();
  }, [sessionId]);

  // Scroll to the bottom when messages or loading state changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <ScrollArea className="flex-1 px-4 md:px-6" ref={scrollRef}>
      <div className="py-6 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-[50vh] text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Start a conversation
            </h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Send a message to begin chatting with the AI assistant
            </p>
          </div>
        )}

        {/* Map over all messages */}
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            content={message.content}
            isUser={message.isUser}
            timestamp={message.timestamp}
          />
        ))}

        {/* Show typing indicator if loading */}
        {isLoading && <TypingIndicator />}

        {/* Scroll to the bottom reference */}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
};

export default ChatPanel;
