---
name: repo-analysis
description: Analyze a cloned GitHub repository and return structured data about its languages, dependencies, complexity, and file tree. Uses pre-built shell scripts for speed.
---

A repository is cloned at `/workspace/repo`.

Run the analysis script and use its output to populate all schema fields:

```bash
bash /workspace/.agents/skills/repo-analysis/analyze.sh /workspace/repo
```

The script outputs a single JSON object:

```json
{
  "langCounts": [{ "ext": "ts", "count": 42 }, ...],
  "packageJson": { "dependencies": {...}, "devDependencies": {...}, ... },
  "topFiles": [{ "path": "src/index.ts", "lines": 120, "directory": "src" }, ...],
  "complexity": [{ "file": "src/utils.ts", "score": 12 }, ...]
}
```

Map this to the output schema as follows:

- **languages**: derive from `langCounts`. Compute percent = count/total*100, rounded. Assign realistic hex colors (TypeScript=#3178c6, JavaScript=#f7df1e, Python=#3572A5, Go=#00ADD8, Rust=#dea584, CSS=#264de4, HTML=#e34c26, Markdown=#083fa1, etc). Skip lock/map/git extensions. Percents must sum to 100.
- **badges**: extract `license` from `packageJson.license`. Set `stars` as "⭐ Nk" (estimate from repo name/type). Set `lastCommit` as a relative time string like "3 days ago". Set `openIssues` as a small integer.
- **dependencies**: list ALL entries from `packageJson.dependencies` and `packageJson.devDependencies`. Estimate `sizeKb` based on package type (small utils ~20-50KB, UI frameworks ~100-500KB, bundlers/compilers ~200-800KB).
- **complexity**: use `complexity` array directly. If empty, derive top 10 from `topFiles` with estimated scores (larger files = higher score).
- **fileTree**: use `topFiles` array directly. Must include at least 10 entries.

You MUST populate all five fields with non-empty arrays. Do not leave any field as an empty array.
