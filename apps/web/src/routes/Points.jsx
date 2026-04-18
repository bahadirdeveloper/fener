import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db.js'
import { getPosition } from '../lib/location.js'

const KINDS = [
  { id: 'home', label: 'Ev', emoji: '🏠' },
  { id: 'school', label: 'Okul', emoji: '🏫' },
  { id: 'work', label: 'İş', emoji: '🏢' },
  { id: 'family', label: 'Aile', emoji: '👨‍👩‍👧' },
  { id: 'meet', label: 'Buluşma', emoji: '📍' },
  { id: 'other', label: 'Diğer', emoji: '⭐' }
]

export default function Points() {
  const points = useLiveQuery(() => db.meetingPoints.toArray(), []) ?? []
  const [form, setForm] = useState({ name: '', kind: 'meet', lat: '', lng: '' })
  const [busy, setBusy] = useState(false)

  async function useCurrent() {
    setBusy(true)
    try {
      const p = await getPosition()
      setForm((f) => ({ ...f, lat: p.lat.toFixed(5), lng: p.lng.toFixed(5) }))
    } catch { /* ignore */ }
    setBusy(false)
  }

  async function add(e) {
    e.preventDefault()
    const lat = parseFloat(form.lat)
    const lng = parseFloat(form.lng)
    if (!form.name.trim() || isNaN(lat) || isNaN(lng)) return
    await db.meetingPoints.add({ name: form.name, kind: form.kind, lat, lng, priority: 0 })
    setForm({ name: '', kind: 'meet', lat: '', lng: '' })
  }

  async function remove(id) {
    await db.meetingPoints.delete(id)
  }

  async function importGeoJson(file) {
    try {
      const text = await file.text()
      const obj = JSON.parse(text)
      const feats = Array.isArray(obj?.features) ? obj.features : []
      let added = 0
      for (const f of feats) {
        const coords = f?.geometry?.coordinates
        if (f?.geometry?.type !== 'Point' || !Array.isArray(coords) || coords.length < 2) continue
        const [lng, lat] = coords
        if (typeof lat !== 'number' || typeof lng !== 'number') continue
        const name = f.properties?.name || f.properties?.label || `Nokta ${Date.now()}`
        const kind = KINDS.find((k) => k.id === f.properties?.kind)?.id || 'other'
        await db.meetingPoints.add({ name, kind, lat, lng, priority: 0 })
        added++
      }
      alert(`${added} nokta eklendi.`)
    } catch (e) {
      alert('GeoJSON okunamadı: ' + e.message)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Kendi Noktalarım</h2>
      <p className="text-sm opacity-70">
        Ev, okul, buluşma noktası… Afette haritada görünsün.
      </p>

      <form onSubmit={add} className="flex flex-col gap-2 rounded-xl p-3 bg-[--color-fener-card] border border-[--color-fener-border]">
        <input
          className="inp-p"
          placeholder="İsim (ör. Ev, Okul)"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <div className="grid grid-cols-3 gap-2">
          {KINDS.map((k) => (
            <button
              type="button"
              key={k.id}
              onClick={() => setForm({ ...form, kind: k.id })}
              className={`rounded-lg p-2 text-xs font-semibold flex flex-col items-center gap-1 ${form.kind === k.id ? 'bg-[--color-fener-gold] text-[--color-fener-bg]' : 'bg-[--color-fener-bg] border border-[--color-fener-border]'}`}
            >
              <span className="text-xl">{k.emoji}</span>
              <span>{k.label}</span>
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            className="inp-p flex-1"
            inputMode="decimal"
            placeholder="Enlem"
            value={form.lat}
            onChange={(e) => setForm({ ...form, lat: e.target.value })}
          />
          <input
            className="inp-p flex-1"
            inputMode="decimal"
            placeholder="Boylam"
            value={form.lng}
            onChange={(e) => setForm({ ...form, lng: e.target.value })}
          />
        </div>
        <button type="button" onClick={useCurrent} disabled={busy} className="rounded-lg p-2 text-sm bg-[--color-fener-bg] border border-[--color-fener-border]">
          📍 Mevcut konumumu kullan
        </button>
        <button type="submit" className="rounded-lg p-3 bg-[--color-fener-gold] text-[--color-fener-bg] font-bold">
          Ekle
        </button>
      </form>

      <div className="grid grid-cols-2 gap-2">
        <label className="rounded-lg p-3 bg-[--color-fener-card] border border-[--color-fener-border] text-sm font-semibold text-center cursor-pointer">
          📥 İçe aktar
          <input
            type="file"
            accept=".geojson,application/geo+json,application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importGeoJson(f)
              e.target.value = ''
            }}
          />
        </label>
        <button
          type="button"
          disabled={points.length === 0}
          onClick={() => {
            const geo = {
              type: 'FeatureCollection',
              features: points.map((p) => ({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
                properties: { name: p.name, kind: p.kind }
              }))
            }
            const blob = new Blob([JSON.stringify(geo, null, 2)], { type: 'application/geo+json' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `fener-noktalarim-${new Date().toISOString().slice(0, 10)}.geojson`
            a.click()
            URL.revokeObjectURL(url)
          }}
          className="rounded-lg p-3 bg-[--color-fener-card] border border-[--color-fener-border] text-sm font-semibold disabled:opacity-50"
        >
          💾 Dışa aktar
        </button>
      </div>

      <ul className="flex flex-col gap-2">
        {points.map((p) => {
          const k = KINDS.find((x) => x.id === p.kind) ?? KINDS[5]
          return (
            <li key={p.id} className="flex items-center gap-3 rounded-xl p-3 bg-[--color-fener-card] border border-[--color-fener-border]">
              <span className="text-2xl">{k.emoji}</span>
              <div className="flex-1">
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs opacity-70">{k.label} · {p.lat.toFixed(4)}, {p.lng.toFixed(4)}</div>
              </div>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs px-2 py-1 rounded bg-[--color-fener-bg] border border-[--color-fener-border]"
              >
                Yol
              </a>
              <button
                onClick={() => remove(p.id)}
                className="text-sm text-[--color-fener-help] px-2"
                aria-label="Sil"
              >
                Sil
              </button>
            </li>
          )
        })}
        {points.length === 0 && (
          <li className="text-center text-sm opacity-50 py-4">Henüz nokta yok.</li>
        )}
      </ul>

      <style>{`
        .inp-p {
          width: 100%;
          background: var(--color-fener-bg);
          border: 1px solid var(--color-fener-border);
          border-radius: 0.5rem;
          padding: 0.75rem;
          color: var(--color-fener-cream);
        }
        .inp-p:focus { outline: 2px solid var(--color-fener-gold); }
      `}</style>
    </div>
  )
}
