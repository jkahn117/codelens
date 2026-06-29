import { useFlueAgent } from "@flue/react";
import { useMemo, useState } from "react";
import { hashRepoUrl } from "../lib/hashRepoUrl.ts";

// Chat composable backed by useFlueAgent (beta.8 conversation API).
export function useChat(repoUrl: string | null) {
  const [agentId, setAgentId] = useState<string>("");

  // Derive the stable agent ID from the repo URL once it's available.
  useMemo(() => {
    if (!repoUrl) return;
    hashRepoUrl(repoUrl).then(setAgentId);
  }, [repoUrl]);

  const { messages, status, sendMessage } = useFlueAgent({
    name: "repo-analyzer",
    id: agentId || undefined,
  });

  const streaming = status === "submitted" || status === "streaming";

  async function send(text: string) {
    if (!agentId) return;
    await sendMessage(text);
  }

  return { messages, send, streaming };
}
