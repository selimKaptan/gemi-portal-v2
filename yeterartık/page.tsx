'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import {
  Anchor,
  Ship,
  Globe,
  Shield,
  ChevronRight,
  BarChart3,
  Clock,
  Users,
  ArrowRight,
  Menu,
  X,
  Star,
} from 'lucide-react'

const STATS = [
  { label: 'Aktif Gemi', value: '2,400+', icon: Ship },
  { label: 'Liman', value: '180+', icon: Anchor },
  { label: 'Kullanıcı Ülke', value: '42', icon: Globe },
  { label: 'Başarı Oranı', value: '%99.7', icon: Shield },
]

const FEATURES = [
  {
    icon: Ship,
    title: 'Filo Yönetimi',
    desc: 'Tüm gemi filonuzu tek platformdan yönetin. IMO, bayrak, GRT/NRT bilgileri anlık takip.',
    gradient: 'from-ocean-500/20 to-navy-700/20',
    border: 'border-ocean-500/30',
  },
  {
    icon: BarChart3,
    title: 'Talep Takibi',
    desc: 'Hizmet taleplerini oluşturun, takip edin, onaylayın. Anlık durum güncellemeleri.',
    gradient: 'from-maritime-gold/10 to-navy-700/20',
    border: 'border-maritime-gold/30',
  },
  {
    icon: Clock,
    title: 'Gerçek Zamanlı',
    desc: 'Anlık bildirimler ve durum güncellemeleri ile hiçbir fırsatı kaçırmayın.',
    gradient: 'from-emerald-500/10 to-navy-700/20',
    border: 'border-emerald-500/30',
  },
  {
    icon: Shield,
    title: 'Güvenli Altyapı',
    desc: 'Rol bazlı erişim kontrolü ve şifrelenmiş veri transferi ile maksimum güvenlik.',
    gradient: 'from-purple-500/10 to-navy-700/20',
    border: 'border-purple-500/30',
  },
  {
    icon: Users,
    title: 'Armator & Acente',
    desc: 'Armatorlar ve acenteler için özel dashboardlar ve iş akışları.',
    gradient: 'from-pink-500/10 to-navy-700/20',
    border: 'border-pink-500/30',
  },
  {
    icon: Globe,
    title: 'Global Liman Ağı',
    desc: 'Dünya genelinde 180+ liman ile entegre çalışın. Çok dil desteği.',
    gradient: 'from-cyan-500/10 to-navy-700/20',
    border: 'border-cyan-500/30',
  },
]

const TESTIMONIALS = [
  {
    quote: 'MarinePortal ile gemi operasyonlarımızı %40 daha verimli yönetiyoruz. Harika bir platform.',
    name: 'Mehmet Yılmaz',
    title: 'Genel Müdür, Yılmaz Denizcilik',
    rating: 5,
  },
  {
    quote: 'Acente olarak talep süreçlerini bu kadar kolay yönetebileceğimizi düşünmezdim.',
    name: 'Ayşe Kaya',
    title: 'Operasyon Müdürü, Akdeniz Acentesi',
    rating: 5,
  },
]

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-maritime-primary overflow-x-hidden">
      {/* Ocean background animation */}
      <div className="ocean-bg" />

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-maritime-primary/95 backdrop-blur-md border-b border-navy-700/50' : ''
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-ocean-500 flex items-center justify-center">
                <Anchor className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-display font-bold text-lg">
                Marine<span className="text-ocean-400">Portal</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-400 hover:text-white text-sm transition-colors">Özellikler</a>
              <a href="#stats" className="text-gray-400 hover:text-white text-sm transition-colors">İstatistikler</a>
              <a href="#testimonials" className="text-gray-400 hover:text-white text-sm transition-colors">Referanslar</a>
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/auth/login" className="btn-ghost text-sm">
                Giriş Yap
              </Link>
              <Link href="/auth/register" className="btn-primary text-sm">
                Ücretsiz Başla
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-gray-400 hover:text-white p-2"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-navy-900/95 backdrop-blur-md border-b border-navy-700/50 px-4 py-4 space-y-3">
            <a href="#features" className="block text-gray-300 hover:text-white py-2">Özellikler</a>
            <a href="#stats" className="block text-gray-300 hover:text-white py-2">İstatistikler</a>
            <Link href="/auth/login" className="block text-center btn-secondary py-2.5 mt-3">Giriş Yap</Link>
            <Link href="/auth/register" className="block text-center btn-primary py-2.5">Ücretsiz Başla</Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4">
        <div className="max-w-7xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ocean-500/10 border border-ocean-500/20 text-ocean-400 text-sm font-medium mb-8 animate-fade-in">
            <div className="w-2 h-2 bg-ocean-400 rounded-full animate-pulse" />
            Türkiye'nin Önde Gelen Denizcilik Platformu
          </div>

          {/* Headline */}
          <h1 className="font-display text-5xl md:text-7xl font-bold text-white mb-6 animate-slide-up leading-tight">
            Gemi Operasyonlarını
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocean-400 to-ocean-200">
              Yeni Nesil
            </span>{' '}
            Yönetin
          </h1>

          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Armatorlar ve acenteler için entegre gemi yönetim platformu.
            Talepleri, filonuzu ve operasyonlarınızı tek yerden kontrol edin.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/auth/register" className="btn-primary text-base px-8 py-3 flex items-center justify-center gap-2">
              Hemen Başlayın
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/auth/login" className="btn-secondary text-base px-8 py-3 flex items-center justify-center gap-2">
              Hesabınıza Giriş Yapın
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Hero decorative ships */}
          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-maritime-primary via-transparent to-transparent z-10 pointer-events-none" />
            <div className="maritime-card p-2 mx-auto max-w-5xl overflow-hidden">
              <div className="rounded-lg bg-navy-950 p-6 relative overflow-hidden" style={{ minHeight: '320px' }}>
                {/* Fake dashboard preview */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-ocean-500 via-ocean-400 to-transparent" />
                </div>
                {/* Sidebar preview */}
                <div className="flex gap-4 h-full">
                  <div className="w-44 shrink-0 bg-navy-900/80 rounded-lg p-3 space-y-2">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-6 h-6 rounded bg-ocean-500/30 flex items-center justify-center">
                        <Anchor className="w-3 h-3 text-ocean-400" />
                      </div>
                      <span className="text-white text-xs font-semibold">MarinePortal</span>
                    </div>
                    {['Dashboard', 'Gemiler', 'Talepler', 'Profil'].map((item, i) => (
                      <div key={item} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${i === 0 ? 'bg-ocean-500/20 text-ocean-400 border border-ocean-500/30' : 'text-gray-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-ocean-400' : 'bg-gray-600'}`} />
                        {item}
                      </div>
                    ))}
                  </div>
                  {/* Content preview */}
                  <div className="flex-1 space-y-3">
                    {/* Stats row */}
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { l: 'Toplam Gemi', v: '14', c: 'text-ocean-400' },
                        { l: 'Aktif Talep', v: '7', c: 'text-yellow-400' },
                        { l: 'Onaylı', v: '23', c: 'text-green-400' },
                        { l: 'Tamamlanan', v: '156', c: 'text-purple-400' },
                      ].map(s => (
                        <div key={s.l} className="bg-navy-900/80 rounded-lg p-3">
                          <div className={`text-xl font-bold ${s.c} number-display`}>{s.v}</div>
                          <div className="text-gray-600 text-xs mt-1">{s.l}</div>
                        </div>
                      ))}
                    </div>
                    {/* Table preview */}
                    <div className="bg-navy-900/80 rounded-lg p-3">
                      <div className="text-gray-400 text-xs mb-3 font-medium">Son Talepler</div>
                      <div className="space-y-2">
                        {[
                          { ship: 'MV Ankara Star', port: 'İzmir', status: 'Onaylı', sc: 'text-green-400' },
                          { ship: 'MT Bosphorus', port: 'İstanbul', status: 'Beklemede', sc: 'text-yellow-400' },
                          { ship: 'MV Ege Pearl', port: 'Mersin', status: 'İnceleniyor', sc: 'text-blue-400' },
                        ].map((row, i) => (
                          <div key={i} className="flex items-center justify-between py-1.5 border-b border-navy-700/30 last:border-0">
                            <div className="flex items-center gap-2">
                              <Ship className="w-3 h-3 text-gray-600" />
                              <span className="text-gray-300 text-xs">{row.ship}</span>
                            </div>
                            <span className="text-gray-500 text-xs">{row.port}</span>
                            <span className={`text-xs font-medium ${row.sc}`}>{row.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="maritime-card p-6 text-center group hover:border-ocean-500/30 transition-all duration-300">
                <div className="w-12 h-12 bg-ocean-500/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-ocean-500/20 transition-colors">
                  <Icon className="w-6 h-6 text-ocean-400" />
                </div>
                <div className="text-3xl font-bold text-white font-display number-display">{value}</div>
                <div className="text-gray-500 text-sm mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Her İhtiyacınız İçin
              <span className="text-ocean-400"> Kapsamlı Çözüm</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Denizcilik operasyonlarınızı modernize etmek için ihtiyaç duyduğunuz her şey tek platformda.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, gradient, border }) => (
              <div
                key={title}
                className={`group p-6 rounded-xl bg-gradient-to-br ${gradient} border ${border} hover:scale-[1.02] transition-all duration-300`}
              >
                <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/10 transition-colors">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2 font-display">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display text-4xl font-bold text-white mb-4">
              Müşterilerimiz <span className="text-ocean-400">Ne Diyor?</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {TESTIMONIALS.map(({ quote, name, title, rating }) => (
              <div key={name} className="maritime-card p-8">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-maritime-gold fill-maritime-gold" />
                  ))}
                </div>
                <p className="text-gray-300 text-base leading-relaxed mb-6 italic">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-ocean-500/20 border border-ocean-500/30 flex items-center justify-center">
                    <span className="text-ocean-400 font-bold text-sm">{name[0]}</span>
                  </div>
                  <div>
                    <div className="text-white font-medium text-sm">{name}</div>
                    <div className="text-gray-500 text-xs">{title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="maritime-card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-ocean-500/10 to-transparent" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-ocean-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Anchor className="w-8 h-8 text-ocean-400 animate-float" />
              </div>
              <h2 className="font-display text-4xl font-bold text-white mb-4">
                Hemen Başlayın
              </h2>
              <p className="text-gray-400 text-lg mb-8 max-w-lg mx-auto">
                Ücretsiz hesap oluşturun ve gemi operasyonlarınızı dönüştürün.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register" className="btn-primary text-base px-10 py-3 flex items-center justify-center gap-2">
                  Ücretsiz Kayıt Ol
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/auth/login" className="btn-secondary text-base px-10 py-3">
                  Giriş Yap
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-800/50 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-ocean-500 flex items-center justify-center">
                <Anchor className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-white font-display font-bold">
                Marine<span className="text-ocean-400">Portal</span>
              </span>
            </div>
            <p className="text-gray-600 text-sm text-center">
              © 2024 MarinePortal. Tüm hakları saklıdır. Türkiye'de geliştirildi 🇹🇷
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">Gizlilik</a>
              <a href="#" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">Şartlar</a>
              <a href="#" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">İletişim</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
