import { clsx } from 'clsx'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  rounded?: boolean
  className?: string
}

export default function Skeleton({ width, height = 16, rounded, className }: SkeletonProps) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-[var(--bg-surface)]',
        rounded ? 'rounded-full' : 'rounded-[var(--radius-md)]',
        className,
      )}
      style={{ width, height }}
    />
  )
}
