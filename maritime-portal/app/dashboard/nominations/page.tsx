import { redirect } from 'next/navigation'
import { getUser, getUserProfile, createClient } from '@/lib/supabase/server'
import { serialize } from '@/lib/utils'
import NominationsClient from './NominationsClient'
import type { Nomination } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function NominationsPage() {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  const profile = await getUserProfile(user.id)
  if (!profile || profile.role !== 'agency') redirect('/dashboard')

  const supabase = await createClient()

  const { data } = await supabase
    .from('nominations')
    .select('*')
    .eq('agency_id', user.id)
    .order('created_at', { ascending: false })

  const nominations = (data ?? []) as Nomination[]

  // Okunmamışları okundu yap
  const unreadIds = nominations.filter(n => !n.is_read).map(n => n.id)
  if (unreadIds.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from('nominations').update({ is_read: true }).in('id', unreadIds)
  }

  return <NominationsClient initialNominations={serialize(nominations)} />
}
