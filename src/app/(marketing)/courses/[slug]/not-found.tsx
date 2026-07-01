import Link from 'next/link'
import { BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CourseNotFound(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <BookOpen className="text-muted-foreground/30 mb-4 size-10" />
      <h1 className="text-xl font-semibold">Page not found</h1>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm">
        This course or lesson doesn&apos;t exist or has been removed.
      </p>
      <Button asChild className="mt-6">
        <Link href="/courses">Browse courses</Link>
      </Button>
    </div>
  )
}
