import { CreditCard } from 'lucide-react'
import { ModulePlaceholder } from '@/components/shell/ModulePlaceholder'

export default function SubscriptionPage(): React.JSX.Element {
  return (
    <ModulePlaceholder
      icon={CreditCard}
      eyebrow="Account"
      title="Subscription"
      description="Your plan, billing, and family seats will live here — arriving in a future sprint."
    />
  )
}
