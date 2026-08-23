import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Layers } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getIsPaidUser } from '@/lib/subscription/getIsPaidUser'
import { getQuantumDocumentCount } from '@/features/quantum-document-transformer/getQuantumDocumentCount'
import { getQuantumDocumentHistory } from '@/features/quantum-document-transformer/actions/getQuantumDocumentHistory'
import { AIDocumentTransformerWidget } from '@/components/dashboard/AIDocumentTransformerWidget'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TYPOGRAPHY } from '@/lib/designSystem/typography'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Document Mastery Studio',
}

// Pillar 3 — Document Mastery Studio™ (3-Pillar Command Center, Phase 4).
// "Upload & Master" embeds the real, already-built AI Document Transformer
// (Neural Map Notes, Smart Summaries) — "My Library" lives inside this
// same tab via the widget's own `?library=open` history drawer, so it
// doesn't need a separate top-level destination anymore. "Study Projects"
// stays a real link into the existing Learning Projects engine
// (/preview/dashboard) rather than being re-embedded here — that engine
// has its own multi-stage routes (6-stage reading flow, MCQs, etc.) that
// don't collapse into a single tab.
export default async function DocumentStudioPage(): Promise<React.JSX.Element> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/document-studio')

  const [isPaidUser, quantumDocumentCount, recentQuantumDocuments] = await Promise.all([
    getIsPaidUser(user.id),
    getQuantumDocumentCount(user.id),
    getQuantumDocumentHistory(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <p className={TYPOGRAPHY.label}>Pillar 3</p>
        <h1 className={cn(TYPOGRAPHY.h1, 'mt-1')}>📚 Document Mastery Studio</h1>
        <p className={cn(TYPOGRAPHY.body, 'mt-2 text-muted-foreground')}>
          Upload any PDF, textbook, or research paper — get Quantum Speed Reading drills, Smart Summaries, and Neural Map Notes. Your past uploads and study projects live here too.
        </p>
      </div>

      <Tabs defaultValue="upload">
        <TabsList>
          <TabsTrigger value="upload">Upload & Master</TabsTrigger>
          <TabsTrigger value="projects">Study Projects</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="pt-4">
          <AIDocumentTransformerWidget isPro={isPaidUser} initialDocumentCount={quantumDocumentCount} recentDocuments={recentQuantumDocuments.slice(0, 5)} />
        </TabsContent>

        <TabsContent value="projects" className="pt-4">
          <div className="flex flex-col items-start gap-4 rounded-2xl border border-border/60 bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/[0.08]">
                <Layers className="size-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Study Projects</p>
                <p className="mt-0.5 text-sm text-muted-foreground">Research, Revision, Focus, Memory, and Smart Notes modes — built on documents you&apos;ve already uploaded.</p>
              </div>
            </div>
            <Button asChild className="w-full rounded-full sm:w-auto">
              <Link href="/preview/dashboard">Open Study Projects</Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
