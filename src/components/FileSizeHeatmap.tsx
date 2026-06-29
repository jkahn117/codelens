import { Treemap, Tooltip, ResponsiveContainer } from "recharts";
import type { AnalysisResult } from "../types.ts";

const dirColors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#6366f1", "#ef4444", "#84cc16", "#f97316"];

function HeatmapContent(props: { x?: number; y?: number; width?: number; height?: number; fill?: string; name?: string }) {
  const { x = 0, y = 0, width = 0, height = 0, fill = "#222", name } = props;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} fillOpacity={0.7} stroke="#0a0a0a" />
      {width > 50 && height > 16 && (
        <text x={x + 3} y={y + 12} fill="#f0f0f0" fontSize={9} fontFamily="monospace">
          {name?.split("/").pop()?.slice(0, Math.floor(width / 6))}
        </text>
      )}
    </g>
  );
}

function HeatmapTooltip({ active, payload }: { active?: boolean; payload?: { payload?: { name?: string; size?: number } }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d?.name) return null;
  return (
    <div className="rounded border border-border bg-panel px-2.5 py-1.5 font-mono text-xs text-text-primary">
      {d.name} — {d.size} lines
    </div>
  );
}

export function FileSizeHeatmap({ fileTree }: { fileTree: AnalysisResult["fileTree"] }) {
  const dirs = [...new Set(fileTree.map((f) => f.directory || "root"))];
  const colorByDir = new Map(dirs.map((d, i) => [d, dirColors[i % dirColors.length]]));
  const data = fileTree.map((f) => ({ name: f.path, size: f.lines, fill: colorByDir.get(f.directory || "root") ?? "#666" }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <Treemap data={data} dataKey="size" stroke="#0a0a0a" content={<HeatmapContent />}>
        <Tooltip content={<HeatmapTooltip />} />
      </Treemap>
    </ResponsiveContainer>
  );
}
