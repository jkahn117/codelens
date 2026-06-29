import type { AnalysisResult } from "../types.ts";

// Size category for treemap coloring: green → yellow → red
export function sizeCategory(sizeKb: number): "healthy" | "moderate" | "heavy" {
  if (sizeKb > 1024) return "heavy";
  if (sizeKb > 256) return "moderate";
  return "healthy";
}

// Complexity category for bar chart coloring
export function complexityCategory(score: number): "healthy" | "moderate" | "heavy" {
  if (score > 15) return "heavy";
  if (score > 8) return "moderate";
  return "healthy";
}

// Truncate file path to last 2 segments
export function truncatePath(path: string): string {
  const parts = path.split("/");
  return parts.slice(-2).join("/");
}

// Group file tree by top-level directory
export function groupByDirectory(
  fileTree: AnalysisResult["fileTree"],
): Map<string, AnalysisResult["fileTree"]> {
  const groups = new Map<string, AnalysisResult["fileTree"]>();
  for (const file of fileTree) {
    const dir = file.directory || "root";
    if (!groups.has(dir)) groups.set(dir, []);
    groups.get(dir)!.push(file);
  }
  return groups;
}
