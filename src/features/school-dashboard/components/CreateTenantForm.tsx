'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { createSchool } from '../actions/createSchool'
import { SCHOOL_TIER_LABELS, type SchoolType } from '../types'
import { TENANT_COPY } from '../tenantCopy'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const CreateTenantFormSchema = z.object({
  schoolName: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  tier: z.enum(['tier_50', 'tier_100', 'tier_200', 'tier_500_plus']),
  adminFullName: z.string().min(2, 'Admin name must be at least 2 characters'),
  adminEmail: z.string().email('Please enter a valid email address'),
})

type CreateTenantFormInput = z.infer<typeof CreateTenantFormSchema>

type CreatedAdminCredentials = { adminEmail: string; adminPassword: string }

type CreateTenantFormProps = {
  type: SchoolType
  backHref: string
}

// Shared by /admin/schools/new and /admin/partners/new — a franchise
// partner is provisioned by the exact same createSchool action, just
// with type: 'franchise_partner' (see createSchool.ts's own comment).
export function CreateTenantForm({ type, backHref }: CreateTenantFormProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const [credentials, setCredentials] = useState<CreatedAdminCredentials | null>(null)
  const router = useRouter()
  const copy = TENANT_COPY[type]

  const form = useForm<CreateTenantFormInput>({
    resolver: zodResolver(CreateTenantFormSchema),
    defaultValues: { schoolName: '', slug: '', tier: 'tier_50', adminFullName: '', adminEmail: '' },
  })

  function handleSubmit(values: CreateTenantFormInput): void {
    startTransition(async () => {
      const result = await createSchool({ ...values, type })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setCredentials({ adminEmail: result.adminEmail, adminPassword: result.adminPassword })
    })
  }

  if (credentials !== null) {
    return (
      <div className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">{copy.entityLabel} created</h2>
        <p className="text-muted-foreground text-sm">
          Share these credentials with the {copy.adminRoleLabel.toLowerCase()} — the password is shown only once and cannot be recovered here.
        </p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Login email</dt>
          <dd className="font-mono">{credentials.adminEmail}</dd>
          <dt className="text-muted-foreground">Password</dt>
          <dd className="font-mono">{credentials.adminPassword}</dd>
        </dl>
        <Button onClick={() => router.push(backHref)}>Back to {copy.entityLabelLower}s</Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="schoolName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{copy.nameFieldLabel}</FormLabel>
              <FormControl>
                <Input placeholder={copy.namePlaceholder} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="greenwood" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tier</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(SCHOOL_TIER_LABELS).map(([tier, label]) => (
                    <SelectItem key={tier} value={tier}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="adminFullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{copy.adminRoleLabel}&apos;s name</FormLabel>
              <FormControl>
                <Input placeholder="Priya Sharma" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="adminEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{copy.adminRoleLabel}&apos;s email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating…' : `Create ${copy.entityLabelLower}`}
        </Button>
      </form>
    </Form>
  )
}
