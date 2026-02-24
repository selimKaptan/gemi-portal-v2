'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  FileText, Eye, Clock, CheckCircle, RotateCcw,
  MessageSquare, Ship as ShipIcon, User, ChevronDown, ChevronUp,
  Check, Plus, Trash2, Pencil, X, DollarSign, Loader2
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import type { PDAWithArmator, PdaStatus, PdaItem } from '@/types'

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const EMPTY_ITEM = { description: '', amount: '', currency: 'USD', note: '' }

interface AdminPdasClientProps { initialPdas: PDAWithArmator[] }

export default function AdminPdasClient({ initialPdas }: AdminPdasClientProps) {
  const supabase = createClient()
  const [pdas, setPdas] = useState<PDAWithArmator[]>(initialPdas)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adminNote, setAdminNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState<PdaStatus | 'all'>('all')
  const [targetPriceForm, setTargetPriceForm] = useState<Record<string, { price: string; currency: string }>>({})
  const [targetSaving, setTargetSaving] = useState<string | null>(null)

  // Kalem (line item) state
  const [itemsMap, setItemsMap] = useState<Record<string, PdaItem[]>>({})
  const [itemsLoading, setItemsLoading] = useState<string | null>(null)
  const [newItem, setNewItem] = useState({ ...EMPTY_ITEM })
  const [addingItem, setAddingItem] = useState(false)
  const [editingItem, setEditingItem] = useState<PdaItem | null>(null)
  const [editItemForm, setEditItemForm] = useState({ ...EMPTY_ITEM })
  const [itemSaving, setItemSaving] = useState(false)

  const { t } = useTranslation()
  const { adminPdas: a, common } = t

  const STATUS_CONFIG: Record<PdaStatus, { label: string; color: string; icon: React.ElementType }> = {
    pending:   { label: a.statusPending,   color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', icon: Clock       },
    reviewing: { label: a.statusReviewing, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',       icon: Eye         },
    returned:  { label: a.statusReturned,  color: 'text-orange-400 bg-orange-400/10 border-orange-400/20', icon: RotateCcw   },
    approved:  { label: a.statusApproved,  color: 'text-green-400 bg-green-400/10 border-green-400/20',    icon: CheckCircle },
  }

  function StatusBadge({ status }: { status: PdaStatus }) {
    const cfg = STATUS_CONFIG[status]; const Icon = cfg.icon
    return <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}><Icon className="w-3 h-3" />{cfg.label}</span>
  }

  const filtered = filterStatus === 'all' ? pdas : pdas.filter(p => p.status === filterStatus)
  const counts = { all: pdas.length, pending: pdas.filter(p => p.status === 'pending').length, reviewing: pdas.filter(p => p.status === 'reviewing').length, returned: pdas.filter(p => p.status === 'returned').length, approved: pdas.filter(p => p.status === 'approved').length }

  // Kalemleri yükle
  const fetchItems = useCallback(async (pdaId: string) => {
    if (itemsMap[pdaId]) return
    setItemsLoading(pdaId)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).from('pda_items').select('*').eq('pda_id', pdaId).order('created_at')
      if (error) throw error
      setItemsMap(prev => ({ ...prev, [pdaId]: (data ?? []) as PdaItem[] }))
    } catch { /* silent */ } finally { setItemsLoading(null) }
  }, [itemsMap, supabase])

  async function toggleExpand(pdaId: string) {
    const isExpanding = expandedId !== pdaId
    setExpandedId(isExpanding ? pdaId : null)
    if (isExpanding) {
      setEditingId(null)
      setAddingItem(false)
      setEditingItem(null)
      await fetchItems(pdaId)
      // Hedef fiyat formunu mevcut değerle doldur
      const pda = pdas.find(p => p.id === pdaId)
      if (pda) {
        setTargetPriceForm(prev => ({
          ...prev,
          [pdaId]: { price: pda.target_price?.toString() ?? '', currency: pda.target_currency ?? 'USD' }
        }))
      }
    }
  }

  async function handleSaveTargetPrice(pdaId: string) {
    const form = targetPriceForm[pdaId]
    if (!form) return
    setTargetSaving(pdaId)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).from('pdas').update({
        target_price: form.price ? parseFloat(form.price) : null,
        target_currency: form.currency,
      }).eq('id', pdaId).select('*, profiles:armator_id ( full_name, company_name ), ships:ship_id ( name, imo_no )').single()
      if (error) throw error
      setPdas(prev => prev.map(p => p.id === pdaId ? (data as PDAWithArmator) : p))
      toast.success('Hedef fiyat kaydedildi.')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : common.error)
    } finally { setTargetSaving(null) }
  }

  async function updatePda(id: string, updates: { status?: PdaStatus; admin_notes?: string }) {
    setSaving(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).from('pdas').update(updates).eq('id', id)
        .select('*, profiles:armator_id ( full_name, company_name ), ships:ship_id ( name, imo_no )').single()
      if (error) throw new Error(error.message)
      setPdas(prev => prev.map(p => p.id === id ? (data as PDAWithArmator) : p))
      toast.success(a.updated); setEditingId(null); setAdminNote('')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : a.updateFailed)
    } finally { setSaving(false) }
  }

  async function handleReturn(pda: PDAWithArmator) {
    if (!adminNote.trim()) { toast.error(a.returnNoteRequired); return }
    await updatePda(pda.id, { status: 'returned', admin_notes: adminNote.trim() })
  }

  function startEditing(pda: PDAWithArmator) { setEditingId(pda.id); setAdminNote(pda.admin_notes ?? '') }

  // Kalem ekle
  async function handleAddItem(pdaId: string) {
    if (!newItem.description.trim()) return toast.error('Açıklama gereklidir.')
    setItemSaving(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).from('pda_items').insert({
        pda_id: pdaId,
        description: newItem.description.trim(),
        amount: newItem.amount ? parseFloat(newItem.amount) : null,
        currency: newItem.currency,
        note: newItem.note.trim() || null,
      }).select().single()
      if (error) throw error
      setItemsMap(prev => ({ ...prev, [pdaId]: [...(prev[pdaId] ?? []), data as PdaItem] }))
      setNewItem({ ...EMPTY_ITEM })
      setAddingItem(false)
      toast.success('Kalem eklendi.')
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : common.error)
    } finally { setItemSaving(false) }
  }

  // Kalem güncelle
  async function handleUpdateItem(pdaId: string) {
    if (!editingItem || !editItemForm.description.trim()) return
    setItemSaving(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).from('pda_items').update({
        description: editItemForm.description.trim(),
        amount: editItemForm.amount ? parseFloat(editItemForm.amount) : null,
        currency: editItemForm.currency,
        note: editItemForm.note.trim() || null,
      }).eq('id', editingItem.id).select().single()
      if (error) throw error
      setItemsMap(prev => ({ ...prev, [pdaId]: prev[pdaId].map(i => i.id === editingItem.id ? data as PdaItem : i) }))
      setEditingItem(null)
      toast.success('Kalem güncellendi.')
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : common.error)
    } finally { setItemSaving(false) }
  }

  // Kalem sil
  async function handleDeleteItem(pdaId: string, itemId: string) {
    if (!confirm('Bu kalemi silmek istediğinize emin misiniz?')) return
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('pda_items').delete().eq('id', itemId)
      if (error) throw error
      setItemsMap(prev => ({ ...prev, [pdaId]: prev[pdaId].filter(i => i.id !== itemId) }))
      toast.success('Kalem silindi.')
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : common.error) }
  }

  function startEditItem(item: PdaItem) {
    setEditingItem(item)
    setEditItemForm({ description: item.description, amount: item.amount?.toString() ?? '', currency: item.currency, note: item.note ?? '' })
    setAddingItem(false)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">{a.title}</h1>
        <p className="text-gray-400 text-sm mt-1">{a.desc}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {([
          { key: 'all'       as const, label: a.filterAll,       count: counts.all       },
          { key: 'pending'   as const, label: a.filterPending,   count: counts.pending   },
          { key: 'reviewing' as const, label: a.filterReviewing, count: counts.reviewing },
          { key: 'returned'  as const, label: a.filterReturned,  count: counts.returned  },
          { key: 'approved'  as const, label: a.filterApproved,  count: counts.approved  },
        ]).map(({ key, label, count }) => (
          <button key={key} onClick={() => setFilterStatus(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${filterStatus === key ? 'bg-ocean-500/15 text-ocean-400 border-ocean-500/30' : 'text-gray-400 border-navy-700/50 hover:text-white hover:border-navy-600'}`}>
            {label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterStatus === key ? 'bg-ocean-500/20 text-ocean-300' : 'bg-navy-700 text-gray-500'}`}>{count}</span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="maritime-card p-12 text-center">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-white font-semibold mb-1">{a.empty}</p>
          <p className="text-gray-500 text-sm">{a.emptyDesc}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(pda => {
            const expanded = expandedId === pda.id
            const isEditing = editingId === pda.id
            const items = itemsMap[pda.id] ?? []
            const total = items.reduce((sum, i) => sum + (i.amount ?? 0), 0)
            const currencies = [...new Set(items.map(i => i.currency))]

            return (
              <div key={pda.id} className="maritime-card overflow-hidden">
                {/* Header */}
                <div className="flex items-start gap-4 p-4 cursor-pointer hover:bg-navy-700/20 transition-colors"
                  onClick={() => toggleExpand(pda.id)}>
                  <div className="w-10 h-10 rounded-lg bg-ocean-500/10 border border-ocean-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-5 h-5 text-ocean-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{pda.title}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1">
                      {pda.profiles && <span className="flex items-center gap-1 text-gray-400 text-xs"><User className="w-3 h-3" />{pda.profiles.full_name}{pda.profiles.company_name && ` · ${pda.profiles.company_name}`}</span>}
                      {pda.ships && <span className="flex items-center gap-1 text-gray-400 text-xs"><ShipIcon className="w-3 h-3" />{pda.ships.name}</span>}
                      <span className="text-gray-600 text-xs">{new Date(pda.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                      {items.length > 0 && <span className="flex items-center gap-1 text-ocean-400 text-xs"><DollarSign className="w-3 h-3" />{items.length} kalem</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <StatusBadge status={pda.status} />
                    {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                  </div>
                </div>

                {expanded && (
                  <div className="border-t border-navy-700/50">
                    {/* İki panel: Sol PDF, Sağ Kalemler */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 divide-y xl:divide-y-0 xl:divide-x divide-navy-700/50">

                      {/* SOL: PDF Önizleme */}
                      <div className="p-4 space-y-3">
                        <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-ocean-400" />PDF Önizleme
                        </p>

                        {pda.file_url ? (
                          <div className="space-y-2">
                            <div className="rounded-xl overflow-hidden border border-navy-600/40 bg-navy-950/60" style={{ height: '500px' }}>
                              <iframe
                                src={`${pda.file_url}#toolbar=0&navpanes=0`}
                                className="w-full h-full"
                                title={pda.file_name ?? 'PDA Dosyası'}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <FileText className="w-3.5 h-3.5" />
                                <span>{pda.file_name}</span>
                                {pda.file_size && <span>({formatFileSize(pda.file_size)})</span>}
                              </div>
                              <a href={pda.file_url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-ocean-500/15 text-ocean-400 border border-ocean-500/30 hover:bg-ocean-500/25 transition-colors"
                                onClick={e => e.stopPropagation()}>
                                <Eye className="w-3 h-3" />Yeni Sekmede Aç
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-48 rounded-xl border border-dashed border-navy-600/40 text-gray-600">
                            <FileText className="w-10 h-10 mb-2" />
                            <p className="text-sm">Dosya yüklenmemiş</p>
                          </div>
                        )}

                        {/* Armatör bilgileri */}
                        <div className="space-y-2 pt-2 border-t border-navy-700/30">
                          {pda.description && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{a.descSection}</p>
                              <p className="text-gray-300 text-sm">{pda.description}</p>
                            </div>
                          )}
                          {pda.armator_notes && (
                            <div className="bg-navy-700/30 rounded-lg p-3 border border-navy-600/30">
                              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1.5">{a.armatorNote}</p>
                              <p className="text-gray-200 text-sm">{pda.armator_notes}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* SAĞ: Kalem Tablosu + Notlar + Aksiyonlar */}
                      <div className="p-4 space-y-5">

                        {/* Kalem Tablosu */}
                        <div onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold flex items-center gap-1.5">
                              <DollarSign className="w-3.5 h-3.5 text-ocean-400" />Maliyet Kalemleri
                            </p>
                            {!addingItem && (
                              <button onClick={() => { setAddingItem(true); setEditingItem(null) }}
                                className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-ocean-500/15 text-ocean-400 border border-ocean-500/30 hover:bg-ocean-500/25 transition-colors">
                                <Plus className="w-3 h-3" />Kalem Ekle
                              </button>
                            )}
                          </div>

                          {itemsLoading === pda.id ? (
                            <div className="flex items-center justify-center py-6">
                              <Loader2 className="w-5 h-5 text-gray-500 animate-spin" />
                            </div>
                          ) : (
                            <div className="space-y-1">
                              {items.length === 0 && !addingItem && (
                                <p className="text-gray-600 text-sm text-center py-4 border border-dashed border-navy-700/40 rounded-lg">
                                  Henüz kalem eklenmemiş
                                </p>
                              )}

                              {/* Mevcut Kalemler */}
                              {items.map(item => (
                                <div key={item.id}>
                                  {editingItem?.id === item.id ? (
                                    /* Düzenleme satırı */
                                    <div className="bg-navy-800/60 rounded-lg p-3 border border-ocean-500/25 space-y-2">
                                      <input type="text" placeholder="Açıklama *" className="input-maritime w-full text-sm"
                                        value={editItemForm.description} onChange={e => setEditItemForm(p => ({ ...p, description: e.target.value }))} />
                                      <div className="grid grid-cols-3 gap-2">
                                        <input type="number" placeholder="Tutar" className="input-maritime text-sm col-span-2"
                                          value={editItemForm.amount} onChange={e => setEditItemForm(p => ({ ...p, amount: e.target.value }))} />
                                        <select className="input-maritime text-sm" value={editItemForm.currency} onChange={e => setEditItemForm(p => ({ ...p, currency: e.target.value }))}>
                                          <option>USD</option><option>EUR</option><option>TRY</option>
                                        </select>
                                      </div>
                                      <input type="text" placeholder="Not (opsiyonel)" className="input-maritime w-full text-sm"
                                        value={editItemForm.note} onChange={e => setEditItemForm(p => ({ ...p, note: e.target.value }))} />
                                      <div className="flex gap-2">
                                        <button onClick={() => setEditingItem(null)} className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1"><X className="w-3 h-3" />İptal</button>
                                        <button onClick={() => handleUpdateItem(pda.id)} disabled={itemSaving} className="btn-primary text-xs py-1 px-2.5 flex items-center gap-1">
                                          {itemSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}Kaydet
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    /* Normal görünüm satırı */
                                    <div className="flex items-start justify-between gap-2 px-3 py-2 rounded-lg hover:bg-navy-700/30 transition-colors group">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-white text-sm">{item.description}</span>
                                          {item.amount != null && (
                                            <span className="text-ocean-400 text-sm font-bold number-display">
                                              {item.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {item.currency}
                                            </span>
                                          )}
                                        </div>
                                        {item.note && <p className="text-gray-500 text-xs mt-0.5">{item.note}</p>}
                                      </div>
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                        <button onClick={() => startEditItem(item)} className="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-white hover:bg-navy-600 transition-colors">
                                          <Pencil className="w-3 h-3" />
                                        </button>
                                        <button onClick={() => handleDeleteItem(pda.id, item.id)} className="w-6 h-6 rounded flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}

                              {/* Yeni kalem ekleme formu */}
                              {addingItem && (
                                <div className="bg-navy-800/60 rounded-lg p-3 border border-ocean-500/25 space-y-2 mt-2">
                                  <p className="text-xs text-ocean-400 font-semibold uppercase tracking-wide">Yeni Kalem</p>
                                  <input type="text" placeholder="Açıklama * (ör: Pilotage, Towage...)" className="input-maritime w-full text-sm"
                                    value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))} autoFocus />
                                  <div className="grid grid-cols-3 gap-2">
                                    <input type="number" min="0" step="0.01" placeholder="Tutar" className="input-maritime text-sm col-span-2"
                                      value={newItem.amount} onChange={e => setNewItem(p => ({ ...p, amount: e.target.value }))} />
                                    <select className="input-maritime text-sm" value={newItem.currency} onChange={e => setNewItem(p => ({ ...p, currency: e.target.value }))}>
                                      <option>USD</option><option>EUR</option><option>TRY</option>
                                    </select>
                                  </div>
                                  <input type="text" placeholder="Not (opsiyonel)" className="input-maritime w-full text-sm"
                                    value={newItem.note} onChange={e => setNewItem(p => ({ ...p, note: e.target.value }))} />
                                  <div className="flex gap-2">
                                    <button onClick={() => { setAddingItem(false); setNewItem({ ...EMPTY_ITEM }) }} className="btn-secondary text-xs py-1 px-2.5 flex items-center gap-1"><X className="w-3 h-3" />İptal</button>
                                    <button onClick={() => handleAddItem(pda.id)} disabled={itemSaving} className="btn-primary text-xs py-1 px-2.5 flex items-center gap-1">
                                      {itemSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}Ekle
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Kalem Toplamı */}
                              {items.length > 0 && currencies.length === 1 && (
                                <div className="flex items-center justify-between px-3 py-2 mt-2 rounded-lg bg-navy-800/40 border border-navy-700/40">
                                  <span className="text-gray-400 text-sm font-medium">Kalem Toplamı</span>
                                  <span className="text-white font-bold text-sm number-display">
                                    {total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {currencies[0]}
                                  </span>
                                </div>
                              )}

                              {/* Hedef / Teklif Fiyatı */}
                              <div className="mt-3 rounded-xl border border-ocean-500/30 bg-ocean-500/5 p-3 space-y-2">
                                <p className="text-xs font-semibold text-ocean-400 uppercase tracking-wide flex items-center gap-1.5">
                                  <DollarSign className="w-3.5 h-3.5" />Hedef Teklif Fiyatı
                                </p>
                                {pda.target_price != null && editingItem === null && !addingItem ? (
                                  <div className="flex items-center justify-between">
                                    <span className="text-white text-xl font-bold number-display">
                                      {pda.target_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {pda.target_currency ?? 'USD'}
                                    </span>
                                    <button onClick={() => setTargetPriceForm(prev => ({ ...prev, [pda.id]: { price: pda.target_price!.toString(), currency: pda.target_currency ?? 'USD' } }))}
                                      className="text-xs text-ocean-400 hover:text-ocean-300 transition-colors">
                                      Düzenle
                                    </button>
                                  </div>
                                ) : null}
                                {(targetPriceForm[pda.id] !== undefined || pda.target_price == null) && (
                                  <div className="space-y-2">
                                    <div className="grid grid-cols-3 gap-2">
                                      <input
                                        type="number" min="0" step="0.01"
                                        placeholder="Fiyat girin..."
                                        className="input-maritime text-sm col-span-2"
                                        value={targetPriceForm[pda.id]?.price ?? ''}
                                        onChange={e => setTargetPriceForm(prev => ({ ...prev, [pda.id]: { ...prev[pda.id], price: e.target.value } }))}
                                      />
                                      <select
                                        className="input-maritime text-sm"
                                        value={targetPriceForm[pda.id]?.currency ?? 'USD'}
                                        onChange={e => setTargetPriceForm(prev => ({ ...prev, [pda.id]: { ...prev[pda.id], currency: e.target.value } }))}>
                                        <option>USD</option><option>EUR</option><option>TRY</option>
                                      </select>
                                    </div>
                                    <button
                                      onClick={() => handleSaveTargetPrice(pda.id)}
                                      disabled={targetSaving === pda.id}
                                      className="w-full btn-primary text-sm py-2 flex items-center justify-center gap-2">
                                      {targetSaving === pda.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                      Hedef Fiyatı Kaydet
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Admin Notu */}
                        <div onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold flex items-center gap-1.5">
                              <MessageSquare className="w-3.5 h-3.5 text-ocean-400" />{a.adminNote}
                            </p>
                            {!isEditing && (
                              <button onClick={() => startEditing(pda)} className="text-xs text-ocean-400 hover:text-ocean-300 transition-colors">
                                {pda.admin_notes ? a.editNote : a.addNote}
                              </button>
                            )}
                          </div>
                          {isEditing ? (
                            <div className="space-y-2">
                              <textarea className="input-maritime w-full resize-none text-sm" rows={3}
                                placeholder={a.notePlaceholder} value={adminNote} onChange={e => setAdminNote(e.target.value)} autoFocus />
                              <div className="flex gap-2">
                                <button onClick={() => { setEditingId(null); setAdminNote('') }} className="btn-secondary text-sm py-1.5 px-3">{common.cancel}</button>
                                <button onClick={() => updatePda(pda.id, { admin_notes: adminNote.trim() || undefined })} disabled={saving}
                                  className="btn-primary text-sm py-1.5 px-3 flex items-center gap-1.5">
                                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}{common.save}
                                </button>
                              </div>
                            </div>
                          ) : pda.admin_notes ? (
                            <div className="bg-ocean-500/5 rounded-lg p-3 border border-ocean-500/20">
                              <p className="text-gray-200 text-sm">{pda.admin_notes}</p>
                            </div>
                          ) : (
                            <p className="text-gray-600 text-sm italic">{a.noNote}</p>
                          )}
                        </div>

                        {/* Aksiyon Butonları */}
                        {(pda.status === 'pending' || pda.status === 'reviewing') && (
                          <div onClick={e => e.stopPropagation()} className="pt-3 border-t border-navy-700/30">
                            <button onClick={() => updatePda(pda.id, { status: 'approved' })} disabled={saving}
                              className="w-full inline-flex items-center justify-center gap-2 text-sm py-3 rounded-xl bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25 transition-colors disabled:opacity-50 font-semibold">
                              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                              Onayla & Gönder
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
