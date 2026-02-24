import { redirect } from 'next/navigation'
import { getUser, getUserProfile, createClient } from '@/lib/supabase/server'
import { serialize } from '@/lib/utils'
import ArchiveClient from './ArchiveClient'
import type { DemandWithShip } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ArchivePage() {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  const profile = await getUserProfile(user.id)
  if (!profile) redirect('/auth/login')

  const supabase = await createClient()

  // Süresi dolmuş talepleri otomatik kapat
  await (supabase as any).rpc('expire_demands')

  let demands: DemandWithShip[] = []

  if (profile.role === 'armator') {
    const { data: ships } = await supabase
      .from('ships')
      .select('id')
      .eq('armator_id', user.id)

    const shipIds = ((ships ?? []) as { id: string }[]).map(s => s.id)

    if (shipIds.length > 0) {
      const { data } = await supabase
        .from('demands')
        .select('*, ships(id, name, imo_no, bayrak)')
        .in('ship_id', shipIds)
        .in('status', ['completed', 'rejected', 'cancelled', 'expired'])
        .order('updated_at', { ascending: false })
      demands = (data ?? []) as DemandWithShip[]
    }
  } else {
    const { data } = await supabase
      .from('demands')
      .select('*, ships(id, name, imo_no, bayrak)')
      .in('status', ['completed', 'rejected', 'cancelled', 'expired'])
      .order('updated_at', { ascending: false })
    demands = (data ?? []) as DemandWithShip[]
  }

  return (
    <ArchiveClient
      initialDemands={serialize(demands)}
      role={profile.role}
      userId={user.id}
    />
  )
}
