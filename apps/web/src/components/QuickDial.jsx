import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db.js'

const OFFICIAL = [
  { label: '112 Acil', phone: '112' },
  { label: 'AFAD', phone: '122' },
  { label: 'İtfaiye', phone: '110' },
  { label: 'Sahil', phone: '158' }
]

export default function QuickDial() {
  const family = useLiveQuery(() => db.family.toArray(), []) ?? []
  const primary = family.filter((f) => f.phone).slice(0, 2)

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs uppercase tracking-wider opacity-60">Hızlı ara</div>
      <div className="grid grid-cols-4 gap-2">
        {OFFICIAL.map((o) => (
          <a
            key={o.phone}
            href={`tel:${o.phone}`}
            className="rounded-xl py-3 bg-[--color-fener-help] text-white font-bold text-center text-xs"
          >
            📞<br />{o.label}
          </a>
        ))}
      </div>
      {primary.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {primary.map((f) => (
            <a
              key={f.id}
              href={`tel:${f.phone}`}
              className="rounded-xl py-3 bg-[--color-fener-card] border border-[--color-fener-border] font-semibold text-center text-sm"
            >
              📞 {f.name}
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
