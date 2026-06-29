import type { FeedStep, AppState } from "../types.ts";
import { ActivityFeed } from "./ActivityFeed.tsx";
import { ChatPanel } from "./ChatPanel.tsx";

interface RightPanelProps {
  steps: FeedStep[];
  state: AppState;
  repoUrl: string | null;
}

export function RightPanel({ steps, state, repoUrl }: RightPanelProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 overflow-y-auto border-b border-border bg-page/50 p-3" style={{ maxHeight: "160px" }}>
        <ActivityFeed steps={steps} state={state} />
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatPanel state={state} repoUrl={repoUrl} />
      </div>
    </div>
  );
}
