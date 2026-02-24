import { redirect } from 'next/navigation'
import { getUser, getUserProfile, createClient } from '@/lib/supabase/server'
import { serialize } from '@/lib/utils'
import AdminPdasClient from './AdminPdasClient'
import type { PDAWithArmator } from '@/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AdminPage() {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  const profile = await getUserProfile(user.id)
  if (!profile) redirect('/auth/login')

  if (profile.role !== 'admin') redirect('/dashboard')

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('pdas')
    .select(`
      *,
      profiles:armator_id ( full_name, company_name ),
      ships:ship_id ( name, imo_no )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[Admin PDA] Fetch error:', error.message)
  }

  return (
    <AdminPdasClient
      initialPdas={serialize((data ?? []) as PDAWithArmator[])}
    />
  )
}
