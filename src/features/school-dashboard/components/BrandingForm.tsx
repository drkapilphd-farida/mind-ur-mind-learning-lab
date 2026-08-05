'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { updateTenantBranding } from '../actions/updateTenantBranding'
import { TENANT_COPY } from '../tenantCopy'
import type { SchoolType } from '../types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const BrandingFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

type BrandingFormInput = z.infer<typeof BrandingFormSchema>

type BrandingFormProps = {
  schoolId: string
  tenantType: SchoolType
  currentName: string
  currentLogoUrl: string | null
}

// Uploads the logo file directly from the browser to the school-assets
// bucket (same direct-upload pattern as the one existing precedent,
// NewLearningProjectWizard.tsx -> learning-documents), path
// {schoolId}/logo.{ext}, RLS-checked via is_school_admin(). The resulting
// public URL + name are then persisted via updateTenantBranding.
export function BrandingForm({ schoolId, tenantType, currentName, currentLogoUrl }: BrandingFormProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const [logoUrl, setLogoUrl] = useState(currentLogoUrl)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const copy = TENANT_COPY[tenantType]

  const form = useForm<BrandingFormInput>({
    resolver: zodResolver(BrandingFormSchema),
    defaultValues: { name: currentName },
  })

  function handleSubmit(values: BrandingFormInput): void {
    startTransition(async () => {
      let nextLogoUrl = logoUrl

      if (selectedFile) {
        const supabase = createClient()
        const extension = selectedFile.name.split('.').pop() ?? 'png'
        const path = `${schoolId}/logo.${extension}`
        const { error: uploadError } = await supabase.storage.from('school-assets').upload(path, selectedFile, { upsert: true })
        if (uploadError) {
          toast.error(uploadError.message)
          return
        }
        const {
          data: { publicUrl },
        } = supabase.storage.from('school-assets').getPublicUrl(path)
        nextLogoUrl = publicUrl
      }

      const result = await updateTenantBranding({ schoolId, name: values.name, logoUrl: nextLogoUrl })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setLogoUrl(nextLogoUrl)
      setSelectedFile(null)
      toast.success('Branding updated')
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="space-y-2">
          <span className="text-sm font-medium">Logo</span>
          <div className="flex items-center gap-4">
            {logoUrl ? (
              <Image src={logoUrl} alt="" width={48} height={48} className="size-12 rounded-lg border object-contain" unoptimized />
            ) : (
              <div className="flex size-12 items-center justify-center rounded-lg border text-muted-foreground text-xs">None</div>
            )}
            <Input
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            />
          </div>
          <p className="text-muted-foreground text-xs">Shown across your {copy.entityLabelLower} dashboard and your students&apos; headers.</p>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{copy.nameFieldLabel}</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Saving…' : 'Save branding'}
        </Button>
      </form>
    </Form>
  )
}
