import type { AppState } from "../types.ts";
import { useChat } from "../hooks/useChat.ts";
import { MessageList } from "./MessageList.tsx";
import { MessageInput } from "./MessageInput.tsx";
import { SuggestedQuestions } from "./SuggestedQuestions.tsx";

export function ChatPanel({
  state,
  chatSessionId,
}: {
  state: AppState;
  chatSessionId: string | null;
}) {
  // Key remounts the hook/session when a new analysis run starts.
  return <ChatSession key={chatSessionId ?? "idle"} state={state} chatSessionId={chatSessionId} />;
}

function ChatSession({
  state,
  chatSessionId,
}: {
  state: AppState;
  chatSessionId: string | null;
}) {
  const { messages, send, streaming } = useChat(chatSessionId);
  const disabled = state === "analyzing";
  const showSuggestions = state === "complete";

  return (
    <div className="flex h-full flex-col">
      {disabled && (
        <div className="border-b border-border px-3 py-1.5 text-center font-mono text-xs text-text-dim">
          Analysis in progress...
        </div>
      )}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <span className="font-mono text-xs text-text-dim">
              {state === "complete" ? "Ask a question about this repo..." : "Chat"}
            </span>
          </div>
        ) : (
          <MessageList messages={messages} streaming={streaming} />
        )}
      </div>
      {showSuggestions && <SuggestedQuestions onSelect={send} />}
      <MessageInput onSend={send} disabled={disabled || streaming} />
    </div>
  );
}
