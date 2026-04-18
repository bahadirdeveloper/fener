import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db.js'

const TYPE_META = {
  ok: { emoji: '✅', label: 'İyiyim' },
  help: { emoji: '🆘', label: 'Yardım' },
  sos: { emoji: '🆘', label: 'SOS' },
  ping: { emoji: '📡', label: 'Ping' },
  chat: { emoji: '💬', label: 'Mesaj' },
  voice: { emoji: '🎙️', label: 'Ses' },
  damage: { emoji: '🏚️', label: 'Yıkık' },
  fire: { emoji: '🔥', label: 'Yangın' },
  flood: { emoji: '🌊', label: 'Sel' },
  blocked: { emoji: '🚧', label: 'Yol kapalı' },
  safe: { emoji: '✅', label: 'Güvenli' },
  quake: { emoji: '📳', label: 'Sarsıntı' },
  other: { emoji: '❕', label: 'Diğer' }
}

function parseType(raw) {
  if (!raw) return { key: 'other', emoji: '❕', label: 'Bilinmiyor', incoming: false }
  const incoming = raw.startsWith('ble-in:')
  const parts = raw.split(':')
  const key = parts[parts.length - 1]
  const meta = TYPE_META[key] || { emoji: '❕', label: key }
  return { key, emoji: meta.emoji, label: meta.label, incoming }
}

const FILTERS = [
  { id: 'all', label: 'Tümü' },
  { id: 'pending', label: 'Bekleyen' },
  { id: 'sent', label: 'Gönderilen' },
  { id: 'incoming', label: 'Gelen' }
]

export default function Outbox() {
  const [filter, setFilter] = useState('all')
  const items = useLiveQuery(
    () => db.outbox.orderBy('createdAt').reverse().limit(100).toArray(),
    []
  ) ?? []

  const filtered = items.filter((m) => {
    if (filter === 'pending') return m.status !== 'sent'
    if (filter === 'sent') return m.status === 'sent'
    if (filter === 'incoming') return typeof m.type === 'string' && m.type.startsWith('ble-in:')
    return true
  })

  async function clearAll() {
    if (!confirm('Tüm outbox silinsin mi?')) return
    await db.outbox.clear()
  }

  async function clearSent() {
    await db.outbox.where('status').equals('sent').delete()
  }

  async function markSent(id) {
    await db.outbox.update(id, { status: 'sent', sentAt: Date.now() })
  }

  async function retry(id) {
    await db.outbox.update(id, { status: 'pending', sentAt: null })
  }

  const pending = items.filter((m) => m.status !== 'sent').length
  const sent = items.length - pending

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Giden Kutusu</h2>
        {items.length > 0 && (
          <div className="flex gap-1">
            {sent > 0 && (
              <button onClick={clearSent} className="text-xs px-2 py-1 rounded bg-[--color-fener-card] border border-[--color-fener-border]">
                Gönderilenleri sil
              </button>
            )}
            <button onClick={clearAll} className="text-xs px-2 py-1 rounded bg-[--color-fener-help] text-white">
              Hepsini sil
            </button>
          </div>
        )}
      </div>
      <div className="flex gap-2 text-xs">
        <span className="px-2 py-1 rounded bg-[--color-fener-card] border border-[--color-fener-border]">
          Bekleyen: <strong>{pending}</strong>
        </span>
        <span className="px-2 py-1 rounded bg-[--color-fener-card] border border-[--color-fener-border]">
          Gönderilen: <strong>{sent}</strong>
        </span>
      </div>
      <p className="text-sm opacity-70">
        Son 100 kayıt. Faz 2'de BLE/LoRa ağa gönderilecek.
      </p>

      <div className="flex gap-1 overflow-x-auto -mx-1 px-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${filter === f.id ? 'bg-[--color-fener-gold] text-[--color-fener-bg] font-semibold' : 'bg-[--color-fener-card] border border-[--color-fener-border]'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-sm opacity-50 text-center py-10">
          {items.length === 0 ? 'Henüz mesaj yok.' : 'Bu filtrede kayıt yok.'}
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {filtered.map((m) => {
          let envelope = null
          try {
            if (typeof m.text === 'string' && m.text.startsWith('{'))
              envelope = JSON.parse(m.text)
          } catch { /* noop */ }
          const t = parseType(m.type)
          const badge = t.key === 'ok' || t.key === 'safe' ? 'bg-[--color-fener-ok]' :
                        t.key === 'help' || t.key === 'sos' || t.key === 'fire' || t.key === 'damage' ? 'bg-[--color-fener-help]' :
                        'bg-[--color-fener-gold]'
          return (
            <li key={m.id} className="rounded-xl p-3 bg-[--color-fener-card] border border-[--color-fener-border]">
              <div className="flex items-center justify-between mb-1">
                <span className={`${badge} text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded text-black flex items-center gap-1`}>
                  <span aria-hidden>{t.emoji}</span>
                  {t.label}
                  {t.incoming && <span className="opacity-70">· gelen</span>}
                </span>
                <span className="text-xs opacity-60">
                  {new Date(m.createdAt).toLocaleString('tr-TR')}
                </span>
              </div>
              {envelope?.body ? (
                <>
                  <pre className="whitespace-pre-wrap text-xs font-sans opacity-90 mt-1">{envelope.body}</pre>
                  <div className="text-[10px] opacity-50 mt-2 font-mono break-all">
                    from {envelope.from} · {envelope.alg}
                  </div>
                </>
              ) : (
                <pre className="whitespace-pre-wrap text-xs font-sans">{m.text}</pre>
              )}
              {m.lat != null && (
                <div className="text-[10px] opacity-50 mt-1">
                  📍 {m.lat.toFixed(4)}, {m.lng.toFixed(4)}
                </div>
              )}
              <div className="flex items-center justify-between mt-1">
                <div className="text-[10px] opacity-60">
                  Durum: {m.status || 'pending'}
                  {m.sentAt && ` · ${new Date(m.sentAt).toLocaleTimeString('tr-TR')}`}
                </div>
                <div className="flex gap-1">
                  {m.status === 'sent' ? (
                    <button onClick={() => retry(m.id)} className="text-[10px] px-2 py-0.5 rounded bg-[--color-fener-card] border border-[--color-fener-border]">
                      ↻ tekrar
                    </button>
                  ) : (
                    <button onClick={() => markSent(m.id)} className="text-[10px] px-2 py-0.5 rounded bg-[--color-fener-ok] text-white">
                      ✓ gönderildi
                    </button>
                  )}
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
