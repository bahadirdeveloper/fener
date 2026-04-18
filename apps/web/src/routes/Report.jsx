import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, pushOutbox } from '../lib/db.js'
import { getPosition, getLastKnownPosition } from '../lib/location.js'
import { signMessage } from '../lib/sign.js'

const KINDS = [
  { id: 'damage', label: 'Yıkık / hasarlı', emoji: '🏚️', color: '#D63F2A' },
  { id: 'fire', label: 'Yangın', emoji: '🔥', color: '#E85D2A' },
  { id: 'flood', label: 'Sel / su', emoji: '🌊', color: '#2A8FD6' },
  { id: 'blocked', label: 'Yol kapalı', emoji: '🚧', color: '#E0A02A' },
  { id: 'safe', label: 'Güvenli alan', emoji: '✅', color: '#2F9E44' },
  { id: 'quake', label: 'Sarsıntı hissettim', emoji: '📳', color: '#8C5AD6' },
  { id: 'other', label: 'Diğer', emoji: '❕', color: '#C4A882' }
]

export default function Report() {
  const { t } = useTranslation()
  const nav = useNavigate()
  const [kind, setKind] = useState('damage')
  const [note, setNote] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const past = useLiveQuery(() => db.reports.orderBy('createdAt').reverse().limit(20).toArray(), []) ?? []

  async function submit() {
    setErr('')
    setBusy(true)
    try {
      let pos
      try { pos = await getPosition({ timeout: 8000 }) } catch (e) {
        const last = getLastKnownPosition()
        if (!last) throw e
        pos = last
        setErr('Canlı konum yok; son bilinen nokta kullanıldı.')
      }
      const row = {
        kind,
        note: note.trim(),
        lat: pos.lat,
        lng: pos.lng,
        createdAt: Date.now()
      }
      await db.reports.add(row)
      try {
        const env = await signMessage({ v: 1, kind: 'report', sub: kind, note: row.note, lat: row.lat, lng: row.lng, t: row.createdAt })
        await pushOutbox({ type: `report:${kind}`, text: JSON.stringify(env), lat: row.lat, lng: row.lng })
      } catch { /* sign opsiyonel */ }
      nav('/harita')
    } catch (e) {
      setErr(e.message || 'Konum alınamadı')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">{t('page.report')}</h2>
      <p className="text-base opacity-80">
        Ne gördün? Seç, konum otomatik eklensin. Haritada herkes görür.
      </p>

      <div className="grid grid-cols-2 gap-2">
        {KINDS.map((k) => (
          <button
            key={k.id}
            onClick={() => setKind(k.id)}
            className={`rounded-xl p-4 font-semibold text-left flex items-center gap-3 min-h-[72px] ${kind === k.id ? 'ring-2 ring-[--color-fener-gold]' : 'border border-[--color-fener-border]'} bg-[--color-fener-card]`}
          >
            <span className="text-3xl" aria-hidden>{k.emoji}</span>
            <span className="text-base leading-tight">{k.label}</span>
          </button>
        ))}
      </div>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Kısa not yazabilirsin (zorunlu değil)"
        rows={3}
        className="rounded-xl p-3 bg-[--color-fener-card] border border-[--color-fener-border] text-base"
      />

      {err && (
        <div className="text-sm text-[--color-fener-help]">{err}</div>
      )}

      <button
        onClick={submit}
        disabled={busy}
        className="rounded-2xl py-4 bg-[--color-fener-gold] text-[--color-fener-bg] font-bold text-lg disabled:opacity-50 min-h-[56px]"
      >
        {busy ? 'Kaydediliyor…' : '✓ Raporu kaydet'}
      </button>

      {past.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase tracking-wider opacity-70">Geçmiş raporlar</div>
            <button
              onClick={() => {
                const geo = {
                  type: 'FeatureCollection',
                  features: past.map((r) => ({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [r.lng, r.lat] },
                    properties: { kind: r.kind, note: r.note, createdAt: r.createdAt }
                  }))
                }
                const blob = new Blob([JSON.stringify(geo, null, 2)], { type: 'application/geo+json' })
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `fener-raporlar-${new Date().toISOString().slice(0, 10)}.geojson`
                a.click()
                URL.revokeObjectURL(url)
              }}
              className="text-xs px-3 py-1 rounded-lg bg-[--color-fener-card] border border-[--color-fener-border] font-semibold"
            >
              💾 GeoJSON indir
            </button>
          </div>
          <ul className="flex flex-col gap-2">
            {past.map((r) => {
              const meta = KINDS.find((k) => k.id === r.kind)
              return (
                <li key={r.id} className="rounded-lg p-2 bg-[--color-fener-card] border border-[--color-fener-border] flex items-center gap-2 text-sm">
                  <span className="text-xl" aria-hidden>{meta?.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold">{meta?.label}</div>
                    <div className="text-xs opacity-70">
                      {new Date(r.createdAt).toLocaleString('tr-TR')} · {r.lat?.toFixed(4)}, {r.lng?.toFixed(4)}
                    </div>
                    {r.note && <div className="text-xs opacity-80 mt-1">{r.note}</div>}
                  </div>
                  <button
                    onClick={() => db.reports.delete(r.id)}
                    className="text-xs text-[--color-fener-help] px-2"
                    aria-label="Sil"
                  >
                    Sil
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export { KINDS as REPORT_KINDS }
