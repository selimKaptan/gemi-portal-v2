import { redirect } from 'next/navigation'
import { getUser, getUserProfile, createClient } from '@/lib/supabase/server'
import { serialize } from '@/lib/utils'
import type { DemandWithShip } from '@/types'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  const profile = await getUserProfile(user.id)
  if (!profile) redirect('/auth/login')

  const supabase = await createClient()

  let stats = { total: 0, pending: 0, approved: 0, completed: 0, ships: 0 }
  let recentDemands: DemandWithShip[] = []

  if (profile.role === 'admin') {
    const { data: pdas } = await supabase.from('pdas').select('id, status')
    const allPdas = (pdas ?? []) as { id: string; status: string }[]
    stats.total     = allPdas.length
    stats.pending   = allPdas.filter(p => p.status === 'pending').length
    stats.approved  = allPdas.filter(p => p.status === 'approved').length
    stats.completed = allPdas.filter(p => p.status === 'returned').length
  } else if (profile.role === 'armator') {
    const { data: ships } = await supabase.from('ships').select('id').eq('armator_id', user.id)
    const shipRows = (ships ?? []) as { id: string }[]
    stats.ships = shipRows.length

    if (stats.ships > 0) {
      const shipIds = shipRows.map(s => s.id)
      const { data: demands } = await supabase
        .from('demands')
        .select('*, ships(id, name, imo_no, bayrak)')
        .in('ship_id', shipIds)
        .order('created_at', { ascending: false })

      const allDemands = (demands ?? []) as DemandWithShip[]
      stats.total     = allDemands.length
      stats.pending   = allDemands.filter(d => d.status === 'pending' || d.status === 'reviewing').length
      stats.approved  = allDemands.filter(d => d.status === 'approved').length
      stats.completed = allDemands.filter(d => d.status === 'completed').length
      recentDemands   = allDemands.slice(0, 5)
    }
  } else {
    const { data: demands } = await supabase
      .from('demands')
      .select('*, ships(id, name, imo_no, bayrak)')
      .order('created_at', { ascending: false })

    const allDemands = (demands ?? []) as DemandWithShip[]
    stats.total     = allDemands.length
    stats.pending   = allDemands.filter(d => d.status === 'pending' || d.status === 'reviewing').length
    stats.approved  = allDemands.filter(d => d.status === 'approved').length
    stats.completed = allDemands.filter(d => d.status === 'completed').length
    recentDemands   = allDemands.slice(0, 5)
  }

  return (
    <DashboardClient
      profile={serialize(profile)}
      stats={stats}
      recentDemands={serialize(recentDemands)}
    />
  )
}
