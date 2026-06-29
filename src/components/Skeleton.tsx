export function Skeleton({ height = "200px" }: { height?: string }) {
  return <div className="animate-pulse rounded bg-border/50" style={{ height }} />;
}
