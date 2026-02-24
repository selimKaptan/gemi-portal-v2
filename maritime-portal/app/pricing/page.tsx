'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Anchor, Check, X, ArrowRight, Zap, Shield, Crown,
  Ship, FileText, ClipboardList, Users, BarChart3,
  Headphones, Globe, Lock, ChevronLeft,
} from 'lucide-react'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'


function FeatureCell({ value }: { value: string | boolean }) {
  if (value === true) return <Check className="w-5 h-5 text-green-400 mx-auto" />
  if (value === false) return <X className="w-4 h-4 text-gray-700 mx-auto" />
  return <span className="text-gray-300 text-sm">{value}</span>
}

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const { t } = useTranslation()
  const { pricing: pr, nav } = t

  const PLANS = [
    {
      id: 'starter', name: pr.starter, badge: null, icon: Zap, iconColor: 'text-ocean-400', iconBg: 'bg-ocean-500/10',
      price: { monthly: 0, yearly: 0 }, priceLabel: '$0',
      priceNote: pr.forever, cta: pr.ctaFree, ctaHref: '/auth/register', ctaClass: 'btn-secondary w-full text-center',
      border: 'border-navy-700/50', highlight: false, description: pr.starterDesc,
      features: [
        { label: pr.featureShipLimit,      included: true  },
        { label: pr.featureRequests10,     included: true  },
        { label: pr.featureBasicRequests,  included: true  },
        { label: pr.featureRoles,          included: true  },
        { label: pr.featureEmailSupport,   included: true  },
        { label: pr.featurePda,            included: false },
        { label: pr.featureOffers,         included: false },
        { label: pr.featureReporting,      included: false },
        { label: pr.featureApi,            included: false },
        { label: pr.featurePriority,       included: false },
      ],
    },
    {
      id: 'pro', name: pr.pro, badge: pr.popular, icon: Shield, iconColor: 'text-white', iconBg: 'bg-white/15',
      price: { monthly: 100, yearly: 80 }, priceLabel: null, priceNote: pr.perMonth,
      cta: pr.ctaPro, ctaHref: '/auth/register', ctaClass: 'btn-primary w-full text-center',
      border: 'border-ocean-500/40', highlight: true, description: pr.proDesc,
      features: [
        { label: pr.featureShipLimit20,       included: true  },
        { label: pr.featureRequestsUnlimited, included: true  },
        { label: pr.featureAdvancedRequests,  included: true  },
        { label: pr.featureAllRoles,          included: true  },
        { label: pr.featurePhoneSupport,      included: true  },
        { label: pr.featurePda,               included: true  },
        { label: pr.featureOffers,            included: true  },
        { label: pr.featureReporting,         included: true  },
        { label: pr.featureApi,               included: false },
        { label: pr.featureSla,               included: false },
      ],
    },
    {
      id: 'enterprise', name: pr.enterprise, badge: null, icon: Crown, iconColor: 'text-maritime-gold', iconBg: 'bg-maritime-gold/10',
      price: { monthly: null, yearly: null }, priceLabel: pr.customPrice, priceNote: pr.customNote,
      cta: pr.ctaEnterprise, ctaHref: 'mailto:info@marineportal.com',
      ctaClass: 'btn-secondary w-full text-center border-maritime-gold/30 text-maritime-gold hover:bg-maritime-gold/10',
      border: 'border-maritime-gold/30', highlight: false, description: pr.enterpriseDesc,
      features: [
        { label: pr.featureShipUnlimited,     included: true },
        { label: pr.featureRequestsUnlimited, included: true },
        { label: pr.featureFullPlatform,      included: true },
        { label: pr.featureCustomRoles,       included: true },
        { label: pr.featureDedicatedSupport,  included: true },
        { label: pr.featurePda,               included: true },
        { label: pr.featureOffers,            included: true },
        { label: pr.featureCustomReporting,   included: true },
        { label: pr.featureFullApi,           included: true },
        { label: pr.featureDedicated,         included: true },
      ],
    },
  ]

  const COMPARE_FEATURES = [
    { label: pr.rowShipLimit,  starter: pr.rowShipStarter,       pro: pr.rowShipPro,       enterprise: pr.rowShipEnt       },
    { label: pr.rowRequests,   starter: pr.rowRequestsStarter,   pro: pr.rowRequestsPro,   enterprise: pr.rowRequestsEnt   },
    { label: pr.rowPda,        starter: false,                    pro: true,                enterprise: true                },
    { label: pr.rowOffers,     starter: false,                    pro: true,                enterprise: true                },
    { label: pr.rowArchive,    starter: pr.rowArchiveStarter,    pro: pr.rowArchivePro,    enterprise: pr.rowArchiveEnt    },
    { label: pr.rowApi,        starter: false,                    pro: false,               enterprise: true                },
    { label: pr.rowSupport,    starter: pr.rowSupportStarter,    pro: pr.rowSupportPro,    enterprise: pr.rowSupportEnt    },
    { label: pr.rowSla,        starter: false,                    pro: false,               enterprise: true                },
    { label: pr.rowCustom,     starter: false,                    pro: false,               enterprise: true                },
  ]

  return (
    <div className="min-h-screen bg-navy-950 overflow-x-hidden">
      {/* Ocean bg */}
      <div className="ocean-bg" />

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-navy-950/90 backdrop-blur-md border-b border-navy-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-ocean-500 flex items-center justify-center">
              <Anchor className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-display font-bold text-lg">
              Marine<span className="text-ocean-400">Portal</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-gray-400 hover:text-white text-sm transition-colors flex items-center gap-1.5">
              <ChevronLeft className="w-4 h-4" />{nav.home}
            </Link>
            <LanguageSwitcher variant="light" />
            <Link href="/auth/login" className="btn-ghost text-sm">{nav.login}</Link>
            <Link href="/auth/register" className="btn-primary text-sm">{nav.register}</Link>
          </div>
        </div>
      </nav>

      <div className="pt-28 pb-24 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-ocean-500/10 border border-ocean-500/20 text-ocean-400 text-sm font-medium mb-6">
              <div className="w-2 h-2 bg-ocean-400 rounded-full animate-pulse" />
              {pr.badge}
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {pr.title}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocean-400 to-ocean-200">
                {pr.title2}
              </span>
            </h1>
            <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">{pr.desc}</p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-1 mt-10 bg-navy-800/60 border border-navy-600/50 rounded-xl p-1">
              <button onClick={() => setBilling('monthly')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${billing === 'monthly' ? 'bg-ocean-500 text-white shadow-lg shadow-ocean-500/20' : 'text-gray-400 hover:text-white'}`}>
                {pr.monthly}
              </button>
              <button onClick={() => setBilling('yearly')}
                className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${billing === 'yearly' ? 'bg-ocean-500 text-white shadow-lg shadow-ocean-500/20' : 'text-gray-400 hover:text-white'}`}>
                {pr.yearly}
                <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">{pr.discount}</span>
              </button>
            </div>
          </div>

          {/* Plans */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-20 animate-slide-up">
            {PLANS.map((plan) => {
              const Icon = plan.icon
              const price = billing === 'yearly' ? plan.price.yearly : plan.price.monthly
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl border ${plan.border} flex flex-col overflow-hidden transition-all duration-300 hover:scale-[1.01] ${
                    plan.highlight
                      ? 'bg-gradient-to-b from-ocean-500/10 via-navy-800/80 to-navy-900/80 shadow-2xl shadow-ocean-500/10'
                      : 'bg-navy-800/40 hover:bg-navy-800/60'
                  }`}
                >
                  {/* Popular badge */}
                  {plan.badge && (
                    <div className="absolute top-0 left-0 right-0 flex justify-center">
                      <div className="bg-ocean-500 text-white text-xs font-bold px-4 py-1 rounded-b-lg tracking-wide">
                        {plan.badge}
                      </div>
                    </div>
                  )}

                  <div className={`p-8 flex flex-col flex-1 ${plan.badge ? 'pt-10' : ''}`}>
                    {/* Icon + Name */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-11 h-11 rounded-xl ${plan.iconBg} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${plan.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="text-white font-display font-bold text-xl">{plan.name}</h3>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      {plan.priceLabel ? (
                        <div>
                          <span className="text-4xl font-bold text-white font-display">{plan.priceLabel}</span>
                        </div>
                      ) : (
                        <div className="flex items-end gap-2">
                          <span className="text-4xl font-bold text-white font-display number-display">
                            ${price?.toLocaleString('en-US')}
                          </span>
                          <span className="text-gray-500 text-sm mb-1.5">/ {pr.monthly.toLowerCase()}</span>
                        </div>
                      )}
                      <p className="text-gray-500 text-sm mt-1">{plan.priceNote}</p>
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-sm leading-relaxed mb-8">{plan.description}</p>

                    {/* Features */}
                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map(({ label, included }) => (
                        <li key={label} className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            included
                              ? 'bg-green-500/15 border border-green-500/30'
                              : 'bg-navy-700/50 border border-navy-600/30'
                          }`}>
                            {included
                              ? <Check className="w-3 h-3 text-green-400" />
                              : <X className="w-3 h-3 text-gray-600" />
                            }
                          </div>
                          <span className={`text-sm ${included ? 'text-gray-200' : 'text-gray-600'}`}>
                            {label}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <Link href={plan.ctaHref} className={`${plan.ctaClass} py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all`}>
                      {plan.cta}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Compare table */}
          <div className="maritime-card overflow-hidden mb-20">
            <div className="p-6 border-b border-navy-700/40">
              <h2 className="font-display text-2xl font-bold text-white">{pr.compareTitle}</h2>
              <p className="text-gray-500 text-sm mt-1">{pr.compareDesc}</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-navy-700/40">
                    <th className="text-left p-5 text-gray-500 text-sm font-medium w-1/2">{pr.compareFeature}</th>
                    <th className="text-center p-5 text-ocean-400 text-sm font-bold">
                      <div className="flex items-center justify-center gap-1.5">
                        <Zap className="w-4 h-4" /> {pr.starter}
                      </div>
                    </th>
                    <th className="text-center p-5 text-white text-sm font-bold bg-ocean-500/5">
                      <div className="flex items-center justify-center gap-1.5">
                        <Shield className="w-4 h-4 text-ocean-400" /> {pr.pro}
                      </div>
                    </th>
                    <th className="text-center p-5 text-maritime-gold text-sm font-bold">
                      <div className="flex items-center justify-center gap-1.5">
                        <Crown className="w-4 h-4" /> {pr.enterprise}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_FEATURES.map(({ label, starter, pro, enterprise }, i) => (
                    <tr
                      key={label}
                      className={`border-b border-navy-700/30 last:border-0 ${
                        i % 2 === 0 ? 'bg-transparent' : 'bg-navy-800/20'
                      }`}
                    >
                      <td className="p-5 text-gray-300 text-sm">{label}</td>
                      <td className="p-5 text-center"><FeatureCell value={starter} /></td>
                      <td className="p-5 text-center bg-ocean-500/5"><FeatureCell value={pro} /></td>
                      <td className="p-5 text-center"><FeatureCell value={enterprise} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* FAQ / Bottom CTA */}
          <div className="maritime-card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-ocean-500/5 to-transparent" />
            <div className="relative z-10">
              <div className="w-16 h-16 bg-ocean-500/15 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Headphones className="w-8 h-8 text-ocean-400" />
              </div>
              <h2 className="font-display text-3xl font-bold text-white mb-3">{pr.ctaBoxTitle}</h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">{pr.ctaBoxDesc}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/register" className="btn-primary px-8 py-3 flex items-center justify-center gap-2">
                  {pr.trialBtn}<ArrowRight className="w-4 h-4" />
                </Link>
                <a href="mailto:info@marineportal.com" className="btn-secondary px-8 py-3 flex items-center justify-center gap-2">
                  {pr.demoBtn}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-navy-800/50 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-ocean-500 flex items-center justify-center">
              <Anchor className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-white font-display font-bold">
              Marine<span className="text-ocean-400">Portal</span>
            </span>
          </div>
          <p className="text-gray-600 text-sm">{pr.footer}</p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">{pr.privacy}</a>
            <a href="#" className="text-gray-600 hover:text-gray-400 text-sm transition-colors">{pr.terms}</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
