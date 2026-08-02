'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type ExitConfirmationDialogProps = {
  open: boolean
  exerciseTitle: string
  onCancel: () => void
  onConfirmExit: () => void
}

// New territory — confirmed by repo-wide grep during Sprint 47 research that
// no exit-confirmation pattern exists anywhere in the codebase. Uses the
// existing, previously-unused Dialog primitive (src/components/ui/dialog.tsx)
// rather than building a new modal from scratch. This is PremiumReadingPlayer's
// OWN exit affordance — it does not, and cannot, intercept the exit buttons
// already built into UniversalExercisePlayer/ExerciseRunner (would require
// modifying those files, out of scope this sprint).
export function ExitConfirmationDialog({
  open,
  exerciseTitle,
  onCancel,
  onConfirmExit,
}: ExitConfirmationDialogProps): React.JSX.Element {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!nextOpen) onCancel() }}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Exit {exerciseTitle}?</DialogTitle>
          <DialogDescription>Your progress on this exercise will not be saved.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Keep Reading
          </Button>
          <Button variant="destructive" onClick={onConfirmExit}>
            Exit Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
