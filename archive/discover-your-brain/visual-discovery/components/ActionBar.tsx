'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

type ActionBarProps = {
  continueEnabled: boolean
}

// Continue is a real button (not a Link) so its disabled state is
// accessible and unambiguous — it only becomes navigable once the
// countdown has completed. Back stays small and subtle, returning to the
// previous screen.
export function ActionBar({ continueEnabled }: ActionBarProps): React.JSX.Element {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.8, ease: 'easeOut' }}
      className="flex flex-col items-center gap-4"
    >
      <motion.div
        whileHover={continueEnabled ? { scale: 1.02 } : {}}
        whileTap={continueEnabled ? { scale: 0.98 } : {}}
        transition={{ duration: 0.15, ease: 'easeOut' }}
      >
        <Button
          size="lg"
          disabled={!continueEnabled}
          onClick={() => router.push('/discover-your-brain/challenge')}
          className="min-w-[240px] rounded-full text-base shadow-sm"
        >
          Continue
        </Button>
      </motion.div>

      <Link
        href="/discover-your-brain"
        className="text-sm text-muted-foreground underline-offset-4 transition-colors duration-(--duration-fast) hover:text-foreground hover:underline"
      >
        Back
      </Link>
    </motion.div>
  )
}
