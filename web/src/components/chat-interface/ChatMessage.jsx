import { cn } from "@/lib/utils";

const ChatMessage = ({ content, isUser, timestamp }) => {
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
        {timestamp && (
          <p
            className={cn(
              "text-xs mt-1",
              isUser ? "text-primary-foreground/70" : "text-muted-foreground"
            )}
          >
            {timestamp}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
