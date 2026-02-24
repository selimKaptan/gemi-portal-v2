'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin, Search, ChevronDown, X } from 'lucide-react'
import { TURKEY_PORTS } from '@/lib/ports'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

export default function PortCombobox({ value, onChange, placeholder = 'Liman ara...', required, disabled, className }: Props) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selectedPort = value ? TURKEY_PORTS.find(p => p.name === value) : null

  const filtered = query.length >= 1
    ? TURKEY_PORTS.filter(p => {
        const q = query.toUpperCase()
        return p.name.includes(q) || p.code.toUpperCase().includes(q)
      }).slice(0, 60)
    : TURKEY_PORTS.slice(0, 60)

  useEffect(() => { setHighlighted(0) }, [query])

  function handleSelect(portName: string) {
    onChange(portName)
    setQuery('')
    setOpen(false)
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
    setQuery('')
    inputRef.current?.focus()
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!open) { if (e.key === 'ArrowDown' || e.key === 'Enter') setOpen(true); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlighted(h => Math.min(h + 1, filtered.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlighted(h => Math.max(h - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (filtered[highlighted]) handleSelect(filtered[highlighted].name) }
    else if (e.key === 'Escape') { setOpen(false); setQuery('') }
  }

  useEffect(() => {
    if (!open || !listRef.current) return
    const el = listRef.current.querySelector(`[data-idx="${highlighted}"]`)
    el?.scrollIntoView({ block: 'nearest' })
  }, [highlighted, open])

  return (
    <div className={`relative ${className ?? ''}`}>
      {/* Trigger / Selected display */}
      {!open && (
        <button
          type="button"
          onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 10) }}
          disabled={disabled}
          className="input-maritime w-full flex items-center gap-2 text-left cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
          {selectedPort ? (
            <span className="flex-1 text-white text-sm truncate">
              {selectedPort.name}
              <span className="ml-2 text-gray-500 text-xs font-mono">{selectedPort.code}</span>
            </span>
          ) : (
            <span className="flex-1 text-gray-500 text-sm">{placeholder}</span>
          )}
          <div className="flex items-center gap-1 ml-auto">
            {selectedPort && (
              <span onClick={handleClear} className="p-0.5 hover:text-red-400 transition-colors">
                <X className="w-3.5 h-3.5" />
              </span>
            )}
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
        </button>
      )}

      {/* Search input (shown when open) */}
      {open && (
        <div className="input-maritime flex items-center gap-2 p-0 overflow-hidden">
          <Search className="w-4 h-4 text-gray-500 flex-shrink-0 ml-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Liman adı veya kodu yazın..."
            className="flex-1 bg-transparent border-none outline-none text-white text-sm py-2.5 pr-3 placeholder-gray-500"
            autoComplete="off"
          />
          {required && <input type="text" value={value} required readOnly className="sr-only" tabIndex={-1} />}
        </div>
      )}

      {/* Dropdown */}
      {open && (
        <div
          ref={listRef}
          className="absolute top-full left-0 right-0 mt-1 bg-navy-800 border border-navy-600/60 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto"
        >
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">Sonuç bulunamadı</div>
          ) : (
            filtered.map((port, idx) => (
              <button
                key={port.code}
                type="button"
                data-idx={idx}
                onMouseDown={() => handleSelect(port.name)}
                onMouseEnter={() => setHighlighted(idx)}
                className={`w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors first:rounded-t-xl last:rounded-b-xl ${
                  idx === highlighted ? 'bg-navy-700/80 text-white' : 'text-gray-300 hover:text-white hover:bg-navy-700/50'
                } ${port.name === value ? 'text-ocean-400' : ''}`}
              >
                <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                <span className="flex-1 truncate">{port.name}</span>
                <span className="text-gray-500 text-xs font-mono flex-shrink-0">{port.code}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
