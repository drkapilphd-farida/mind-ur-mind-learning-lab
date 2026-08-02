import { Settings } from 'lucide-react'
import { ModulePlaceholder } from '@/components/shell/ModulePlaceholder'

export default function PreviewSettingsPage(): React.JSX.Element {
  return (
    <ModulePlaceholder
      icon={Settings}
      eyebrow="Account"
      title="Settings"
      description="Account, notification, and privacy settings for AI Learning Studio™ will live here — arriving in a future sprint."
    />
  )
}
