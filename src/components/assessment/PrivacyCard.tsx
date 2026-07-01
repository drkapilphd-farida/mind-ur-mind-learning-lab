import { ShieldCheck } from 'lucide-react'
import { Card, CardTitle, CardDescription } from '@/components/ui/card'

export function PrivacyCard(): React.JSX.Element {
  return (
    <Card className="rounded-[1.75rem] border border-border/70 bg-card/90 shadow-sm shadow-muted/10">
      <div className="flex items-start gap-4 p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </div>

        <div className="space-y-2">
          <CardTitle className="text-base font-semibold">Private by design</CardTitle>
          <CardDescription className="text-sm leading-6 text-muted-foreground">
            Your answers stay private. They are used only to personalize your experience.
          </CardDescription>
        </div>
      </div>
    </Card>
  )
}

export default PrivacyCard
