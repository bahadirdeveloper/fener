import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
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
  const { t } = useTranslation()
  const [on, setOn] = useState(false)
  const [active, setActive] = useState(false)
  const [mode, setMode] = useState('screen')
  const [torchErr, setTorchErr] = useState('')
  const timers = useRef([])
  const trackRef = useRef(null)

  useEffect(() => () => {
    stop()
  }, [])

  async function startScreen() {
    setMode('screen')
    await acquireWakeLock()
    setActive(true)
    loop(0)
  }

  async function startTorch() {
    setTorchErr('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      const track = stream.getVideoTracks()[0]
      const caps = track.getCapabilities?.() || {}
      if (!caps.torch) {
        track.stop()
        throw new Error('Bu cihazda torch desteklenmiyor — ekran modu kullan.')
      }
      trackRef.current = track
      setMode('torch')
      await acquireWakeLock()
      setActive(true)
      loop(0)
    } catch (e) {
      setTorchErr(e.message || 'Torch açılamadı')
    }
  }

  function loop(i) {
    if (i >= PATTERN.length) i = 0
    const lit = i % 2 === 0
    setOn(lit)
    if (trackRef.current) {
      trackRef.current.applyConstraints({ advanced: [{ torch: lit }] }).catch(() => {})
    }
    const tm = setTimeout(() => loop(i + 1), PATTERN[i])
    timers.current.push(tm)
  }

  function stop() {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setOn(false)
    setActive(false)
    releaseWakeLock()
    if (trackRef.current) {
      try { trackRef.current.applyConstraints({ advanced: [{ torch: false }] }) } catch { /* noop */ }
      try { trackRef.current.stop() } catch { /* noop */ }
      trackRef.current = null
    }
  }

  if (active && mode === 'screen') {
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

  if (active && mode === 'torch') {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center gap-6">
        <div className="text-6xl">{on ? '🔦' : '·'}</div>
        <div className="text-[--color-fener-gold] font-mono">TORCH SOS</div>
        <button
          onClick={stop}
          className="rounded-xl px-6 py-3 bg-[--color-fener-help] text-white font-bold"
        >
          DURDUR
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">{t('page.flash')}</h2>
      <p className="text-sm opacity-80">
        Mors alfabesinde SOS sinyali yanıp söner. Gece 400–500 m mesafeden görülebilir.
      </p>
      <div className="rounded-xl p-4 bg-[--color-fener-card] border border-[--color-fener-border] text-xs opacity-80">
        İpucu: telefonu görülebilir bir yere koy. Torch modunda pil daha hızlı biter; ekran modu alternatif.
      </div>
      <button
        onClick={startTorch}
        className="rounded-2xl p-6 bg-[--color-fener-gold] text-[--color-fener-bg] font-extrabold text-xl"
      >
        🔦 KAMERA IŞIĞI (TORCH) · SOS
      </button>
      <button
        onClick={startScreen}
        className="rounded-2xl p-5 bg-[--color-fener-card] border border-[--color-fener-gold] text-[--color-fener-cream] font-bold"
      >
        💡 EKRAN IŞIĞI · SOS
      </button>
      {torchErr && <div className="text-sm text-[--color-fener-help]">{torchErr}</div>}
    </div>
  )
}
