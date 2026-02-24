'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Eye, EyeOff, UserPlus, Ship, Anchor } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'
import toast from 'react-hot-toast'
import type { UserRole } from '@/types'

export default function RegisterPage() {
  const { t } = useTranslation()
  const { auth } = t

  const [form, setForm] = useState({
    full_name: '',
    company_name: '',
    phone: '',
    email: '',
    password: '',
    role: 'armator' as UserRole,
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  function update(key: keyof typeof form, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Şifre en az 6 karakter olmalıdır.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.full_name,
            company_name: form.company_name,
            phone: form.phone,
            role: form.role,
          },
        },
      })

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Bu e-posta adresi zaten kayıtlı.')
        } else {
          toast.error(error.message)
        }
        return
      }

      toast.success('Kayıt başarılı! E-postanızı doğrulayın ve giriş yapın.')
      window.location.href = '/auth/login'
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
          <h2 className="font-display text-3xl font-bold text-white mb-2">{auth.registerTitle}</h2>
          <p className="text-gray-400 text-sm">{auth.registerSub}</p>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Role picker */}
      <div className="mb-6">
        <p className="label-maritime mb-3">{auth.chooseRole}</p>
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: 'armator', label: auth.armator, desc: auth.armatorDesc, icon: Ship },
            { value: 'agency',  label: auth.agency,  desc: auth.agencyDesc,  icon: Anchor },
          ] as const).map(({ value, label, desc, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => update('role', value)}
              className={`p-4 rounded-xl border text-left transition-all duration-200 ${
                form.role === value
                  ? 'border-ocean-500/60 bg-ocean-500/10'
                  : 'border-navy-700/80 bg-navy-800/40 hover:border-navy-600'
              }`}
            >
              <Icon className={`w-5 h-5 mb-2 ${form.role === value ? 'text-ocean-400' : 'text-gray-500'}`} />
              <p className={`font-semibold text-sm ${form.role === value ? 'text-white' : 'text-gray-300'}`}>{label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="form-group">
          <label className="label-maritime">{auth.fullName}</label>
          <input
            type="text"
            className="input-maritime"
            placeholder={auth.namePlaceholder}
            value={form.full_name}
            onChange={e => update('full_name', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="label-maritime">{auth.companyName}</label>
          <input
            type="text"
            className="input-maritime"
            placeholder="..."
            value={form.company_name}
            onChange={e => update('company_name', e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label-maritime">Tel</label>
            <input
              type="tel"
              className="input-maritime"
              placeholder="+90 555 000 0000"
              value={form.phone}
              onChange={e => update('phone', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="label-maritime">{auth.email}</label>
            <input
              type="email"
              className="input-maritime"
              placeholder={auth.emailPlaceholder}
              value={form.email}
              onChange={e => update('email', e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label className="label-maritime">{auth.password}</label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              className="input-maritime pr-10"
              placeholder={auth.passPlaceholder}
              value={form.password}
              onChange={e => update('password', e.target.value)}
              required
              minLength={6}
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
          disabled={loading}
          className="btn-primary w-full py-3 gap-2 mt-2"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {auth.registering}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <UserPlus className="w-4 h-4" />
              {auth.registerBtn}
            </span>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        {auth.haveAccount}{' '}
        <Link href="/auth/login" className="text-ocean-400 hover:text-ocean-300 font-medium transition-colors">
          {auth.loginLink}
        </Link>
      </p>
    </div>
  )
}
