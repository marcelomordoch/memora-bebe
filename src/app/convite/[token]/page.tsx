import { createClient } from '@supabase/supabase-js'
import ConviteClient from './ConviteClient'

interface PageProps {
  params: Promise<{ token: string }>
}

// Admin client bypassa RLS — convite deve ser público
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export default async function ConvitePage({ params }: PageProps) {
  const { token } = await params
  const admin = adminClient()

  const { data: raw } = await admin
    .from('family_members')
    .select('id, name, role, status, invite_token, babies(id, name, gender, photo_url)')
    .eq('invite_token', token)
    .single()

  // Normalizar babies: o Supabase retorna array quando é join, mas é um objeto único
  const invite = raw ? {
    ...raw,
    babies: Array.isArray(raw.babies) ? raw.babies[0] ?? null : raw.babies,
  } : null

  return <ConviteClient invite={invite as Parameters<typeof ConviteClient>[0]['invite']} token={token} />
}
