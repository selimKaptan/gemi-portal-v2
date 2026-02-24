'use client'

import { useState } from 'react'
import { User, Lock, Building2, Phone, Mail, Save, Eye, EyeOff, MapPin, X, Search, Plus } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import toast from 'react-hot-toast'
import type { Profile } from '@/types'
import { TURKEY_PORTS } from '@/lib/ports'

interface Props { profile: Profile; email: string; initialAgencyPorts: string[] }

export default function ProfileClient({ profile, email, initialAgencyPorts }: Props) {
  const [info, setInfo] = useState({ full_name: profile.full_name, company_name: profile.company_name ?? '', phone: profile.phone ?? '' })
  const [pass, setPass] = useState({ newPass: '', confirm: '' })
  const [showPass, setShowPass] = useState({ new: false, confirm: false })
  const [savingInfo, setSavingInfo] = useState(false)
  const [savingPass, setSavingPass] = useState(false)
  const [ports, setPorts] = useState<string[]>(initialAgencyPorts)
  const [portSearch, setPortSearch] = useState('')
  const [portSaving, setPortSaving] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)

  const { t } = useTranslation()
  const { profile: pr, sidebar, common } = t

  const supabase = createClient()

  const filteredSuggestions = TURKEY_PORTS.filter(p => {
    if (ports.includes(p.name)) return false
    if (portSearch.length === 0) return true
    const q = portSearch.toUpperCase()
    return p.name.includes(q) || p.code.toUpperCase().includes(q)
  }).slice(0, 60)

  async function handleAddPort(portName: string) {
    const name = portName.trim()
    if (!name) return
    // Accept by name or code lookup
    const found = TURKEY_PORTS.find(p => p.name.toUpperCase() === name.toUpperCase() || p.code.toUpperCase() === name.toUpperCase())
    const finalName = found ? found.name : name
    if (ports.includes(finalName)) return
    setPortSaving(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('agency_ports').insert({ agency_id: profile.id, port_name: finalName })
      if (error) throw error
      setPorts(prev => [...prev, finalName].sort()); setPortSearch(''); setShowSuggestions(false)
      toast.success(pr.portAdded(finalName))
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : pr.portAddErr)
    } finally { setPortSaving(false) }
  }

  async function handleRemovePort(portName: string) {
    setPortSaving(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('agency_ports').delete().eq('agency_id', profile.id).eq('port_name', portName)
      if (error) throw error
      setPorts(prev => prev.filter(p => p !== portName)); toast.success(pr.portRemoved(portName))
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : pr.portRemoveErr)
    } finally { setPortSaving(false) }
  }

  function handlePortKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredSuggestions.length > 0) handleAddPort(filteredSuggestions[0].name)
      else if (portSearch.trim()) handleAddPort(portSearch)
    }
  }

  async function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault(); setSavingInfo(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error } = await (supabase as any).from('profiles').update({ full_name: info.full_name, company_name: info.company_name || null, phone: info.phone || null }).eq('id', profile.id)
      if (error) throw error; toast.success(pr.saved)
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : common.error)
    } finally { setSavingInfo(false) }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    if (pass.newPass !== pass.confirm) { toast.error(pr.passMismatch); return }
    if (pass.newPass.length < 6) { toast.error(pr.passShort); return }
    setSavingPass(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: pass.newPass })
      if (error) throw error; toast.success(pr.passUpdated); setPass({ newPass: '', confirm: '' })
    } catch (err: unknown) { toast.error(err instanceof Error ? err.message : common.error)
    } finally { setSavingPass(false) }
  }

  const roleBadge = profile.role === 'agency'
    ? { label: sidebar.agencyPanel,  classes: 'bg-maritime-gold/10 text-maritime-gold border-maritime-gold/20' }
    : profile.role === 'admin'
      ? { label: sidebar.adminPanel,  classes: 'bg-red-500/10 text-red-400 border-red-500/20' }
      : { label: sidebar.armatorPanel, classes: 'bg-ocean-500/10 text-ocean-400 border-ocean-500/20' }

  return (
    <div className="space-y-8 animate-fade-in max-w-2xl">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">{pr.title}</h1>
        <p className="text-gray-400 text-sm mt-0.5">{pr.subtitle}</p>
      </div>

      <div className="maritime-card p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-ocean-500/20 border-2 border-ocean-500/30 flex items-center justify-center flex-shrink-0">
          <span className="text-ocean-400 font-bold text-xl">{profile.full_name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()}</span>
        </div>
        <div>
          <h2 className="text-white font-semibold text-lg">{profile.full_name}</h2>
          <p className="text-gray-400 text-sm">{email}</p>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border mt-2 ${roleBadge.classes}`}>{roleBadge.label}</span>
        </div>
      </div>

      <div className="maritime-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-ocean-500/10 rounded-lg flex items-center justify-center"><User className="w-4 h-4 text-ocean-400" /></div>
          <h3 className="font-display text-lg font-semibold text-white">{pr.infoSection}</h3>
        </div>
        <form onSubmit={handleSaveInfo} className="space-y-4">
          <div className="form-group">
            <label className="label-maritime">{pr.nameLabel}</label>
            <input type="text" className="input-maritime" value={info.full_name} onChange={e => setInfo(p => ({ ...p, full_name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label className="label-maritime flex items-center gap-1.5"><Building2 className="w-3 h-3" /> {pr.companyLabel}</label>
            <input type="text" className="input-maritime" placeholder={pr.companyPlaceholder} value={info.company_name} onChange={e => setInfo(p => ({ ...p, company_name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label-maritime flex items-center gap-1.5"><Phone className="w-3 h-3" /> {pr.phoneLabel}</label>
              <input type="tel" className="input-maritime" placeholder="+90 555 000 0000" value={info.phone} onChange={e => setInfo(p => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="label-maritime flex items-center gap-1.5"><Mail className="w-3 h-3" /> {pr.emailLabel}</label>
              <input type="email" className="input-maritime" value={email} disabled />
            </div>
          </div>
          <div className="flex justify-end pt-1">
            <button type="submit" disabled={savingInfo} className="btn-primary gap-2">
              <Save className="w-4 h-4" />{savingInfo ? common.saving : common.save}
            </button>
          </div>
        </form>
      </div>

      {profile.role === 'agency' && (
        <div className="maritime-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-maritime-gold/10 rounded-lg flex items-center justify-center"><MapPin className="w-4 h-4 text-maritime-gold" /></div>
            <h3 className="font-display text-lg font-semibold text-white">{pr.portsSection}</h3>
          </div>
          <p className="text-gray-500 text-sm mb-5 ml-11">{pr.portsDesc}</p>

          {ports.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {ports.map(port => (
                <span key={port} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-maritime-gold/10 text-maritime-gold border border-maritime-gold/25">
                  <MapPin className="w-3 h-3" />{port}
                  <button onClick={() => handleRemovePort(port)} disabled={portSaving} className="ml-0.5 hover:text-red-400 transition-colors" title={pr.removePort}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
          )}

          {ports.length === 0 && (
            <div className="flex items-center gap-2 text-yellow-400/80 text-sm mb-4 bg-yellow-400/5 border border-yellow-400/15 rounded-lg px-4 py-3">
              <MapPin className="w-4 h-4 flex-shrink-0" />{pr.noPorts}
            </div>
          )}

          <div className="relative">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input type="text" className="input-maritime pl-9 w-full" placeholder={pr.portInputPlaceholder}
                  value={portSearch} onChange={e => { setPortSearch(e.target.value); setShowSuggestions(true) }}
                  onFocus={() => setShowSuggestions(true)} onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  onKeyDown={handlePortKeyDown} disabled={portSaving} />
              </div>
              <button type="button" onClick={() => { if (filteredSuggestions.length > 0) handleAddPort(filteredSuggestions[0].name); else if (portSearch.trim()) handleAddPort(portSearch) }} disabled={portSaving || !portSearch.trim()}
                className="btn-primary px-4 flex items-center gap-1.5 disabled:opacity-40">
                <Plus className="w-4 h-4" />{pr.portAddBtn}
              </button>
            </div>
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-navy-800 border border-navy-600/60 rounded-xl shadow-xl z-20 max-h-52 overflow-y-auto">
                {filteredSuggestions.map(port => (
                  <button key={port.code} type="button" onMouseDown={() => handleAddPort(port.name)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-navy-700/60 flex items-center gap-3 transition-colors first:rounded-t-xl last:rounded-b-xl">
                    <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                    <span className="flex-1 truncate">{port.name}</span>
                    <span className="text-gray-600 text-xs font-mono flex-shrink-0">{port.code}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <p className="text-gray-600 text-xs mt-2">{pr.portHint}</p>
        </div>
      )}

      <div className="maritime-card p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-ocean-500/10 rounded-lg flex items-center justify-center"><Lock className="w-4 h-4 text-ocean-400" /></div>
          <h3 className="font-display text-lg font-semibold text-white">{pr.passwordSection}</h3>
        </div>
        <form onSubmit={handleChangePassword} className="space-y-4">
          {([
            { key: 'newPass'  as const, label: pr.newPassLabel,     show: showPass.new,     toggle: () => setShowPass(p => ({ ...p, new: !p.new })) },
            { key: 'confirm'  as const, label: pr.confirmPassLabel, show: showPass.confirm, toggle: () => setShowPass(p => ({ ...p, confirm: !p.confirm })) },
          ]).map(({ key, label, show, toggle }) => (
            <div key={key} className="form-group">
              <label className="label-maritime">{label}</label>
              <div className="relative">
                <input type={show ? 'text' : 'password'} className="input-maritime pr-10" placeholder="••••••••" value={pass[key]} onChange={e => setPass(p => ({ ...p, [key]: e.target.value }))} required minLength={6} />
                <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
          <div className="flex justify-end pt-1">
            <button type="submit" disabled={savingPass} className="btn-primary gap-2">
              <Lock className="w-4 h-4" />{savingPass ? pr.updatingPass : pr.updatePassBtn}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
