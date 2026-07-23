/** Parse a public GitHub repo URL into owner/repo. Rejects non-GitHub hosts. */
export function parseGitHubRepo(
  repoUrl: string,
): { owner: string; repo: string; cloneUrl: string } | null {
  const cleaned = repoUrl.trim().replace(/\.git$/, "").replace(/\/+$/, "");
  const match = cleaned.match(
    /^(?:https?:\/\/)?(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)$/i,
  );
  if (!match) return null;
  const owner = match[1];
  const repo = match[2];
  return { owner, repo, cloneUrl: `https://github.com/${owner}/${repo}.git` };
}

/** Format star count as "⭐ 4.2k" for dashboard badges. */
export function formatStars(count: number): string {
  if (count >= 1_000_000) return `⭐ ${(count / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
  if (count >= 10_000) return `⭐ ${Math.round(count / 1000)}k`;
  if (count >= 1000) return `⭐ ${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `⭐ ${count}`;
}

/** Relative time string from an ISO timestamp. */
export function relativeTime(iso: string, now = Date.now()): string {
  const diffMs = Math.max(0, now - new Date(iso).getTime());
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export interface GitHubBadges {
  license: string;
  stars: string;
  lastCommit: string;
  openIssues: number;
}

/** Fetch live repo metadata from the GitHub REST API. */
export async function fetchGitHubBadges(
  owner: string,
  repo: string,
): Promise<GitHubBadges> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "codelens-demo",
    },
  });

  if (!res.ok) {
    return {
      license: "Unknown",
      stars: "⭐ ?",
      lastCommit: "unknown",
      openIssues: 0,
    };
  }

  const data = (await res.json()) as {
    stargazers_count?: number;
    open_issues_count?: number;
    pushed_at?: string;
    license?: { spdx_id?: string | null } | null;
  };

  const spdx = data.license?.spdx_id;
  return {
    license: spdx && spdx !== "NOASSERTION" ? spdx : "Unknown",
    stars: formatStars(data.stargazers_count ?? 0),
    lastCommit: data.pushed_at ? relativeTime(data.pushed_at) : "unknown",
    openIssues: data.open_issues_count ?? 0,
  };
}
