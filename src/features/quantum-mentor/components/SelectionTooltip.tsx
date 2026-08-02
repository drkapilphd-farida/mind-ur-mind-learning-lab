'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ArrowLeft, Languages, Sparkles } from 'lucide-react'
import { usePrefersReducedMotion } from '@/hooks/exercises/usePrefersReducedMotion'
import { cn } from '@/lib/utils'
import { logger } from '@/lib/logger'
import type { SupportedLanguage } from '@/features/quantum-document-transformer/supportedLanguages'
import {
  SELECTION_ACTION_TYPES,
  SELECTION_ACTION_LABELS,
  TRANSLATE_EXPLAIN_LANGUAGES,
  type SelectionActionType,
  type ExplainSelectionResponse,
} from '../types'
import { AiMentorSelectionDrawer, type SelectionExplanationState } from './AiMentorSelectionDrawer'

const MAX_SELECTED_TEXT_CHARS = 2000
const MAX_CONTEXT_CHARS = 4000
const MIN_SELECTION_LENGTH = 3

// The three actions that fire immediately on click — `translate_explain`
// is handled separately (see `handleTranslateExplainClick`) since it needs
// a target language before it can fire.
const DIRECT_ACTION_TYPES = SELECTION_ACTION_TYPES.filter((actionType) => actionType !== 'translate_explain')

type ToolbarPosition = { top: number; left: number }

type SelectionTooltipProps = {
  children: React.ReactNode
  // Light surrounding text (e.g. the document's title + summary) that
  // grounds the explanation without itself being the thing explained —
  // see quantumMentorExplainSelectionPrompt.ts. Optional: some wrapped
  // views (e.g. a bare keyword list) have nothing useful to offer here.
  documentContext?: string
  // Regional Language Support — the document's own already-known
  // language (e.g. a document already transformed into Hindi). When this
  // is a real regional language, "Translate & Explain" fires immediately
  // using it — there's no ambiguity to ask the user about. Omitted or
  // 'en' means there's no non-English document language to fall back to,
  // so the user picks one from TRANSLATE_EXPLAIN_LANGUAGES instead.
  documentLanguage?: SupportedLanguage
}

// Text Selection & Interactive AI Mentor Copilot™ — wraps a region of a
// document result view (Summary, Spider Notes, Reading Text) and turns
// any text selection inside it into a small floating quick-action
// toolbar, Medium-highlight style. Selection is tracked via the
// document-level `selectionchange` event (the only reliable cross-browser
// signal for "the selection changed", including via keyboard/shift-arrow,
// not just mouse drag) and scoped to this component's own subtree by
// checking `container.contains(...)` — so selecting text elsewhere on the
// page (e.g. inside a sibling widget) never triggers this toolbar.
export function SelectionTooltip({ children, documentContext, documentLanguage }: SelectionTooltipProps): React.JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedText, setSelectedText] = useState<string | null>(null)
  const [position, setPosition] = useState<ToolbarPosition | null>(null)
  const [showLanguagePicker, setShowLanguagePicker] = useState(false)
  const [explanation, setExplanation] = useState<SelectionExplanationState>({ status: 'idle' })
  const prefersReducedMotion = usePrefersReducedMotion()

  const clearToolbar = useCallback(() => {
    setSelectedText(null)
    setPosition(null)
    setShowLanguagePicker(false)
  }, [])

  useEffect(() => {
    function handleSelectionChange(): void {
      const selection = window.getSelection()
      const container = containerRef.current
      if (!selection || selection.isCollapsed || !container) {
        clearToolbar()
        return
      }

      const anchorNode = selection.anchorNode
      const focusNode = selection.focusNode
      if (!anchorNode || !focusNode || !container.contains(anchorNode) || !container.contains(focusNode)) {
        clearToolbar()
        return
      }

      const text = selection.toString().trim()
      if (text.length < MIN_SELECTION_LENGTH) {
        clearToolbar()
        return
      }

      const rect = selection.getRangeAt(0).getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) {
        clearToolbar()
        return
      }

      setSelectedText(text.slice(0, MAX_SELECTED_TEXT_CHARS))
      // Viewport-relative coordinates, paired with `position: fixed` below
      // — deliberately not converted to document coordinates, since the
      // toolbar clears itself on scroll (see the listener below) rather
      // than tracking a moving target.
      setPosition({ top: rect.top - 10, left: rect.left + rect.width / 2 })
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    return () => document.removeEventListener('selectionchange', handleSelectionChange)
  }, [clearToolbar])

  useEffect(() => {
    if (!position) return undefined
    window.addEventListener('scroll', clearToolbar, { capture: true, passive: true })
    window.addEventListener('resize', clearToolbar, { passive: true })
    return () => {
      window.removeEventListener('scroll', clearToolbar, { capture: true })
      window.removeEventListener('resize', clearToolbar)
    }
  }, [position, clearToolbar])

  async function handleAction(actionType: SelectionActionType, targetLanguage?: SupportedLanguage): Promise<void> {
    const textForRequest = selectedText
    if (!textForRequest) return

    window.getSelection()?.removeAllRanges()
    clearToolbar()
    setExplanation({ status: 'loading', actionType, selectedText: textForRequest, targetLanguage })

    try {
      const response = await fetch('/api/quantum-mentor/explain-selection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selected_text: textForRequest,
          context: documentContext?.slice(0, MAX_CONTEXT_CHARS),
          action_type: actionType,
          ...(targetLanguage ? { target_language: targetLanguage } : {}),
        }),
      })
      const json = (await response.json()) as ExplainSelectionResponse

      if (!json.success) {
        logger.error('[QuantumMentorSelection] Explain-selection request failed', { error: json.error })
        setExplanation({ status: 'error', actionType, selectedText: textForRequest, error: json.error, targetLanguage })
        return
      }

      setExplanation({ status: 'success', actionType, selectedText: textForRequest, explanation: json.explanation, targetLanguage })
    } catch (error) {
      logger.error('[QuantumMentorSelection] Explain-selection request threw', { error: error instanceof Error ? error.message : 'Unknown error.' })
      setExplanation({ status: 'error', actionType, selectedText: textForRequest, error: 'Something went wrong. Please try again.', targetLanguage })
    }
  }

  // Regional Language Support — the document's own language is the real
  // fallback the brief asks for: if this document was already transformed
  // into a regional language, there's nothing ambiguous to ask the user
  // about, so fire immediately. Only an English (or unknown) document
  // language needs the picker.
  function handleTranslateExplainClick(): void {
    if (documentLanguage && documentLanguage !== 'en') {
      void handleAction('translate_explain', documentLanguage)
      return
    }
    setShowLanguagePicker(true)
  }

  return (
    <div ref={containerRef} className="relative">
      {children}

      {selectedText && position && (
        <div
          role="toolbar"
          aria-label="AI Mentor quick actions"
          // Prevents the browser from collapsing the text selection on
          // mousedown before the button's click handler runs — without
          // this, clicking a quick action would clear `selectedText` a
          // beat before `handleAction` ever reads it.
          onMouseDown={(event) => event.preventDefault()}
          style={{ top: position.top, left: position.left }}
          className={cn(
            'fixed z-40 flex -translate-x-1/2 -translate-y-full items-center gap-0.5 rounded-full border border-border bg-popover p-1 shadow-lg',
            !prefersReducedMotion && 'animate-in fade-in zoom-in-95 duration-100',
          )}
        >
          {showLanguagePicker ? (
            <>
              <button
                type="button"
                onClick={() => setShowLanguagePicker(false)}
                aria-label="Back to actions"
                className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/[0.08] hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <ArrowLeft className="size-3.5" aria-hidden="true" />
              </button>
              {TRANSLATE_EXPLAIN_LANGUAGES.map((language) => (
                <button
                  key={language.code}
                  type="button"
                  onClick={() => void handleAction('translate_explain', language.code)}
                  className="whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {language.name}
                </button>
              ))}
            </>
          ) : (
            <>
              <Sparkles className="ml-1.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
              {DIRECT_ACTION_TYPES.map((actionType) => (
                <button
                  key={actionType}
                  type="button"
                  onClick={() => void handleAction(actionType)}
                  className="whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {SELECTION_ACTION_LABELS[actionType]}
                </button>
              ))}
              <button
                type="button"
                onClick={handleTranslateExplainClick}
                className="flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-foreground/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Languages className="size-3.5 shrink-0" aria-hidden="true" />
                {SELECTION_ACTION_LABELS.translate_explain}
              </button>
            </>
          )}
        </div>
      )}

      <AiMentorSelectionDrawer state={explanation} onOpenChange={(open) => { if (!open) setExplanation({ status: 'idle' }) }} />
    </div>
  )
}
