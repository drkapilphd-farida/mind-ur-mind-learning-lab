import { Separator } from '@/components/ui/separator'

export function AuthDivider({ label }: { label: string }): React.JSX.Element {
  return (
    <div className="relative flex items-center">
      <Separator className="flex-1" />
      <span className="text-muted-foreground px-3 text-xs">{label}</span>
      <Separator className="flex-1" />
    </div>
  )
}
