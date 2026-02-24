'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Globe } from 'lucide-react'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { LOCALES, type Locale } from '@/lib/i18n/translations'

interface Props {
  variant?: 'dark' | 'light'
}

export default function LanguageSwitcher({ variant = 'dark' }: Props) {
  const { locale, setLocale } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = LOCALES.find(l => l.code === locale) ?? LOCALES[0]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const btnClass = variant === 'dark'
    ? 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-navy-700/50 border border-transparent hover:border-navy-600/50 transition-all'
    : 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-all'

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} className={btnClass}>
        <Globe className="w-3.5 h-3.5" />
        <span>{current.flag} {current.label}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 bg-navy-800 border border-navy-600/60 rounded-xl shadow-xl z-50 py-1 min-w-[130px]">
          {LOCALES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLocale(l.code as Locale); setOpen(false) }}
              className={`w-full text-left flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
                locale === l.code
                  ? 'text-ocean-400 bg-ocean-500/10'
                  : 'text-gray-300 hover:text-white hover:bg-navy-700/60'
              }`}
            >
              <span>{l.flag}</span>
              <span>{l.label}</span>
              {locale === l.code && <span className="ml-auto w-1.5 h-1.5 bg-ocean-400 rounded-full" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
