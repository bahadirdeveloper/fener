import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { acquireWakeLock, releaseWakeLock } from '../lib/wakeLock.js'

// Enkaz altı senaryosu için minimum enerji + maksimum fark edilme.
// SOS kalıbı: · · · — — — · · ·  (kısa-kısa-kısa, uzun-uzun-uzun, kısa-kısa-kısa)
const SOS_VIBRATE = [200, 100, 200, 100, 200, 300, 500, 100, 500, 100, 500, 300, 200, 100, 200, 100, 200, 1500]

export default function SilentSos() {
  const { t } = useTranslation()
  const [active, setActive] = useState(false)
  const [tick, setTick] = useState(0)
  const audioCtxRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => () => stop(), [])

  function beep() {
    try {
      if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)()
      const ctx = audioCtxRef.current
      const now = ctx.currentTime
      // SOS audio: 3 short, 3 long, 3 short
      const pattern = [
        [0.15, 0],
        [0.15, 0.3],
        [0.15, 0.6],
        [0.45, 1.1],
        [0.45, 1.8],
        [0.45, 2.5],
        [0.15, 3.3],
        [0.15, 3.6],
        [0.15, 3.9]
      ]
      pattern.forEach(([dur, off]) => {
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = 3000
        gain.gain.setValueAtTime(0, now + off)
        gain.gain.linearRampToValueAtTime(0.6, now + off + 0.01)
        gain.gain.setValueAtTime(0.6, now + off + dur - 0.02)
        gain.gain.linearRampToValueAtTime(0, now + off + dur)
        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start(now + off)
        osc.stop(now + off + dur)
      })
    } catch { /* noop */ }
  }

  async function start() {
    await acquireWakeLock()
    setActive(true)
    setTick(0)
    const run = () => {
      try { navigator.vibrate?.(SOS_VIBRATE) } catch { /* noop */ }
      beep()
      setTick((t) => t + 1)
    }
    run()
    intervalRef.current = setInterval(run, 8000)
  }

  function stop() {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
    try { navigator.vibrate?.(0) } catch { /* noop */ }
    try { audioCtxRef.current?.close() } catch { /* noop */ }
    audioCtxRef.current = null
    releaseWakeLock()
    setActive(false)
  }

  if (active) {
    return (
      <div className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-center text-center gap-6 p-6">
        <div className="text-6xl animate-pulse" aria-hidden>🆘</div>
        <div className="text-[--color-fener-gold] text-xl font-bold">SESSİZ SOS AKTİF</div>
        <div className="text-[--color-fener-cream]/70 text-sm max-w-xs">
          Her 8 saniyede bir Mors SOS titreşim ve 3 kHz düdük. Ekran açık kalır.
        </div>
        <div className="text-[--color-fener-gold-bright] text-xs">Sinyal #{tick}</div>
        <button
          onClick={stop}
          className="mt-8 rounded-2xl px-8 py-5 bg-[--color-fener-help] text-white font-bold text-lg"
        >
          ⏹ Durdur
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">{t('page.silentSos')}</h2>
      <p className="text-sm opacity-80">
        Enkaz altı ya da saklanma senaryosu için düşük pil kullanımlı mod. Ekran kapanmaz,
        her 8 saniyede Mors "SOS" titreşim + kısa düdük çıkarır. Sesli alarma göre daha
        uzun dayanır.
      </p>
      <div className="rounded-xl p-4 bg-[--color-fener-card] border border-[--color-fener-border] text-xs opacity-80">
        <ul className="list-disc ml-5 flex flex-col gap-1">
          <li>Telefonu sert yüzeye koy — titreşim daha uzağa gider.</li>
          <li>Gerekirse tuşa basılı tutup düdük modu ile dönüşümlü kullan.</li>
          <li>Pili uzatmak için parlaklık en düşük, kablosuz bağlantılar kapalı olsun.</li>
        </ul>
      </div>
      <button
        onClick={start}
        className="rounded-2xl p-6 bg-[--color-fener-help] text-white font-extrabold text-2xl"
      >
        🆘 SESSİZ SOS'U BAŞLAT
      </button>
    </div>
  )
}
