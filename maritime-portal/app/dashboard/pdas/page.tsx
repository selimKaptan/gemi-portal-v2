import { redirect } from 'next/navigation'
import { getUser, getUserProfile, createClient } from '@/lib/supabase/server'
import { serialize } from '@/lib/utils'
import PdasClient from './PdasClient'
import type { PDA, Ship } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PdasPage() {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  const profile = await getUserProfile(user.id)
  if (!profile) redirect('/auth/login')

  if (profile.role !== 'armator') redirect('/dashboard')

  const supabase = await createClient()

  const [{ data: pdas }, { data: ships }] = await Promise.all([
    supabase
      .from('pdas')
      .select('*')
      .eq('armator_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('ships')
      .select('id, name, imo_no')
      .eq('armator_id', user.id)
      .order('name'),
  ])

  return (
    <PdasClient
      initialPdas={serialize((pdas ?? []) as PDA[])}
      ships={serialize((ships ?? []) as Pick<Ship, 'id' | 'name' | 'imo_no'>[])}
      userId={user.id}
    />
  )
}
