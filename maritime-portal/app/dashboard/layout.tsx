import { redirect } from 'next/navigation'
import { getUser, getUserProfile } from '@/lib/supabase/server'
import Navbar from '@/components/navbar/Navbar'
import Sidebar from '@/components/dashboard/Sidebar'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  if (!user) redirect('/auth/login')

  const profile = await getUserProfile(user.id)
  if (!profile) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar role={profile.role} userId={user.id} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar profile={profile} />

          <main className="flex-1 overflow-y-auto p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
