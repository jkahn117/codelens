import { useState } from "react";
import { HeroBar } from "./components/HeroBar.tsx";
import { TopBar } from "./components/TopBar.tsx";
import { DashboardPanel } from "./components/DashboardPanel.tsx";
import { RightPanel } from "./components/RightPanel.tsx";
import { useAnalysis } from "./hooks/useAnalysis.ts";
import type { AppState } from "./types.ts";

export function App({ authEnabled }: { authEnabled: boolean }) {
  const [state, setState] = useState<AppState>("empty");
  const [repoUrl, setRepoUrl] = useState<string | null>(null);
  // Fresh id per analysis run so chat history does not carry across runs.
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const { analyze, steps, result, analyzing, error, reset } = useAnalysis();
  const embed = new URLSearchParams(window.location.search).has("embed");

  async function handleAnalyze(url: string) {
    const sessionId = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
    setRepoUrl(url);
    setChatSessionId(sessionId);
    setState("analyzing");
    const next = await analyze(url, sessionId);
    setState(next ? "complete" : "error");
  }

  function handleReset() {
    reset();
    setRepoUrl(null);
    setChatSessionId(null);
    setState("empty");
  }

  if (embed) {
    return (
      <div className="h-full w-full overflow-hidden bg-page">
        <DashboardPanel result={result} analyzing={analyzing} error={error} />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-page">
      <TopBar authEnabled={authEnabled} />
      <HeroBar
        onAnalyze={handleAnalyze}
        onReset={handleReset}
        analyzing={analyzing}
        hasResult={state === "complete"}
        authEnabled={authEnabled}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto border-r border-border">
          <DashboardPanel result={result} analyzing={analyzing} error={error} />
        </div>
        <div className="w-[40%] min-w-90">
          <RightPanel steps={steps} state={state} error={error} chatSessionId={chatSessionId} />
        </div>
      </div>
    </div>
  );
}
