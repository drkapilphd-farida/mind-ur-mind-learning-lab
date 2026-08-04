'use client'

import { ChevronDown, Check } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import type { ChildProfile } from '../types'

type ChildSwitcherProps = {
  childProfiles: readonly ChildProfile[]
  selectedChildId: string
  onSelectChild: (childId: string) => void
}

// A soft, matching ring around the avatar's initials — the same visual
// language (colored ring on a filled circle) as the persistent brand
// logo elsewhere in this app, applied per-child so each child's own
// color travels with them everywhere their avatar appears.
function ChildAvatar({ child, size = 'default' }: { child: ChildProfile; size?: 'default' | 'sm' | 'lg' }): React.JSX.Element {
  return (
    <Avatar size={size} className={cn('ring-2 ring-offset-2', child.avatarRingClass)}>
      <AvatarFallback className={cn('font-semibold text-white', child.avatarColorClass)}>
        {child.avatarInitials}
      </AvatarFallback>
    </Avatar>
  )
}

// Multi-Child Profile Switcher — a single dropdown trigger showing the
// currently-selected child, so a parent with several kids on the
// platform can flip between their individual weekly data without
// leaving the dashboard or reloading the page. Every child gets a
// distinct, ringed avatar (trigger and menu alike) so the switcher
// reads as "whose data am I looking at" at a glance, not just a plain
// text menu.
export function ChildSwitcher({ childProfiles, selectedChildId, onSelectChild }: ChildSwitcherProps): React.JSX.Element {
  const selectedChild = childProfiles.find((child) => child.id === selectedChildId) ?? childProfiles[0]!

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white py-2 pr-3 pl-2 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
        >
          <ChildAvatar child={selectedChild} size="lg" />
          <div className="hidden text-left sm:block">
            <p className="text-sm font-semibold text-slate-900">{selectedChild.name}</p>
            <p className="text-xs text-slate-500">{selectedChild.grade}</p>
          </div>
          <ChevronDown className="size-4 text-slate-400" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        {childProfiles.map((child) => {
          const isSelected = child.id === selectedChildId
          return (
            <DropdownMenuItem
              key={child.id}
              onSelect={() => onSelectChild(child.id)}
              className={cn('flex items-center gap-3 rounded-lg py-2', isSelected && 'bg-indigo-50/70')}
            >
              <ChildAvatar child={child} size="sm" />
              <div className="flex-1">
                <p className={cn('text-sm', isSelected ? 'font-semibold text-slate-900' : 'font-medium text-slate-800')}>
                  {child.name}
                </p>
                <p className="text-xs text-slate-500">{child.grade}</p>
              </div>
              {isSelected && <Check className="size-4 shrink-0 text-indigo-600" aria-hidden="true" />}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
