import { Brain } from 'lucide-react'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import type { Mnemonic } from '../types'

type MnemonicsListViewProps = {
  mnemonics: readonly Mnemonic[]
}

// Smart Mnemonics™ — one real memory hook per genuinely difficult term/
// formula/date the model found. `mnemonics` can honestly be empty (a
// simple document may have nothing worth a memory trick) — this
// component renders nothing at all in that case rather than an empty
// "Mnemonics" section header with no content under it.
export function MnemonicsListView({ mnemonics }: MnemonicsListViewProps): React.JSX.Element | null {
  if (mnemonics.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-foreground/[0.02] p-4">
      <div className="flex items-center gap-1.5">
        <Brain className="size-3.5 text-fuchsia-500" aria-hidden="true" />
        <p className={TYPOGRAPHY.label}>Smart Mnemonics™</p>
      </div>
      <ul className="mt-3 space-y-2.5">
        {mnemonics.map((mnemonic) => (
          <li key={mnemonic.term} className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-foreground">{mnemonic.term}</span>
            <span className="text-sm text-muted-foreground">{mnemonic.hook}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
