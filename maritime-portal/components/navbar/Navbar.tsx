'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Anchor, Bell, LogOut, User, ChevronDown } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import type { Profile } from '@/types'
import toast from 'react-hot-toast'

interface NavbarProps {
  profile: Profile | null
}

export default function Navbar({ profile }: NavbarProps) {
  const router = useRouter()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const { t } = useTranslation()
  const { navbar, sidebar } = t

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('[data-dropdown]')) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [])

  async function handleLogout() {
    setLoggingOut(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      toast.success(navbar.loggedOut)
      window.location.href = '/auth/login'
    } catch {
      toast.error(navbar.logoutError)
      setLoggingOut(false)
    }
  }

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U'

  const roleBadge = profile?.role === 'agency' ? sidebar.agencyPanel : profile?.role === 'admin' ? sidebar.adminPanel : sidebar.armatorPanel

  return (
    <header className="h-16 bg-navy-900/80 backdrop-blur-md border-b border-navy-700/50 flex items-center px-6 gap-4 z-30 sticky top-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mr-auto lg:hidden">
        <div className="w-7 h-7 rounded-lg bg-ocean-500 flex items-center justify-center">
          <Anchor className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-white font-display font-bold text-base">
          Marine<span className="text-ocean-400">Portal</span>
        </span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <LanguageSwitcher />
        {/* Notifications (placeholder) */}
        <button className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-navy-700/50 transition-colors relative">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-ocean-400 rounded-full" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" data-dropdown>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg hover:bg-navy-700/50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-ocean-500/20 border border-ocean-500/30 flex items-center justify-center flex-shrink-0">
              <span className="text-ocean-400 font-bold text-xs">{initials}</span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-white text-sm font-medium leading-none">{profile?.full_name ?? navbar.user}</p>
              <p className="text-gray-500 text-xs mt-0.5">{roleBadge}</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 maritime-card shadow-xl overflow-hidden z-50 animate-fade-in">
              <div className="p-3 border-b border-navy-700/50">
                <p className="text-white text-sm font-medium">{profile?.full_name}</p>
                <p className="text-gray-500 text-xs mt-0.5 truncate">{profile?.company_name}</p>
              </div>
              <div className="p-1">
                <a
                  href="/dashboard/profile"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-navy-700/50 text-sm transition-colors"
                  onClick={() => setDropdownOpen(false)}
                >
                  <User className="w-4 h-4" />
                  {navbar.profile}
                </a>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm transition-colors disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  {loggingOut ? navbar.loggingOut : navbar.logout}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
