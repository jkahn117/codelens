import type { FlueConversationMessage } from "@flue/react";

function messageText(msg: FlueConversationMessage): string {
  return msg.parts
    .filter((p) => p.type === "text")
    .map((p) => (p as { text: string }).text)
    .join("");
}

export function MessageList({
  messages,
  streaming,
}: {
  messages: FlueConversationMessage[];
  streaming: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 p-3">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={
            msg.role === "user"
              ? "ml-auto max-w-[80%] rounded-lg bg-accent px-3 py-2 text-sm text-white"
              : "max-w-[85%] px-1 py-1 text-sm text-text-primary"
          }
        >
          {messageText(msg)}
        </div>
      ))}
      {/* Typing indicator while agent is responding */}
      {streaming && (
        <div className="flex items-center gap-1.5 px-1 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-text-dim animate-[pulse_0.8s_ease-in-out_0s_infinite]" />
          <span className="h-1.5 w-1.5 rounded-full bg-text-dim animate-[pulse_0.8s_ease-in-out_0.2s_infinite]" />
          <span className="h-1.5 w-1.5 rounded-full bg-text-dim animate-[pulse_0.8s_ease-in-out_0.4s_infinite]" />
        </div>
      )}
    </div>
  );
}
