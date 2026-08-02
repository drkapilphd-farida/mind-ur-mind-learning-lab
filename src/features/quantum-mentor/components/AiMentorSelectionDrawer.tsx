'use client'

import { AlertCircle, Loader2, Sparkles } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { getLanguageName, type SupportedLanguage } from '@/features/quantum-document-transformer/supportedLanguages'
import { SELECTION_ACTION_LABELS, type SelectionActionType } from '../types'

// `targetLanguage` is only ever populated for the `translate_explain`
// action (see SelectionTooltip.tsx) — every other action responds in
// whatever language the highlighted text itself was already in.
export type SelectionExplanationState =
  | { status: 'idle' }
  | { status: 'loading'; actionType: SelectionActionType; selectedText: string; targetLanguage?: SupportedLanguage | undefined }
  | { status: 'success'; actionType: SelectionActionType; selectedText: string; explanation: string; targetLanguage?: SupportedLanguage | undefined }
  | { status: 'error'; actionType: SelectionActionType; selectedText: string; error: string; targetLanguage?: SupportedLanguage | undefined }

type AiMentorSelectionDrawerProps = {
  state: SelectionExplanationState
  onOpenChange: (open: boolean) => void
}

// Text Selection & Interactive AI Mentor Copilot™ — the response panel.
// A side Sheet (same primitive DocumentHistorySidebar.tsx already uses),
// not a centered Dialog: it slides in over roughly a third of the screen
// so the document the learner was reading stays visible underneath —
// "immersed in their reading flow, without losing their place" is a
// layout choice, not just copy.
export function AiMentorSelectionDrawer({ state, onOpenChange }: AiMentorSelectionDrawerProps): React.JSX.Element {
  const isOpen = state.status !== 'idle'

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border/60">
          <div className="flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-primary" aria-hidden="true" />
            <SheetTitle>
              {state.status === 'idle'
                ? 'AI Mentor'
                : state.targetLanguage
                  ? `${SELECTION_ACTION_LABELS[state.actionType]} — ${getLanguageName(state.targetLanguage)}`
                  : SELECTION_ACTION_LABELS[state.actionType]}
            </SheetTitle>
          </div>
          <SheetDescription>Your AI Mentor&rsquo;s take on the text you highlighted.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-4">
          {state.status !== 'idle' && (
            <blockquote className="mb-4 rounded-lg border-l-2 border-primary/40 bg-foreground/[0.02] py-2 pl-3 text-sm italic text-muted-foreground">
              &ldquo;{state.selectedText}&rdquo;
            </blockquote>
          )}

          {state.status === 'loading' && (
            <div className="flex items-center gap-2 py-8 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              <p className={TYPOGRAPHY.small}>Thinking it through…</p>
            </div>
          )}

          {state.status === 'success' && <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{state.explanation}</p>}

          {state.status === 'error' && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              <p className="text-sm">{state.error}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
