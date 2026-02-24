'use client'

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import { translations, type Locale, type Translations } from './translations'

const COOKIE_NAME = 'mp_locale'

interface LanguageContextValue {
  locale: Locale
  t: Translations
  setLocale: (l: Locale) => void
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: 'tr',
  t: translations.tr as Translations,
  setLocale: () => {},
})

function getInitialLocale(): Locale {
  if (typeof document === 'undefined') return 'tr'
  const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`))
  const val = match?.[1] as Locale | undefined
  if (val && ['tr', 'en', 'ru'].includes(val)) return val
  const browser = navigator.language.slice(0, 2)
  if (browser === 'en') return 'en'
  if (browser === 'ru') return 'ru'
  return 'tr'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('tr')

  useEffect(() => {
    setLocaleState(getInitialLocale())
  }, [])

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    document.cookie = `${COOKIE_NAME}=${l}; path=/; max-age=31536000; SameSite=Lax`
  }, [])

  return (
    <LanguageContext.Provider value={{ locale, t: translations[locale] as Translations, setLocale }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  return useContext(LanguageContext)
}
