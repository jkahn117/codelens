import { useState } from "react";
import { SignInButton, useUser } from "@clerk/react";

const DEFAULT_REPO = "https://github.com/cloudflare/workers-sdk";

interface HeroBarProps {
  onAnalyze: (url: string) => void;
  onReset: () => void;
  analyzing: boolean;
  hasResult: boolean;
  authEnabled: boolean;
}

/** Modal that appears when an unauthenticated user tries to run an analysis. */
function SignInPrompt({ onClose }: { onClose: () => void }) {
  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Panel — stop clicks propagating to backdrop */}
      <div
        className="relative w-full max-w-sm rounded-lg border border-border bg-panel p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-text-dim hover:text-text-primary transition-colors cursor-pointer"
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
          </svg>
        </button>

        {/* Lock icon */}
        <div className="mb-5 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="text-accent">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>

        {/* Copy */}
        <h2 className="mb-2 text-center text-base font-semibold text-text-primary">
          Sign in to analyze
        </h2>
        <p className="mb-6 text-center text-sm text-text-dim">
          CodeLens requires an account to run repository analysis.
        </p>

        {/* Sign in CTA — opens Clerk's modal, closes this dialog first */}
        <SignInButton mode="modal">
          <button
            onClick={onClose}
            className="w-full cursor-pointer rounded bg-accent py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
          >
            Sign in
          </button>
        </SignInButton>
      </div>
    </div>
  );
}

interface HeroBarContentProps {
  url: string;
  setUrl: (url: string) => void;
  onSubmit: (event: React.FormEvent) => void;
  onReset: () => void;
  analyzing: boolean;
  hasResult: boolean;
  showPrompt: boolean;
  onClosePrompt: () => void;
}

function HeroBarContent({
  url,
  setUrl,
  onSubmit,
  onReset,
  analyzing,
  hasResult,
  showPrompt,
  onClosePrompt,
}: HeroBarContentProps) {
  return (
    <>
      <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-panel px-6">
        <form onSubmit={onSubmit} className="flex flex-1 items-center gap-3">
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

      {showPrompt && <SignInPrompt onClose={onClosePrompt} />}
    </>
  );
}

function AuthenticatedHeroBar({
  url,
  setUrl,
  onAnalyze,
  onReset,
  analyzing,
  hasResult,
  showPrompt,
  setShowPrompt,
}: Omit<HeroBarContentProps, "onSubmit" | "onClosePrompt"> & { onAnalyze: (url: string) => void; setShowPrompt: (show: boolean) => void }) {
  const { isSignedIn, isLoaded } = useUser();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || analyzing) return;

    if (isLoaded && !isSignedIn) {
      setShowPrompt(true);
      return;
    }

    onAnalyze(url.trim());
  }

  return (
    <HeroBarContent
      url={url}
      setUrl={setUrl}
      onSubmit={handleSubmit}
      onReset={onReset}
      analyzing={analyzing}
      hasResult={hasResult}
      showPrompt={showPrompt}
      onClosePrompt={() => setShowPrompt(false)}
    />
  );
}

export function HeroBar({ onAnalyze, onReset, analyzing, hasResult, authEnabled }: HeroBarProps) {
  const [url, setUrl] = useState(DEFAULT_REPO);
  const [showPrompt, setShowPrompt] = useState(false);

  if (authEnabled) {
    return (
      <AuthenticatedHeroBar
        url={url}
        setUrl={setUrl}
        onAnalyze={onAnalyze}
        onReset={onReset}
        analyzing={analyzing}
        hasResult={hasResult}
        showPrompt={showPrompt}
        setShowPrompt={setShowPrompt}
      />
    );
  }

  return (
    <HeroBarContent
      url={url}
      setUrl={setUrl}
      onSubmit={(e) => {
        e.preventDefault();
        if (url.trim() && !analyzing) onAnalyze(url.trim());
      }}
      onReset={onReset}
      analyzing={analyzing}
      hasResult={hasResult}
      showPrompt={false}
      onClosePrompt={() => undefined}
    />
  );
}
