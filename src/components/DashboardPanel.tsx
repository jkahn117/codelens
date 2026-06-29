import type { AnalysisResult } from "../types.ts";
import { LanguageBar } from "./LanguageBar.tsx";
import { HealthBadges } from "./HealthBadges.tsx";
import { DependencyTreemap } from "./DependencyTreemap.tsx";
import { ComplexityChart } from "./ComplexityChart.tsx";
import { FileSizeHeatmap } from "./FileSizeHeatmap.tsx";
import { Skeleton } from "./Skeleton.tsx";

interface DashboardPanelProps {
  result: AnalysisResult | null;
  analyzing: boolean;
}

export function DashboardPanel({ result, analyzing }: DashboardPanelProps) {
  if (!result && !analyzing) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="font-mono text-lg text-text-dim">Paste a GitHub repo URL to analyze it</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex gap-6">
        <div className="flex-[3]">
          <h3 className="mb-2 font-mono text-xs text-text-dim">Languages</h3>
          {result ? <LanguageBar languages={result.languages} /> : <Skeleton height="60px" />}
        </div>
        <div className="flex-[2]">
          <h3 className="mb-2 font-mono text-xs text-text-dim">Health</h3>
          {result ? <HealthBadges badges={result.badges} /> : <Skeleton height="60px" />}
        </div>
      </div>
      <div>
        <h3 className="mb-2 font-mono text-xs text-text-dim">
          Dependencies{result && ` (${result.dependencies.length})`}
        </h3>
        {result ? <DependencyTreemap dependencies={result.dependencies} /> : <Skeleton height="220px" />}
      </div>
      <div>
        <h3 className="mb-2 font-mono text-xs text-text-dim">Most Complex Files</h3>
        {result ? <ComplexityChart complexity={result.complexity} /> : <Skeleton height="200px" />}
      </div>
      <div>
        <h3 className="mb-2 font-mono text-xs text-text-dim">Codebase Structure</h3>
        {result ? <FileSizeHeatmap fileTree={result.fileTree} /> : <Skeleton height="200px" />}
      </div>
    </div>
  );
}
