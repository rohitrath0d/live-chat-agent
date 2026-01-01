import { cn } from "@/lib/utils";

// Format timestamp to human-readable format (e.g., "1 Jan 2026, 4:28 AM")
const formatTime = (timestamp) => {
  if (!timestamp) return "";

  try {
    const date = new Date(timestamp);
    return date.toLocaleString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return timestamp; // Return as-is if parsing fails
  }
};

const ChatMessage = ({ content, isUser, timestamp }) => {
  const formattedTime = formatTime(timestamp);

  return (
    <div
      className={cn(
        "flex w-full animate-fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[80%] md:max-w-[70%] rounded-2xl px-4 py-3 shadow-message",
          isUser
            ? "bg-primary text-primary-foreground rounded-br-md"
            : "bg-card text-card-foreground rounded-bl-md border border-border"
        )}
      >
        <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
        {formattedTime && (
          <p
            className={cn(
              "text-xs mt-1",
              isUser ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            {formattedTime}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
