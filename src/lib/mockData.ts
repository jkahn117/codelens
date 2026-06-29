import type { AnalysisResult, FeedStep } from "../types.ts";

// Sample analysis result used when running the frontend without the Flue backend.
export const mockAnalysisResult: AnalysisResult = {
  languages: [
    { name: "TypeScript", percent: 62, color: "#3178c6" },
    { name: "JavaScript", percent: 18, color: "#f7df1e" },
    { name: "CSS", percent: 12, color: "#264de4" },
    { name: "HTML", percent: 5, color: "#e34c26" },
    { name: "Other", percent: 3, color: "#888888" },
  ],
  badges: {
    license: "MIT",
    stars: "⭐ 4.2k",
    lastCommit: "2 days ago",
    openIssues: 47,
  },
  dependencies: [
    { name: "react", version: "^19.0.0", sizeKb: 42 },
    { name: "react-dom", version: "^19.0.0", sizeKb: 168 },
    { name: "recharts", version: "^3.0.0", sizeKb: 1240 },
    { name: "hono", version: "^4.7.0", sizeKb: 86 },
    { name: "valibot", version: "^1.0.0", sizeKb: 34 },
    { name: "agents", version: "^0.14.2", sizeKb: 312 },
    { name: "tailwindcss", version: "^4.0.0", sizeKb: 580 },
    { name: "@cloudflare/sandbox", version: "^0.11.0", sizeKb: 210 },
    { name: "@vitejs/plugin-react", version: "^4.3.0", sizeKb: 145 },
  ],
  complexity: [
    { file: "src/hooks/useAnalysis.ts", score: 24 },
    { file: "src/hooks/useChat.ts", score: 19 },
    { file: "src/components/DependencyTreemap.tsx", score: 14 },
    { file: "src/components/FileSizeHeatmap.tsx", score: 12 },
    { file: "src/components/ComplexityChart.tsx", score: 10 },
    { file: "src/lib/chartData.ts", score: 7 },
    { file: "src/components/HeroBar.tsx", score: 5 },
    { file: "src/components/HealthBadges.tsx", score: 4 },
    { file: "src/components/LanguageBar.tsx", score: 4 },
    { file: "src/components/Skeleton.tsx", score: 2 },
  ],
  fileTree: [
    { path: "src/App.tsx", lines: 42, directory: "src" },
    { path: "src/main.tsx", lines: 13, directory: "src" },
    { path: "src/index.css", lines: 25, directory: "src" },
    { path: "src/components/HeroBar.tsx", lines: 43, directory: "src/components" },
    { path: "src/components/DashboardPanel.tsx", lines: 60, directory: "src/components" },
    { path: "src/components/RightPanel.tsx", lines: 24, directory: "src/components" },
    { path: "src/components/LanguageBar.tsx", lines: 38, directory: "src/components" },
    { path: "src/components/HealthBadges.tsx", lines: 33, directory: "src/components" },
    { path: "src/components/DependencyTreemap.tsx", lines: 71, directory: "src/components" },
    { path: "src/components/ComplexityChart.tsx", lines: 51, directory: "src/components" },
    { path: "src/components/FileSizeHeatmap.tsx", lines: 74, directory: "src/components" },
    { path: "src/components/ActivityFeed.tsx", lines: 50, directory: "src/components" },
    { path: "src/components/ChatPanel.tsx", lines: 46, directory: "src/components" },
    { path: "src/components/MessageList.tsx", lines: 24, directory: "src/components" },
    { path: "src/components/MessageInput.tsx", lines: 41, directory: "src/components" },
    { path: "src/components/SuggestedQuestions.tsx", lines: 25, directory: "src/components" },
    { path: "src/components/Skeleton.tsx", lines: 20, directory: "src/components" },
    { path: "src/hooks/useAnalysis.ts", lines: 60, directory: "src/hooks" },
    { path: "src/hooks/useChat.ts", lines: 55, directory: "src/hooks" },
    { path: "src/lib/chartData.ts", lines: 34, directory: "src/lib" },
    { path: "src/lib/stepLabels.ts", lines: 12, directory: "src/lib" },
    { path: "src/lib/hashRepoUrl.ts", lines: 10, directory: "src/lib" },
    { path: "src/lib/mockData.ts", lines: 85, directory: "src/lib" },
    { path: "src/types.ts", lines: 28, directory: "src" },
  ],
};

// Simulated activity feed steps shown during analysis.
export const mockActivitySteps: FeedStep[] = [
  { id: "1", label: "Connected to GitHub", status: "complete" },
  { id: "2", label: "Cloning repo", status: "complete", duration: "1.4s" },
  { id: "3", label: "Reading package.json", status: "complete" },
  { id: "4", label: "Scanning files", status: "complete" },
  { id: "5", label: "Resolving dependencies", status: "complete" },
  { id: "6", label: "Computing complexity", status: "complete" },
  { id: "7", label: "Building report", status: "complete" },
];

// Deterministic canned responses for the mock chat agent.
const cannedResponses: Record<string, string> = {
  "What's the riskiest dependency?":
    "`recharts` is the riskiest dependency at 1.2 MB. It also has a complex API surface, so upgrading or replacing it later would be non-trivial.",
  "Which file should I refactor first?":
    "Start with `src/hooks/useAnalysis.ts` — it has the highest cyclomatic complexity score (24) and handles the most state transitions.",
  "Is this repo well-tested?":
    "No test files were found in the scan. This is a demo project, but for production you'd want unit tests around `useAnalysis` and the chart components.",
};

export function getCannedResponse(question: string): string {
  const normalized = question.trim();
  return (
    cannedResponses[normalized] ??
    "That's a great question about this repo. In the full Flue-backed version, the agent would inspect the cloned files and give you a contextual answer."
  );
}
