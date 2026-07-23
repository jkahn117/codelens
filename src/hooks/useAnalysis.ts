import { useFlueClient } from "@flue/react";
import { useState } from "react";
import type { AnalysisResult, FeedStep } from "../types.ts";

// Drives the activity feed and dashboard from a Flue workflow run.
export function useAnalysis() {
  const flue = useFlueClient();
  const [steps, setSteps] = useState<FeedStep[]>([]);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function upsertStep(label: string, status: FeedStep["status"]) {
    setSteps((prev) => {
      const existing = prev.find((s) => s.label === label);
      if (existing) {
        return prev.map((s) => (s.label === label ? { ...s, status } : s));
      }
      return [...prev, { id: crypto.randomUUID(), label, status }];
    });
  }

  function failOpenSteps(message: string) {
    setSteps((prev) =>
      prev.map((s) => (s.status === "in-progress" ? { ...s, status: "error" } : s)),
    );
    setError(message);
  }

  // sandboxId must match the chat agent id so analysis.json is written there.
  async function analyze(repoUrl: string, sandboxId: string): Promise<AnalysisResult | null> {
    setAnalyzing(true);
    setSteps([]);
    setResult(null);
    setError(null);

    try {
      const { runId } = await flue.workflows.invoke("analyze", {
        input: { repoUrl, sandboxId },
      });

      let nextResult: AnalysisResult | null = null;

      for await (const event of flue.runs.stream(runId, { live: true })) {
        if (event.type === "log" && event.level === "info" && event.attributes?.status) {
          const label = event.message;
          const status = event.attributes.status as FeedStep["status"];
          upsertStep(label, status);
        }

        if (event.type === "run_end") {
          if (event.isError) {
            const err = event.error as { message?: string } | string | undefined;
            const message =
              typeof err === "string"
                ? err
                : err?.message || "Analysis failed";
            failOpenSteps(message);
          } else if (event.result) {
            nextResult = event.result as AnalysisResult;
            setResult(nextResult);
            // Ensure any still-open steps close cleanly when the run succeeds.
            setSteps((prev) =>
              prev.map((s) =>
                s.status === "in-progress" ? { ...s, status: "complete" } : s,
              ),
            );
          } else {
            failOpenSteps("Analysis finished without a result");
          }
          break;
        }
      }

      return nextResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failOpenSteps(message);
      return null;
    } finally {
      setAnalyzing(false);
    }
  }

  function reset() {
    setSteps([]);
    setResult(null);
    setAnalyzing(false);
    setError(null);
  }

  return { analyze, steps, result, analyzing, error, reset };
}
