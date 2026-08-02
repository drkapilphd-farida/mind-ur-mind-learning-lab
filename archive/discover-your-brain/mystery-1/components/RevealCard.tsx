import { Card, CardContent } from '@/components/ui/card'

type RevealCardProps = {
  icon: string
  title: string
  body: string
}

// Reusable icon + title + body card. Content only observes and connects —
// never judges ("Excellent"/"Poor"/etc. are never valid values here).
// Icon sits as its own leading line for clearer typographic hierarchy
// rather than an inline prefix.
export function RevealCard({ icon, title, body }: RevealCardProps): React.JSX.Element {
  return (
    <Card className="rounded-[1.5rem] border border-border/60 bg-card/80 shadow-sm shadow-muted/10">
      <CardContent className="flex flex-col items-start gap-3 px-7 py-7 text-left">
        <span aria-hidden="true" className="text-2xl">
          {icon}
        </span>
        <p className="font-heading text-base font-semibold tracking-tight text-foreground">{title}</p>
        <p className="text-[15px] leading-7 text-muted-foreground">{body}</p>
      </CardContent>
    </Card>
  )
}
