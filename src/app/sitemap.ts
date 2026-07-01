import type { MetadataRoute } from 'next'
import { createServiceClient } from '@/lib/supabase/service'

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let courseUrls: MetadataRoute.Sitemap = []

  try {
    const supabase = createServiceClient()
    const { data: courses } = await supabase
      .from('courses')
      .select('slug, updated_at')
      .eq('is_published', true)
      .order('updated_at', { ascending: false })

    courseUrls = (courses ?? []).map((c) => ({
      url: `${appUrl}/courses/${c.slug}`,
      lastModified: new Date(c.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))
  } catch {
    // DB unavailable — return static URLs only
  }

  return [
    {
      url: appUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${appUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...courseUrls,
  ]
}
