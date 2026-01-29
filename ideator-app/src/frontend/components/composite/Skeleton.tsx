// ============================================================================
// IDEATOR — Skeleton Loading Composite (FE-1.3)
// ============================================================================

interface SkeletonProps {
  width?: string;
  height?: string;
  className?: string;
}

export function Skeleton({ width = '100%', height = '20px', className = '' }: SkeletonProps) {
  return (
    <div
      className={`bg-[var(--bg-tertiary)] rounded-[var(--radius-sm)] animate-pulse ${className}`}
      style={{ width, height }}
    />
  );
}
