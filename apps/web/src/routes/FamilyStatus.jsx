import { useLiveQuery } from 'dexie-react-hooks'
import { useTranslation } from 'react-i18next'
import { db } from '../lib/db.js'

const STATES = [
  { id: 'ok', label: 'İyi', color: '#2F9E44', emoji: '✅' },
  { id: 'help', label: 'Yardım', color: '#D63F2A', emoji: '🆘' },
  { id: 'unknown', label: 'Bilinmiyor', color: '#C4A882', emoji: '❓' }
]

function fmtAgo(ts) {
  if (!ts) return '—'
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s önce`
  if (s < 3600) return `${Math.floor(s / 60)}dk önce`
  if (s < 86400) return `${Math.floor(s / 3600)}sa önce`
  return `${Math.floor(s / 86400)}g önce`
}

export default function FamilyStatus() {
  const { t } = useTranslation()
  const family = useLiveQuery(() => db.family.toArray(), []) ?? []

  async function setStatus(id, s) {
    await db.family.update(id, { lastStatus: s, lastStatusAt: Date.now() })
  }

  const counts = STATES.reduce((acc, s) => {
    acc[s.id] = family.filter((m) => (m.lastStatus || 'unknown') === s.id).length
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">{t('page.familyStatus')}</h2>
      <p className="text-sm opacity-70">
        Herkesle iletişim kurduğunda durumlarını işaretle. WhatsApp veya telefonla doğrula.
      </p>

      <div className="grid grid-cols-3 gap-2">
        {STATES.map((s) => (
          <div
            key={s.id}
            className="rounded-xl p-3 bg-[--color-fener-card] border border-[--color-fener-border] text-center"
          >
            <div className="text-2xl" aria-hidden>{s.emoji}</div>
            <div className="text-xs opacity-70">{s.label}</div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{counts[s.id]}</div>
          </div>
        ))}
      </div>

      {family.length === 0 ? (
        <div className="text-sm opacity-60 text-center py-4">
          Henüz aile üyesi yok. <a href="/aile" className="underline">Ekle →</a>
        </div>
      ) : (
        <ul className="flex flex-col gap-2">
          {family.map((m) => {
            const cur = m.lastStatus || 'unknown'
            const meta = STATES.find((s) => s.id === cur)
            return (
              <li key={m.id} className="rounded-xl p-3 bg-[--color-fener-card] border border-[--color-fener-border]">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div>
                    <div className="font-semibold">{m.name}</div>
                    <div className="text-xs opacity-70">
                      {meta.emoji} {meta.label} · {fmtAgo(m.lastStatusAt)}
                    </div>
                  </div>
                  {m.phone && (
                    <a
                      href={`tel:${m.phone}`}
                      className="text-xs px-3 py-2 rounded-lg bg-[--color-fener-gold] text-[--color-fener-bg] font-bold"
                    >
                      📞 Ara
                    </a>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {STATES.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setStatus(m.id, s.id)}
                      className={`rounded-lg py-2 text-sm font-semibold ${cur === s.id ? 'ring-2 ring-[--color-fener-gold]' : 'border border-[--color-fener-border]'}`}
                      style={{ background: cur === s.id ? s.color : 'transparent', color: cur === s.id ? '#fff' : undefined }}
                    >
                      {s.emoji} {s.label}
                    </button>
                  ))}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
