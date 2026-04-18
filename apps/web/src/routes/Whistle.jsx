import { useEffect, useRef, useState } from 'react'
import { acquireWakeLock, releaseWakeLock } from '../lib/wakeLock.js'

const FREQ = 3000
const PATTERN = [
  { on: 400 }, { off: 200 },
  { on: 400 }, { off: 200 },
  { on: 400 }, { off: 1200 }
]

export default function Whistle() {
  const ctxRef = useRef(null)
  const oscRef = useRef(null)
  const gainRef = useRef(null)
  const timerRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => () => stop(), [])

  async function ensureCtx() {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return null
      ctxRef.current = new Ctx()
    }
    if (ctxRef.current.state === 'suspended') {
      try { await ctxRef.current.resume() } catch { /* noop */ }
    }
    return ctxRef.current
  }

  async function loop() {
    const ctx = await ensureCtx()
    if (!ctx) { setErr('Tarayıcı ses üretmeyi desteklemiyor.'); setPlaying(false); return }
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'square'
    osc.frequency.value = FREQ
    gain.gain.value = 0
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    oscRef.current = osc
    gainRef.current = gain

    let i = 0
    const step = () => {
      const s = PATTERN[i % PATTERN.length]
      if (s.on != null) {
        gain.gain.setValueAtTime(0.9, ctx.currentTime)
        timerRef.current = setTimeout(() => { i++; step() }, s.on)
      } else {
        gain.gain.setValueAtTime(0, ctx.currentTime)
        timerRef.current = setTimeout(() => { i++; step() }, s.off)
      }
    }
    step()
  }

  async function start() {
    if (playing) return
    setErr('')
    setPlaying(true)
    acquireWakeLock()
    try {
      await loop()
    } catch (e) {
      setErr(e?.message || 'Ses başlatılamadı')
      setPlaying(false)
    }
  }

  function stop() {
    setPlaying(false)
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    try { oscRef.current?.stop() } catch { /* noop */ }
    try { gainRef.current?.disconnect() } catch { /* noop */ }
    oscRef.current = null
    gainRef.current = null
    releaseWakeLock()
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Enkaz Düdüğü</h2>
      <p className="text-base opacity-80">
        Enkaz altında sesinin duyulmasına yardım eder. Telefonun sessiz tuşunu kapat, sesi sonuna kadar aç, hoparlörü üste çevir.
      </p>
      {err && (
        <div className="rounded-xl p-3 bg-[--color-fener-help]/20 border border-[--color-fener-help] text-sm">
          {err}
        </div>
      )}
      <div className="text-xs opacity-60">
        iPhone'da sessize alma (yan tuş) varsa ses çıkmaz. Android'de medya sesini aç.
      </div>

      {playing ? (
        <button onClick={stop} className="big-btn big-btn-help">
          <span className="text-5xl">⏹</span>
          <span>DURDUR</span>
        </button>
      ) : (
        <button onClick={start} className="big-btn big-btn-card">
          <span className="text-5xl">📢</span>
          <span>ÇAL</span>
        </button>
      )}

      <div className="text-xs opacity-60 text-center">
        ⚠️ Pil ve kulak sağlığı için gerçek acil durumda kullan.
      </div>
    </div>
  )
}
