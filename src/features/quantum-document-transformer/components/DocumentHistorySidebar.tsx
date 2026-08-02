'use client'

import { useEffect, useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { formatRelativeDate } from '@/lib/formatRelativeDate'
import { getQuantumDocumentHistory, type QuantumDocumentHistoryItem } from '../actions/getQuantumDocumentHistory'
import { getQuantumDocumentById } from '../actions/getQuantumDocumentById'
import { getLanguageName } from '../supportedLanguages'
import type { QuantumDocument } from '../types'

type DocumentHistorySidebarProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectDocument: (document: QuantumDocument) => void
}

function firstLine(text: string | null): string | null {
  if (!text) return null
  return text.split('\n').find((line) => line.trim().length > 0)?.trim() ?? null
}

// Document History & Library — reopens a past quantum_documents row's
// already-generated payload (see getQuantumDocumentById.ts) straight into
// the widget's existing result state — no new upload, no new Claude call,
// no new token cost. The list itself (getQuantumDocumentHistory.ts) only
// ever fetches the light fields a row needs to render here; the full
// payload is fetched on demand, only for the one document actually
// clicked.
export function DocumentHistorySidebar({ open, onOpenChange, onSelectDocument }: DocumentHistorySidebarProps): React.JSX.Element {
  const [items, setItems] = useState<readonly QuantumDocumentHistoryItem[] | null>(null)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [selectError, setSelectError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setSelectError(null)
    void getQuantumDocumentHistory().then(setItems)
  }, [open])

  async function handleSelect(item: QuantumDocumentHistoryItem): Promise<void> {
    setSelectError(null)
    setLoadingId(item.id)
    const result = await getQuantumDocumentById(item.id)
    setLoadingId(null)

    if (!result.success) {
      setSelectError(result.error)
      return
    }

    onSelectDocument(result.document)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border/60">
          <SheetTitle>Document History™</SheetTitle>
          <SheetDescription>Reopen a past upload — no new AI call, no extra cost.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {items === null ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <FileText className="size-8 text-muted-foreground/40" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">No documents yet — transform your first one to see it here.</p>
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => void handleSelect(item)}
                    disabled={loadingId !== null}
                    className="flex w-full items-start gap-3 rounded-xl border border-border p-3 text-left transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <div aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      {loadingId === item.id ? <Loader2 className="size-4 animate-spin text-primary" /> : <FileText className="size-4 text-primary" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate text-sm font-medium text-foreground">{item.title}</p>
                        {item.targetLanguage !== 'en' && (
                          <Badge variant="outline" className="shrink-0 text-[10px]">{getLanguageName(item.targetLanguage)}</Badge>
                        )}
                      </div>
                      {firstLine(item.aiSummary) && (
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{firstLine(item.aiSummary)}</p>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground/70">{formatRelativeDate(item.createdAt)}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {selectError && <p className="mt-3 text-center text-xs text-destructive" role="alert">{selectError}</p>}
        </div>
      </SheetContent>
    </Sheet>
  )
}
