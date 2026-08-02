'use client'

import { motion } from 'framer-motion'
import { Brain, Lock, Zap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

const CARDS = [
  {
    icon: Brain,
    title: 'Personalized Journey',
    description: 'Your experience adapts to the way your brain naturally learns.',
  },
  {
    icon: Lock,
    title: 'Private by Design',
    description: 'Everything you discover remains personal and secure.',
  },
  {
    icon: Zap,
    title: 'Just a Few Minutes',
    description: 'Your personalized Brain Journey begins immediately afterwards.',
  },
] as const

// Three premium trust cards, staggered in after the hero settles. One
// shared shape (icon badge + title + one-sentence description) reusing the
// app's existing Card primitive rather than a bespoke layout.
export function TrustCards(): React.JSX.Element {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.95, ease: 'easeOut' }}
      className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3"
    >
      {CARDS.map((card, index) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.05 + index * 0.1, ease: 'easeOut' }}
          >
            <Card className="rounded-[1.5rem] border border-border/60 bg-card/80 shadow-sm shadow-muted/10">
              <CardContent className="flex flex-col items-start gap-3 px-6 py-6">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <div className="space-y-1">
                  <p className="font-heading text-sm font-semibold text-foreground">{card.title}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{card.description}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
