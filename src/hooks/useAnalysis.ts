import { useFlueClient } from "@flue/react";
import { useState } from "react";
import type { AnalysisResult, FeedStep } from "../types.ts";
import { hashRepoUrl } from "../lib/hashRepoUrl.ts";

// Drives the activity feed and dashboard from a Flue workflow run.
export function useAnalysis() {
  const flue = useFlueClient();
  const [steps, setSteps] = useState<FeedStep[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  async function analyze(repoUrl: string) {
    setAnalyzing(true);
    setSteps([]);
    setResult(null);

    const sandboxId = await hashRepoUrl(repoUrl);
    const { runId } = await flue.workflows.invoke("analyze", {
      input: { repoUrl, sandboxId },
    });

    for await (const event of flue.runs.stream(runId, { live: true })) {
      // Step events are emitted as log events (emitData removed in beta.8)
      if (event.type === "log" && event.level === "info" && event.attributes?.status) {
        const label = event.message;
        const status = event.attributes.status as FeedStep["status"];
        setSteps((prev) => {
          const existing = prev.find((s) => s.label === label);
          if (existing) {
            return prev.map((s) => s.label === label ? { ...s, status } : s);
          }
          return [...prev, { id: crypto.randomUUID(), label, status }];
        });
      }

      if (event.type === "run_end") {
        if (!event.isError && event.result) {
          setResult(event.result as AnalysisResult);
        }
        break;
      }
    }

    setAnalyzing(false);
  }

  function reset() {
    setSteps([]);
    setResult(null);
    setAnalyzing(false);
  }

  return { analyze, steps, result, analyzing, reset };
}
