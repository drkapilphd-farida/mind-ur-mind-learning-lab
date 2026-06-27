import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Award, BookOpen, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CopyCertLinkButton } from '@/features/certificates/components/CopyCertLinkButton'

type CertificatePageProps = {
  params: Promise<{ token: string }>
}

export async function generateMetadata({
  params,
}: CertificatePageProps): Promise<Metadata> {
  const { token } = await params
  const supabase = await createClient()

  const { data: cert } = await supabase
    .from('certificates')
    .select('course_id')
    .eq('token', token)
    .single()

  if (!cert) return { title: 'Certificate Not Found' }

  const { data: course } = await supabase
    .from('courses')
    .select('title')
    .eq('id', cert.course_id)
    .single()

  return { title: `Certificate — ${course?.title ?? 'Course'}` }
}

export default async function CertificatePage({
  params,
}: CertificatePageProps): Promise<React.JSX.Element> {
  const { token } = await params
  const supabase = await createClient()

  const { data: cert } = await supabase
    .from('certificates')
    .select('id, token, issued_at, course_id, user_id')
    .eq('token', token)
    .single()

  if (!cert) notFound()

  const [{ data: course }, { data: profile }] = await Promise.all([
    supabase
      .from('courses')
      .select('title, slug')
      .eq('id', cert.course_id)
      .single(),
    supabase
      .from('profiles')
      .select('full_name')
      .eq('id', cert.user_id)
      .single(),
  ])

  if (!course) notFound()

  const studentName = profile?.full_name ?? 'A dedicated learner'
  const issueDate = new Intl.DateTimeFormat('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(cert.issued_at))

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const certUrl = `${appUrl}/certificates/${cert.token}`

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl">
        <div className="rounded-2xl border-2 bg-card shadow-lg">
          {/* Header band */}
          <div className="bg-primary rounded-t-2xl px-10 py-8 text-center text-primary-foreground">
            <div className="mb-3 flex justify-center">
              <Award className="size-12" />
            </div>
            <p className="text-xs font-semibold tracking-widest uppercase opacity-80">
              Mind Ur Mind Learning Lab™
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">
              Certificate of Completion
            </h1>
          </div>

          {/* Body */}
          <div className="px-10 py-10 text-center">
            <p className="text-muted-foreground text-sm">This certifies that</p>

            <p className="mt-3 text-3xl font-bold tracking-tight">
              {studentName}
            </p>

            <p className="text-muted-foreground mt-4 text-sm">
              has successfully completed
            </p>

            <p className="mt-2 text-xl font-semibold">{course.title}</p>

            <Separator className="my-8" />

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Calendar className="size-4 shrink-0" />
              <span>Issued on {issueDate}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-muted/30 rounded-b-2xl border-t px-8 py-4">
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
              <p className="text-muted-foreground truncate text-xs">{certUrl}</p>
              <div className="flex shrink-0 gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/courses/${course.slug}`}>
                    <BookOpen className="size-3.5" />
                    Back to course
                  </Link>
                </Button>
                <CopyCertLinkButton url={certUrl} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
