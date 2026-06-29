import { useState } from "react";
import { HeroBar } from "./components/HeroBar.tsx";
import { DashboardPanel } from "./components/DashboardPanel.tsx";
import { RightPanel } from "./components/RightPanel.tsx";
import { useAnalysis } from "./hooks/useAnalysis.ts";
import type { AppState } from "./types.ts";

export function App() {
  const [state, setState] = useState<AppState>("empty");
  const [repoUrl, setRepoUrl] = useState<string | null>(null);
  const { analyze, steps, result, analyzing, reset } = useAnalysis();
  const embed = new URLSearchParams(window.location.search).has("embed");

  async function handleAnalyze(url: string) {
    setRepoUrl(url);
    setState("analyzing");
    await analyze(url);
    setState("complete");
  }

  function handleReset() {
    reset();
    setRepoUrl(null);
    setState("empty");
  }

  if (embed) {
    return (
      <div className="h-full w-full overflow-hidden bg-page">
        <DashboardPanel result={result} analyzing={analyzing} />
      </div>
    );
  }

  return (
    <div className="flex h-full w-full flex-col bg-page">
      <HeroBar
        onAnalyze={handleAnalyze}
        onReset={handleReset}
        analyzing={analyzing}
        hasResult={state === "complete"}
      />
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto border-r border-border">
          <DashboardPanel result={result} analyzing={analyzing} />
        </div>
        <div className="w-[40%] min-w-90">
          <RightPanel steps={steps} state={state} repoUrl={repoUrl} />
        </div>
      </div>
    </div>
  );
}
