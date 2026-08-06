import { useState } from "react";
import type { AnalysisResult, FeedStep } from "../types.ts";

// Drives the activity feed and dashboard from the /api/analyze SSE stream.
export function useAnalysis() {
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
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl, sandboxId }),
      });

      if (!res.ok || !res.body) {
        failOpenSteps(`Analysis request failed: ${res.status}`);
        return null;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let nextResult: AnalysisResult | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Parse complete SSE events (separated by \n\n)
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const event of events) {
          const dataLine = event.trim();
          if (!dataLine.startsWith("data: ")) continue;

          const payload = JSON.parse(dataLine.slice(6));

          if (payload.type === "step") {
            upsertStep(payload.label, payload.status);
          } else if (payload.type === "result") {
            nextResult = payload.result as AnalysisResult;
            setResult(nextResult);
            // Close any still-open steps
            setSteps((prev) =>
              prev.map((s) => (s.status === "in-progress" ? { ...s, status: "complete" } : s)),
            );
          } else if (payload.type === "error") {
            failOpenSteps(payload.message);
          }
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
