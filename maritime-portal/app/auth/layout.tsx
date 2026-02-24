import { Anchor } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy-900 flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 -left-10 w-96 h-96 bg-ocean-500 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-0 w-72 h-72 bg-ocean-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group w-fit">
            <div className="w-10 h-10 rounded-xl bg-ocean-500 flex items-center justify-center group-hover:bg-ocean-600 transition-colors">
              <Anchor className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-display font-bold text-xl">
              Marine<span className="text-ocean-400">Portal</span>
            </span>
          </Link>

          {/* Pitch copy */}
          <div className="space-y-6">
            <h1 className="font-display text-4xl font-bold text-white leading-tight">
              Gemi Operasyonlarınızı<br />
              <span className="text-ocean-400">Yeni Nesil</span> Yönetin
            </h1>
            <p className="text-gray-400 text-lg leading-relaxed max-w-md">
              Armatorlar ve acenteler için entegre denizcilik yönetim platformu.
              Güvenli, hızlı ve modern.
            </p>
            <div className="flex flex-col gap-3 pt-2">
              {[
                'Cookie-based güvenli kimlik doğrulama',
                'Rol bazlı erişim kontrolü',
                'Gerçek zamanlı talep takibi',
                'Türkiye\'nin denizcilik altyapısı',
              ].map(item => (
                <div key={item} className="flex items-center gap-3 text-sm text-gray-300">
                  <div className="w-1.5 h-1.5 bg-ocean-400 rounded-full flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Footer note */}
          <p className="text-gray-600 text-sm">
            © 2024 MarinePortal. Türkiye&apos;de geliştirildi 🇹🇷
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 relative">
        <div className="ocean-bg" />
        {/* Mobile logo */}
        <Link href="/" className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-ocean-500 flex items-center justify-center">
            <Anchor className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-display font-bold text-lg">
            Marine<span className="text-ocean-400">Portal</span>
          </span>
        </Link>

        <div className="relative z-10 w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  )
}
