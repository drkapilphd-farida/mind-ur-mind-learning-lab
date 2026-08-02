'use client'

import { useState } from 'react'
import { Download, Printer, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ExportControlsProps = {
  summaryText: string
}

// Native browser print (mirrors the pattern already used in
// quantum-speed-reading/components/reports/PrintButton.tsx, not its code —
// this is a new, decoupled component). "Share Progress" uses the real Web
// Share API when available, falling back to a clipboard copy — never a
// fake share network integration.
export function ExportControls({ summaryText }: ExportControlsProps): React.JSX.Element {
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')

  const handlePrint = (): void => {
    window.print()
  }

  const handleShare = async (): Promise<void> => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title: 'My Visual Intelligence Progress', text: summaryText })
        return
      } catch {
        // user cancelled or share failed — fall through to clipboard
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(summaryText)
      setShareStatus('copied')
      setTimeout(() => setShareStatus('idle'), 2000)
    }
  }

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-sm print:hidden">
      <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">Export</p>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button variant="outline" className="flex-1 gap-2 rounded-full" onClick={handlePrint}>
          <Printer className="size-4" aria-hidden="true" />
          Export PDF / Download Report
        </Button>
        <Button variant="outline" className="flex-1 gap-2 rounded-full" onClick={() => void handleShare()}>
          <Share2 className="size-4" aria-hidden="true" />
          {shareStatus === 'copied' ? 'Copied to clipboard' : 'Share Progress'}
        </Button>
      </div>
      <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
        <Download className="size-3" aria-hidden="true" />
        Uses your browser&apos;s native print-to-PDF — no third-party service involved.
      </p>
    </div>
  )
}
