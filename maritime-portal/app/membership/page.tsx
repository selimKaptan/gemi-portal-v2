'use client'

import Link from 'next/link'
import { Anchor, Ship, Building2, TrendingUp, CheckCircle, ArrowRight, ChevronLeft } from 'lucide-react'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

const ROLES = [
  {
    id: 'armator',
    icon: Ship,
    color: 'ocean',
    gradient: 'from-ocean-500/20 to-navy-800/40',
    border: 'border-ocean-500/30',
    iconBg: 'bg-ocean-500/15 border-ocean-500/25',
    iconColor: 'text-ocean-400',
    badge: 'Armatör',
    badgeColor: 'bg-ocean-500/15 text-ocean-300 border-ocean-500/25',
    title: 'Armatörler',
    subtitle: 'Gemi sahipleri ve işletmeciler',
    desc: 'Gemilerinizi platformumuza kaydederek dünya genelindeki acentelerden proforma teklifi alın, PDA kontrolü yaptırın ve tüm operasyonlarınızı tek ekrandan yönetin.',
    requirements: [
      'Aktif gemi sahibi veya işletmecisi olmak',
      'Geçerli IMO numarasına sahip en az 1 gemi',
      'Şirket veya bireysel kayıt imkânı',
      'Geçerli bir iletişim e-postası',
    ],
    benefits: [
      'Sınırsız gemi kaydı (Pro plan)',
      'Dünya genelinde acentelerden teklif alma',
      'PDA (Proforma Disbursement Account) kontrol hizmeti',
      'Anlık talep takibi ve bildirimler',
      'Arşiv ve raporlama araçları',
    ],
    cta: 'Armatör Olarak Kaydol',
  },
  {
    id: 'agency',
    icon: Building2,
    color: 'emerald',
    gradient: 'from-emerald-500/15 to-navy-800/40',
    border: 'border-emerald-500/30',
    iconBg: 'bg-emerald-500/15 border-emerald-500/25',
    iconColor: 'text-emerald-400',
    badge: 'Acente',
    badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
    title: 'Acenteler',
    subtitle: 'Gemi acenteleri ve liman işletmecileri',
    desc: 'Hizmet verdiğiniz limanları tanımlayın, o limanlara gelen talepleri görün ve rekabetçi tekliflerinizi doğrudan armatörlere iletin.',
    requirements: [
      'Tescilli bir gemi acentesi veya şirket olmak',
      'Hizmet verilen liman(lar)ın bildirilmesi',
      'Yetkili temsilci adı ve iletişim bilgileri',
      'Geçerli bir iş e-postası',
    ],
    benefits: [
      'Hizmet verdiğiniz limanlardaki taleplere erişim',
      'Proforma dosyası ekleyerek teklif gönderme',
      'Rekabetçi teklif ortamı',
      'Kabul edilen tekliflerin otomatik bildirim ile iletilmesi',
      'Acente profili ve portföy yönetimi',
    ],
    cta: 'Acente Olarak Kaydol',
  },
  {
    id: 'broker',
    icon: TrendingUp,
    color: 'amber',
    gradient: 'from-amber-500/15 to-navy-800/40',
    border: 'border-amber-500/30',
    iconBg: 'bg-amber-500/15 border-amber-500/25',
    iconColor: 'text-amber-400',
    badge: 'Broker',
    badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
    title: 'Brokerlar',
    subtitle: 'Denizcilik komisyoncuları ve aracılar',
    desc: 'Armatör ve acenteler arasında köprü görevi üstlenerek her iki taraf için de değer yaratın. Komisyon bazlı iş modelinizi dijital ortama taşıyın.',
    requirements: [
      'Denizcilik sektöründe aktif broker/komisyoncu olmak',
      'Mevcut müşteri portföyü (armatör veya acente)',
      'Şirket veya serbest meslek kaydı',
      'Geçerli iletişim ve fatura bilgileri',
    ],
    benefits: [
      'Hem armatör hem acente özelliklerine erişim',
      'Müşteri portföyünü platform üzerinden yönetme',
      'Çoklu talep takibi',
      'Özel broker dashboard (yakında)',
      'Öncelikli destek hattı',
    ],
    cta: 'Broker Olarak Kaydol',
  },
]

export default function MembershipPage() {
  return (
    <div className="min-h-screen bg-maritime-primary overflow-x-hidden">
      <div className="ocean-bg" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-maritime-primary/95 backdrop-blur-md border-b border-navy-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-ocean-500 flex items-center justify-center">
                <Anchor className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-display font-bold text-lg">
                Marine<span className="text-ocean-400">Portal</span>
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <LanguageSwitcher variant="light" />
              <Link href="/auth/login"    className="btn-ghost text-sm">Giriş Yap</Link>
              <Link href="/auth/register" className="btn-primary text-sm">Ücretsiz Başla</Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        {/* Geri butonu */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-10 transition-colors group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Ana Sayfaya Dön
        </Link>

        {/* Başlık */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ocean-500/10 border border-ocean-500/20 text-ocean-400 text-sm font-medium mb-6">
            <div className="w-2 h-2 bg-ocean-400 rounded-full animate-pulse" />
            Üyelik Bilgileri
          </div>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            Kimler Üye Olabilir?
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            MarinePortal, denizcilik sektöründeki farklı paydaşlar için özel olarak tasarlanmış
            bir platformdur. Rolünüze uygun üyelik seçeneğini inceleyin.
          </p>
        </div>

        {/* Rol Kartları */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {ROLES.map(role => {
            const Icon = role.icon
            return (
              <div key={role.id}
                className={`relative rounded-2xl border ${role.border} bg-gradient-to-br ${role.gradient} p-8 flex flex-col`}>
                {/* Badge */}
                <div className="flex items-center justify-between mb-6">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${role.badgeColor}`}>
                    {role.badge}
                  </span>
                  <div className={`w-12 h-12 rounded-xl border ${role.iconBg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${role.iconColor}`} />
                  </div>
                </div>

                {/* Başlık */}
                <h2 className="font-display text-2xl font-bold text-white mb-1">{role.title}</h2>
                <p className={`text-sm font-medium mb-4 ${role.iconColor}`}>{role.subtitle}</p>
                <p className="text-gray-400 text-sm leading-relaxed mb-8">{role.desc}</p>

                {/* Kayıt Şartları */}
                <div className="mb-6">
                  <h3 className="text-white text-sm font-semibold uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${role.iconColor.replace('text-', 'bg-')}`} />
                    Kayıt Şartları
                  </h3>
                  <ul className="space-y-2.5">
                    {role.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                        <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${role.iconColor}`} />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Avantajlar */}
                <div className="mb-8 flex-1">
                  <h3 className="text-white text-sm font-semibold uppercase tracking-wide mb-3 flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${role.iconColor.replace('text-', 'bg-')}`} />
                    Platform Avantajları
                  </h3>
                  <ul className="space-y-2.5">
                    {role.benefits.map((benefit, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-gray-400">
                        <ArrowRight className={`w-4 h-4 flex-shrink-0 mt-0.5 ${role.iconColor} opacity-70`} />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <Link href="/auth/register"
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all
                    border ${role.border} ${role.iconColor} hover:bg-white/5`}>
                  {role.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            )
          })}
        </div>

        {/* Alt bilgi */}
        <div className="mt-16 text-center">
          <div className="inline-block bg-navy-800/50 border border-navy-700/50 rounded-2xl px-8 py-6">
            <p className="text-gray-400 text-sm mb-3">Hangi role uygun olduğunuzdan emin değil misiniz?</p>
            <p className="text-white font-medium mb-4">Destek ekibimizle iletişime geçin.</p>
            <a href="mailto:info@marineportal.io"
              className="inline-flex items-center gap-2 text-ocean-400 hover:text-ocean-300 text-sm font-medium transition-colors">
              info@marineportal.io
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
