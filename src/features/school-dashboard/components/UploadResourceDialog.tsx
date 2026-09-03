'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, Upload } from 'lucide-react'
import { uploadPartnerResource } from '../actions/uploadPartnerResource'
import { SUGGESTED_PARTNER_RESOURCE_CATEGORIES } from '../types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const UploadResourceFormSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string(),
  category: z.string().min(1, 'Category is required'),
  scheduledAt: z.string(),
})

type UploadResourceFormInput = z.infer<typeof UploadResourceFormSchema>

const CATEGORY_DATALIST_ID = 'partner-resource-category-suggestions'

// File input is deliberately NOT wired into react-hook-form/Zod (a
// browser File isn't something a resolver needs to validate — the
// action itself re-checks size/type server-side) — same separate-
// useState-for-the-file convention as BrandingForm.tsx.
export function UploadResourceDialog(): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<UploadResourceFormInput>({
    resolver: zodResolver(UploadResourceFormSchema),
    defaultValues: { title: '', description: '', category: '', scheduledAt: '' },
  })

  function handleSubmit(values: UploadResourceFormInput): void {
    if (file === null) {
      toast.error('Please choose a file to upload.')
      return
    }

    const formData = new FormData()
    formData.set('title', values.title)
    formData.set('description', values.description)
    formData.set('category', values.category)
    formData.set('scheduledAt', values.scheduledAt)
    formData.set('file', file)

    startTransition(async () => {
      const result = await uploadPartnerResource(formData)
      if (!result.success) {
        toast.error(result.error)
        return
      }
      toast.success('Resource uploaded')
      form.reset({ title: '', description: '', category: '', scheduledAt: '' })
      setFile(null)
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Upload New Resource
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload new resource</DialogTitle>
          <DialogDescription>Shared with every school admin and franchise partner.</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Q3 Marketing Video Ad" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="Video Ads" list={CATEGORY_DATALIST_ID} {...field} />
                  </FormControl>
                  <datalist id={CATEGORY_DATALIST_ID}>
                    {SUGGESTED_PARTNER_RESOURCE_CATEGORIES.map((category) => (
                      <option key={category} value={category} />
                    ))}
                  </datalist>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              {/* Plain Label, not FormLabel — FormLabel calls useFormField()
                  unconditionally, which throws ("useFormField must be used
                  within <FormField>") the instant this dialog opens, since
                  this field is deliberately outside react-hook-form (see
                  this component's own top comment). This was the actual
                  root cause of the reported crash. */}
              <Label htmlFor="partner-resource-file">File</Label>
              <Input
                id="partner-resource-file"
                type="file"
                accept="application/pdf,video/mp4,image/png,image/jpeg,image/webp,.doc,.docx"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <p className="text-muted-foreground text-xs">PDF, MP4, image, or Word document — up to 50MB.</p>
            </div>

            <FormField
              control={form.control}
              name="scheduledAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scheduled for (optional)</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={isPending}>
                <Upload className="size-4" />
                {isPending ? 'Uploading…' : 'Upload resource'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
