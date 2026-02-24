'use client'

import Link from 'next/link'
import { Anchor, Mail, Phone, MapPin, Clock, ArrowLeft, Send, MessageSquare } from 'lucide-react'
import { useState } from 'react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', company: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // Mailto fallback
    const body = `Ad Soyad: ${form.name}\nŞirket: ${form.company}\nKonu: ${form.subject}\n\n${form.message}`
    window.location.href = `mailto:info@marineportal.com?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(body)}`
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-maritime-primary">
      <div className="ocean-bg" />

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-maritime-primary/95 backdrop-blur-md border-b border-navy-700/50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-ocean-500 flex items-center justify-center">
              <Anchor className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-display font-bold text-lg">
              Marine<span className="text-ocean-400">Portal</span>
            </span>
          </Link>
          <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Ana Sayfaya Dön
          </Link>
        </div>
      </nav>

      <div className="relative pt-28 pb-20 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ocean-500/10 border border-ocean-500/20 text-ocean-400 text-sm font-medium mb-6">
              <MessageSquare className="w-3.5 h-3.5" /> İletişim
            </div>
            <h1 className="font-display text-5xl font-bold text-white mb-4">
              Bizimle <span className="text-ocean-400">İletişime Geçin</span>
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto leading-relaxed">
              Sorularınız, demo talepleriniz veya işbirliği için buradayız.
              En kısa sürede size geri dönüş yapacağız.
            </p>
          </div>

          <div className="grid lg:grid-cols-5 gap-8">

            {/* Sol — İletişim bilgileri */}
            <div className="lg:col-span-2 space-y-4">
              <div className="maritime-card p-6 space-y-5">
                <h2 className="text-white font-semibold text-lg">İletişim Bilgileri</h2>

                <div className="space-y-4">
                  <a href="mailto:info@marineportal.com"
                    className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-ocean-500/10 border border-ocean-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-ocean-500/20 transition-colors">
                      <Mail className="w-5 h-5 text-ocean-400" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">E-posta</p>
                      <p className="text-white text-sm group-hover:text-ocean-400 transition-colors">info@marineportal.com</p>
                    </div>
                  </a>

                  <a href="tel:+902121234567"
                    className="flex items-start gap-4 group">
                    <div className="w-10 h-10 rounded-xl bg-ocean-500/10 border border-ocean-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-ocean-500/20 transition-colors">
                      <Phone className="w-5 h-5 text-ocean-400" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">Telefon</p>
                      <p className="text-white text-sm group-hover:text-ocean-400 transition-colors">+90 212 123 45 67</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-ocean-500/10 border border-ocean-500/20 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-ocean-400" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">Adres</p>
                      <p className="text-white text-sm">İstanbul, Türkiye</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-ocean-500/10 border border-ocean-500/20 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-ocean-400" />
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-0.5">Çalışma Saatleri</p>
                      <p className="text-white text-sm">Pzt – Cum: 09:00 – 18:00</p>
                      <p className="text-gray-600 text-xs mt-0.5">Cumartesi: 10:00 – 14:00</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="maritime-card p-6 bg-gradient-to-br from-ocean-500/10 to-navy-800/60">
                <p className="text-white font-semibold mb-2">Hemen Başlamak İster misiniz?</p>
                <p className="text-gray-400 text-sm mb-4">Ücretsiz hesap oluşturun, platformu keşfedin.</p>
                <Link href="/auth/register" className="btn-primary w-full text-center text-sm block py-2.5">
                  Ücretsiz Kayıt Ol
                </Link>
              </div>
            </div>

            {/* Sağ — Form */}
            <div className="lg:col-span-3">
              <div className="maritime-card p-8">
                {sent ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-5">
                      <Send className="w-7 h-7 text-green-400" />
                    </div>
                    <h3 className="text-white font-display text-xl font-bold mb-2">Mesajınız İletildi</h3>
                    <p className="text-gray-400 text-sm mb-6">E-posta istemciniz açıldı. En kısa sürede geri döneceğiz.</p>
                    <button onClick={() => setSent(false)} className="btn-secondary text-sm">
                      Yeni Mesaj Gönder
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <h2 className="text-white font-semibold text-lg mb-6">Mesaj Gönderin</h2>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="label-maritime text-xs">Ad Soyad *</label>
                        <input type="text" required className="input-maritime w-full text-sm"
                          placeholder="Adınız Soyadınız"
                          value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label className="label-maritime text-xs">E-posta *</label>
                        <input type="email" required className="input-maritime w-full text-sm"
                          placeholder="ornek@sirket.com"
                          value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="form-group">
                        <label className="label-maritime text-xs">Şirket</label>
                        <input type="text" className="input-maritime w-full text-sm"
                          placeholder="Şirket adı (opsiyonel)"
                          value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
                      </div>
                      <div className="form-group">
                        <label className="label-maritime text-xs">Konu *</label>
                        <select required className="input-maritime w-full text-sm"
                          value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}>
                          <option value="">Konu seçin...</option>
                          <option value="Demo Talebi">Demo Talebi</option>
                          <option value="Fiyat Bilgisi">Fiyat Bilgisi</option>
                          <option value="Teknik Destek">Teknik Destek</option>
                          <option value="İşbirliği">İşbirliği</option>
                          <option value="Diğer">Diğer</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="label-maritime text-xs">Mesajınız *</label>
                      <textarea required rows={5} className="input-maritime w-full resize-none text-sm"
                        placeholder="Mesajınızı buraya yazın..."
                        value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
                    </div>

                    <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                      <Send className="w-4 h-4" /> Mesajı Gönder
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
