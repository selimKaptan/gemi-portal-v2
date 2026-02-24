'use client'

import { useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import {
  FileText, Upload, X, Plus, Eye, Trash2, Clock, CheckCircle,
  RotateCcw, AlertCircle, ChevronDown, ChevronUp, MessageSquare
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import type { PDA, PdaStatus } from '@/types'

interface ShipOption { id: string; name: string; imo_no: string }
interface PdasClientProps { initialPdas: PDA[]; ships: ShipOption[]; userId: string }

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function PdasClient({ initialPdas, ships, userId }: PdasClientProps) {
  const supabase = createClient()
  const [pdas, setPdas] = useState<PDA[]>(initialPdas)
  const [showForm, setShowForm] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [form, setForm] = useState({ title: '', description: '', ship_id: '', armator_notes: '', file: null as File | null })

  const { t } = useTranslation()
  const { pdas: p, common } = t

  const STATUS_CONFIG: Record<PdaStatus, { label: string; color: string; icon: React.ElementType }> = {
    pending:   { label: p.statusPending,   color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20', icon: Clock         },
    reviewing: { label: p.statusReviewing, color: 'text-blue-400 bg-blue-400/10 border-blue-400/20',       icon: Eye           },
    returned:  { label: p.statusReturned,  color: 'text-orange-400 bg-orange-400/10 border-orange-400/20', icon: RotateCcw     },
    approved:  { label: p.statusApproved,  color: 'text-green-400 bg-green-400/10 border-green-400/20',    icon: CheckCircle   },
  }

  function StatusBadge({ status }: { status: PdaStatus }) {
    const cfg = STATUS_CONFIG[status]
    const Icon = cfg.icon
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
        <Icon className="w-3 h-3" />{cfg.label}
      </span>
    )
  }

  function resetForm() { setForm({ title: '', description: '', ship_id: '', armator_notes: '', file: null }); setShowForm(false) }

  function handleFile(file: File) {
    const allowed = ['application/pdf', 'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowed.includes(file.type)) { toast.error(p.invalidFile); return }
    if (file.size > 20 * 1024 * 1024) { toast.error(p.fileTooLarge); return }
    setForm(prev => ({ ...prev, file }))
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]; if (file) handleFile(file)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return toast.error(p.titleRequired)
    setUploading(true)
    try {
      let file_url: string | null = null, file_name: string | null = null, file_size: number | null = null
      if (form.file) {
        const ext = form.file.name.split('.').pop()
        const path = `${userId}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage.from('pdas').upload(path, form.file)
        if (uploadError) throw new Error(uploadError.message)
        const { data: urlData } = supabase.storage.from('pdas').getPublicUrl(path)
        file_url = urlData.publicUrl; file_name = form.file.name; file_size = form.file.size
      }
      const payload = { armator_id: userId, title: form.title.trim(), description: form.description.trim() || null,
        ship_id: form.ship_id || null, armator_notes: form.armator_notes.trim() || null, file_url, file_name, file_size, status: 'pending' as PdaStatus }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await (supabase as any).from('pdas').insert(payload).select().single()
      if (error) throw new Error(error.message)
      setPdas(prev => [data as PDA, ...prev]); toast.success(p.uploaded); resetForm()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : common.error)
    } finally { setUploading(false) }
  }

  async function handleDelete(pda: PDA) {
    if (!confirm(p.deleteConfirm(pda.title))) return
    try {
      if (pda.file_url) {
        const path = pda.file_url.split('/pdas/')[1]
        if (path) await supabase.storage.from('pdas').remove([path])
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('pdas').delete().eq('id', pda.id)
      if (error) throw new Error(error.message)
      setPdas(prev => prev.filter(x => x.id !== pda.id)); toast.success(p.deleted)
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : common.error) }
  }

  const counts = {
    pending: pdas.filter(x => x.status === 'pending').length,
    reviewing: pdas.filter(x => x.status === 'reviewing').length,
    returned: pdas.filter(x => x.status === 'returned').length,
    approved: pdas.filter(x => x.status === 'approved').length,
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">{p.title}</h1>
          <p className="text-gray-400 text-sm mt-1">{p.desc}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />{p.uploadBtn}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {([
          { label: p.statusPending,   count: counts.pending,   color: 'text-yellow-400' },
          { label: p.statusReviewing, count: counts.reviewing, color: 'text-blue-400'   },
          { label: p.statusReturned,  count: counts.returned,  color: 'text-orange-400' },
          { label: p.statusApproved,  count: counts.approved,  color: 'text-green-400'  },
        ]).map(({ label, count, color }) => (
          <div key={label} className="maritime-card p-4">
            <p className="text-gray-400 text-xs uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold mt-1 ${color}`}>{count}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="maritime-card w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold text-white">{p.uploadTitle}</h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">{p.titleLabel}</label>
                <input className="input-maritime w-full" placeholder={p.titlePlaceholder} value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">{p.shipLabel}</label>
                <select className="input-maritime w-full" value={form.ship_id} onChange={e => setForm(prev => ({ ...prev, ship_id: e.target.value }))}>
                  <option value="">{p.shipPlaceholder}</option>
                  {ships.map(s => <option key={s.id} value={s.id}>{s.name} — {s.imo_no}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">{p.descLabel}</label>
                <textarea className="input-maritime w-full resize-none" rows={3} placeholder={p.descPlaceholder} value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">{p.notesLabel}</label>
                <textarea className="input-maritime w-full resize-none" rows={2} placeholder={p.notesPlaceholder} value={form.armator_notes} onChange={e => setForm(prev => ({ ...prev, armator_notes: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">{p.fileLabel}</label>
                <div className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${dragOver ? 'border-ocean-400 bg-ocean-400/10' : form.file ? 'border-green-500/50 bg-green-500/5' : 'border-navy-600 hover:border-ocean-500/50 hover:bg-ocean-500/5'}`}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }} onDragLeave={() => setDragOver(false)} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()}>
                  {form.file ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-green-400 flex-shrink-0" />
                      <div className="text-left">
                        <p className="text-white text-sm font-medium truncate max-w-xs">{form.file.name}</p>
                        <p className="text-gray-400 text-xs">{formatFileSize(form.file.size)}</p>
                      </div>
                      <button type="button" onClick={e => { e.stopPropagation(); setForm(prev => ({ ...prev, file: null })) }} className="ml-auto text-gray-500 hover:text-red-400 transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                      <p className="text-gray-400 text-sm">{p.dropHint}</p>
                      <p className="text-gray-600 text-xs mt-1">{p.dropSubHint}</p>
                    </div>
                  )}
                </div>
                <input ref={fileInputRef} type="file" accept=".pdf,.xls,.xlsx,.doc,.docx" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={resetForm} className="btn-secondary flex-1">{common.cancel}</button>
                <button type="submit" disabled={uploading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  {uploading ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />{p.uploading}</> : <><Upload className="w-4 h-4" />{p.uploadAction}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {pdas.length === 0 ? (
        <div className="maritime-card p-12 text-center">
          <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">{p.noPdas}</h3>
          <p className="text-gray-400 text-sm mb-6">{p.noPdasSub}</p>
          <button onClick={() => setShowForm(true)} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" />{p.addFirst}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {pdas.map(pda => {
            const expanded = expandedId === pda.id
            return (
              <div key={pda.id} className="maritime-card overflow-hidden">
                <div className="flex items-center gap-4 p-4 cursor-pointer hover:bg-navy-700/20 transition-colors" onClick={() => setExpandedId(expanded ? null : pda.id)}>
                  <div className="w-10 h-10 rounded-lg bg-ocean-500/10 border border-ocean-500/20 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-ocean-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{pda.title}</p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {new Date(pda.created_at).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      {pda.file_name && ` · ${pda.file_name}`}
                    </p>
                  </div>
                  <StatusBadge status={pda.status} />
                  {expanded ? <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                </div>
                {expanded && (
                  <div className="border-t border-navy-700/50 p-4 space-y-4">
                    {pda.description && (
                      <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{p.descSection}</p>
                        <p className="text-gray-300 text-sm">{pda.description}</p>
                      </div>
                    )}
                    {pda.armator_notes && (
                      <div className="bg-navy-700/30 rounded-lg p-3 border border-navy-600/30">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{p.notesSection}</p>
                        <p className="text-gray-300 text-sm">{pda.armator_notes}</p>
                      </div>
                    )}
                    {pda.admin_notes && (
                      <div className="bg-orange-500/5 rounded-lg p-3 border border-orange-500/20">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="w-3.5 h-3.5 text-orange-400" />
                          <p className="text-xs text-orange-400 uppercase tracking-wide font-semibold">{p.adminNoteSection}</p>
                        </div>
                        <p className="text-gray-200 text-sm">{pda.admin_notes}</p>
                      </div>
                    )}
                    {pda.status === 'returned' && !pda.admin_notes && (
                      <div className="flex items-center gap-2 text-orange-400 text-sm">
                        <AlertCircle className="w-4 h-4" /><span>{p.returnedNote}</span>
                      </div>
                    )}
                    {pda.target_price != null && (
                      <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
                        <p className="text-xs text-green-400 uppercase tracking-wide font-semibold mb-1">Hedef Teklif Fiyatı</p>
                        <p className="text-white text-2xl font-bold number-display">
                          {pda.target_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} {pda.target_currency ?? 'USD'}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-3 pt-2">
                      {pda.file_url && (
                        <a href={pda.file_url} target="_blank" rel="noopener noreferrer" className="btn-secondary inline-flex items-center gap-2 text-sm py-2 px-4">
                          <Eye className="w-4 h-4" />{p.viewFile}
                        </a>
                      )}
                      {pda.status === 'pending' && (
                        <button onClick={() => handleDelete(pda)} className="inline-flex items-center gap-2 text-sm py-2 px-4 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors">
                          <Trash2 className="w-4 h-4" />{p.deleteBtn}
                        </button>
                      )}
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
