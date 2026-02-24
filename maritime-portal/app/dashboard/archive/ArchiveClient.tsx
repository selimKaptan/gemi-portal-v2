'use client'

import { useState, useMemo } from 'react'
import { Archive, Search, Eye, X, Ship as ShipIcon, CheckCircle, XCircle, Ban, Timer, RotateCcw, Loader2, Star, MessageSquare } from 'lucide-react'
import { formatDate, formatDateTime, getStatusBadgeClass, getStatusLabel, getPriorityBadgeClass, getPriorityLabel, truncate } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import type { DemandWithShip, DemandStatus, UserRole, Review } from '@/types'

interface Props {
  initialDemands: DemandWithShip[]
  role: UserRole
  userId: string
}

export default function ArchiveClient({ initialDemands, role, userId }: Props) {
  const [demands, setDemands] = useState<DemandWithShip[]>(initialDemands)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<DemandStatus | 'all'>('all')
  const [viewDemand, setViewDemand] = useState<DemandWithShip | null>(null)
  const [restoringId, setRestoringId] = useState<string | null>(null)

  // Review state
  const [reviewModal, setReviewModal] = useState<DemandWithShip | null>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewHover, setReviewHover] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [reviewSaving, setReviewSaving] = useState(false)
  const [myReviews, setMyReviews] = useState<Record<string, Review>>({})

  const { t } = useTranslation()
  const { archive: a } = t
  const supabase = createClient()

  async function handleRestore(dem: DemandWithShip) {
    if (!confirm(a.restoreConfirm)) return
    setRestoringId(dem.id)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any)
        .from('demands')
        .update({ status: 'pending', expires_at: null })
        .eq('id', dem.id)
      if (error) throw error
      setDemands(prev => prev.filter(d => d.id !== dem.id))
      setViewDemand(null)
      toast.success(a.restored)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : a.restoreErr)
    } finally {
      setRestoringId(null)
    }
  }

  async function openReviewModal(dem: DemandWithShip) {
    setReviewModal(dem)
    setReviewRating(myReviews[dem.id]?.rating ?? 0)
    setReviewComment(myReviews[dem.id]?.comment ?? '')
    // Mevcut review'u çek
    if (!myReviews[dem.id]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any).from('reviews').select('*').eq('demand_id', dem.id).eq('armator_id', userId).maybeSingle()
      if (data) {
        setMyReviews(prev => ({ ...prev, [dem.id]: data as Review }))
        setReviewRating((data as Review).rating)
        setReviewComment((data as Review).comment ?? '')
      }
    }
  }

  async function handleSubmitReview() {
    if (!reviewModal || reviewRating === 0) return toast.error('Lütfen bir puan seçin.')
    setReviewSaving(true)
    try {
      const existing = myReviews[reviewModal.id]
      if (existing) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any).from('reviews').update({ rating: reviewRating, comment: reviewComment || null }).eq('id', existing.id).select().single()
        if (error) throw error
        setMyReviews(prev => ({ ...prev, [reviewModal.id]: data as Review }))
      } else {
        // Önce bu talebin kabul edilen teklifini bul (agency_id için)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: offer } = await (supabase as any).from('offers').select('agency_id').eq('demand_id', reviewModal.id).eq('status', 'accepted').maybeSingle()
        if (!offer) throw new Error('Kabul edilen teklif bulunamadı.')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any).from('reviews').insert({
          demand_id: reviewModal.id,
          armator_id: userId,
          agency_id: offer.agency_id,
          rating: reviewRating,
          comment: reviewComment || null,
        }).select().single()
        if (error) throw error
        setMyReviews(prev => ({ ...prev, [reviewModal.id]: data as Review }))
      }
      toast.success('Değerlendirmeniz kaydedildi.')
      setReviewModal(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Hata oluştu.')
    } finally { setReviewSaving(false) }
  }

  const FILTER_OPTIONS = [
    { value: 'all'       as const, label: a.filterAll,       icon: Archive     },
    { value: 'completed' as const, label: a.filterCompleted, icon: CheckCircle },
    { value: 'rejected'  as const, label: a.filterRejected,  icon: XCircle     },
    { value: 'expired'   as const, label: a.filterExpired,   icon: Timer       },
    { value: 'cancelled' as const, label: a.filterCancelled, icon: Ban         },
  ]

  const filtered = useMemo(() => demands.filter(d => {
    const matchSearch =
      d.ships?.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.port.toLowerCase().includes(search.toLowerCase()) ||
      d.ships?.imo_no?.toLowerCase().includes(search.toLowerCase()) ||
      d.details.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || d.status === filterStatus
    return matchSearch && matchStatus
  }), [demands, search, filterStatus])

  const counts = {
    all:       demands.length,
    completed: demands.filter(d => d.status === 'completed').length,
    rejected:  demands.filter(d => d.status === 'rejected').length,
    expired:   demands.filter(d => d.status === 'expired').length,
    cancelled: demands.filter(d => d.status === 'cancelled').length,
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white flex items-center gap-3">
          <Archive className="w-6 h-6 text-gray-400" />{a.title}
        </h1>
        <p className="text-gray-400 text-sm mt-1">{a.desc}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map(({ value, label, icon: Icon }) => {
          const count = counts[value as keyof typeof counts] ?? 0
          return (
            <button key={value} onClick={() => setFilterStatus(value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${filterStatus === value ? 'bg-ocean-500/15 text-ocean-400 border-ocean-500/30' : 'text-gray-400 border-navy-700/50 hover:text-white hover:border-navy-600'}`}>
              <Icon className="w-3.5 h-3.5" />{label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterStatus === value ? 'bg-ocean-500/20 text-ocean-300' : 'bg-navy-700 text-gray-500'}`}>{count}</span>
            </button>
          )
        })}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input type="text" className="input-maritime pl-9" placeholder={a.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="maritime-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Archive className="w-12 h-12 text-gray-700 mb-4" />
            <p className="text-gray-500">{search || filterStatus !== 'all' ? a.noResults : a.empty}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-maritime">
              <thead>
                <tr>
                  <th>{a.colShip}</th><th>{a.colImo}</th><th>{a.colPort}</th><th>{a.colPriority}</th>
                  <th>{a.colStatus}</th><th>{a.colCreated}</th><th>{a.colClosed}</th>
                  {role !== 'armator' && <th>{a.colDeadline}</th>}
                  <th className="text-right">{a.colAction}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-ocean-500/10 flex items-center justify-center flex-shrink-0">
                          <ShipIcon className="w-3.5 h-3.5 text-ocean-400" />
                        </div>
                        <span className="font-medium text-white">{d.ships?.name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="text-gray-400 text-xs font-mono">{d.ships?.imo_no ?? '—'}</td>
                    <td>
                      <div className="text-gray-200">{d.port}</div>
                      <div className="text-xs text-gray-500 max-w-[150px] truncate">{truncate(d.details, 40)}</div>
                    </td>
                    <td><span className={getPriorityBadgeClass(d.priority)}>{getPriorityLabel(d.priority)}</span></td>
                    <td><span className={getStatusBadgeClass(d.status)}>{getStatusLabel(d.status)}</span></td>
                    <td className="text-gray-500 text-xs">{formatDateTime(d.created_at)}</td>
                    <td className="text-gray-500 text-xs">{formatDateTime(d.updated_at)}</td>
                    {role !== 'armator' && (
                      <td className="text-gray-500 text-xs">
                        {d.expires_at ? formatDateTime(d.expires_at) : <span className="text-gray-600">{a.noDeadline}</span>}
                      </td>
                    )}
                    <td>
                      <div className="flex justify-end items-center gap-1">
                        {role === 'armator' && d.status === 'completed' && (
                          <button
                            onClick={() => openReviewModal(d)}
                            className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg border transition-colors ${myReviews[d.id] ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' : 'bg-navy-700/40 text-gray-400 border-navy-600/40 hover:text-amber-400 hover:border-amber-500/30'}`}
                            title="Değerlendir">
                            <Star className={`w-3 h-3 ${myReviews[d.id] ? 'fill-amber-400' : ''}`} />
                            {myReviews[d.id] ? `${myReviews[d.id].rating}/5` : 'Değerlendir'}
                          </button>
                        )}
                        {role === 'armator' && (
                          <button
                            onClick={() => handleRestore(d)}
                            disabled={restoringId === d.id}
                            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-ocean-500/15 text-ocean-400 border border-ocean-500/30 hover:bg-ocean-500/25 transition-colors disabled:opacity-50"
                            title={a.restoreBtn}>
                            {restoringId === d.id
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <RotateCcw className="w-3 h-3" />}
                            {a.restoreBtn}
                          </button>
                        )}
                        <button onClick={() => setViewDemand(d)} className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-navy-700/50 transition-colors" title={a.viewBtn}>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setReviewModal(null)}>
          <div className="modal-content max-w-md">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-400" />Acenteyi Değerlendir
                </h2>
                <p className="text-gray-400 text-sm mt-1">{reviewModal.ships?.name} — {reviewModal.port}</p>
              </div>
              <button onClick={() => setReviewModal(null)} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-5">
              {/* Yıldız seçici */}
              <div>
                <p className="text-sm text-gray-400 mb-3">Hizmet kalitesini puanlayın</p>
                <div className="flex items-center gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onMouseEnter={() => setReviewHover(star)}
                      onMouseLeave={() => setReviewHover(0)}
                      onClick={() => setReviewRating(star)}
                      className="transition-transform hover:scale-110">
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          star <= (reviewHover || reviewRating)
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-gray-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {reviewRating > 0 && (
                  <p className="text-center text-sm mt-2 font-medium">
                    {['', '😞 Çok Kötü', '😕 Kötü', '😐 Orta', '🙂 İyi', '😊 Mükemmel'][reviewRating]}
                  </p>
                )}
              </div>

              {/* Yorum */}
              <div>
                <label className="label-maritime flex items-center gap-1.5 mb-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-ocean-400" />
                  Yorum <span className="text-gray-600 font-normal">(opsiyonel)</span>
                </label>
                <textarea
                  className="input-maritime w-full resize-none"
                  rows={3}
                  placeholder="Acente hakkındaki deneyiminizi paylaşın..."
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setReviewModal(null)} className="btn-secondary flex-1">İptal</button>
                <button
                  onClick={handleSubmitReview}
                  disabled={reviewSaving || reviewRating === 0}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-40">
                  {reviewSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                  {myReviews[reviewModal.id] ? 'Güncelle' : 'Değerlendirmeyi Gönder'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {viewDemand && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setViewDemand(null)}>
          <div className="modal-content max-w-lg">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ShipIcon className="w-4 h-4 text-ocean-400" />
                  <h2 className="font-display text-xl font-bold text-white">{viewDemand.ships?.name ?? a.viewTitle}</h2>
                </div>
                <p className="text-gray-500 text-sm">IMO: {viewDemand.ships?.imo_no} · {viewDemand.port}</p>
              </div>
              <button onClick={() => setViewDemand(null)} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className={getStatusBadgeClass(viewDemand.status)}>{getStatusLabel(viewDemand.status)}</span>
                <span className={getPriorityBadgeClass(viewDemand.priority)}>{getPriorityLabel(viewDemand.priority)}</span>
              </div>
              <div className="bg-navy-950/60 rounded-lg p-4">
                <p className="label-maritime mb-1">{a.viewDetails}</p>
                <p className="text-gray-200 text-sm leading-relaxed">{viewDemand.details}</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="label-maritime">{a.viewEta}</p><p className="text-gray-200">{formatDateTime(viewDemand.estimated_arrival)}</p></div>
                <div><p className="label-maritime">{a.viewEtd}</p><p className="text-gray-200">{formatDateTime(viewDemand.estimated_departure)}</p></div>
                {viewDemand.cargo_type && <div><p className="label-maritime">{a.viewCargoType}</p><p className="text-gray-200">{viewDemand.cargo_type}</p></div>}
                {viewDemand.cargo_amount && <div><p className="label-maritime">{a.viewCargoAmount}</p><p className="text-gray-200 number-display">{viewDemand.cargo_amount.toLocaleString('tr-TR')} ton</p></div>}
                <div><p className="label-maritime">{a.viewCreated}</p><p className="text-gray-200">{formatDateTime(viewDemand.created_at)}</p></div>
                <div><p className="label-maritime">{a.viewClosed}</p><p className="text-gray-200">{formatDateTime(viewDemand.updated_at)}</p></div>
                {viewDemand.expires_at && <div><p className="label-maritime">{a.viewDeadline}</p><p className="text-gray-200">{formatDateTime(viewDemand.expires_at)}</p></div>}
              </div>
              {viewDemand.notes && (
                <div className="bg-navy-950/60 rounded-lg p-4">
                  <p className="label-maritime mb-1">{a.viewNotes}</p>
                  <p className="text-gray-200 text-sm">{viewDemand.notes}</p>
                </div>
              )}
              {role === 'armator' && (
                <div className="border-t border-navy-700/40 pt-4">
                  <button
                    onClick={() => handleRestore(viewDemand)}
                    disabled={restoringId === viewDemand.id}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-ocean-500/15 text-ocean-400 border border-ocean-500/30 hover:bg-ocean-500/25 transition-colors disabled:opacity-50 font-medium text-sm">
                    {restoringId === viewDemand.id
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : <RotateCcw className="w-4 h-4" />}
                    {a.restoreBtn}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
