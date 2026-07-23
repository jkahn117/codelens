// Mirrors the Valibot AnalysisResult schema in workflows/analyze.ts
export interface AnalysisResult {
  languages: { name: string; percent: number; color: string }[];
  badges: {
    license: string;
    stars: string;
    lastCommit: string;
    openIssues: number;
  };
  dependencies: { name: string; version: string; sizeKb: number }[];
  complexity: { file: string; score: number }[];
  fileTree: { path: string; lines: number; directory: string }[];
}

export type AppState = "empty" | "analyzing" | "complete" | "error";

export interface FeedStep {
  id: string;
  label: string;
  status: "pending" | "in-progress" | "complete" | "error";
  duration?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
}
