import { useFlueAgent } from "@flue/react";

// Chat composable backed by useFlueAgent. agentId is the sandboxId — the same
// container the analysis route wrote analysis.json into.
export function useChat(agentId: string | null) {
  const { messages, status, sendMessage } = useFlueAgent({
    url: agentId ? `/agents/repo-analyzer/${agentId}` : undefined,
  });

  const streaming = status === "submitted" || status === "streaming";

  async function send(text: string) {
    if (!agentId) return;
    await sendMessage(text);
  }

  return { messages, send, streaming };
}
