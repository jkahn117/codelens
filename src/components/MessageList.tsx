import type { FlueConversationMessage } from "@flue/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
          {msg.role !== "user" ? (
            <div className="space-y-2 leading-6 [&_a]:text-accent [&_a]:underline [&_code]:rounded [&_code]:bg-panel [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em] [&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-base [&_h2]:font-semibold [&_h3]:font-semibold [&_li]:ml-4 [&_li]:list-disc [&_ol]:space-y-1 [&_p]:min-h-5 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-panel [&_pre]:p-3 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:space-y-1">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{messageText(msg)}</ReactMarkdown>
            </div>
          ) : (
            messageText(msg)
          )}
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
