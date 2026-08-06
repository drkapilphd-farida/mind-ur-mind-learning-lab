'use client'

import { useMemo } from 'react'
import { useQueryState, parseAsString } from 'nuqs'
import { BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DeleteButton } from '@/features/admin/components/DeleteButton'
import { deletePartnerResource } from '../actions/deletePartnerResource'
import { fileTypeIcon, fileTypeLabel } from '../fileTypeIcon'
import type { PartnerResource } from '../types'

type PartnerResourcesAdminGridProps = {
  resources: readonly PartnerResource[]
}

export function PartnerResourcesAdminGrid({ resources }: PartnerResourcesAdminGridProps): React.JSX.Element {
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''))
  const [category, setCategory] = useQueryState('category', parseAsString.withDefault('all'))

  const categories = useMemo(() => Array.from(new Set(resources.map((resource) => resource.category))).sort(), [resources])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return resources.filter((resource) => {
      if (category !== 'all' && resource.category !== category) return false
      if (query === '') return true
      return resource.title.toLowerCase().includes(query) || (resource.description ?? '').toLowerCase().includes(query)
    })
  }, [resources, search, category])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search resources…"
          value={search}
          onChange={(event) => void setSearch(event.target.value === '' ? null : event.target.value)}
          className="max-w-xs"
        />
        <Select value={category} onValueChange={(value) => void setCategory(value === 'all' ? null : value)}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-muted-foreground text-sm">
          {filtered.length} of {resources.length} shown
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-xl border p-10 text-center">
          <BookOpen className="text-muted-foreground/30 mx-auto mb-4 size-10" />
          <p className="text-muted-foreground text-sm">{resources.length === 0 ? 'No resources yet — upload the first one.' : 'No results match your search/filter.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource) => {
            const Icon = fileTypeIcon(resource.fileType)
            return (
              <div key={resource.id} className="bg-card flex flex-col justify-between gap-4 rounded-2xl border p-5 shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-xl">
                      <Icon className="size-4.5" />
                    </div>
                    <Badge variant="outline">{resource.category}</Badge>
                  </div>
                  <div>
                    <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                      {resource.title}
                    </a>
                    {resource.description !== null && <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">{resource.description}</p>}
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {fileTypeLabel(resource.fileType)}
                    {resource.scheduledAt !== null && <> · {new Date(resource.scheduledAt).toLocaleString()}</>}
                  </p>
                </div>
                <div className="flex justify-end">
                  <DeleteButton label={resource.title} deleteAction={deletePartnerResource.bind(null, { id: resource.id })} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
