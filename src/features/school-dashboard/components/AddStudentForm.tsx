'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { addStudentManually } from '../actions/addStudentManually'
import { slugify } from '../provisioning/slugify'
import { TENANT_COPY } from '../tenantCopy'
import type { SchoolClass, SchoolType } from '../types'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const AddStudentFormSchema = z.object({
  classId: z.string().min(1, 'Choose a class'),
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  rollNumber: z.string(),
})

type AddStudentFormInput = z.infer<typeof AddStudentFormSchema>

type CreatedStudentCredentials = { username: string; password: string; fullName: string }

type AddStudentFormProps = {
  schoolId: string
  schoolSlug: string
  classes: readonly SchoolClass[]
  tenantType: SchoolType
}

export function AddStudentForm({ schoolId, schoolSlug, classes, tenantType }: AddStudentFormProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const [credentials, setCredentials] = useState<CreatedStudentCredentials | null>(null)
  const router = useRouter()
  const copy = TENANT_COPY[tenantType]

  const form = useForm<AddStudentFormInput>({
    resolver: zodResolver(AddStudentFormSchema),
    defaultValues: { classId: classes[0]?.id ?? '', fullName: '', rollNumber: '' },
  })

  function handleSubmit(values: AddStudentFormInput): void {
    const selectedClass = classes.find((schoolClass) => schoolClass.id === values.classId)
    if (!selectedClass) {
      toast.error('Choose a class')
      return
    }

    startTransition(async () => {
      const result = await addStudentManually({
        schoolId,
        schoolSlug,
        classId: selectedClass.id,
        classSlug: slugify(selectedClass.name),
        fullName: values.fullName,
        rollNumber: values.rollNumber.trim() === '' ? null : values.rollNumber.trim(),
      })
      if (!result.success) {
        toast.error(result.error)
        return
      }
      setCredentials({ username: result.username, password: result.password, fullName: result.fullName })
      form.reset({ classId: values.classId, fullName: '', rollNumber: '' })
      router.refresh()
    })
  }

  if (credentials !== null) {
    return (
      <div className="space-y-4 rounded-xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Student account created</h2>
        <p className="text-muted-foreground text-sm">
          Share these login details with {credentials.fullName} — the password is shown only once and cannot be recovered here.
        </p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
          <dt className="text-muted-foreground">Username</dt>
          <dd className="font-mono">{credentials.username}</dd>
          <dt className="text-muted-foreground">Password</dt>
          <dd className="font-mono">{credentials.password}</dd>
        </dl>
        <Button onClick={() => setCredentials(null)}>Add another student</Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="classId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{copy.groupLabel}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={`Choose a ${copy.groupLabel.toLowerCase()}`} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {classes.map((schoolClass) => (
                    <SelectItem key={schoolClass.id} value={schoolClass.id}>
                      {schoolClass.name}
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
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Student&apos;s name</FormLabel>
              <FormControl>
                <Input placeholder="Rahul Verma" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="rollNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Roll number (optional)</FormLabel>
              <FormControl>
                <Input placeholder="42" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Creating…' : 'Create student account'}
        </Button>
      </form>
    </Form>
  )
}
