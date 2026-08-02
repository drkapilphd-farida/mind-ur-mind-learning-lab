'use client'

import { motion } from 'framer-motion'

const ITEMS = [
  {
    icon: '📖',
    title: 'Read',
    description: 'Discover how naturally and comfortably you read.',
  },
  {
    icon: '🧠',
    title: 'Remember',
    description: 'Explore how your brain remembers information.',
  },
  {
    icon: '🎯',
    title: 'Focus',
    description: 'Observe how steadily your attention stays engaged.',
  },
  {
    icon: '😌',
    title: 'Stay Calm',
    description: 'See how calm and mentally ready you are to learn.',
  },
] as const

// Section 2 — What You Will Discover. Deliberately no cards, shadows or
// borders — just icons and labels, kept as light as the hero. Equal
// height across the row comes from CSS Grid's default row-stretch, so
// each item just needs to fill its cell rather than set an explicit height.
export function DiscoveryPreview(): React.JSX.Element {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, delay: index * 0.1, ease: 'easeOut' }}
            className="flex h-full flex-col items-center gap-3 text-center transition-transform duration-300 hover:-translate-y-0.5"
          >
            <span aria-hidden="true" className="text-3xl">
              {item.icon}
            </span>
            <p className="font-heading text-base font-semibold text-foreground">{item.title}</p>
            <p className="text-sm leading-6 text-muted-foreground">{item.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
