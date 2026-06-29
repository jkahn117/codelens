import { Treemap, Tooltip, ResponsiveContainer } from "recharts";
import type { AnalysisResult } from "../types.ts";
import { sizeCategory } from "../lib/chartData.ts";

const colorMap = { healthy: "#22c55e", moderate: "#eab308", heavy: "#ef4444" };

function TreemapContent(props: { x?: number; y?: number; width?: number; height?: number; fill?: string; name?: string }) {
  const { x = 0, y = 0, width = 0, height = 0, fill = "#222", name } = props;
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} stroke="#0a0a0a" />
      {width > 60 && height > 20 && (
        <text x={x + 4} y={y + 14} fill="#f0f0f0" fontSize={10} fontFamily="monospace">
          {name?.slice(0, Math.floor(width / 7))}
        </text>
      )}
    </g>
  );
}

function TreemapTooltip({ active, payload }: { active?: boolean; payload?: { payload?: { name?: string; size?: number } }[] }) {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d?.name) return null;
  return (
    <div className="rounded border border-border bg-panel px-2.5 py-1.5 font-mono text-xs text-text-primary">
      {d.name} — {d.size} KB
    </div>
  );
}

export function DependencyTreemap({ dependencies }: { dependencies: AnalysisResult["dependencies"] }) {
  if (dependencies.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center rounded border border-border">
        <span className="font-mono text-xs text-text-dim">No package.json found</span>
      </div>
    );
  }

  const data = dependencies.map((dep) => ({
    name: `${dep.name}@${dep.version}`,
    size: dep.sizeKb,
    fill: colorMap[sizeCategory(dep.sizeKb)],
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <Treemap data={data} dataKey="size" stroke="#0a0a0a" content={<TreemapContent />}>
        <Tooltip content={<TreemapTooltip />} />
      </Treemap>
    </ResponsiveContainer>
  );
}
