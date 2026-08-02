'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'
import { useDiscoveryFlowStore } from '@/features/discover-learning-potential/store/useDiscoveryFlowStore'
import { DiscoveryProgressDots } from '@/features/discover-learning-potential/components/DiscoveryProgressDots'
import type { LearnerType } from '@/features/discover-learning-potential/types'

const OPTIONS: readonly { id: LearnerType; label: string }[] = [
  { id: 'myself', label: 'Myself' },
  { id: 'child', label: 'My Child' },
]

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
}

// Premium Mobile Polish — this screen's architecture is locked (two real
// options, one Continue action, no forms). This pass tunes vertical
// rhythm to the 8/16/24/32/48/64 spacing scale, lightens the card
// treatment toward a soft shadow, and adds the outer-journey progress
// dots (see `DiscoveryProgressDots.tsx` for why this is scoped to
// journey hand-offs, never the actual exercises).
export function WhoIsLearningScreen(): React.JSX.Element {
  const router = useRouter()
  const setLearnerType = useDiscoveryFlowStore((state) => state.setLearnerType)
  const [selected, setSelected] = useState<LearnerType | null>(null)

  function handleContinue(): void {
    if (!selected) return
    setLearnerType(selected)
    router.push('/discover-learning-potential/reading')
  }

  return (
    <main
      className="flex min-h-[100dvh] flex-col items-center justify-center gap-12 px-6 pt-16 text-center"
      style={{ paddingBottom: 'max(3rem, env(safe-area-inset-bottom))' }}
    >
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
        <DiscoveryProgressDots currentStage="who-is-learning" />
      </motion.div>

      <motion.h1 {...fadeUp} transition={{ duration: 0.6, ease: 'easeOut' }} className={cn(TYPOGRAPHY.h1)}>
        Who are you learning with today?
      </motion.h1>

      <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }} className="flex w-full max-w-sm flex-col gap-4 sm:max-w-none sm:flex-row">
        {OPTIONS.map((option) => {
          const isSelected = selected === option.id
          return (
            <motion.button
              key={option.id}
              type="button"
              onClick={() => setSelected(option.id)}
              aria-pressed={isSelected}
              whileTap={{ scale: 0.96 }}
              animate={{ scale: isSelected ? 1.03 : 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className={cn(
                'flex min-h-14 flex-1 items-center justify-center gap-2.5 rounded-2xl border px-9 py-7 text-lg font-medium transition-all duration-(--duration-fast)',
                isSelected ? 'border-primary/60 bg-primary/5 text-primary shadow-lg shadow-primary/15' : 'border-border/60 text-foreground shadow-sm hover:border-primary/30',
              )}
            >
              {option.label}
              <AnimatePresence initial={false}>
                {isSelected && (
                  <motion.span initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 20 }}>
                    <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        })}
      </motion.div>

      <motion.div {...fadeUp} transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }} className="w-full max-w-sm">
        <motion.div key={selected ?? 'unselected'} initial={{ scale: selected ? 0.92 : 1 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 420, damping: 16 }}>
          <Button
            size="lg"
            variant={selected ? 'default' : 'outline'}
            onClick={handleContinue}
            className={cn(
              'min-h-14 w-[90%] rounded-full text-base transition-all duration-(--duration-base) sm:w-full',
              selected ? 'font-semibold shadow-lg shadow-primary/20' : 'text-muted-foreground',
            )}
          >
            Continue
          </Button>
        </motion.div>
      </motion.div>
    </main>
  )
}
