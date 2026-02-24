'use client'

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { Ship, ClipboardList, CheckCircle, Clock, TrendingUp, AlertCircle, FileText, ShieldCheck } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { getStatusBadgeClass, getStatusLabel, formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import type { DemandWithShip, Profile } from '@/types'

interface Props {
  profile: Profile
  stats: { total: number; pending: number; approved: number; completed: number; ships: number }
  recentDemands: DemandWithShip[]
}

export default function DashboardClient({ profile, stats: initialStats, recentDemands: initialDemands }: Props) {
  const { t } = useTranslation()
  const { dashboard: d, common } = t
  const supabase = createClient()

  const [stats, setStats] = useState(initialStats)
  const [recentDemands, setRecentDemands] = useState<DemandWithShip[]>(initialDemands)

  const refreshStats = useCallback(async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sb = supabase as any
    if (profile.role === 'admin') {
      const { data } = await sb.from('pdas').select('id, status')
      const pdas = (data ?? []) as { id: string; status: string }[]
      setStats({
        ships: 0,
        total:     pdas.length,
        pending:   pdas.filter((p: { status: string }) => p.status === 'pending').length,
        approved:  pdas.filter((p: { status: string }) => p.status === 'approved').length,
        completed: pdas.filter((p: { status: string }) => p.status === 'returned').length,
      })
    } else if (profile.role === 'armator') {
      const { data: ships } = await sb.from('ships').select('id').eq('armator_id', profile.id)
      const shipIds = ((ships ?? []) as { id: string }[]).map(s => s.id)
      if (shipIds.length === 0) return
      const { data } = await sb.from('demands').select('*, ships(id, name, imo_no, bayrak)').in('ship_id', shipIds).order('created_at', { ascending: false })
      const all = (data ?? []) as DemandWithShip[]
      setStats({
        ships:     shipIds.length,
        total:     all.length,
        pending:   all.filter(d => d.status === 'pending' || d.status === 'reviewing').length,
        approved:  all.filter(d => d.status === 'approved').length,
        completed: all.filter(d => d.status === 'completed').length,
      })
      setRecentDemands(all.slice(0, 5))
    } else {
      const { data } = await sb.from('demands').select('*, ships(id, name, imo_no, bayrak)').order('created_at', { ascending: false })
      const all = (data ?? []) as DemandWithShip[]
      setStats({
        ships: 0,
        total:     all.length,
        pending:   all.filter(d => d.status === 'pending' || d.status === 'reviewing').length,
        approved:  all.filter(d => d.status === 'approved').length,
        completed: all.filter(d => d.status === 'completed').length,
      })
      setRecentDemands(all.slice(0, 5))
    }
  }, [profile, supabase])

  useEffect(() => {
    const table = profile.role === 'admin' ? 'pdas' : 'demands'
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table }, () => {
        refreshStats()
      })
    if (profile.role === 'armator') {
      channel.on('postgres_changes', { event: '*', schema: 'public', table: 'ships' }, () => {
        refreshStats()
      })
    }
    channel.subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [profile.role, refreshStats, supabase])

  const roleLabel =
    profile.role === 'admin'   ? d.adminRole   :
    profile.role === 'armator' ? d.armatorRole : d.agencyRole

  const STAT_CARDS = profile.role === 'admin'
    ? [
        { label: d.totalPda,    value: stats.total,     icon: FileText,      color: 'text-ocean-400',  bg: 'bg-ocean-500/10',  href: '/dashboard/admin' },
        { label: d.waitingPda,  value: stats.pending,   icon: Clock,         color: 'text-yellow-400', bg: 'bg-yellow-500/10', href: '/dashboard/admin' },
        { label: d.approvedPda, value: stats.approved,  icon: CheckCircle,   color: 'text-green-400',  bg: 'bg-green-500/10',  href: '/dashboard/admin' },
        { label: d.returnedPda, value: stats.completed, icon: TrendingUp,    color: 'text-orange-400', bg: 'bg-orange-500/10', href: '/dashboard/admin' },
      ]
    : profile.role === 'armator'
    ? [
        { label: d.totalShips,   value: stats.ships,     icon: Ship,          color: 'text-ocean-400',  bg: 'bg-ocean-500/10',  href: '/dashboard/ships'   },
        { label: d.totalDemands, value: stats.total,     icon: ClipboardList, color: 'text-yellow-400', bg: 'bg-yellow-500/10', href: '/dashboard/demands' },
        { label: d.approved,     value: stats.approved,  icon: CheckCircle,   color: 'text-green-400',  bg: 'bg-green-500/10',  href: '/dashboard/demands' },
        { label: d.pending,      value: stats.pending,   icon: Clock,         color: 'text-orange-400', bg: 'bg-orange-500/10', href: '/dashboard/demands' },
      ]
    : [
        { label: d.totalDemands, value: stats.total,     icon: ClipboardList, color: 'text-ocean-400',  bg: 'bg-ocean-500/10',  href: '/dashboard/demands' },
        { label: d.pending,      value: stats.pending,   icon: Clock,         color: 'text-yellow-400', bg: 'bg-yellow-500/10', href: '/dashboard/demands' },
        { label: d.approved,     value: stats.approved,  icon: CheckCircle,   color: 'text-green-400',  bg: 'bg-green-500/10',  href: '/dashboard/demands' },
        { label: d.completed,    value: stats.completed, icon: TrendingUp,    color: 'text-purple-400', bg: 'bg-purple-500/10', href: '/dashboard/demands' },
      ]

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">
          {d.welcome}, {profile.full_name.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          {roleLabel} {d.panelWelcome}
          {profile.company_name && ` — ${profile.company_name}`}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STAT_CARDS.map(({ label, value, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} className="stat-card group">
            <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className={`text-2xl font-bold ${color} number-display`}>{value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Admin shortcut */}
      {profile.role === 'admin' && (
        <Link
          href="/dashboard/admin"
          className="maritime-card p-6 flex items-center gap-5 hover:border-ocean-500/30 transition-all group"
        >
          <div className="w-12 h-12 bg-ocean-500/10 rounded-xl flex items-center justify-center group-hover:bg-ocean-500/20 transition-colors flex-shrink-0">
            <ShieldCheck className="w-6 h-6 text-ocean-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-lg">{d.pdaPanel}</p>
            <p className="text-gray-400 text-sm mt-1">{d.pdaPanelDesc}</p>
          </div>
          <div className="ml-auto text-ocean-400 text-lg">→</div>
        </Link>
      )}

      {/* Recent demands */}
      {profile.role !== 'admin' && (
        <div className="maritime-card overflow-hidden">
          <div className="page-header px-6 pt-5 pb-4 border-b border-navy-700/40">
            <h2 className="font-display text-lg font-semibold text-white">{d.recentDemands}</h2>
            <Link href="/dashboard/demands" className="text-ocean-400 hover:text-ocean-300 text-sm transition-colors">
              {d.viewAll}
            </Link>
          </div>

          {recentDemands.length === 0 ? (
            <div className="empty-state">
              <AlertCircle className="w-12 h-12 text-gray-700 mb-4" />
              <p className="text-gray-500">{d.noDemands}</p>
              {profile.role === 'armator' && (
                <Link href="/dashboard/demands" className="btn-primary mt-4 text-sm">
                  {d.createFirst}
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="table-maritime">
                <thead>
                  <tr>
                    <th>{d.colShip}</th>
                    <th>{d.colPort}</th>
                    <th>{d.colStatus}</th>
                    <th>{d.colDate}</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDemands.map(dem => (
                    <tr
                      key={dem.id}
                      className="cursor-pointer hover:bg-navy-700/20 transition-colors"
                      onClick={() => window.location.href = `/dashboard/demands?open=${dem.id}`}
                    >
                      <td>
                        <div className="font-medium text-white">{dem.ships?.name ?? '—'}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{dem.ships?.imo_no}</div>
                      </td>
                      <td>{dem.port}</td>
                      <td>
                        <span className={getStatusBadgeClass(dem.status)}>{getStatusLabel(dem.status)}</span>
                      </td>
                      <td className="text-gray-500">{formatDate(dem.created_at)}</td>
                      <td className="text-right">
                        <span className="text-xs text-ocean-400 flex items-center justify-end gap-1">
                          Görüntüle →
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Quick actions — armator only */}
      {profile.role === 'armator' && (
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/dashboard/ships" className="maritime-card p-5 flex items-center gap-4 hover:border-ocean-500/30 transition-all group">
            <div className="w-10 h-10 bg-ocean-500/10 rounded-xl flex items-center justify-center group-hover:bg-ocean-500/20 transition-colors flex-shrink-0">
              <Ship className="w-5 h-5 text-ocean-400" />
            </div>
            <div>
              <p className="text-white font-medium">{d.addShip}</p>
              <p className="text-gray-500 text-sm">{d.addShipDesc}</p>
            </div>
          </Link>
          <Link href="/dashboard/demands" className="maritime-card p-5 flex items-center gap-4 hover:border-maritime-gold/30 transition-all group">
            <div className="w-10 h-10 bg-maritime-gold/10 rounded-xl flex items-center justify-center group-hover:bg-maritime-gold/20 transition-colors flex-shrink-0">
              <ClipboardList className="w-5 h-5 text-maritime-gold" />
            </div>
            <div>
              <p className="text-white font-medium">{d.createDemand}</p>
              <p className="text-gray-500 text-sm">{d.createDemandDesc}</p>
            </div>
          </Link>
          <Link href="/dashboard/pdas" className="maritime-card p-5 flex items-center gap-4 hover:border-purple-500/30 transition-all group">
            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors flex-shrink-0">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-medium">{d.uploadPda}</p>
              <p className="text-gray-500 text-sm">{d.uploadPdaDesc}</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
