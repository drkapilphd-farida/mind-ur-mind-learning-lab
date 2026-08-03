# Engineering Constitution
## Quantum Mind Learning Lab™

**Version:** 1.0.0  
**Status:** Active  
**Owner:** Principal Engineering  
**Last Updated:** 2026-06-27

---

> This document is the single source of truth for all engineering decisions in Quantum Mind Learning Lab™. Every contributor — engineer, contractor, or AI assistant — is bound by these standards. Deviations require explicit approval from Principal Engineering and must be documented.

---

## Table of Contents

1. [Folder Structure](#1-folder-structure)
2. [Naming Conventions](#2-naming-conventions)
3. [TypeScript Standards](#3-typescript-standards)
4. [React Standards](#4-react-standards)
5. [Next.js App Router Standards](#5-nextjs-app-router-standards)
6. [Tailwind CSS Standards](#6-tailwind-css-standards)
7. [shadcn/ui Standards](#7-shadcnui-standards)
8. [Component Architecture](#8-component-architecture)
9. [State Management Strategy](#9-state-management-strategy)
10. [Supabase Integration Strategy](#10-supabase-integration-strategy)
11. [Environment Variables Policy](#11-environment-variables-policy)
12. [Git Commit Convention](#12-git-commit-convention)
13. [Branch Naming Convention](#13-branch-naming-convention)
14. [File Naming Convention](#14-file-naming-convention)
15. [Error Handling Standards](#15-error-handling-standards)
16. [Logging Strategy](#16-logging-strategy)
17. [AI Integration Standards](#17-ai-integration-standards)
18. [Security Standards](#18-security-standards)
19. [Performance Standards](#19-performance-standards)
20. [Scalability Principles](#20-scalability-principles)

---

## 1. Folder Structure

### Principle
The folder structure is feature-oriented at the top level and layer-oriented within each feature. Shared infrastructure lives at the root of `src/`. Nothing is buried more than four directory levels deep without explicit justification.

### Top-Level Layout

```
mind-ur-mind-learning-lab/
├── .claude/                          # Claude Code configuration
│   └── settings.json
├── .github/
│   ├── workflows/                    # CI/CD pipelines
│   └── PULL_REQUEST_TEMPLATE.md
├── docs/
│   ├── ENGINEERING_CONSTITUTION.md   # This file (canonical copy)
│   ├── adr/                          # Architecture Decision Records
│   └── api/                          # API reference docs
├── public/
│   ├── fonts/
│   ├── images/
│   └── icons/
├── src/
│   ├── app/                          # Next.js App Router (routes only)
│   ├── components/                   # Shared UI components
│   ├── features/                     # Feature modules (self-contained)
│   ├── lib/                          # Utility libraries and integrations
│   ├── hooks/                        # Shared React hooks
│   ├── stores/                       # Global client state (Zustand)
│   ├── types/                        # Global TypeScript types and interfaces
│   ├── styles/                       # Global CSS, Tailwind config extensions
│   └── config/                       # App-wide configuration constants
├── supabase/
│   ├── migrations/                   # Ordered SQL migration files
│   ├── seed.sql                      # Development seed data
│   └── config.toml                   # Supabase local config
├── tests/
│   ├── e2e/                          # Playwright end-to-end tests
│   ├── integration/                  # Integration tests
│   └── __mocks__/                    # Shared test mocks
├── scripts/                          # Dev and CI utility scripts
├── .env.local                        # Local secrets (never committed)
├── .env.example                      # Template for required env vars
├── CLAUDE.md                         # Claude Code project context
├── ENGINEERING_CONSTITUTION.md       # This file (root copy)
└── next.config.ts
```

### `src/app/` — Routes Only

The `app/` directory contains **only** Next.js routing files. No business logic, no components beyond page-level layouts that compose feature components.

```
src/app/
├── (marketing)/                      # Route group — public marketing pages
│   ├── page.tsx                      # Landing page
│   ├── pricing/
│   │   └── page.tsx
│   └── layout.tsx
├── (auth)/                           # Route group — auth flows
│   ├── login/
│   │   └── page.tsx
│   ├── signup/
│   │   └── page.tsx
│   └── layout.tsx
├── (dashboard)/                      # Route group — authenticated app
│   ├── layout.tsx                    # Dashboard shell (sidebar, nav)
│   ├── dashboard/
│   │   └── page.tsx
│   ├── courses/
│   │   ├── page.tsx                  # Course catalog
│   │   ├── [courseId]/
│   │   │   ├── page.tsx
│   │   │   └── lessons/
│   │   │       └── [lessonId]/
│   │   │           └── page.tsx
│   ├── practice/
│   │   └── page.tsx
│   ├── progress/
│   │   └── page.tsx
│   └── settings/
│       └── page.tsx
├── api/                              # API route handlers
│   ├── ai/
│   │   └── chat/
│   │       └── route.ts
│   ├── webhooks/
│   │   └── stripe/
│   │       └── route.ts
│   └── health/
│       └── route.ts
├── error.tsx                         # Root error boundary
├── not-found.tsx
├── loading.tsx
├── layout.tsx                        # Root layout
└── globals.css
```

### `src/features/` — Feature Modules

Each feature is a self-contained module. Features may import from `src/lib/`, `src/components/`, and `src/types/`, but **never from another feature**.

```
src/features/
├── auth/
│   ├── components/                   # Auth-specific UI
│   ├── hooks/                        # Auth-specific hooks
│   ├── actions/                      # Server Actions for auth
│   ├── api/                          # Client-side API call wrappers
│   └── types.ts                      # Auth-specific types
├── courses/
│   ├── components/
│   ├── hooks/
│   ├── actions/
│   ├── api/
│   └── types.ts
├── lessons/
│   ├── components/
│   ├── hooks/
│   ├── actions/
│   ├── api/
│   └── types.ts
├── ai-tutor/
│   ├── components/
│   ├── hooks/
│   ├── actions/
│   ├── api/
│   └── types.ts
├── billing/
│   ├── components/
│   ├── hooks/
│   ├── actions/
│   ├── api/
│   └── types.ts
└── analytics/
    ├── components/
    ├── hooks/
    ├── actions/
    ├── api/
    └── types.ts
```

### `src/lib/` — Shared Infrastructure

```
src/lib/
├── supabase/
│   ├── client.ts                     # Browser client singleton
│   ├── server.ts                     # Server client (cookies)
│   ├── middleware.ts                 # Middleware client
│   └── types.ts                      # Generated database types
├── ai/
│   ├── client.ts                     # Anthropic SDK client
│   ├── prompts/                      # Prompt templates
│   └── tools/                        # AI tool definitions
├── stripe/
│   └── client.ts
├── utils/
│   ├── cn.ts                         # clsx + tailwind-merge
│   ├── format.ts                     # Date, number, string formatters
│   └── validators.ts                 # Zod schema library
└── constants.ts                      # App-wide constants (routes, limits)
```

---

## 2. Naming Conventions

### General Rule
**Clarity beats brevity.** Names must be unambiguous when read in isolation. Abbreviations are forbidden except for universally understood acronyms (e.g., `id`, `url`, `api`).

### Summary Table

| Artifact | Convention | Example |
|---|---|---|
| React components | PascalCase | `LessonCard`, `AITutorPanel` |
| Hooks | camelCase, `use` prefix | `useLessonProgress` |
| Server Actions | camelCase, verb first | `createCourseEnrollment` |
| Utility functions | camelCase, verb first | `formatDuration` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_RETRY_ATTEMPTS` |
| Types / Interfaces | PascalCase | `LessonProgress`, `UserProfile` |
| Enums | PascalCase enum, SCREAMING_SNAKE members | `LessonStatus.IN_PROGRESS` |
| CSS classes | kebab-case (Tailwind utilities only) | n/a |
| Database tables | snake_case, plural | `lesson_completions` |
| Database columns | snake_case | `completed_at` |
| Environment variables | SCREAMING_SNAKE_CASE | `NEXT_PUBLIC_SUPABASE_URL` |
| Route segments | kebab-case | `/courses/[courseId]/lessons` |
| API routes | kebab-case, plural nouns | `/api/course-enrollments` |

### Naming Rules by Context

**Boolean variables and props:** prefix with `is`, `has`, `can`, `should`.
```ts
// Correct
const isLoading = true
const hasCompletedLesson = false
const canAccessPremium = user.tier === 'premium'

// Wrong
const loading = true
const completedLesson = false
```

**Event handlers:** prefix with `handle` in implementation, `on` in props.
```tsx
// Correct
function handleLessonComplete() { ... }
<LessonCard onComplete={handleLessonComplete} />

// Wrong
function lessonComplete() { ... }
<LessonCard complete={lessonComplete} />
```

**Async functions:** use descriptive verbs — `fetch`, `create`, `update`, `delete`, `submit`, `load`.
```ts
async function fetchUserProgress(userId: string) { ... }
async function createCourseEnrollment(input: EnrollmentInput) { ... }
```

---

## 3. TypeScript Standards

### Compiler Configuration

```jsonc
// tsconfig.json — required flags
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

All flags above are **mandatory**. `strict: true` is non-negotiable.

### Type Rules

**Rule 1: No `any`. Ever.**  
Use `unknown` when the type is genuinely unknown, then narrow it.
```ts
// Wrong
function processData(data: any) { ... }

// Correct
function processData(data: unknown) {
  if (!isLessonData(data)) throw new TypeError('Invalid lesson data')
  // data is now LessonData
}
```

**Rule 2: Prefer `type` over `interface` for data shapes.**  
Use `interface` only when you need declaration merging (rare) or extending third-party types.
```ts
// Preferred
type LessonProgress = {
  lessonId: string
  userId: string
  completedAt: Date | null
  score: number
}

// Only for extension
interface ExtendedRequest extends NextRequest {
  userId: string
}
```

**Rule 3: Explicit return types on all exported functions.**
```ts
// Wrong
export function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}m`
}

// Correct
export function formatDuration(seconds: number): string {
  return `${Math.floor(seconds / 60)}m`
}
```

**Rule 4: Use discriminated unions for state modeling.**
```ts
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }
```

**Rule 5: Use Zod for all runtime validation.**  
Type assertions (`as Type`, `!`) are banned at system boundaries (API responses, form input, external data). All external data must be parsed through a Zod schema.
```ts
import { z } from 'zod'

const LessonSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  durationSeconds: z.number().int().positive(),
})

type Lesson = z.infer<typeof LessonSchema>
```

**Rule 6: No type assertions at boundaries.**
```ts
// Wrong
const lesson = apiResponse as Lesson

// Correct
const lesson = LessonSchema.parse(apiResponse)
```

**Rule 7: Use const enums sparingly — prefer union types.**
```ts
// Preferred
type LessonStatus = 'not_started' | 'in_progress' | 'completed' | 'locked'

// Avoid unless cross-file constant sharing is required
const enum LessonStatus { NOT_STARTED, IN_PROGRESS, COMPLETED, LOCKED }
```

**Rule 8: Generics must have descriptive names.**
```ts
// Wrong
function parseResponse<T>(data: unknown): T { ... }

// Correct
function parseResponse<TData>(data: unknown): TData { ... }
```

---

## 4. React Standards

### Component Rules

**Rule 1: Function components only. No class components.**

**Rule 2: One component per file.** Small helper subcomponents that are only used within one file may coexist in that file, but must be placed below the primary export.

**Rule 3: Props types are always explicit and named.**
```tsx
// Wrong
export function LessonCard({ title, duration }: { title: string; duration: number }) { ... }

// Correct
type LessonCardProps = {
  title: string
  duration: number
  onStart?: () => void
}

export function LessonCard({ title, duration, onStart }: LessonCardProps) { ... }
```

**Rule 4: Destructure props at the parameter level.** Do not access `props.x` inside the function body.

**Rule 5: `key` props must be stable, unique, and meaningful — never array indices.**
```tsx
// Wrong
{lessons.map((lesson, i) => <LessonCard key={i} {...lesson} />)}

// Correct
{lessons.map((lesson) => <LessonCard key={lesson.id} {...lesson} />)}
```

**Rule 6: Avoid anonymous arrow functions as event handlers inline.** Define named handlers.
```tsx
// Wrong
<Button onClick={() => setIsOpen(true)}>Open</Button>

// Correct
function handleOpen() { setIsOpen(true) }
<Button onClick={handleOpen}>Open</Button>
```

Exception: trivial one-expression handlers where extracting adds no clarity.

**Rule 7: `useEffect` discipline.**
- Every effect must have a complete, intentional dependency array.
- Effects that trigger side effects from user actions belong in event handlers, not effects.
- Effects are for synchronization — syncing React state with an external system.
- No effects that merely derive state from other state. Use `useMemo` or compute inline.

**Rule 8: Custom hooks encapsulate all non-trivial stateful logic.** A component with more than one `useState` and one `useEffect` that aren't directly related to rendering is a candidate for extraction into a hook.

**Rule 9: Memoization is opt-in, not default.**  
Do not wrap everything in `memo`, `useMemo`, and `useCallback`. Apply them only after identifying a real performance problem with the React DevTools profiler.

**Rule 10: Controlled vs. Uncontrolled forms.**  
Use React Hook Form for all forms. Do not manage form state manually with `useState`.

---

## 5. Next.js App Router Standards

### File Conventions

| File | Purpose |
|---|---|
| `page.tsx` | Public route UI — only one per segment |
| `layout.tsx` | Persistent shell wrapping child routes |
| `loading.tsx` | Suspense fallback for the segment |
| `error.tsx` | Error boundary for the segment |
| `not-found.tsx` | 404 for the segment |
| `route.ts` | API route handler |
| `middleware.ts` | Edge middleware (auth gates, redirects) |

### Server vs. Client Component Rules

**Default to Server Components.** Add `'use client'` only when the component requires:
- Browser APIs (`window`, `document`, `localStorage`)
- React hooks (`useState`, `useEffect`, `useContext`, etc.)
- Event listeners
- Real-time subscriptions

**The boundary rule:** Push `'use client'` as deep into the tree as possible. The goal is maximum RSC surface area. A single interactive button in a page does not make the whole page a client component.

```tsx
// Correct — page is a Server Component
// src/app/(dashboard)/courses/page.tsx
import { CourseGrid } from '@/features/courses/components/CourseGrid'
import { getCourseCatalog } from '@/features/courses/api/getCourseCatalog'

export default async function CoursesPage() {
  const courses = await getCourseCatalog()
  return <CourseGrid courses={courses} />
}

// CourseGrid can be a Server Component that contains client sub-components
// for interactive elements (enrollment button, filter dropdowns)
```

### Data Fetching Rules

- Fetch data in Server Components via direct Supabase server client calls or Server Actions.
- Never call your own Next.js API routes from Server Components — call the data layer directly.
- Use `fetch` with Next.js cache semantics (`cache: 'force-cache'`, `next: { revalidate: N }`) for external APIs only.
- Parallel data fetching with `Promise.all` when multiple independent queries are needed.

```tsx
// Correct — parallel fetching in a Server Component
export default async function DashboardPage() {
  const [user, enrollments, recommendations] = await Promise.all([
    getUserProfile(),
    getUserEnrollments(),
    getAIRecommendations(),
  ])
  // ...
}
```

### Server Actions

- All mutations go through Server Actions — never POST to your own API routes from client components for mutations.
- Server Actions are defined in `features/[feature]/actions/` files with the `'use server'` directive.
- Every Server Action must validate its input with a Zod schema before touching the database.
- Every Server Action returns a typed result object, never throws to the client.

```ts
// src/features/courses/actions/enrollInCourse.ts
'use server'

import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'

const EnrollInput = z.object({
  courseId: z.string().uuid(),
})

type EnrollResult =
  | { success: true; enrollmentId: string }
  | { success: false; error: string }

export async function enrollInCourse(input: unknown): Promise<EnrollResult> {
  const parsed = EnrollInput.safeParse(input)
  if (!parsed.success) return { success: false, error: 'Invalid input' }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthenticated' }

  // ... enrollment logic
}
```

### Middleware

Middleware handles only:
1. Authentication gate (redirect unauthenticated users)
2. Authorization redirects (role-based route protection)
3. Locale/i18n routing

Middleware must not contain business logic or database queries beyond session token validation.

### Route Handlers (`route.ts`)

Use API route handlers only for:
- Webhook receivers (Stripe, external services)
- AI streaming responses
- File upload endpoints
- Health check endpoints

All other data operations use Server Actions or direct server-side data fetching.

---

## 6. Tailwind CSS Standards

### Configuration

```ts
// tailwind.config.ts — required structure
export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand colors only — defined as CSS custom properties
        brand: {
          50: 'hsl(var(--brand-50))',
          // ...through 950
        },
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
    },
  },
}
```

### Utility Rules

**Rule 1: Never write custom CSS unless Tailwind cannot express it.** If you're reaching for a `<style>` tag or a `.css` file for component styling, reconsider the approach. Exceptions: CSS custom properties (design tokens), `@keyframes`, and third-party overrides.

**Rule 2: Use the `cn()` utility for all conditional class merging.**
```ts
// src/lib/utils/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
```

```tsx
// Usage — never string concatenate classes
<div className={cn('rounded-lg p-4', isActive && 'bg-brand-100', className)} />
```

**Rule 3: Responsive design is mobile-first.** Base styles are mobile; use `sm:`, `md:`, `lg:`, `xl:` to layer up.

**Rule 4: No magic numbers.** Use design tokens (spacing scale, type scale) exclusively. No `w-[347px]` unless it is a one-off constraint derived from a specific external requirement (e.g., a fixed media asset size).

**Rule 5: Dark mode via CSS custom properties.** Define color tokens in `:root` and `[data-theme="dark"]` rather than scattering `dark:` variants on every element. Components use semantic token names, not raw color utilities.

```css
/* src/app/globals.css */
:root {
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(222 47% 11%);
  --color-primary: hsl(262 83% 58%);
}

[data-theme="dark"] {
  --color-background: hsl(222 47% 11%);
  --color-foreground: hsl(0 0% 98%);
  --color-primary: hsl(262 83% 68%);
}
```

**Rule 6: Avoid `@apply` in component CSS files.** Tailwind utilities belong in JSX. `@apply` is permitted only in `globals.css` for base layer resets and typography baseline.

---

## 7. shadcn/ui Standards

### Adoption Model

shadcn/ui components are **owned code**, not a dependency. When a component is added via the shadcn CLI, it becomes part of the codebase and is subject to the same review standards as any other code.

### Directory

All shadcn components live in `src/components/ui/`. They are never modified in place — extend them by wrapping, not editing the primitive.

### Extension Pattern

```tsx
// src/components/ui/button.tsx — shadcn primitive (do not edit)
// src/components/Button.tsx — our extension (add variants, enforce defaults)

import { Button as BaseButton, type ButtonProps as BaseButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

type ButtonProps = BaseButtonProps & {
  isLoading?: boolean
}

export function Button({ isLoading, children, disabled, className, ...props }: ButtonProps) {
  return (
    <BaseButton
      {...props}
      disabled={disabled || isLoading}
      className={cn(isLoading && 'cursor-wait', className)}
    >
      {isLoading ? <LoadingSpinner /> : children}
    </BaseButton>
  )
}
```

### Rules

- Never import directly from `@/components/ui/` in feature code. Always use the wrapped version from `@/components/`.
- When a shadcn component is updated via CLI, review the diff before accepting. Never auto-accept CLI updates.
- Accessibility attributes (`aria-*`, `role`) added by shadcn are never removed.
- Form components always use the shadcn Form primitives built on React Hook Form — never build custom form wrappers.

---

## 8. Component Architecture

### The Four Layers

Components exist in one of four layers. Each layer has strict dependency rules.

```
Layer 4: Pages         src/app/**/page.tsx
  ↓ compose
Layer 3: Feature       src/features/*/components/
  ↓ compose
Layer 2: Shared UI     src/components/
  ↓ compose
Layer 1: Primitives    src/components/ui/ (shadcn)
```

**Dependency rule:** Higher layers may import from lower layers. Lower layers never import from higher layers. Features never import from other features.

### Component Categories

**Primitive (Layer 1):** Unstyled or minimally styled, highly reusable, zero domain knowledge. Examples: `Button`, `Input`, `Dialog`, `Card`.

**Shared UI (Layer 2):** Branded, domain-aware visual components that carry no data fetching. Examples: `UserAvatar`, `CourseProgressBar`, `LessonStatusBadge`. These accept all their data as props.

**Feature (Layer 3):** Domain components that may fetch their own data, manage local state, or call Server Actions. Examples: `CourseEnrollmentCard`, `AITutorChat`, `LessonPlayer`.

**Page (Layer 4):** Compose feature components, provide layout, handle metadata. Must remain thin — no business logic.

### Anatomy of a Feature Component

```
src/features/courses/components/
├── CourseEnrollmentCard/
│   ├── index.ts                 # Public export
│   ├── CourseEnrollmentCard.tsx # Component implementation
│   └── CourseEnrollmentCard.test.tsx
```

Use the folder + `index.ts` pattern only when a component has test files or sibling utilities. Single-file components do not need a folder.

### Props Contract Rules

- Required props are listed before optional props.
- Optional props have explicit default values at destructuring, not inside the function body.
- Components never read from global state (stores, context) unless they are designated "container" components. Data flows down via props.
- Render prop patterns and compound components are permitted for complex UI; document the pattern with a brief comment.

---

## 9. State Management Strategy

### State Classification

| State Type | Location | Tool |
|---|---|---|
| Server state (remote data) | Server Components / TanStack Query | TanStack Query v5 |
| URL state (filters, pagination, tabs) | URL search params | `nuqs` |
| Form state | Component-local | React Hook Form |
| Global UI state (modals, toasts, theme) | Client store | Zustand |
| Auth session | Supabase client | Supabase Auth helpers |
| Ephemeral component state | Component-local | `useState` |

### Rules

**Rule 1: Server state is not duplicated in client stores.** If data comes from the server, TanStack Query owns it. Zustand stores do not cache server data.

**Rule 2: URL is the primary source of truth for navigation state.** Filters, sort orders, pagination, and active tabs live in the URL so they are shareable, bookmarkable, and survive refresh.

**Rule 3: Zustand stores are flat and minimal.**  
Stores hold only state that is genuinely global and cannot live in the URL or a component. Each store is a single domain (e.g., `useUIStore`, `useAIStore`).

```ts
// src/stores/useUIStore.ts
import { create } from 'zustand'

type UIStore = {
  isMobileSidebarOpen: boolean
  openMobileSidebar: () => void
  closeMobileSidebar: () => void
}

export const useUIStore = create<UIStore>((set) => ({
  isMobileSidebarOpen: false,
  openMobileSidebar: () => set({ isMobileSidebarOpen: true }),
  closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
}))
```

**Rule 4: TanStack Query query keys are colocated with their queries.**
```ts
// src/features/courses/api/getCourse.ts
export const courseKeys = {
  all: ['courses'] as const,
  detail: (id: string) => ['courses', id] as const,
  catalog: (filters: CourseFilters) => ['courses', 'catalog', filters] as const,
}
```

**Rule 5: Optimistic updates are allowed for mutations that affect visible UI immediately.** Implement using TanStack Query's `onMutate` / `onError` / `onSettled` lifecycle with cache rollback on failure.

---

## 10. Supabase Integration Strategy

### Client Instances

Three distinct Supabase clients are used. Each has a single factory function and must not be instantiated anywhere else.

| Client | File | Used In |
|---|---|---|
| Browser client | `src/lib/supabase/client.ts` | `'use client'` components, hooks |
| Server client | `src/lib/supabase/server.ts` | Server Components, Server Actions, Route Handlers |
| Middleware client | `src/lib/supabase/middleware.ts` | `middleware.ts` only |

### Database Rules

**Migrations are the single source of truth for schema.**  
All schema changes go through numbered migration files in `supabase/migrations/`. Never modify the database schema directly in production or staging. Never use the Supabase dashboard schema editor for production changes.

**Migration naming:** `YYYYMMDDHHMMSS_descriptive_name.sql`

**Row Level Security (RLS) is mandatory on all user-data tables.**  
No table containing user data is deployed without RLS enabled. Every RLS policy is reviewed by a second engineer before merge.

**Typesafety:** Generate TypeScript types from the database schema after every migration.
```bash
supabase gen types typescript --project-id $PROJECT_ID > src/lib/supabase/types.ts
```

### Auth Strategy

- Supabase Auth handles all authentication. No custom auth implementation.
- Session management is handled by `@supabase/ssr` with cookie-based sessions.
- Middleware validates the session on every request to protected routes.
- User identity in Server Actions is always re-fetched from Supabase — never trusted from client-sent data.

```ts
// Required pattern in every Server Action that requires auth
const supabase = await createServerClient()
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) return { success: false, error: 'Unauthenticated' }
```

### Realtime

- Supabase Realtime subscriptions are established in client-side hooks (`useEffect`), always with cleanup.
- Realtime is used for: live collaboration indicators, AI response streaming state, notification badges.
- Never subscribe to realtime in Server Components.

### Storage

- All user-uploaded files go through Supabase Storage.
- Validate file type and size on both client (UX) and server (security) before upload.
- All storage buckets are private by default. Public access requires explicit justification and a dedicated public bucket.
- Signed URLs are generated server-side with the minimum required expiry duration.

---

## 11. Environment Variables Policy

### Classification

| Prefix | Exposure | Examples |
|---|---|---|
| `NEXT_PUBLIC_` | Client + Server | `NEXT_PUBLIC_SUPABASE_URL` |
| *(no prefix)* | Server only | `SUPABASE_SERVICE_ROLE_KEY` |

### Rule: Minimum Exposure

Only variables that are **required** on the client get `NEXT_PUBLIC_`. Service role keys, AI API keys, Stripe secret keys, and webhook secrets are server-only, always.

### Required Variables

```bash
# .env.example — committed to the repository, no real values

# Supabase (public — safe for client)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Supabase (secret — server only)
SUPABASE_SERVICE_ROLE_KEY=

# AI (secret — server only)
ANTHROPIC_API_KEY=

# Billing (secret — server only)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# App
NEXT_PUBLIC_APP_URL=
NODE_ENV=
```

### Validation at Startup

All environment variables are validated at application startup using a Zod schema in `src/config/env.ts`. The application refuses to start if required variables are missing or malformed.

```ts
// src/config/env.ts
import { z } from 'zod'

const ServerEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
})

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  NEXT_PUBLIC_APP_URL: z.string().url(),
})
```

### Storage and Access

- `.env.local` is gitignored. Never commit real credentials.
- Production secrets live in the hosting platform's secret manager (Vercel Environment Variables, never `.env.production`).
- Secrets are rotated immediately upon suspected exposure. Rotate first, investigate second.

---

## 12. Git Commit Convention

### Format

Commits follow the Conventional Commits specification:

```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types

| Type | When to Use |
|---|---|
| `feat` | A new feature visible to users |
| `fix` | A bug fix |
| `perf` | A code change that improves performance |
| `refactor` | Code restructuring with no behavior change |
| `test` | Adding or updating tests |
| `docs` | Documentation changes only |
| `chore` | Tooling, config, dependency updates |
| `ci` | CI/CD pipeline changes |
| `revert` | Reverts a previous commit |

### Scope

The scope is the feature or domain area affected: `auth`, `courses`, `lessons`, `ai-tutor`, `billing`, `analytics`, `ui`, `db`, `api`, `config`.

### Subject Rules

- Imperative mood, present tense: "add" not "added" or "adds"
- No capital letter at the start
- No period at the end
- Maximum 72 characters
- Must complete the sentence: "This commit will ___"

### Examples

```
feat(courses): add video progress tracking to lesson player

fix(auth): resolve infinite redirect loop on session expiry

perf(ai-tutor): stream response tokens to reduce perceived latency

refactor(billing): extract stripe webhook handler into dedicated service

chore(deps): upgrade supabase-js to 2.45.0

test(courses): add enrollment flow integration tests
```

### Breaking Changes

```
feat(api)!: rename /api/lessons endpoint to /api/lesson-items

BREAKING CHANGE: The /api/lessons route has been renamed to /api/lesson-items
for consistency with the resource naming convention. Update all client calls.
```

---

## 13. Branch Naming Convention

### Format

```
<type>/<ticket-id>-<short-description>
```

### Types

| Type | When to Use |
|---|---|
| `feat/` | New feature development |
| `fix/` | Bug fixes |
| `hotfix/` | Critical production fixes |
| `refactor/` | Refactoring, no behavior change |
| `test/` | Test additions or updates |
| `docs/` | Documentation only |
| `chore/` | Tooling, dependency, config changes |
| `release/` | Release preparation |

### Rules

- Lowercase and hyphen-separated only. No underscores, no camelCase.
- Include the ticket/issue ID when one exists.
- Description is concise — 3 to 5 words maximum.
- Never commit directly to `main` or `develop`. All changes go through pull requests.

### Examples

```
feat/MUM-142-lesson-video-player
fix/MUM-89-auth-redirect-loop
hotfix/MUM-201-stripe-webhook-signature-failure
refactor/MUM-115-extract-ai-client
chore/MUM-67-upgrade-dependencies
docs/MUM-33-api-endpoint-reference
release/v1.2.0
```

### Protected Branches

| Branch | Purpose | Direct Push |
|---|---|---|
| `main` | Production | Blocked — PR + 1 approval required |
| `develop` | Staging / integration | Blocked — PR required |
| `release/*` | Release candidates | Blocked — PR required |

---

## 14. File Naming Convention

### Rules by File Type

| File Type | Convention | Example |
|---|---|---|
| React components | PascalCase `.tsx` | `LessonCard.tsx` |
| React hooks | camelCase `.ts`, `use` prefix | `useLessonProgress.ts` |
| Server Actions | camelCase `.ts`, verb-first | `enrollInCourse.ts` |
| Utility functions | camelCase `.ts` | `formatDuration.ts` |
| Type definitions | camelCase `.ts` or `types.ts` | `types.ts` |
| Zod schemas | camelCase `.ts`, `Schema` suffix | `lessonSchema.ts` |
| Next.js special files | lowercase (framework required) | `page.tsx`, `layout.tsx` |
| Test files | Mirror source name + `.test.ts(x)` | `LessonCard.test.tsx` |
| Database migrations | timestamp + snake_case | `20260627120000_add_lesson_completions.sql` |
| Config files | lowercase kebab-case | `tailwind.config.ts` |

### Index Files

`index.ts` files are used only to re-export from a directory that functions as a public API (e.g., a feature module's public surface). They are not used for co-locating implementation in the same directory as arbitrary groupings.

### No Generic Names

File names must be specific and self-describing. The following names are banned as primary file names: `utils.ts`, `helpers.ts`, `common.ts`, `misc.ts`, `stuff.ts`. Instead, name the file after what it actually contains: `dateFormatters.ts`, `currencyHelpers.ts`.

---

## 15. Error Handling Standards

### Philosophy

Errors are classified into two categories:

1. **Expected errors:** User input errors, business rule violations, resource not found, unauthenticated. These are handled gracefully and communicated to the user.
2. **Unexpected errors:** Programming errors, infrastructure failures, unhandled cases. These are logged, reported, and result in a safe fallback UI.

### Server Action Error Pattern

Server Actions never throw to the client. They always return a typed result.

```ts
type ActionResult<TData = void> =
  | { success: true; data: TData }
  | { success: false; error: string; code?: string }
```

### API Route Handler Error Pattern

```ts
// src/lib/utils/apiResponse.ts
export function apiError(message: string, status: number): Response {
  return Response.json({ error: message }, { status })
}

export function apiSuccess<T>(data: T, status = 200): Response {
  return Response.json({ data }, { status })
}
```

### Client-Side Error Boundaries

Every feature section has an `error.tsx` segment. The root `error.tsx` is the final catch. Error boundaries display a recovery action (retry, go home) and log to the error monitoring service.

### Never Swallow Errors Silently

```ts
// Wrong — error is lost
try {
  await doSomething()
} catch {
  // do nothing
}

// Correct — log and handle
try {
  await doSomething()
} catch (error) {
  logger.error('Failed to do something', { error, context })
  return { success: false, error: 'Operation failed. Please try again.' }
}
```

### Zod Parse Error Handling

```ts
// Always use safeParse at boundaries, not parse (which throws)
const result = Schema.safeParse(input)
if (!result.success) {
  return { success: false, error: formatZodError(result.error) }
}
```

### Error Monitoring

All unexpected errors are reported to the error monitoring service (Sentry or equivalent) with:
- User ID (if authenticated)
- Route / Server Action name
- Request context (sanitized — no PII in error payloads)
- Environment (`production`, `staging`)

---

## 16. Logging Strategy

### Log Levels

| Level | When to Use |
|---|---|
| `error` | Unexpected failures, system errors, data corruption |
| `warn` | Degraded behavior, rate limit approaching, deprecated usage |
| `info` | Significant business events (enrollment created, payment processed) |
| `debug` | Development-only diagnostic information |

### Rules

**Rule 1: `console.log` is banned in production code.** Use the structured logger exclusively.

**Rule 2: No PII in logs.** User emails, names, payment details, and health data are never logged. Log user IDs only.

**Rule 3: Structured JSON logging in production.**  
Every log entry is a JSON object with consistent fields:

```ts
type LogEntry = {
  level: 'error' | 'warn' | 'info' | 'debug'
  message: string
  timestamp: string            // ISO 8601
  service: 'web' | 'api'
  userId?: string              // Never PII — only ID
  requestId?: string
  duration?: number            // ms, for performance logs
  error?: {
    message: string
    stack?: string             // Only in non-production
    code?: string
  }
  [key: string]: unknown       // Additional structured context
}
```

**Rule 4: Log at the boundary, not at every step.** One log per Server Action (on error or significant event), not one per function call within.

**Rule 5: Performance-sensitive paths use sampling.** High-volume debug logs in hot paths use a sampling rate to avoid log volume explosion.

### Logger Implementation

```ts
// src/lib/logger.ts
const logger = {
  error: (message: string, context?: object) => { ... },
  warn: (message: string, context?: object) => { ... },
  info: (message: string, context?: object) => { ... },
  debug: (message: string, context?: object) => { ... },
}
export { logger }
```

---

## 17. AI Integration Standards

### Architecture

AI capabilities are isolated in `src/lib/ai/` and `src/features/ai-tutor/`. No AI SDK calls appear in generic components or utility files.

### Client Configuration

```ts
// src/lib/ai/client.ts
import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})
```

The Anthropic client is **server-side only**. The API key is never exposed to the client. All AI calls go through Server Actions or API route handlers.

### Model Selection

| Use Case | Model | Rationale |
|---|---|---|
| AI Tutor conversations | `claude-sonnet-4-6` | Balance of capability and cost |
| Content generation (bulk) | `claude-haiku-4-5-20251001` | Cost-optimized for volume |
| Complex reasoning / grading | `claude-opus-4-8` | Maximum capability for high-stakes |

### Streaming Pattern

AI responses are streamed to reduce perceived latency. Streaming is implemented via API route handlers that return a `ReadableStream`.

```ts
// src/app/api/ai/chat/route.ts
export async function POST(request: Request): Promise<Response> {
  // Validate auth, validate input
  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages,
    system: systemPrompt,
  })

  return new Response(stream.toReadableStream())
}
```

### Prompt Management

- All system prompts live in `src/lib/ai/prompts/` as exported TypeScript strings.
- Prompts are versioned. Breaking changes to a prompt create a new versioned file.
- Prompts include explicit instructions for response format, tone, and refusal behavior for out-of-scope requests.
- User-supplied content in prompts is clearly delimited with XML tags to prevent prompt injection.

```ts
// src/lib/ai/prompts/tutorSystemPrompt.ts
export function buildTutorPrompt(context: TutorContext): string {
  return `You are an expert tutor for Quantum Mind Learning Lab...

<course_context>
${context.courseTitle}
</course_context>

<lesson_content>
${context.lessonContent}
</lesson_content>`
}
```

### Safety Rules

- User input is sanitized before inclusion in any prompt.
- AI responses are displayed as-is from the model — never `eval`'d or used to construct server-side queries.
- Rate limiting is enforced per user per model per time window on all AI endpoints.
- AI-generated content that will be persisted to the database is validated for length and structure before storage.
- Costs are tracked per user. Accounts exceeding thresholds trigger alerts before service degradation.

### Tool Use

When using Anthropic tool use (function calling):
- Tool definitions are typed with Zod schemas and TypeScript types.
- Tool results are validated before being passed back to the model.
- Tool implementations run server-side only and are never exposed to the client.

---

## 18. Security Standards

### Authentication and Authorization

- Authentication: Supabase Auth (JWTs, OAuth providers, magic links).
- Authorization: Row Level Security (RLS) in Supabase is the primary enforcement layer. Application-layer checks are secondary defense.
- Never trust client-sent user IDs. Always resolve the user identity from the session on the server.
- Admin operations require a server-side check against a role claim in the user's JWT and a Supabase RLS policy.

### Input Validation

- **All** inputs from the client (form data, URL params, JSON bodies, headers) are validated with Zod schemas before processing.
- Validation happens at the first point of entry (Server Action, Route Handler, Middleware) — not deep in business logic.
- Reject unknown fields (`z.object({...}).strict()`) on all input schemas.

### Injection Prevention

- **SQL Injection:** Use Supabase's query builder exclusively. No raw string-interpolated SQL queries. Parameterized queries only.
- **XSS:** React's JSX escapes output by default. `dangerouslySetInnerHTML` is banned. Markdown rendered to HTML uses a sanitization library (`DOMPurify` or `rehype-sanitize`).
- **Prompt Injection:** User content in AI prompts is wrapped in XML delimiters. The system prompt instructs the model to treat content inside those tags as user data only.
- **CSRF:** Next.js Server Actions have built-in CSRF protection via origin checking. Route Handlers that accept mutations validate the `Origin` header.

### HTTP Security Headers

```ts
// next.config.ts — required security headers
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geophysical=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'",  // narrow as allowed
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    ].join('; '),
  },
]
```

### Secrets and Credentials

- No secrets in source code, ever. Violating this triggers an immediate secret rotation.
- Service role keys are used only in server contexts and are never logged.
- The `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS — functions using it must implement explicit authorization checks.
- Webhook payloads are always verified with the provider's signature before processing.

### Dependency Security

- `npm audit` runs in CI on every PR. High and Critical findings block merge.
- Dependencies are reviewed before installation. No dependencies with fewer than 1,000 weekly downloads or under 6 months of existence without explicit justification.
- Lock file (`package-lock.json`) is always committed and always up to date.

### Data Privacy

- Minimum data collection principle: only collect data needed for product functionality.
- PII fields in the database are identified and tagged in migration files.
- User data deletion is handled by cascading deletes from the `auth.users` table and a documented off-boarding runbook.

---

## 19. Performance Standards

### Targets

| Metric | Target | Measurement |
|---|---|---|
| Largest Contentful Paint (LCP) | < 2.5s | Vercel Speed Insights |
| First Input Delay (FID) / INP | < 100ms | Core Web Vitals |
| Cumulative Layout Shift (CLS) | < 0.1 | Core Web Vitals |
| Time to First Byte (TTFB) | < 600ms | Vercel Speed Insights |
| JS Bundle (initial load) | < 150kB gzipped | Next.js bundle analyzer |

### Image Optimization

- All images use Next.js `<Image>` component. Raw `<img>` tags are banned.
- Images are sized to their display dimensions. No oversized source images.
- WebP/AVIF formats are served automatically via the `<Image>` component.
- Hero images and above-the-fold images use `priority` prop. Below-the-fold images use `loading="lazy"` (default).

### Code Splitting

- Dynamic imports (`next/dynamic`) for heavy components that are not needed on initial render: code editors, video players, AI chat interfaces, rich text editors.
- Route-level code splitting is automatic via App Router. Do not circumvent it with barrel files that eagerly import everything.

### Caching Strategy

| Layer | Strategy |
|---|---|
| CDN (Vercel Edge) | Static assets, immutable (1 year) |
| Page (ISR) | Course catalog, lesson metadata (60s revalidate) |
| API responses | TanStack Query (staleTime: 60s for most lists) |
| Database | Supabase connection pooling via PgBouncer |
| AI responses | Anthropic prompt caching for long system prompts |

### Bundle Discipline

- Audit imports: import only what is used. Named imports over namespace imports (`import { specific } from 'lib'`, not `import * as lib from 'lib'`).
- No lodash, moment.js, or other large general-purpose libraries when native JS or a targeted micro-library will do.
- Run `@next/bundle-analyzer` before any PR that adds a new top-level dependency.

### Database Performance

- All database queries used in Server Components or Server Actions must have an index on all filter and sort columns.
- N+1 queries are forbidden. Use joins or batch fetches.
- Expensive queries are tested with `EXPLAIN ANALYZE` before deployment.
- Supabase RLS policies are reviewed for index usage — a policy that triggers a sequential scan on a large table is a critical issue.

---

## 20. Scalability Principles

### Stateless Application Layer

The Next.js application is stateless. No in-memory state is shared across requests. This allows horizontal scaling and eliminates session affinity requirements. State lives in:
- The database (Supabase / Postgres)
- The CDN (static assets, ISR cache)
- The client (local UI state, TanStack Query cache)

### Edge-First Architecture

- Middleware runs on the Vercel Edge Network — keep it lightweight (auth check only).
- Static pages and ISR pages are served from the CDN, not the Node.js runtime.
- Designate compute-intensive API routes as Node.js runtime; use Edge Runtime only for auth, redirects, and header manipulation.

### Async and Non-Blocking

- Long-running operations (bulk content generation, report generation, email dispatch) are offloaded to background jobs (Supabase Edge Functions + pg_cron, or a job queue).
- The request-response cycle for any user-facing action must complete within 10 seconds. Anything longer is a background job.
- AI streaming reduces blocking — responses start rendering within 500ms even for long generations.

### Database Scalability

- Use Postgres schemas to logically separate domains: `auth` (Supabase), `learning`, `billing`, `analytics`.
- Design tables for row-level access patterns — avoid queries that scan entire tables for per-user operations.
- Read replicas are used for analytics queries when they become expensive. Never run analytical aggregations in the critical path.
- Connection pooling is always enabled (Supabase PgBouncer in transaction mode for serverless).

### Feature Flags

Significant new features are shipped behind feature flags. This enables:
- Gradual rollout to a percentage of users
- Instant rollback without a deployment
- A/B testing new learning features

Feature flags are evaluated server-side to prevent client-side exposure of unreleased features.

### Tenant Isolation

Quantum Mind Learning Lab™ is a multi-tenant SaaS. Every query that touches user data must be scoped to the authenticated user's organization or account. RLS policies enforce this at the database level. Application code adds a second check. There is no "query all tenants" access from the application layer.

### Observability

Scalable systems require observability before scale, not after. From day one:
- **Metrics:** Request latency, error rates, AI token usage, active users — instrumented at the edge.
- **Traces:** Distributed traces connecting client request → Server Action → database query → AI call.
- **Alerts:** P95 latency > 2s and error rate > 0.1% on any route trigger an on-call alert.
- **Dashboards:** Business metrics (enrollments, lesson completions, AI interactions) are separated from infrastructure metrics.

---

## Architecture Decision Records

Significant technical decisions that deviate from or extend this Constitution are documented as Architecture Decision Records (ADRs) in `docs/adr/`. Each ADR uses the MADR format:

```
docs/adr/
├── 0001-use-supabase-for-auth-and-database.md
├── 0002-anthropic-claude-as-ai-provider.md
├── 0003-zustand-over-redux-for-client-state.md
└── ...
```

An ADR is required for:
- Introducing a new external dependency
- Diverging from a standard defined in this document
- Choosing between two materially different architectural approaches
- Deprecating or replacing an existing system

---

## Amendments

This Constitution is a living document. Amendments follow this process:

1. Open a GitHub Discussion proposing the change with rationale.
2. A two-day comment period for team input.
3. Principal Engineering approves or rejects.
4. On approval, the change is merged via PR with an update to the version number and date in the document header.
5. All active branches adopt the change within one sprint.

---

*Quantum Mind Learning Lab™ Engineering Constitution — v1.0.0*  
*All contributors are responsible for knowing and upholding these standards.*
