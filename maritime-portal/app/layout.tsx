import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'MarinePortal — Gemi Acentesi Yönetim Sistemi',
  description: "Türkiye'nin modern gemi acentesi yönetim platformu. Armatörler ve acenteler için entegre denizcilik çözümü.",
  keywords: ['gemi', 'acente', 'denizcilik', 'armator', 'maritime', 'portal'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>
        <LanguageProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0e1e38',
                color: '#e2e8f0',
                border: '1px solid rgba(22, 40, 71, 0.9)',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
              },
              success: { iconTheme: { primary: '#4ade80', secondary: '#0e1e38' } },
              error:   { iconTheme: { primary: '#f87171', secondary: '#0e1e38' } },
            }}
          />
        </LanguageProvider>
      </body>
    </html>
  )
}
