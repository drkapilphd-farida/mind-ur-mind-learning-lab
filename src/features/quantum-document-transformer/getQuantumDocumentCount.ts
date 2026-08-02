import { createClient } from '@/lib/supabase/server'

// Pro Paywall — a real count of the signed-in user's own quantum_documents
// rows (RLS-scoped), used by both the dashboard's proactive UI check and
// the Route Handler's real enforcement. Not a Server Action: every real
// caller (a Server Component, the Route Handler) already runs server-side,
// so there's no client/server boundary to cross here.
export async function getQuantumDocumentCount(userId: string): Promise<number> {
  const supabase = await createClient()
  const { count } = await supabase
    .from('quantum_documents')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)

  return count ?? 0
}
