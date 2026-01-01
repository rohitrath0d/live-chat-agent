import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { sendMessage } from "@/utils/api";
import { toast } from "sonner";

const ChatInput = ({ sessionId, setIsLoading, disabled, onMessageSent }) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    try {
      if (message.trim() && !disabled) {
        const trimmedMessage = message.trim();

        // Add user message to the chat via callback
        if (onMessageSent) {
          onMessageSent(trimmedMessage);
        }

        // Start the loading state for AI response
        setIsLoading(true);

        // Send the message to the backend through the socket
        sendMessage(sessionId, trimmedMessage);

        // Clear the message input after sending
        setMessage("");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-3 p-4 bg-background border-t border-border">
      <div className="flex-1 relative">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          rows={1}
          className="w-full resize-none rounded-xl border border-input bg-card px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[48px] max-h-[120px]"
          style={{ height: "48px" }}
          onInput={(e) => {
            const target = e.target;
            target.style.height = "48px";
            target.style.height = Math.min(target.scrollHeight, 120) + "px";
          }}
        />
      </div>
      <Button
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        size="icon"
        className="h-12 w-12 rounded-xl shrink-0 shadow-button transition-all duration-200 hover:scale-105 active:scale-95"
      >
        <Send className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ChatInput;
