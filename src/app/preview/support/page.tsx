import { LifeBuoy } from 'lucide-react'
import { ModulePlaceholder } from '@/components/shell/ModulePlaceholder'

export default function SupportPage(): React.JSX.Element {
  return (
    <ModulePlaceholder
      icon={LifeBuoy}
      eyebrow="Account"
      title="Support"
      description="Help articles and contact options will live here — arriving in a future sprint."
    />
  )
}
