import { createClient } from '@/lib/supabase/server'
import ConviteClient from './ConviteClient'

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function ConvitePage({ params }: PageProps) {
  const { token } = await params
  const supabase = await createClient()

  const { data: invite } = await supabase
    .from('family_members')
    .select('*, babies(id, name, gender, photo_url)')
    .eq('invite_token', token)
    .single()

  return <ConviteClient invite={invite} token={token} />
}
