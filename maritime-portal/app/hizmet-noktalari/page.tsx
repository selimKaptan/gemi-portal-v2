'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Anchor, ArrowLeft, MapPin, Search, ChevronDown, Ship } from 'lucide-react'
import { TURKEY_PORTS } from '@/lib/ports'

const REGION_LABELS: Record<string, string> = {
  TRALA: 'Alanya', TRALI: 'Aliağa', TRAMA: 'Amasra', TRAMB: 'Ambarlı',
  TRANA: 'Anamur', TRAYT: 'Antalya', TRAYV: 'Ayvalık', TRBDM: 'Bandırma',
  TRBTN: 'Bartın', TRBXN: 'Bodrum', TRBZC: 'Bozcaada', TRCES: 'Çeşme',
  TRCKZ: 'Çanakkale', TRDAT: 'Datça', TRDIK: 'Dikili', TREDO: 'Edremit',
  TRENE: 'Saros', TRERE: 'Karadeniz Ereğli', TRERK: 'Erdemli', TRFAS: 'Fatsa',
  TRFET: 'Fethiye', TRFIN: 'Finike', TRFOC: 'Foça', TRGCA: 'Gemlik', TRGCK: 'Gemlik',
  TRGEL: 'Gelibolu', TRGEM: 'Gemlik', TRGIR: 'Giresun', TRGOR: 'Gölcük',
  TRGUL: 'Güzelyalı', TRHOP: 'Haydarpaşa', TRIGN: 'İğneada', TRINE: 'İnegöl',
  TRISK: 'İskenderun', TRIST: 'İstanbul', TRIZM: 'İzmir', TRIZT: 'İzmir',
  TRKAS: 'Yumurtalık', TRKMR: 'Kocaeli', TRKRB: 'Karabük', TRKRT: 'Körfez',
  TRKUS: 'Kıyıköy', TRMER: 'Mersin', TRMRA: 'Marmara', TRMRM: 'Mudanya',
  TRMUD: 'Mudanya', TRORD: 'Ordu', TRRIZ: 'Rize', TRSIC: 'Samsun',
  TRSIL: 'Silivri', TRSSX: 'Samsun', TRSUR: 'Samsun', TRTAS: 'Tuzla',
  TRTEK: 'Tekirdağ', TRTIR: 'Pendik', TRTZX: 'Tuzla', TRUNY: 'Marmara',
  TRYAL: 'Yalova', TRZON: 'Zonguldak', TR002: 'İstanbul', TR003: 'Marmara',
  TR01M: 'Marmara', TR027: 'Tuzla', TR039: 'İstanbul', TR092: 'Tuzla / Pendik',
}

function getPrefix(code: string): string {
  const dash = code.indexOf('-')
  return dash > 0 ? code.slice(0, dash) : code.slice(0, 6)
}

export default function HizmetNoktalariPage() {
  const [search, setSearch] = useState('')
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null)

  const grouped = useMemo(() => {
    const map = new Map<string, typeof TURKEY_PORTS>()
    for (const p of TURKEY_PORTS) {
      const prefix = getPrefix(p.code)
      if (!map.has(prefix)) map.set(prefix, [])
      map.get(prefix)!.push(p)
    }
    return Array.from(map.entries())
      .map(([prefix, ports]) => ({ prefix, label: REGION_LABELS[prefix] ?? prefix, ports }))
      .sort((a, b) => (a.label.localeCompare(b.label)))
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return grouped
    const q = search.toUpperCase()
    return grouped
      .map(g => ({
        ...g,
        ports: g.ports.filter(p => p.name.includes(q) || p.code.toUpperCase().includes(q)),
      }))
      .filter(g => g.ports.length > 0)
  }, [grouped, search])

  return (
    <div className="min-h-screen bg-maritime-primary">
      <div className="ocean-bg opacity-40" />
      <header className="relative border-b border-navy-700/50 bg-maritime-primary/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Ana Sayfa</span>
          </Link>
          <div className="flex items-center gap-2">
            <Anchor className="w-6 h-6 text-ocean-400" />
            <span className="font-display font-bold text-white">MarinePortal</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            Hizmet Verebilecek Noktalar
          </h1>
          <p className="text-gray-400 max-w-2xl mb-6">
            MarinePortal ağında standart liman kodlarıyla hizmet verdiğimiz tüm noktalar.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-ocean-500/10 border border-ocean-500/20">
              <Ship className="w-6 h-6 text-ocean-400" />
              <div>
                <span className="text-2xl font-bold text-white">{TURKEY_PORTS.length}</span>
                <span className="text-gray-400 text-sm ml-2">Liman</span>
              </div>
            </div>
            <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-maritime-gold/10 border border-maritime-gold/20">
              <MapPin className="w-6 h-6 text-maritime-gold" />
              <div>
                <span className="text-2xl font-bold text-white">{grouped.length}</span>
                <span className="text-gray-400 text-sm ml-2">Bölge</span>
              </div>
            </div>
          </div>
        </div>

        {/* Arama */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Liman adı veya kodu ile ara..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-maritime pl-10 w-full"
            />
          </div>
        </div>

        {/* Bölge kartları */}
        <div className="space-y-4">
          {filtered.map(({ prefix, label, ports }) => {
            const isExpanded = expandedRegion === prefix
            return (
              <div
                key={prefix}
                className="maritime-card overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setExpandedRegion(isExpanded ? null : prefix)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-navy-800/30 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-ocean-500/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-ocean-400" />
                    </div>
                    <div>
                      <h2 className="font-display text-lg font-semibold text-white">{label}</h2>
                      <p className="text-gray-500 text-sm">{ports.length} liman</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>
                {isExpanded && (
                  <div className="border-t border-navy-700/50 max-h-72 overflow-y-auto">
                    <div className="p-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {ports.map(p => (
                        <div
                          key={p.code}
                          className="flex gap-2 p-3 rounded-lg bg-navy-800/40 border border-navy-700/30 hover:border-ocean-500/30 transition-colors"
                        >
                          <span className="font-mono text-ocean-400 text-xs flex-shrink-0">{p.code}</span>
                          <span className="text-gray-300 text-sm truncate" title={p.name}>{p.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="maritime-card p-12 text-center">
            <MapPin className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">Aramanızla eşleşen liman bulunamadı.</p>
          </div>
        )}

        {/* Kullanım bilgisi */}
        <div className="mt-10 maritime-card p-6">
          <h3 className="font-display font-semibold text-white mb-4">Nasıl Kullanılır?</h3>
          <div className="grid md:grid-cols-3 gap-6 text-gray-400 text-sm">
            <div className="flex gap-3">
              <span className="w-8 h-8 rounded-lg bg-ocean-500/10 text-ocean-400 flex items-center justify-center flex-shrink-0 font-semibold">1</span>
              <p>Acenteler profil ayarlarından hizmet verdikleri limanları bu listeden seçer.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-8 h-8 rounded-lg bg-ocean-500/10 text-ocean-400 flex items-center justify-center flex-shrink-0 font-semibold">2</span>
              <p>Armatorlar talep oluştururken liman seçiminde bu standart listeyi kullanır.</p>
            </div>
            <div className="flex gap-3">
              <span className="w-8 h-8 rounded-lg bg-ocean-500/10 text-ocean-400 flex items-center justify-center flex-shrink-0 font-semibold">3</span>
              <p>Tek tip liman kodu kullanımı karışıklığı önler ve eşleştirmeyi kolaylaştırır.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
