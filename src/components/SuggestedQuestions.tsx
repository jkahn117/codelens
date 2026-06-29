const SUGGESTIONS = [
  "What's the riskiest dependency?",
  "Which file should I refactor first?",
  "Is this repo well-tested?",
];

export function SuggestedQuestions({ onSelect }: { onSelect: (q: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5 border-t border-border px-3 py-2">
      {SUGGESTIONS.map((q) => (
        <button
          key={q}
          onClick={() => onSelect(q)}
          className="rounded-full border border-border bg-page px-2.5 py-0.5 text-[11px] text-text-dim hover:border-accent hover:text-accent transition-colors"
        >
          {q}
        </button>
      ))}
    </div>
  );
}
