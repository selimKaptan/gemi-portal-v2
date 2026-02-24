import { redirect } from 'next/navigation'
import { getUser, getUserProfile, createClient } from '@/lib/supabase/server'
import { serialize } from '@/lib/utils'
import ShipsClient from './ShipsClient'
import type { Ship } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ShipsPage() {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  const profile = await getUserProfile(user.id)
  if (!profile) redirect('/auth/login')

  if (profile.role !== 'armator') redirect('/dashboard')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ships')
    .select('*')
    .eq('armator_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Ships] Fetch error:', error.message)
  }

  return (
    <ShipsClient
      initialShips={serialize((data ?? []) as Ship[])}
      userId={user.id}
    />
  )
}
