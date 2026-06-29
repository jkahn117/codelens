import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";
import type { AnalysisResult } from "../types.ts";
import { complexityCategory, truncatePath } from "../lib/chartData.ts";

const colorMap = { healthy: "#22c55e", moderate: "#eab308", heavy: "#ef4444" };

export function ComplexityChart({ complexity }: { complexity: AnalysisResult["complexity"] }) {
  const data = [...complexity]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((c) => ({ name: truncatePath(c.file), score: c.score, fill: colorMap[complexityCategory(c.score)] }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={140} tick={{ fill: "#666", fontSize: 11, fontFamily: "monospace" }} />
        <Tooltip contentStyle={{ background: "#111", border: "1px solid #222", borderRadius: "4px", fontSize: "12px" }} />
        <Bar dataKey="score" radius={[0, 2, 2, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
