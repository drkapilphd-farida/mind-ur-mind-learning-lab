'use client'

import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { MessageSquareHeart, X } from 'lucide-react'
import { submitParentFeedback } from '../actions/submitParentFeedback'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'

type ParentFeedbackWidgetProps = {
  schoolId: string
  schoolName: string
  entityLabel: string
}

const DISMISS_STORAGE_KEY_PREFIX = 'parent-feedback-dismissed-until:'
const DISMISS_DAYS_ON_SKIP = 30
const DISMISS_DAYS_ON_SUBMIT = 90

function storageKey(schoolId: string): string {
  return `${DISMISS_STORAGE_KEY_PREFIX}${schoolId}`
}

function isDismissed(schoolId: string): boolean {
  const raw = window.localStorage.getItem(storageKey(schoolId))
  if (raw === null) return false
  const dismissedUntil = Number(raw)
  return !Number.isNaN(dismissedUntil) && Date.now() < dismissedUntil
}

function setDismissedForDays(schoolId: string, days: number): void {
  window.localStorage.setItem(storageKey(schoolId), String(Date.now() + days * 24 * 60 * 60 * 1000))
}

// A small, dismissible prompt — never an auto-opening modal. Rendered
// only by ParentFeedbackPrompt.tsx after it's already confirmed the
// signed-in user is an active student of a real tenant, so this
// component itself doesn't re-check that; it only handles the
// "have they already dismissed/answered recently" question, which is
// inherently client-side (localStorage) state a Server Component can't
// know.
export function ParentFeedbackWidget({ schoolId, schoolName, entityLabel }: ParentFeedbackWidgetProps): React.JSX.Element | null {
  const [visible, setVisible] = useState(false)
  const [open, setOpen] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [feedbackText, setFeedbackText] = useState('')
  const [isPending, startTransition] = useTransition()

  // Server-rendered HTML has no localStorage to consult, so this starts
  // hidden and only becomes visible after mount confirms it hasn't been
  // dismissed/answered recently — avoids a hydration mismatch between
  // server and client markup.
  useEffect(() => {
    setVisible(!isDismissed(schoolId))
  }, [schoolId])

  function handleDismiss(): void {
    setDismissedForDays(schoolId, DISMISS_DAYS_ON_SKIP)
    setVisible(false)
  }

  function handleSubmit(): void {
    if (score === null) {
      toast.error('Please select a score from 0 to 10.')
      return
    }
    startTransition(async () => {
      const result = await submitParentFeedback({ schoolId, npsScore: score, feedbackText: feedbackText.trim() === '' ? undefined : feedbackText.trim() })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Thanks for your feedback!')
      setDismissedForDays(schoolId, DISMISS_DAYS_ON_SUBMIT)
      setOpen(false)
      setVisible(false)
      setScore(null)
      setFeedbackText('')
    })
  }

  if (!visible) {
    return null
  }

  return (
    <>
      <div className="bg-card flex items-center justify-between gap-3 rounded-2xl border p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-xl">
            <MessageSquareHeart className="size-4.5" />
          </div>
          <div>
            <p className="text-sm font-medium">How&rsquo;s {schoolName} going?</p>
            <p className="text-muted-foreground text-xs">A quick rating helps them improve.</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button type="button" size="sm" onClick={() => setOpen(true)}>
            Rate now
          </Button>
          <Button type="button" variant="ghost" size="icon" onClick={handleDismiss} aria-label="Dismiss">
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rate {schoolName}</DialogTitle>
            <DialogDescription>How likely are you to recommend this {entityLabel.toLowerCase()} to a friend or colleague?</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <div className="grid grid-cols-11 gap-1">
                {Array.from({ length: 11 }, (_, value) => value).map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setScore(value)}
                    className={cn(
                      'flex h-9 items-center justify-center rounded-md border text-sm font-medium tabular-nums transition-colors',
                      score === value ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted border-border',
                    )}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <div className="text-muted-foreground mt-1.5 flex justify-between text-xs">
                <span>Not likely</span>
                <span>Very likely</span>
              </div>
            </div>

            <Textarea
              placeholder="Anything you'd like to share? (optional)"
              value={feedbackText}
              onChange={(event) => setFeedbackText(event.target.value)}
              maxLength={2000}
            />
          </div>

          <DialogFooter>
            <Button type="button" onClick={handleSubmit} disabled={isPending}>
              {isPending ? 'Submitting…' : 'Submit feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
