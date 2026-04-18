import { useEffect, useState } from 'react'

// Sadece düşük pilde (≤30%) uyarı gösterir; Chrome/Edge/Android'de çalışır,
// iOS Safari desteklemiyor — sessizce gizlenir.
export default function BatteryBadge() {
  const [info, setInfo] = useState(null)

  useEffect(() => {
    if (!navigator.getBattery) return
    let battery
    let detach = () => {}
    navigator.getBattery().then((b) => {
      battery = b
      const update = () => setInfo({ level: b.level, charging: b.charging })
      update()
      b.addEventListener('levelchange', update)
      b.addEventListener('chargingchange', update)
      detach = () => {
        b.removeEventListener('levelchange', update)
        b.removeEventListener('chargingchange', update)
      }
    }).catch(() => {})
    return () => detach()
  }, [])

  if (!info) return null
  const pct = Math.round(info.level * 100)
  if (pct > 30 && !info.charging) return null
  const low = pct <= 15 && !info.charging
  const icon = info.charging ? '⚡' : low ? '🪫' : '🔋'
  return (
    <span
      className={`flex items-center gap-1 text-xs ${low ? 'text-[--color-fener-help] font-semibold' : 'opacity-70'}`}
      aria-label={`Pil ${pct}%${info.charging ? ' şarjda' : ''}`}
    >
      <span aria-hidden>{icon}</span>
      <span>{pct}%</span>
    </span>
  )
}
