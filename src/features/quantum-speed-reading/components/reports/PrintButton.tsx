'use client'

import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

// Sprint-6, Part 4 — browser-native print/PDF export. Every browser's
// print dialog can already "Save as PDF," so this satisfies "PDF export
// ready" with zero new dependencies. Hidden on print via .print\:hidden
// (see the @media print rules in globals.css).
export function PrintButton(): React.JSX.Element {
  return (
    <Button variant="outline" size="sm" className="print:hidden" onClick={() => window.print()}>
      <Printer aria-hidden="true" />
      Print / Save as PDF
    </Button>
  )
}
