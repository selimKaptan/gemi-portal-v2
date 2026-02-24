'use client'

import { useState } from 'react'
import { Ship, Mail, Phone, User, Anchor, Package, Calendar, MessageSquare, ChevronDown, ChevronUp, Inbox } from 'lucide-react'
import type { Nomination } from '@/types'

interface Props {
  initialNominations: Nomination[]
}

export default function NominationsClient({ initialNominations }: Props) {
  const [nominations] = useState<Nomination[]>(initialNominations)
  const [expanded, setExpanded] = useState<string | null>(null)

  if (nominations.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-navy-800/60 flex items-center justify-center mx-auto mb-5">
          <Inbox className="w-9 h-9 text-ocean-400/60" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Henüz nominasyon yok</h2>
        <p className="text-gray-400">Armatörler teklifinizi kabul ettiğinde nominasyon bilgileri burada görünecektir.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-6 space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-ocean-500/10 border border-ocean-500/20">
          <Ship className="w-5 h-5 text-ocean-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Nominasyonlar</h1>
          <p className="text-gray-400 text-sm">{nominations.length} nominasyon</p>
        </div>
      </div>

      {nominations.map(nom => (
        <div key={nom.id} className="card-maritime overflow-hidden">
          <button
            className="w-full text-left p-5 flex items-start justify-between gap-4"
            onClick={() => setExpanded(prev => prev === nom.id ? null : nom.id)}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-ocean-500/10 border border-ocean-500/20 flex items-center justify-center flex-shrink-0">
                <Anchor className="w-5 h-5 text-ocean-400" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white">{nom.vessel_name ?? 'Gemi Bilgisi Yok'}</span>
                  {nom.vessel_imo && <span className="text-xs text-gray-500 font-mono">IMO: {nom.vessel_imo}</span>}
                  {!nom.is_read && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-ocean-500 text-white rounded-full">YENİ</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span className="flex items-center gap-1"><Anchor className="w-3 h-3" />{nom.port ?? '—'}</span>
                  <span className="text-navy-600">•</span>
                  <span>{new Date(nom.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
            {expanded === nom.id
              ? <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
              : <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0 mt-1" />
            }
          </button>

          {expanded === nom.id && (
            <div className="px-5 pb-5 border-t border-navy-700/40 pt-5 space-y-5">
              {/* Gemi & Sefer */}
              <div>
                <p className="text-xs text-ocean-400 font-semibold uppercase tracking-wider mb-3">Sefer Bilgileri</p>
                <div className="grid grid-cols-2 gap-3">
                  {nom.vessel_name && (
                    <InfoRow icon={<Ship className="w-4 h-4" />} label="Gemi" value={nom.vessel_name} />
                  )}
                  {nom.vessel_imo && (
                    <InfoRow icon={<Ship className="w-4 h-4" />} label="IMO No" value={nom.vessel_imo} mono />
                  )}
                  {nom.port && (
                    <InfoRow icon={<Anchor className="w-4 h-4" />} label="Liman" value={nom.port} />
                  )}
                  {nom.cargo_type && (
                    <InfoRow icon={<Package className="w-4 h-4" />} label="Kargo Türü" value={nom.cargo_type} />
                  )}
                  {nom.cargo_amount != null && (
                    <InfoRow icon={<Package className="w-4 h-4" />} label="Kargo Miktarı" value={nom.cargo_amount.toLocaleString('tr-TR')} />
                  )}
                  {nom.eta && (
                    <InfoRow icon={<Calendar className="w-4 h-4" />} label="ETA"
                      value={new Date(nom.eta).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} />
                  )}
                  {nom.etd && (
                    <InfoRow icon={<Calendar className="w-4 h-4" />} label="ETD"
                      value={new Date(nom.etd).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} />
                  )}
                </div>
              </div>

              {/* İletişim */}
              {(nom.contact_name || nom.contact_email || nom.contact_phone) && (
                <div>
                  <p className="text-xs text-ocean-400 font-semibold uppercase tracking-wider mb-3">İletişim Bilgileri</p>
                  <div className="bg-navy-950/60 rounded-xl p-4 border border-navy-700/30 space-y-3">
                    {nom.contact_name && (
                      <div className="flex items-center gap-3 text-sm">
                        <User className="w-4 h-4 text-ocean-400 flex-shrink-0" />
                        <span className="text-gray-300">{nom.contact_name}</span>
                      </div>
                    )}
                    {nom.contact_email && (
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="w-4 h-4 text-ocean-400 flex-shrink-0" />
                        <a href={`mailto:${nom.contact_email}`} className="text-ocean-400 hover:text-ocean-300 underline underline-offset-2 transition-colors">
                          {nom.contact_email}
                        </a>
                      </div>
                    )}
                    {nom.contact_phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone className="w-4 h-4 text-ocean-400 flex-shrink-0" />
                        <a href={`tel:${nom.contact_phone}`} className="text-gray-300 hover:text-white transition-colors">
                          {nom.contact_phone}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Mesaj */}
              {nom.message && (
                <div>
                  <p className="text-xs text-ocean-400 font-semibold uppercase tracking-wider mb-3 flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5" />Armatör Notu
                  </p>
                  <div className="bg-ocean-500/5 border border-ocean-500/20 rounded-xl p-4 text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                    {nom.message}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function InfoRow({ icon, label, value, mono = false }: { icon: React.ReactNode; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="text-ocean-400 mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-gray-500 text-xs">{label}</p>
        <p className={`text-white ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
    </div>
  )
}
