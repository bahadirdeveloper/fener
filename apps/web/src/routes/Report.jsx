import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { db } from '../lib/db.js'
import { getPosition } from '../lib/location.js'

const KINDS = [
  { id: 'damage', label: 'Yıkık / hasarlı', emoji: '🏚️', color: '#D63F2A' },
  { id: 'fire', label: 'Yangın', emoji: '🔥', color: '#E85D2A' },
  { id: 'flood', label: 'Sel / su', emoji: '🌊', color: '#2A8FD6' },
  { id: 'blocked', label: 'Yol kapalı', emoji: '🚧', color: '#E0A02A' },
  { id: 'safe', label: 'Güvenli alan', emoji: '✅', color: '#2F9E44' },
  { id: 'other', label: 'Diğer', emoji: '❕', color: '#C4A882' }
]

export default function Report() {
  const nav = useNavigate()
  const [kind, setKind] = useState('damage')
  const [note, setNote] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit() {
    setErr('')
    setBusy(true)
    try {
      const pos = await getPosition({ timeout: 8000 })
      await db.reports.add({
        kind,
        note: note.trim(),
        lat: pos.lat,
        lng: pos.lng,
        createdAt: Date.now()
      })
      nav('/harita')
    } catch (e) {
      setErr(e.message || 'Konum alınamadı')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Saha raporu</h2>
      <p className="text-sm opacity-70">
        Konumunu ve durumu kaydet. Harita'da pin olarak görünür.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {KINDS.map((k) => (
          <button
            key={k.id}
            onClick={() => setKind(k.id)}
            className={`rounded-xl p-4 font-semibold text-left flex items-center gap-3 ${kind === k.id ? 'ring-2 ring-[--color-fener-gold]' : 'border border-[--color-fener-border]'} bg-[--color-fener-card]`}
          >
            <span className="text-2xl" aria-hidden>{k.emoji}</span>
            <span className="text-sm">{k.label}</span>
          </button>
        ))}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Kısa not (opsiyonel)"
        rows={3}
        className="rounded-xl p-3 bg-[--color-fener-card] border border-[--color-fener-border] text-sm"
      />

      {err && (
        <div className="text-sm text-[--color-fener-help]">{err}</div>
      )}

      <button
        onClick={submit}
        disabled={busy}
        className="rounded-xl p-4 bg-[--color-fener-gold] text-[--color-fener-bg] font-bold disabled:opacity-50"
      >
        {busy ? 'Kaydediliyor…' : 'Raporu kaydet'}
      </button>
    </div>
  )
}

export { KINDS as REPORT_KINDS }
