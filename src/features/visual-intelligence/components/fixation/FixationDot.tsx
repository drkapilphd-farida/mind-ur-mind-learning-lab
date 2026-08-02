import { cn } from '@/lib/utils'

type FixationDotProps = {
  size?: number
  className?: string
  style?: React.CSSProperties | undefined
}

// The single reusable animated dot primitive shared by Static Dot Focus,
// Breath Sync, and Dynamic Dot. A plain, styleable div — position/scale/
// transition animation is driven entirely by the parent via `style`
// (inline transform/transition), since each exercise needs a different
// animation shape (static glow pulse, expand/contract breathing, path
// traversal) that doesn't fit one shared behavior.
export function FixationDot({ size = 24, className, style }: FixationDotProps): React.JSX.Element {
  return (
    <div
      className={cn('rounded-full bg-primary shadow-lg shadow-primary/40', className)}
      style={{ width: size, height: size, ...style }}
      aria-hidden="true"
    />
  )
}
