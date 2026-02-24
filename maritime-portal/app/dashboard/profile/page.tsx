import { redirect } from 'next/navigation'
import { getUser, getUserProfile, createClient } from '@/lib/supabase/server'
import { serialize } from '@/lib/utils'
import ProfileClient from './ProfileClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ProfilePage() {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  const profile = await getUserProfile(user.id)
  if (!profile) redirect('/auth/login')

  let agencyPorts: string[] = []
  if (profile.role === 'agency') {
    const supabase = await createClient()
    const { data } = await supabase
      .from('agency_ports')
      .select('port_name')
      .eq('agency_id', user.id)
      .order('port_name')
    agencyPorts = ((data ?? []) as { port_name: string }[]).map(r => r.port_name)
  }

  return (
    <ProfileClient
      profile={serialize(profile)}
      email={user.email ?? ''}
      initialAgencyPorts={agencyPorts}
    />
  )
}
