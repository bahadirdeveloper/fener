import { useEffect, useRef, useState } from 'react'

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

  useEffect(() => () => stop(), [])

  function ensureCtx() {
    if (!ctxRef.current) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      ctxRef.current = new Ctx()
    }
    return ctxRef.current
  }

  function loop() {
    const ctx = ensureCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
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
        gain.gain.setValueAtTime(1, ctx.currentTime)
        timerRef.current = setTimeout(() => { i++; step() }, s.on)
      } else {
        gain.gain.setValueAtTime(0, ctx.currentTime)
        timerRef.current = setTimeout(() => { i++; step() }, s.off)
      }
    }
    step()
  }

  function start() {
    if (playing) return
    setPlaying(true)
    loop()
  }

  function stop() {
    setPlaying(false)
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    try { oscRef.current?.stop() } catch { /* noop */ }
    try { gainRef.current?.disconnect() } catch { /* noop */ }
    oscRef.current = null
    gainRef.current = null
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Enkaz Düdüğü</h2>
      <p className="text-sm opacity-80">
        Enkaz altında sesin duyulmasına yardım eder. 3kHz frekansta darbeli sinyal çalar.
        Telefonun hoparlörünü kapatma, sesi sonuna kadar aç.
      </p>

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
