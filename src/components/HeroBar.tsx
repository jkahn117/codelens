import { useState } from "react";

const DEFAULT_REPO = "https://github.com/cloudflare/workers-sdk";

interface HeroBarProps {
  onAnalyze: (url: string) => void;
  onReset: () => void;
  analyzing: boolean;
  hasResult: boolean;
}

export function HeroBar({ onAnalyze, onReset, analyzing, hasResult }: HeroBarProps) {
  const [url, setUrl] = useState(DEFAULT_REPO);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (url.trim() && !analyzing) onAnalyze(url.trim());
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-panel px-6">
      <form onSubmit={handleSubmit} className="flex flex-1 items-center gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="github.com/owner/repo"
          readOnly={analyzing}
          className="flex-1 rounded border border-border bg-page px-3 py-1.5 font-mono text-sm text-text-primary placeholder:text-text-dim focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={analyzing}
          className="cursor-pointer rounded bg-accent px-4 py-1.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {analyzing ? "Analyzing..." : "Analyze →"}
        </button>
        {hasResult && !analyzing && (
          <button
            type="button"
            onClick={onReset}
            className="cursor-pointer rounded border border-border px-3 py-1.5 text-sm text-text-dim hover:border-accent hover:text-accent"
          >
            Reset
          </button>
        )}
      </form>
    </header>
  );
}
