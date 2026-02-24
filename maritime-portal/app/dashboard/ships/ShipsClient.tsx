'use client'

import { useState } from 'react'
import { Ship, Plus, Pencil, Trash2, X, AlertCircle, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatDate, formatTonnage } from '@/lib/utils'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import toast from 'react-hot-toast'
import type { Ship as ShipType, ShipInsert } from '@/types'

interface Props {
  initialShips: ShipType[]
  userId: string
}

const EMPTY_FORM: Omit<ShipInsert, 'armator_id'> = {
  name: '', imo_no: '', bayrak: '', grt: 0, nrt: 0, dwt: null, yil: null, gemi_tipi: '',
}

const SHIP_TYPES = [
  'Bulk Carrier', 'Container Ship', 'Tanker', 'General Cargo',
  'RoRo', 'Passenger Ship', 'Tugboat', 'Offshore Vessel', 'Diğer',
]

export default function ShipsClient({ initialShips, userId }: Props) {
  const [ships, setShips] = useState<ShipType[]>(initialShips)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [editShip, setEditShip] = useState<ShipType | null>(null)
  const [form, setForm] = useState<Omit<ShipInsert, 'armator_id'>>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const { t } = useTranslation()
  const { ships: s, common } = t

  const supabase = createClient()

  const filtered = ships.filter(sh =>
    sh.name.toLowerCase().includes(search.toLowerCase()) ||
    sh.imo_no.toLowerCase().includes(search.toLowerCase()) ||
    sh.bayrak.toLowerCase().includes(search.toLowerCase())
  )

  function openAdd() { setEditShip(null); setForm(EMPTY_FORM); setModalOpen(true) }
  function openEdit(ship: ShipType) {
    setEditShip(ship)
    setForm({ name: ship.name, imo_no: ship.imo_no, bayrak: ship.bayrak, grt: ship.grt, nrt: ship.nrt, dwt: ship.dwt, yil: ship.yil, gemi_tipi: ship.gemi_tipi })
    setModalOpen(true)
  }
  function updateForm(key: keyof typeof form, value: string | number | null) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      if (editShip) {
        const { data, error } = await supabase.from('ships').update({ ...form }).eq('id', editShip.id).select().single()
        if (error) throw error
        setShips(prev => prev.map(sh => sh.id === editShip.id ? (data as ShipType) : sh))
        toast.success(s.saved)
      } else {
        const { data, error } = await supabase.from('ships').insert({ ...form, armator_id: userId }).select().single()
        if (error) {
          if (error.message.includes('unique') || error.code === '23505') { toast.error(s.imoExists); return }
          throw error
        }
        setShips(prev => [data as ShipType, ...prev])
        toast.success(s.added)
      }
      setModalOpen(false)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : common.error)
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    setDeleting(true)
    try {
      const { error } = await supabase.from('ships').delete().eq('id', id)
      if (error) throw error
      setShips(prev => prev.filter(sh => sh.id !== id))
      setDeleteId(null)
      toast.success(s.deleted)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : common.error)
    } finally { setDeleting(false) }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">{s.title}</h1>
          <p className="text-gray-400 text-sm mt-0.5">{s.count(ships.length)}</p>
        </div>
        <button onClick={openAdd} className="btn-primary gap-2">
          <Plus className="w-4 h-4" /> {s.addShip}
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input type="text" className="input-maritime pl-9" placeholder={s.searchPlaceholder}
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Ships grid */}
      {filtered.length === 0 ? (
        <div className="maritime-card">
          <div className="empty-state">
            <Ship className="w-12 h-12 text-gray-700 mb-4" />
            <p className="text-gray-400 font-medium">{search ? s.noResults : s.noShips}</p>
            {!search && (
              <button onClick={openAdd} className="btn-primary mt-4 text-sm gap-2">
                <Plus className="w-4 h-4" /> {s.addFirst}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(ship => (
            <div key={ship.id} className="maritime-card p-5 group hover:border-ocean-500/30 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-ocean-500/10 rounded-xl flex items-center justify-center">
                  <Ship className="w-5 h-5 text-ocean-400" />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(ship)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-navy-700/60 transition-colors"
                    title={common.edit}>
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(ship.id)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title={common.delete}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="text-white font-semibold text-base mb-1 font-display">{ship.name}</h3>
              <p className="text-gray-500 text-xs mb-3">IMO: {ship.imo_no}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><p className="text-gray-600 text-xs">{s.flag}</p><p className="text-gray-200">{ship.bayrak}</p></div>
                <div><p className="text-gray-600 text-xs">{s.type}</p><p className="text-gray-200">{ship.gemi_tipi ?? '—'}</p></div>
                <div><p className="text-gray-600 text-xs">GRT</p><p className="text-gray-200 number-display">{formatTonnage(ship.grt)}</p></div>
                <div><p className="text-gray-600 text-xs">DWT</p><p className="text-gray-200 number-display">{formatTonnage(ship.dwt)}</p></div>
              </div>
              <p className="text-gray-600 text-xs mt-3 pt-3 border-t border-navy-700/40">
                {s.addedOn}: {formatDate(ship.created_at)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
          <div className="modal-content">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-xl font-bold text-white">
                {editShip ? s.editShip : s.newShip}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 form-group">
                  <label className="label-maritime">{s.nameLabel}</label>
                  <input type="text" className="input-maritime" placeholder="MV Ankara Star" value={form.name} onChange={e => updateForm('name', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="label-maritime">{s.imoLabel}</label>
                  <input type="text" className="input-maritime" placeholder="1234567" value={form.imo_no} onChange={e => updateForm('imo_no', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="label-maritime">{s.flagLabel}</label>
                  <input type="text" className="input-maritime" placeholder="Türkiye" value={form.bayrak} onChange={e => updateForm('bayrak', e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="label-maritime">{s.grtLabel}</label>
                  <input type="number" min="0" step="0.01" className="input-maritime" placeholder="25000" value={form.grt || ''} onChange={e => updateForm('grt', parseFloat(e.target.value) || 0)} required />
                </div>
                <div className="form-group">
                  <label className="label-maritime">{s.nrtLabel}</label>
                  <input type="number" min="0" step="0.01" className="input-maritime" placeholder="15000" value={form.nrt || ''} onChange={e => updateForm('nrt', parseFloat(e.target.value) || 0)} required />
                </div>
                <div className="form-group">
                  <label className="label-maritime">{s.dwtLabel}</label>
                  <input type="number" min="0" step="0.01" className="input-maritime" placeholder="35000" value={form.dwt ?? ''} onChange={e => updateForm('dwt', e.target.value ? parseFloat(e.target.value) : null)} />
                </div>
                <div className="form-group">
                  <label className="label-maritime">{s.yearLabel}</label>
                  <input type="number" min="1900" max={new Date().getFullYear() + 1} className="input-maritime" placeholder="2010" value={form.yil ?? ''} onChange={e => updateForm('yil', e.target.value ? parseInt(e.target.value) : null)} />
                </div>
                <div className="col-span-2 form-group">
                  <label className="label-maritime">{s.typeLabel}</label>
                  <select className="input-maritime" value={form.gemi_tipi ?? ''} onChange={e => updateForm('gemi_tipi', e.target.value)}>
                    <option value="">{common.selectPlaceholder}</option>
                    {SHIP_TYPES.map(tp => <option key={tp} value={tp}>{tp}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary flex-1">{common.cancel}</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? common.saving : editShip ? common.update : common.add}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && setDeleteId(null)}>
          <div className="modal-content max-w-sm text-center">
            <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-7 h-7 text-red-400" />
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-2">{s.deleteTitle}</h3>
            <p className="text-gray-400 text-sm mb-6">{s.deleteWarning}</p>
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
