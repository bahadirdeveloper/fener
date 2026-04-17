import { useEffect, useRef, useState } from 'react'
import { acquireWakeLock, releaseWakeLock } from '../lib/wakeLock.js'

// Ekran strobe Mors SOS. Gece 400-500 m mesafeden görülebilir.
// Kısa = 250ms, uzun = 750ms, harfler arası 250ms, döngü arası 1500ms.
const PATTERN = [
  250, 250, 250, 250, 250,
  750, 250, 750, 250, 750,
  250, 250, 250, 250, 250,
  1500
]

export default function Flash() {
  const [on, setOn] = useState(false)
  const [active, setActive] = useState(false)
  const timers = useRef([])

  useEffect(() => () => {
    stop()
  }, [])

  async function start() {
    await acquireWakeLock()
    setActive(true)
    loop(0)
  }

  function loop(i) {
    if (i >= PATTERN.length) i = 0
    const litIndex = i % 2 === 0
    setOn(litIndex)
    const t = setTimeout(() => loop(i + 1), PATTERN[i])
    timers.current.push(t)
  }

  function stop() {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setOn(false)
    setActive(false)
    releaseWakeLock()
  }

  if (active) {
    return (
      <div
        onClick={stop}
        className="fixed inset-0 z-50 flex items-center justify-center text-center cursor-pointer"
        style={{ background: on ? '#FFFFFF' : '#000000' }}
      >
        <div style={{ color: on ? '#000' : '#F5D78E' }} className="text-sm font-mono">
          {on ? 'SOS' : '·  ·  ·'}
          <div className="text-xs opacity-60 mt-2">dokun → durdur</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Işık SOS</h2>
      <p className="text-sm opacity-80">
        Ekran Mors alfabesinde SOS yanıp söner. Karanlıkta arama kurtarma için yardımcı olur.
      </p>
      <div className="rounded-xl p-4 bg-[--color-fener-card] border border-[--color-fener-border] text-xs opacity-80">
        İpucu: telefonu yüzü yukarı bakacak şekilde görülebilir bir yere koy. Parlaklığı maksimuma al.
      </div>
      <button
        onClick={start}
        className="rounded-2xl p-6 bg-[--color-fener-gold] text-[--color-fener-bg] font-extrabold text-xl"
      >
        🔦 IŞIKLI SOS'U BAŞLAT
      </button>
    </div>
  )
}
