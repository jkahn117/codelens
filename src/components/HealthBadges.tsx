import type { AnalysisResult } from "../types.ts";

export function HealthBadges({ badges }: { badges: AnalysisResult["badges"] }) {
  const items = [
    { label: "License", value: badges.license, color: "text-healthy" },
    { label: "Stars", value: badges.stars, color: "text-accent" },
    { label: "Last commit", value: badges.lastCommit, color: "text-moderate" },
    { label: "Open issues", value: `${badges.openIssues} open`, color: "text-heavy" },
  ];

  return (
    <div className="grid grid-cols-2 gap-2">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2 rounded border border-border bg-page px-3 py-1.5">
          <span className="font-mono text-xs text-text-dim">{item.label}</span>
          <span className={`font-mono text-xs font-medium ${item.color}`}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}
