const TypingIndicator = () => {
  return (
    <div className="flex justify-start animate-fade-in">
      <div className="bg-card text-card-foreground rounded-2xl rounded-bl-md px-4 py-3 shadow-message border border-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce-dot" style={{ animationDelay: "0ms" }} />
            <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce-dot" style={{ animationDelay: "150ms" }} />
            <span className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce-dot" style={{ animationDelay: "300ms" }} />
          </div>
          <span className="text-sm text-muted-foreground ml-1">Agent is typing…</span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
