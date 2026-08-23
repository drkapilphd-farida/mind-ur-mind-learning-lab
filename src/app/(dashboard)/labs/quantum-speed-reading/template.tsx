import { PageTransition } from '@/components/motion/PageTransition'

export default function Template({ children }: { children: React.ReactNode }): React.JSX.Element {
  return <PageTransition>{children}</PageTransition>
}
