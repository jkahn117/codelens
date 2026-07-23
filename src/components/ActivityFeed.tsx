import type { FeedStep, AppState } from "../types.ts";

const iconMap = {
  pending: "·",
  "in-progress": "⟳",
  complete: "✓",
  error: "✕",
};
const colorMap = {
  pending: "text-text-dim",
  "in-progress": "text-accent",
  complete: "text-healthy",
  error: "text-heavy",
};

export function ActivityFeed({
  steps,
  state,
  error,
}: {
  steps: FeedStep[];
  state: AppState;
  error?: string | null;
}) {
  if (steps.length === 0 && state === "empty") {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="font-mono text-xs text-text-dim">Activity feed</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 font-mono text-[12px]">
      {steps.map((step) => (
        <div
          key={step.id}
          className="flex items-center gap-2 animate-[slideIn_0.2s_ease-out]"
        >
          <span className={`w-3 shrink-0 ${colorMap[step.status]}`}>{iconMap[step.status]}</span>
          <span className={step.status === "pending" ? "text-text-dim" : "text-text-primary"}>
            {step.label}
          </span>
        </div>
      ))}
      {state === "complete" && (
        <div className="mt-1 flex items-center gap-2 font-bold text-accent animate-[slideIn_0.2s_ease-out]">
          <span className="w-3 shrink-0">✓</span>
          <span>Analysis complete</span>
        </div>
      )}
      {state === "error" && (
        <div className="mt-1 flex flex-col gap-1 animate-[slideIn_0.2s_ease-out]">
          <div className="flex items-center gap-2 font-bold text-heavy">
            <span className="w-3 shrink-0">✕</span>
            <span>Analysis failed</span>
          </div>
          {error && (
            <span className="pl-5 text-[11px] text-text-dim break-words">{error}</span>
          )}
        </div>
      )}
    </div>
  );
}
