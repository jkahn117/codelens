export function LanguageBar({ languages }: { languages: { name: string; percent: number; color: string }[] }) {
  return (
    <div>
      <div className="flex h-6 w-full overflow-hidden rounded">
        {languages.map((lang) => (
          <div
            key={lang.name}
            style={{ width: `${lang.percent}%`, backgroundColor: lang.color }}
            className="flex items-center justify-center text-xs text-white"
          >
            {lang.percent > 8 && lang.name}
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {languages.map((lang) => (
          <div key={lang.name} className="flex items-center gap-1.5">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: lang.color }} />
            <span className="font-mono text-xs text-text-primary">{lang.name}</span>
            <span className="font-mono text-xs text-text-dim">{lang.percent}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
