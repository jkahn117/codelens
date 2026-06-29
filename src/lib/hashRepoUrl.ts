// Deterministic agent instance ID from repo URL — SHA-256 truncated to 16 chars
export async function hashRepoUrl(repoUrl: string): Promise<string> {
  const normalized = repoUrl.replace(/^https?:\/\//, "").replace(/\.git$/, "");
  const data = new TextEncoder().encode(normalized);
  const hash = await crypto.subtle.digest("SHA-256", data);
  const hex = Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hex.slice(0, 16);
}
