'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import {
  ClipboardList, Plus, X, Search, Eye, Pencil, Trash2,
  AlertCircle, Clock, Timer, CheckCircle,
  SendHorizonal, DollarSign, Building2, ThumbsUp, Loader2,
  Paperclip, FileText, UploadCloud, Trash, Star
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatDateTime, getStatusBadgeClass, getStatusLabel, getPriorityBadgeClass, getPriorityLabel, truncate, formatTimeRemaining } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import toast from 'react-hot-toast'
import type { DemandWithShip, Ship, DemandStatus, UserRole, PriorityLevel, OfferWithAgency } from '@/types'
import PortCombobox from '@/components/ui/PortCombobox'

interface Props {
  initialDemands: DemandWithShip[]
  ships: Ship[]
  userId: string
  role: UserRole
  agencyHasPorts?: boolean
  openDemandId?: string
}

const EMPTY_FORM = {
  ship_id: '', port: '', details: '', priority: 'normal' as PriorityLevel,
  estimated_arrival: '', estimated_departure: '', cargo_type: '', cargo_amount: '', notes: '',
  deadline_hours: '' as '' | '24' | '48',
}

type FilterStatus = DemandStatus | 'all'

function CountdownBadge({ expiresAt }: { expiresAt: string | null }) {
  const [label, setLabel] = useState(() => formatTimeRemaining(expiresAt))
  useEffect(() => {
    if (!expiresAt) return
    const id = setInterval(() => setLabel(formatTimeRemaining(expiresAt)), 30_000)
    return () => clearInterval(id)
  }, [expiresAt])
  if (!label) return null
  const isUrgent = expiresAt ? new Date(expiresAt).getTime() - Date.now() < 3_600_000 : false
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${isUrgent ? 'text-red-400 bg-red-400/10 border-red-400/20' : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'}`}>
      <Timer className="w-3 h-3" />{label}
    </span>
  )
}

export default function DemandsClient({ initialDemands, ships, userId, role, agencyHasPorts = true, openDemandId }: Props) {
  const [demands, setDemands] = useState<DemandWithShip[]>(initialDemands)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [viewDemand, setViewDemand] = useState<DemandWithShip | null>(null)
  const [editDemand, setEditDemand] = useState<DemandWithShip | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null)
  const [offers, setOffers] = useState<OfferWithAgency[]>([])
  const [offersLoading, setOffersLoading] = useState(false)
  const [offerForm, setOfferForm] = useState({ price: '', currency: 'USD', notes: '' })
  const [offerSaving, setOfferSaving] = useState(false)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [showOfferForm, setShowOfferForm] = useState(false)
  // Nomination modal
  const [nominationModal, setNominationModal] = useState<{ offerId: string; agencyId: string } | null>(null)
  const [nomForm, setNomForm] = useState({ contact_name: '', contact_email: '', contact_phone: '', message: '' })
  const [nomSaving, setNomSaving] = useState(false)
  const [offerFile, setOfferFile] = useState<File | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // Bu acentenin teklif verdiği talep ID'leri
  const [myOfferedIds, setMyOfferedIds] = useState<Set<string>>(() => new Set())

  const { t } = useTranslation()
  const { demands: d, common } = t

  const STATUS_FILTERS: { value: FilterStatus; label: string }[] = [
    { value: 'all',       label: d.filterAll       },
    { value: 'pending',   label: d.filterPending   },
    { value: 'reviewing', label: d.filterReviewing },
    { value: 'approved',  label: d.filterApproved  },
    { value: 'rejected',  label: d.filterRejected  },
    { value: 'completed', label: d.filterCompleted },
    { value: 'expired',   label: d.filterExpired   },
  ]

  const supabase = createClient()

  const filtered = useMemo(() => demands.filter(dem => {
    const matchSearch =
      dem.port.toLowerCase().includes(search.toLowerCase()) ||
      dem.ships?.name?.toLowerCase().includes(search.toLowerCase()) ||
      dem.details.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || dem.status === filterStatus
    return matchSearch && matchStatus
  }), [demands, search, filterStatus])

  function openAdd() { setEditDemand(null); setForm({ ...EMPTY_FORM, ship_id: ships[0]?.id ?? '' }); setModalOpen(true) }
  function openEdit(dem: DemandWithShip) {
    setEditDemand(dem)
    setForm({ ship_id: dem.ship_id, port: dem.port, details: dem.details, priority: dem.priority,
      estimated_arrival: dem.estimated_arrival ? dem.estimated_arrival.slice(0, 16) : '',
      estimated_departure: dem.estimated_departure ? dem.estimated_departure.slice(0, 16) : '',
      cargo_type: dem.cargo_type ?? '', cargo_amount: dem.cargo_amount?.toString() ?? '',
      notes: dem.notes ?? '', deadline_hours: '' })
    setModalOpen(true)
  }
  function upd(key: keyof typeof form, value: string) { setForm(prev => ({ ...prev, [key]: value })) }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setSaving(true)
    try {
      let expires_at: string | null = null
      if (!editDemand && form.deadline_hours) {
        const dt = new Date(); dt.setHours(dt.getHours() + parseInt(form.deadline_hours))
        expires_at = dt.toISOString()
      }
      const payload: Record<string, unknown> = {
        ship_id: form.ship_id, port: form.port, details: form.details, priority: form.priority,
        estimated_arrival: form.estimated_arrival || null, estimated_departure: form.estimated_departure || null,
        cargo_type: form.cargo_type || null, cargo_amount: form.cargo_amount ? parseFloat(form.cargo_amount) : null,
        notes: form.notes || null,
      }
      if (!editDemand) payload.expires_at = expires_at

      if (editDemand) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any).from('demands').update(payload).eq('id', editDemand.id).select('*, ships(id, name, imo_no, bayrak)').single()
        if (error) throw error
        setDemands(prev => prev.map(dem => dem.id === editDemand.id ? data as DemandWithShip : dem))
        toast.success(d.saved)
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data, error } = await (supabase as any).from('demands').insert(payload).select('*, ships(id, name, imo_no, bayrak)').single()
        if (error) throw error
        setDemands(prev => [data as DemandWithShip, ...prev])
        toast.success(d.created)
      }
      setModalOpen(false)
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : common.error)
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    try {
      const { error } = await supabase.from('demands').delete().eq('id', id)
      if (error) throw error
      setDemands(prev => prev.filter(dem => dem.id !== id))
      setDeleteId(null); toast.success(d.deleted)
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : common.error)
    } finally { setDeleting(false) }
  }

  async function updateStatus(id: string, status: DemandStatus) {
    setStatusUpdating(id)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).from('demands').update({ status }).eq('id', id).select('*, ships(id, name, imo_no, bayrak)').single()
      if (error) throw error
      setDemands(prev => prev.map(dem => dem.id === id ? data as DemandWithShip : dem))
      if (viewDemand?.id === id) setViewDemand(data as DemandWithShip)
      toast.success(d.statusUpdated(getStatusLabel(status)))
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : common.error)
    } finally { setStatusUpdating(null) }
  }

  const fetchOffers = useCallback(async (demandId: string) => {
    setOffersLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).from('offers').select('*, profiles:agency_id(full_name, company_name)').eq('demand_id', demandId).order('created_at', { ascending: false })
      if (error) throw error
      const offersData = (data ?? []) as OfferWithAgency[]
      // Acente ortalama puanlarını ayrıca çek
      if (offersData.length > 0) {
        const agencyIds = [...new Set(offersData.map(o => o.agency_id))]
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: ratings } = await (supabase as any)
          .from('agency_ratings')
          .select('agency_id, avg_rating')
          .in('agency_id', agencyIds)
        if (ratings) {
          const ratingMap = Object.fromEntries(ratings.map((r: { agency_id: string; avg_rating: number }) => [r.agency_id, r.avg_rating]))
          offersData.forEach(o => { o.avg_rating = ratingMap[o.agency_id] ?? null })
        }
      }
      setOffers(offersData)
    } catch { /* silent */ } finally { setOffersLoading(false) }
  }, [supabase])

  async function handleOpenView(dem: DemandWithShip) {
    setViewDemand(dem); setOffers([]); setShowOfferForm(false)
    setOfferForm({ price: '', currency: 'USD', notes: '' })
    setOfferFile(null)
    await fetchOffers(dem.id)
  }

  async function handleSubmitOffer(e: React.FormEvent) {
    e.preventDefault(); if (!viewDemand) return; setOfferSaving(true)
    try {
      let file_url: string | null = null
      let file_name: string | null = null
      let file_size: number | null = null

      if (offerFile) {
        const ext = offerFile.name.split('.').pop()
        const path = `${userId}/${viewDemand.id}-${Date.now()}.${ext}`
        const { error: uploadErr } = await supabase.storage.from('offer-files').upload(path, offerFile, { upsert: false })
        if (uploadErr) throw uploadErr
        const { data: urlData } = supabase.storage.from('offer-files').getPublicUrl(path)
        file_url = urlData.publicUrl
        file_name = offerFile.name
        file_size = offerFile.size
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).from('offers').insert({
        demand_id: viewDemand.id, agency_id: userId,
        price: offerForm.price ? parseFloat(offerForm.price) : null,
        currency: offerForm.currency, notes: offerForm.notes || null,
        file_url, file_name, file_size,
      }).select('*, profiles:agency_id(full_name, company_name)').single()
      if (error) throw error

      // Teklif gönderilince talebi "Teklif Verildi" (reviewing) durumuna al
      if (viewDemand.status === 'pending') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase as any).from('demands').update({ status: 'reviewing' }).eq('id', viewDemand.id)
        setDemands(prev => prev.map(dem =>
          dem.id === viewDemand.id ? { ...dem, status: 'reviewing' as DemandStatus } : dem
        ))
        setViewDemand(prev => prev ? { ...prev, status: 'reviewing' as DemandStatus } : null)
      }

      setOffers(prev => [data as OfferWithAgency, ...prev])
      setMyOfferedIds(prev => new Set([...prev, viewDemand.id]))
      setOfferForm({ price: '', currency: 'USD', notes: '' })
      setOfferFile(null); setShowOfferForm(false)
      toast.success(d.offerSentOk)
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : d.offerSendErr)
    } finally { setOfferSaving(false) }
  }

  async function handleAcceptOffer(offerId: string) {
    if (!viewDemand) return; setAcceptingId(offerId)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).rpc('accept_offer', { p_offer_id: offerId })
      if (error) throw error
      setDemands(prev => prev.map(dem => dem.id === viewDemand.id ? { ...dem, status: 'completed' as DemandStatus } : dem))
      setViewDemand(prev => prev ? { ...prev, status: 'completed' as DemandStatus } : null)
      setOffers(prev => prev.map(o => ({ ...o, status: o.id === offerId ? 'accepted' : o.status === 'pending' ? 'rejected' : o.status })))
      toast.success(d.offerAcceptedOk)
      // Kabul edilen teklifin agency_id'sini bul ve nomination modalını aç
      const acceptedOffer = offers.find(o => o.id === offerId)
      if (acceptedOffer) {
        setNomForm({ contact_name: '', contact_email: '', contact_phone: '', message: '' })
        setNominationModal({ offerId, agencyId: acceptedOffer.agency_id })
      }
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : d.offerAcceptErr)
    } finally { setAcceptingId(null) }
  }

  async function handleSendNomination() {
    if (!nominationModal || !viewDemand) return
    setNomSaving(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('nominations').insert({
        offer_id: nominationModal.offerId,
        demand_id: viewDemand.id,
        armator_id: userId,
        agency_id: nominationModal.agencyId,
        vessel_name: viewDemand.ships?.name ?? null,
        vessel_imo: viewDemand.ships?.imo_no ?? null,
        port: viewDemand.port,
        eta: viewDemand.estimated_arrival ?? null,
        etd: viewDemand.estimated_departure ?? null,
        cargo_type: viewDemand.cargo_type ?? null,
        cargo_amount: viewDemand.cargo_amount ?? null,
        contact_name: nomForm.contact_name || null,
        contact_email: nomForm.contact_email || null,
        contact_phone: nomForm.contact_phone || null,
        message: nomForm.message || null,
      })
      if (error) throw error
      toast.success('Nominasyon acenteye gönderildi.')
      setNominationModal(null)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Gönderme hatası.')
    } finally { setNomSaving(false) }
  }

  // Sayfa açılınca bu acentenin daha önce teklif verdiği talepleri çek
  useEffect(() => {
    if (role !== 'agency') return
    ;(async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data } = await (supabase as any)
        .from('offers')
        .select('demand_id')
        .eq('agency_id', userId)
      if (data) setMyOfferedIds(new Set((data as { demand_id: string }[]).map(r => r.demand_id)))
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // URL'de ?open=id varsa sayfa yüklenince o talebi otomatik aç
  useEffect(() => {
    if (!openDemandId) return
    const target = initialDemands.find(d => d.id === openDemandId)
    if (target) handleOpenView(target)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openDemandId])

  const myOffer = role === 'agency' ? offers.find(o => o.agency_id === userId) : null

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            {role === 'agency' ? d.allTitle : d.myTitle}
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">{d.count(demands.length)}</p>
        </div>
        {role === 'armator' && (
          <button onClick={openAdd} disabled={ships.length === 0} className="btn-primary gap-2 disabled:opacity-40" title={ships.length === 0 ? d.addFirst : ''}>
            <Plus className="w-4 h-4" />{d.newDemand}
          </button>
        )}
      </div>

      {/* Agency: no ports warning */}
      {role === 'agency' && !agencyHasPorts && (
        <div className="flex items-start gap-3 bg-yellow-400/5 border border-yellow-400/20 rounded-xl px-4 py-4">
          <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-300 font-medium text-sm">{d.portWarningTitle}</p>
            <p className="text-yellow-400/70 text-xs mt-0.5">
              {d.portWarningDesc}{' '}
              <a href="/dashboard/profile" className="underline hover:text-yellow-300 transition-colors">{d.portWarningLink}</a>{' '}
              {d.portWarningEnd}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" className="input-maritime pl-9" placeholder={d.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {STATUS_FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilterStatus(f.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === f.value ? 'bg-ocean-500/20 text-ocean-400 border border-ocean-500/30' : 'text-gray-500 hover:text-gray-300 border border-navy-700/50 hover:border-navy-600'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="maritime-card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <ClipboardList className="w-12 h-12 text-gray-700 mb-4" />
            <p className="text-gray-400">{search || filterStatus !== 'all' ? d.noResults : d.noDemands}</p>
            {role === 'armator' && !search && filterStatus === 'all' && (
              <button onClick={openAdd} disabled={ships.length === 0} className="btn-primary mt-4 text-sm gap-2">
                <Plus className="w-4 h-4" />{d.createFirst}
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-maritime">
              <thead>
                <tr>
                  <th>{d.colShip}</th><th>{d.colPort}</th><th>{d.colPriority}</th>
                  <th>{d.colStatus}</th><th>{d.colDeadline}</th><th>{d.colCreated}</th>
                  <th className="text-right">{d.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(dem => (
                  <tr key={dem.id}>
                    <td>
                      <div className="font-medium text-white">{dem.ships?.name ?? '—'}</div>
                      <div className="text-xs text-gray-500">{dem.ships?.imo_no}</div>
                    </td>
                    <td>
                      <div className="text-gray-200">{dem.port}</div>
                      <div className="text-xs text-gray-500 mt-0.5 max-w-[180px] truncate">{truncate(dem.details, 50)}</div>
                    </td>
                    <td><span className={getPriorityBadgeClass(dem.priority)}>{getPriorityLabel(dem.priority)}</span></td>
                    <td><span className={getStatusBadgeClass(dem.status)}>{getStatusLabel(dem.status)}</span></td>
                    <td>
                      {dem.expires_at ? (
                        <div className="space-y-1">
                          <div className="text-gray-400 text-xs">{formatDateTime(dem.expires_at)}</div>
                          {(dem.status === 'pending' || dem.status === 'reviewing') && <CountdownBadge expiresAt={dem.expires_at} />}
                        </div>
                      ) : <span className="text-gray-600 text-xs">{d.noDeadline}</span>}
                    </td>
                    <td className="text-gray-500">{formatDate(dem.created_at)}</td>
                    <td>
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleOpenView(dem)} className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-navy-700/50 transition-colors" title={d.actionView}>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {role === 'armator' && dem.status === 'pending' && (
                          <>
                            <button onClick={() => openEdit(dem)} className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-white hover:bg-navy-700/50 transition-colors" title={d.actionEdit}>
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeleteId(dem.id)} className="w-7 h-7 rounded flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title={d.actionDelete}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                        {role === 'agency' && (dem.status === 'pending' || dem.status === 'reviewing') && (
                          myOfferedIds.has(dem.id) ? (
                            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-green-500/10 text-green-400 border border-green-500/20 cursor-default">
                              <CheckCircle className="w-3 h-3" />{d.filterReviewing}
                            </span>
                          ) : (
                            <button onClick={() => handleOpenView(dem)}
                              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-ocean-500/15 text-ocean-400 border border-ocean-500/30 hover:bg-ocean-500/25 transition-colors"
                              title={d.offerBtn}>
                              <SendHorizonal className="w-3 h-3" />{d.offerBtn}
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-white">{editDemand ? d.editTitle : d.addTitle}</h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="form-group">
                <label className="label-maritime">{d.shipLabel}</label>
                <select className="input-maritime" value={form.ship_id} onChange={e => upd('ship_id', e.target.value)} required>
                  <option value="">{common.selectPlaceholder}</option>
                  {ships.map(s => <option key={s.id} value={s.id}>{s.name} — {s.imo_no}</option>)}
                </select>
                {form.ship_id && (() => {
                  const sel = ships.find(s => s.id === form.ship_id)
                  if (!sel) return null
                  return (
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <div className="bg-navy-800/60 rounded-lg px-3 py-2 border border-navy-600/40 text-center">
                        <p className="text-gray-500 text-xs uppercase tracking-wide">GRT</p>
                        <p className="text-white text-sm font-semibold number-display mt-0.5">{sel.grt.toLocaleString('tr-TR')}</p>
                      </div>
                      <div className="bg-navy-800/60 rounded-lg px-3 py-2 border border-navy-600/40 text-center">
                        <p className="text-gray-500 text-xs uppercase tracking-wide">NRT</p>
                        <p className="text-white text-sm font-semibold number-display mt-0.5">{sel.nrt.toLocaleString('tr-TR')}</p>
                      </div>
                      <div className="bg-navy-800/60 rounded-lg px-3 py-2 border border-navy-600/40 text-center">
                        <p className="text-gray-500 text-xs uppercase tracking-wide">Flag</p>
                        <p className="text-white text-sm font-semibold mt-0.5 truncate">{sel.bayrak}</p>
                      </div>
                    </div>
                  )
                })()}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label-maritime">{d.portLabel}</label>
                  <PortCombobox
                    value={form.port}
                    onChange={v => upd('port', v)}
                    placeholder="Liman seçin..."
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="label-maritime">{d.priorityLabel}</label>
                  <select className="input-maritime" value={form.priority} onChange={e => upd('priority', e.target.value)}>
                    <option value="low">{d.priorityLow}</option>
                    <option value="normal">{d.priorityNormal}</option>
                    <option value="high">{d.priorityHigh}</option>
                    <option value="urgent">{d.priorityUrgent}</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="label-maritime">{d.detailsLabel}</label>
                <textarea className="input-maritime" rows={3} placeholder={d.detailsPlaceholder} value={form.details} onChange={e => upd('details', e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label-maritime">{d.etaLabel}</label>
                  <input type="datetime-local" className="input-maritime" value={form.estimated_arrival} onChange={e => upd('estimated_arrival', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="label-maritime">{d.etdLabel}</label>
                  <input type="datetime-local" className="input-maritime" value={form.estimated_departure} onChange={e => upd('estimated_departure', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="label-maritime">{d.cargoTypeLabel}</label>
                  <input type="text" className="input-maritime" placeholder="Bulk Kargo" value={form.cargo_type} onChange={e => upd('cargo_type', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="label-maritime">{d.cargoAmountLabel}</label>
                  <input type="number" min="0" step="0.01" className="input-maritime" placeholder="5000" value={form.cargo_amount} onChange={e => upd('cargo_amount', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="label-maritime">{d.notesLabel}</label>
                <textarea className="input-maritime" rows={2} placeholder={d.notesPlaceholder} value={form.notes} onChange={e => upd('notes', e.target.value)} />
              </div>
              {!editDemand && (
                <div className="form-group">
                  <label className="label-maritime flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-ocean-400" />{d.durationLabel}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      { value: '' as const,   label: d.durationNone },
                      { value: '24' as const, label: d.duration24   },
                      { value: '48' as const, label: d.duration48   },
                    ]).map(opt => (
                      <button key={opt.value} type="button"
                        onClick={() => setForm(prev => ({ ...prev, deadline_hours: opt.value }))}
                        className={`py-2 rounded-lg text-sm font-medium border transition-all ${form.deadline_hours === opt.value ? 'bg-ocean-500/15 text-ocean-400 border-ocean-500/30' : 'text-gray-400 border-navy-700/50 hover:border-navy-600 hover:text-gray-200'}`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {form.deadline_hours && (
                    <p className="text-xs text-yellow-400/80 mt-1.5 flex items-center gap-1">
                      <Timer className="w-3 h-3" />{d.durationWarning(form.deadline_hours)}
                    </p>
                  )}
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">{common.cancel}</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? common.saving : editDemand ? common.update : common.confirm}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewDemand && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) { setViewDemand(null); setOffers([]) } }}>
          <div className="modal-content max-w-lg">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="font-display text-xl font-bold text-white">{viewDemand.ships?.name ?? d.viewTitle}</h2>
                <p className="text-gray-500 text-sm mt-0.5">IMO: {viewDemand.ships?.imo_no} · {viewDemand.port}</p>
              </div>
              <button onClick={() => { setViewDemand(null); setOffers([]) }} className="text-gray-500 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <span className={getStatusBadgeClass(viewDemand.status)}>{getStatusLabel(viewDemand.status)}</span>
                <span className={getPriorityBadgeClass(viewDemand.priority)}>{getPriorityLabel(viewDemand.priority)}</span>
              </div>
              <div className="bg-navy-950/60 rounded-lg p-4">
                <p className="label-maritime mb-1">{d.viewDetails}</p>
                <p className="text-gray-200 text-sm leading-relaxed">{viewDemand.details}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="label-maritime">{d.viewEta}</p><p className="text-gray-200">{formatDateTime(viewDemand.estimated_arrival)}</p></div>
                <div><p className="label-maritime">{d.viewEtd}</p><p className="text-gray-200">{formatDateTime(viewDemand.estimated_departure)}</p></div>
                {viewDemand.cargo_type && <div><p className="label-maritime">{d.viewCargoType}</p><p className="text-gray-200">{viewDemand.cargo_type}</p></div>}
                {viewDemand.cargo_amount && <div><p className="label-maritime">{d.viewCargoAmount}</p><p className="text-gray-200 number-display">{viewDemand.cargo_amount.toLocaleString('tr-TR')} ton</p></div>}
                <div><p className="label-maritime">{d.viewCreated}</p><p className="text-gray-200">{formatDate(viewDemand.created_at)}</p></div>
                <div><p className="label-maritime">{d.viewUpdated}</p><p className="text-gray-200">{formatDate(viewDemand.updated_at)}</p></div>
                <div>
                  <p className="label-maritime">{d.viewDeadline}</p>
                  {viewDemand.expires_at ? (
                    <div className="space-y-1">
                      <p className="text-gray-200">{formatDateTime(viewDemand.expires_at)}</p>
                      <CountdownBadge expiresAt={viewDemand.expires_at} />
                    </div>
                  ) : <p className="text-gray-500">{d.noDeadline}</p>}
                </div>
              </div>
              {viewDemand.notes && (
                <div className="bg-navy-950/60 rounded-lg p-4">
                  <p className="label-maritime mb-1">{d.viewNotes}</p>
                  <p className="text-gray-200 text-sm">{viewDemand.notes}</p>
                </div>
              )}

              {/* Offers */}
              <div className="border-t border-navy-700/40 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-ocean-400" />
                    {d.offersTitle}
                    {offers.length > 0 && <span className="text-xs bg-ocean-500/20 text-ocean-300 px-2 py-0.5 rounded-full">{offers.length}</span>}
                  </h3>
                  {role === 'agency' && (viewDemand.status === 'pending' || viewDemand.status === 'reviewing') && !myOffer && !showOfferForm && (
                    <button onClick={() => setShowOfferForm(true)}
                      className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-ocean-500/15 text-ocean-400 border border-ocean-500/30 hover:bg-ocean-500/25 transition-colors">
                      <SendHorizonal className="w-3.5 h-3.5" />{d.offerBtn}
                    </button>
                  )}
                </div>

                {role === 'agency' && showOfferForm && (
                  <form onSubmit={handleSubmitOffer} className="bg-navy-800/50 rounded-xl p-4 border border-navy-600/40 space-y-3">
                    <p className="text-xs font-semibold text-ocean-400 uppercase tracking-wide">{d.offerFormTitle}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label-maritime text-xs">{d.offerPrice}</label>
                        <input type="number" min="0" step="0.01" className="input-maritime w-full text-sm" placeholder="0.00" value={offerForm.price} onChange={e => setOfferForm(p => ({ ...p, price: e.target.value }))} />
                      </div>
                      <div>
                        <label className="label-maritime text-xs">{d.offerCurrency}</label>
                        <select className="input-maritime w-full text-sm" value={offerForm.currency} onChange={e => setOfferForm(p => ({ ...p, currency: e.target.value }))}>
                          <option value="USD">USD</option><option value="EUR">EUR</option><option value="TRY">TRY</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="label-maritime text-xs">{d.offerNote}</label>
                      <textarea className="input-maritime w-full resize-none text-sm" rows={2} placeholder={d.offerNotePlaceholder} value={offerForm.notes} onChange={e => setOfferForm(p => ({ ...p, notes: e.target.value }))} />
                    </div>

                    {/* Proforma drag & drop */}
                    <div>
                      <label className="label-maritime text-xs flex items-center gap-1.5">
                        <Paperclip className="w-3 h-3 text-ocean-400" />
                        Proforma Dosyası
                        <span className="text-gray-600 font-normal normal-case">(PDF, Word, Excel — maks. 10 MB)</span>
                      </label>
                      {offerFile ? (
                        <div className="flex items-center gap-3 bg-navy-900/60 border border-ocean-500/25 rounded-lg px-3 py-2.5 mt-1">
                          <FileText className="w-5 h-5 text-ocean-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-medium truncate">{offerFile.name}</p>
                            <p className="text-gray-500 text-xs">{(offerFile.size / 1024).toFixed(0)} KB</p>
                          </div>
                          <button type="button" onClick={() => { setOfferFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                            className="text-gray-500 hover:text-red-400 transition-colors flex-shrink-0">
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                          onDragLeave={() => setDragOver(false)}
                          onDrop={e => {
                            e.preventDefault(); setDragOver(false)
                            const file = e.dataTransfer.files[0]
                            if (file && file.size <= 10 * 1024 * 1024) setOfferFile(file)
                            else if (file) toast.error('Dosya boyutu 10 MB\'ı geçemez')
                          }}
                          onClick={() => fileInputRef.current?.click()}
                          className={`mt-1 border-2 border-dashed rounded-lg px-4 py-5 flex flex-col items-center gap-2 cursor-pointer transition-all
                            ${dragOver
                              ? 'border-ocean-400 bg-ocean-500/10 scale-[1.01]'
                              : 'border-navy-600/60 hover:border-ocean-500/40 hover:bg-navy-900/40'
                            }`}
                        >
                          <UploadCloud className={`w-7 h-7 ${dragOver ? 'text-ocean-400' : 'text-gray-600'}`} />
                          <p className="text-xs text-gray-400 text-center leading-relaxed">
                            Dosyayı buraya sürükle bırak<br />
                            <span className="text-ocean-400 hover:underline">veya tıklayarak seç</span>
                          </p>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          if (file && file.size <= 10 * 1024 * 1024) setOfferFile(file)
                          else if (file) toast.error('Dosya boyutu 10 MB\'ı geçemez')
                        }}
                      />
                    </div>

                    <div className="flex gap-2">
                      <button type="button" onClick={() => { setShowOfferForm(false); setOfferFile(null) }} className="btn-secondary text-sm py-1.5 flex-1">{common.cancel}</button>
                      <button type="submit" disabled={offerSaving} className="btn-primary text-sm py-1.5 flex-1 flex items-center justify-center gap-2">
                        {offerSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <SendHorizonal className="w-3.5 h-3.5" />}
                        {d.offerSend}
                      </button>
                    </div>
                  </form>
                )}

                {offersLoading ? (
                  <div className="flex items-center justify-center py-4"><Loader2 className="w-5 h-5 text-gray-500 animate-spin" /></div>
                ) : offers.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center py-3">{d.noOffers}</p>
                ) : (
                  <div className="space-y-2">
                    {offers.map(offer => {
                      const isAccepted = offer.status === 'accepted'
                      const isRejected = offer.status === 'rejected'
                      const isPending  = offer.status === 'pending'
                      return (
                        <div key={offer.id} className={`rounded-xl p-3 border ${isAccepted ? 'bg-green-500/5 border-green-500/25' : isRejected ? 'bg-red-500/5 border-red-500/15 opacity-60' : 'bg-navy-800/40 border-navy-600/40'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Building2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                <span className="text-white text-sm font-medium">{offer.profiles?.company_name ?? offer.profiles?.full_name ?? 'Agency'}</span>
                                {offer.price != null && <span className="text-ocean-400 font-bold text-sm number-display">{offer.price.toLocaleString('tr-TR')} {offer.currency}</span>}
                                <span className={`text-xs px-2 py-0.5 rounded-full border ${isAccepted ? 'text-green-400 bg-green-400/10 border-green-400/20' : isRejected ? 'text-red-400 bg-red-400/10 border-red-400/20' : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'}`}>
                                  {isAccepted ? d.offerAccepted : isRejected ? d.offerRejected : d.offerPending}
                                </span>
                              </div>
                              {offer.notes && <p className="text-gray-400 text-xs mt-1">{offer.notes}</p>}
                              {offer.avg_rating != null && (
                                <div className="flex items-center gap-1 mt-1">
                                  {[1,2,3,4,5].map(s => (
                                    <Star key={s} className={`w-3 h-3 ${s <= Math.round(offer.avg_rating!) ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                                  ))}
                                  <span className="text-gray-500 text-xs ml-1">{offer.avg_rating.toFixed(1)}</span>
                                </div>
                              )}
                              {offer.file_url && (
                                <a
                                  href={offer.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 text-xs text-ocean-400 hover:text-ocean-300 mt-1 transition-colors"
                                  onClick={e => e.stopPropagation()}
                                >
                                  <Paperclip className="w-3 h-3" />
                                  {offer.file_name ?? 'Proforma'}
                                </a>
                              )}
                              <p className="text-gray-600 text-xs mt-1">{formatDateTime(offer.created_at)}</p>
                            </div>
                            {role === 'armator' && isPending && (viewDemand.status === 'pending' || viewDemand.status === 'reviewing') && (
                              <button onClick={() => handleAcceptOffer(offer.id)} disabled={!!acceptingId}
                                className="flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-green-500/15 text-green-400 border border-green-500/30 hover:bg-green-500/25 transition-colors disabled:opacity-50">
                                {acceptingId === offer.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <ThumbsUp className="w-3 h-3" />}
                                {d.offerAcceptBtn}
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
                {role === 'agency' && myOffer && (
                  <div className="text-xs text-gray-500 text-center">{d.offerSent}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nomination Modal */}
      {nominationModal && viewDemand && (
        <div className="modal-backdrop">
          <div className="modal-content max-w-lg">
            <div className="mb-6">
              <h2 className="font-display text-xl font-bold text-white flex items-center gap-2">
                <SendHorizonal className="w-5 h-5 text-ocean-400" />Nominasyon Gönder
              </h2>
              <p className="text-gray-400 text-sm mt-1">Teklif kabul edildi. Acenteye nominasyon bilgilerini iletin.</p>
            </div>

            {/* Gemi & Talep Özeti */}
            <div className="bg-navy-950/60 rounded-xl p-4 border border-navy-700/40 mb-5 grid grid-cols-2 gap-3 text-sm">
              <div><p className="label-maritime text-xs">Gemi</p><p className="text-white font-medium">{viewDemand.ships?.name ?? '—'}</p></div>
              <div><p className="label-maritime text-xs">IMO</p><p className="text-white font-mono">{viewDemand.ships?.imo_no ?? '—'}</p></div>
              <div><p className="label-maritime text-xs">Liman</p><p className="text-white">{viewDemand.port}</p></div>
              {viewDemand.cargo_type && <div><p className="label-maritime text-xs">Kargo</p><p className="text-white">{viewDemand.cargo_type}</p></div>}
              {viewDemand.estimated_arrival && <div><p className="label-maritime text-xs">ETA</p><p className="text-white">{new Date(viewDemand.estimated_arrival).toLocaleDateString('tr-TR')}</p></div>}
              {viewDemand.estimated_departure && <div><p className="label-maritime text-xs">ETD</p><p className="text-white">{new Date(viewDemand.estimated_departure).toLocaleDateString('tr-TR')}</p></div>}
            </div>

            <div className="space-y-3">
              <p className="text-xs text-ocean-400 font-semibold uppercase tracking-wide">İletişim Bilgileri</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="label-maritime text-xs">Ad Soyad</label>
                  <input type="text" className="input-maritime w-full text-sm" placeholder="Kaptan / Operasyon sorumlusu"
                    value={nomForm.contact_name} onChange={e => setNomForm(p => ({ ...p, contact_name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="label-maritime text-xs">Telefon</label>
                  <input type="tel" className="input-maritime w-full text-sm" placeholder="+90 555 000 0000"
                    value={nomForm.contact_phone} onChange={e => setNomForm(p => ({ ...p, contact_phone: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="label-maritime text-xs">E-posta *</label>
                <input type="email" className="input-maritime w-full text-sm" placeholder="iletisim@sirket.com"
                  value={nomForm.contact_email} onChange={e => setNomForm(p => ({ ...p, contact_email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="label-maritime text-xs">Ek Mesaj / Talimatlar</label>
                <textarea className="input-maritime w-full resize-none text-sm" rows={3}
                  placeholder="Acenteye iletmek istediğiniz özel talimatlar, notlar..."
                  value={nomForm.message} onChange={e => setNomForm(p => ({ ...p, message: e.target.value }))} />
              </div>
              <div className="pt-1">
                <button onClick={handleSendNomination} disabled={nomSaving}
                  className="btn-primary w-full flex items-center justify-center gap-2">
                  {nomSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizonal className="w-4 h-4" />}
                  Nominasyonu Gönder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setDeleteId(null)}>
          <div className="modal-content max-w-sm text-center">
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-2">{d.deleteTitle}</h3>
            <p className="text-gray-400 text-sm mb-6">{d.deleteWarning}</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-secondary flex-1">{common.goBack}</button>
              <button onClick={() => handleDelete(deleteId)} disabled={deleting} className="btn-danger flex-1">
                {deleting ? common.deleting : common.yesDelete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
