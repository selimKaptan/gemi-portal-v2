'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  Anchor, LayoutDashboard, Ship, ClipboardList,
  User, FileText, ShieldCheck, Archive, SendHorizonal,
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/types'

interface SidebarProps {
  role: UserRole
  userId?: string
}

export default function Sidebar({ role, userId }: SidebarProps) {
  const pathname = usePathname()
  const { t } = useTranslation()
  const { sidebar } = t
  const [unreadNominations, setUnreadNominations] = useState(0)

  useEffect(() => {
    if (role !== 'agency' || !userId) return
    const supabase = createClient()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(supabase as any)
      .from('nominations')
      .select('id', { count: 'exact', head: true })
      .eq('agency_id', userId)
      .eq('is_read', false)
      .then(({ count }: { count: number | null }) => {
        setUnreadNominations(count ?? 0)
      })
  }, [role, userId])

  const ARMATOR_NAV = [
    { href: '/dashboard',         icon: LayoutDashboard, label: sidebar.dashboard, badge: 0 },
    { href: '/dashboard/ships',   icon: Ship,            label: sidebar.ships,     badge: 0 },
    { href: '/dashboard/demands', icon: ClipboardList,   label: sidebar.demands,   badge: 0 },
    { href: '/dashboard/pdas',    icon: FileText,        label: sidebar.pdas,      badge: 0 },
    { href: '/dashboard/archive', icon: Archive,         label: sidebar.archive,   badge: 0 },
    { href: '/dashboard/profile', icon: User,            label: sidebar.profile,   badge: 0 },
  ]
  const AGENCY_NAV = [
    { href: '/dashboard',               icon: LayoutDashboard, label: sidebar.dashboard,   badge: 0 },
    { href: '/dashboard/demands',       icon: ClipboardList,   label: sidebar.allDemands,  badge: 0 },
    { href: '/dashboard/nominations',   icon: SendHorizonal,   label: 'Nominasyonlar',      badge: unreadNominations },
    { href: '/dashboard/archive',       icon: Archive,         label: sidebar.archive,     badge: 0 },
    { href: '/dashboard/profile',       icon: User,            label: sidebar.profile,     badge: 0 },
  ]
  const ADMIN_NAV = [
    { href: '/dashboard',         icon: LayoutDashboard, label: sidebar.dashboard,  badge: 0 },
    { href: '/dashboard/admin',   icon: ShieldCheck,     label: sidebar.pdaReview,  badge: 0 },
    { href: '/dashboard/archive', icon: Archive,         label: sidebar.archive,    badge: 0 },
    { href: '/dashboard/profile', icon: User,            label: sidebar.profile,    badge: 0 },
  ]

  const nav = role === 'agency' ? AGENCY_NAV : role === 'admin' ? ADMIN_NAV : ARMATOR_NAV

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <aside className="hidden lg:flex flex-col w-60 bg-navy-900/80 border-r border-navy-700/50 backdrop-blur-md h-full">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-navy-700/50 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-lg bg-ocean-500 flex items-center justify-center group-hover:bg-ocean-600 transition-colors">
            <Anchor className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-display font-bold text-base">
            Marine<span className="text-ocean-400">Portal</span>
          </span>
        </Link>
      </div>

      {/* Role badge */}
      <div className="px-4 pt-4 pb-2">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
          role === 'agency'
            ? 'bg-maritime-gold/10 text-maritime-gold border border-maritime-gold/20'
            : role === 'admin'
              ? 'bg-red-500/10 text-red-400 border border-red-500/20'
              : 'bg-ocean-500/10 text-ocean-400 border border-ocean-500/20'
        }`}>
          {role === 'agency' ? sidebar.agencyPanel : role === 'admin' ? sidebar.adminPanel : sidebar.armatorPanel}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {nav.map(({ href, icon: Icon, label, badge }) => {
          const active = isActive(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                active
                  ? 'bg-ocean-500/15 text-ocean-400 border border-ocean-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-navy-700/50'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-ocean-400' : ''}`} />
              {label}
              <div className="ml-auto flex items-center gap-1.5">
                {badge != null && badge > 0 && (
                  <span className="px-1.5 py-0.5 text-xs font-bold bg-ocean-500 text-white rounded-full leading-none">
                    {badge}
                  </span>
                )}
                {active && (
                  <div className="w-1.5 h-1.5 bg-ocean-400 rounded-full" />
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-navy-700/50">
        <p className="text-gray-600 text-xs text-center">
          MarinePortal v1.0
        </p>
      </div>
    </aside>
  )
}
