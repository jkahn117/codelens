import { useState } from "react";

export function MessageInput({ onSend, disabled }: { onSend: (text: string) => void; disabled: boolean }) {
  const [text, setText] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border bg-panel p-3">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ask a question about this repo..."
        disabled={disabled}
        className="flex-1 rounded border border-border bg-page px-3 py-1.5 text-sm text-text-primary placeholder:text-text-dim focus:border-accent focus:outline-none disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="rounded bg-accent px-3 py-1.5 text-sm text-white disabled:opacity-50"
      >
        →
      </button>
    </form>
  );
}
