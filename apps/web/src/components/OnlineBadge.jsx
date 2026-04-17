import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

function fmtDur(ms) {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}dk`
  const h = Math.floor(m / 60)
  return `${h}sa ${m % 60}dk`
}

export default function OnlineBadge() {
  const { t } = useTranslation()
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [since, setSince] = useState(null)
  const [, forceTick] = useState(0)
  const tickRef = useRef(null)

  useEffect(() => {
    const up = () => { setOnline(true); setSince(null) }
    const down = () => { setOnline(false); setSince(Date.now()) }
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    if (!online) setSince((s) => s ?? Date.now())
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])

  useEffect(() => {
    clearInterval(tickRef.current)
    if (!online && since) {
      tickRef.current = setInterval(() => forceTick((x) => x + 1), 1000)
    }
    return () => clearInterval(tickRef.current)
  }, [online, since])

  const label = online ? t('status.online') : t('status.offline')
  const dur = !online && since ? ` · ${fmtDur(Date.now() - since)}` : ''

  return (
    <span className="flex items-center gap-2 text-xs" aria-label={label}>
      <span
        className={`inline-block w-2 h-2 rounded-full ${online ? 'bg-[--color-fener-ok]' : 'bg-[--color-fener-help]'}`}
      />
      {label}{dur}
    </span>
  )
}
