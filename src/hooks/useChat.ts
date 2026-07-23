import { useFlueAgent } from "@flue/react";

// Chat composable backed by useFlueAgent. agentId must match the workflow sandboxId
// so analysis.json lands in the same container the chat agent uses.
export function useChat(agentId: string | null) {
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
