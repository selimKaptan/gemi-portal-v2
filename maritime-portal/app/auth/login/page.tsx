'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import toast from 'react-hot-toast'
import { Suspense } from 'react'

function LoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const { t } = useTranslation()
  const { auth } = t

  useEffect(() => {
    const err = searchParams.get('error')
    if (err === 'session_expired') {
      setSessionError(auth.sessionExpired)
    }
  }, [searchParams, auth.sessionExpired])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('E-posta veya şifre hatalı.')
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('E-postanızı doğrulamadan giriş yapamazsınız.')
        } else {
          toast.error(error.message)
        }
        return
      }

      toast.success('Giriş başarılı! Yönlendiriliyorsunuz...')
      // Full-page reload for cookie sync
      window.location.href = '/dashboard'
    } catch {
      toast.error('Beklenmedik bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-3xl font-bold text-white mb-2">{auth.loginTitle}</h2>
          <p className="text-gray-400 text-sm">{auth.loginSub}</p>
        </div>
        <LanguageSwitcher />
      </div>

      {sessionError && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm">
          <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
          {sessionError}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="form-group">
          <label className="label-maritime" htmlFor="email">{auth.email}</label>
          <input
            id="email"
            type="email"
            className="input-maritime"
            placeholder={auth.emailPlaceholder}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label className="label-maritime" htmlFor="password">{auth.password}</label>
          <div className="relative">
            <input
              id="password"
              type={showPass ? 'text' : 'password'}
              className="input-maritime pr-10"
              placeholder={auth.passPlaceholder}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="btn-primary w-full py-3 gap-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {auth.loggingIn}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <LogIn className="w-4 h-4" />
              {auth.loginBtn}
            </span>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        {auth.noAccount}{' '}
        <Link href="/auth/register" className="text-ocean-400 hover:text-ocean-300 font-medium transition-colors">
          {auth.createAccount}
        </Link>
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
