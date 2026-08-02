'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Reuses PrintButton.tsx's own established "window.print() is our real
// PDF export" convention verbatim (zero new dependencies — every
// browser's print dialog can already "Save as PDF") — just styled as the
// high-visibility, explicitly-labeled action this certificate calls for,
// rather than the small outline button regular reports use.
export function DownloadCertificateButton(): React.JSX.Element {
  return (
    <Button size="lg" className="print:hidden rounded-full" onClick={() => window.print()}>
      <Download aria-hidden="true" />
      Download Certificate (PDF)
    </Button>
  )
}
