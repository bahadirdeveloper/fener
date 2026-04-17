import { useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { haptic } from '../lib/prefs.js'
import QuickDial from '../components/QuickDial.jsx'
import { startBeacon } from '../lib/beacon.js'

export default function Home() {
  const nav = useNavigate()
  const pressTimer = useRef(null)
  const longFired = useRef(false)

  function onHelpDown() {
    longFired.current = false
    pressTimer.current = setTimeout(async () => {
      longFired.current = true
      haptic([50, 80, 50, 80, 200])
      try { await startBeacon({ kind: 'sos', periodMs: 30000 }) } catch { /* noop */ }
      nav('/durum?t=help&panic=1')
    }, 1500)
  }
  function onHelpUp() {
    clearTimeout(pressTimer.current)
    if (!longFired.current) {
      haptic([30, 40, 30])
      nav('/durum?t=help')
    }
  }

  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="text-center pt-2 pb-4">
        <h1 className="text-3xl font-bold">Silifke Acil İletişim</h1>
        <p className="text-sm opacity-70 mt-1">İnternet olmasa da çalışır.</p>
      </div>

      <Link to="/durum?t=ok" onClick={() => haptic(20)} className="big-btn big-btn-ok" aria-label="Ben iyiyim">
        <span className="text-5xl" aria-hidden>👋</span>
        <span>BEN İYİYİM</span>
      </Link>

      <button
        onPointerDown={onHelpDown}
        onPointerUp={onHelpUp}
        onPointerLeave={() => clearTimeout(pressTimer.current)}
        className="big-btn big-btn-help"
        aria-label="Yardım lazım — basılı tut panik modu"
      >
        <span className="text-5xl" aria-hidden>🆘</span>
        <span>YARDIM LAZIM</span>
        <span className="text-[10px] opacity-80 font-normal">basılı tut → otomatik SOS</span>
      </button>

      <Link to="/kart" className="big-btn big-btn-card" aria-label="Acil bilgilerim">
        <span className="text-5xl" aria-hidden>🪪</span>
        <span>ACİL BİLGİLERİM</span>
      </Link>

      <QuickDial />

      <div className="grid grid-cols-4 gap-2 mt-2">
        <Link to="/harita" className="small-btn">
          <span className="text-xl" aria-hidden>🗺️</span>
          <span>Harita</span>
        </Link>
        <Link to="/aile" className="small-btn">
          <span className="text-xl" aria-hidden>👨‍👩‍👧</span>
          <span>Aile</span>
        </Link>
        <Link to="/dudluk" className="small-btn">
          <span className="text-xl" aria-hidden>📢</span>
          <span>Düdük</span>
        </Link>
        <Link to="/rehber" className="small-btn">
          <span className="text-xl" aria-hidden>📖</span>
          <span>Rehber</span>
        </Link>
        <Link to="/oku" className="small-btn">
          <span className="text-xl" aria-hidden>📷</span>
          <span>Oku</span>
        </Link>
        <Link to="/noktalarim" className="small-btn">
          <span className="text-xl" aria-hidden>⭐</span>
          <span>Noktalar</span>
        </Link>
        <Link to="/giden" className="small-btn">
          <span className="text-xl" aria-hidden>📤</span>
          <span>Giden</span>
        </Link>
        <Link to="/rapor" className="small-btn">
          <span className="text-xl" aria-hidden>🚩</span>
          <span>Rapor</span>
        </Link>
        <Link to="/ses" className="small-btn">
          <span className="text-xl" aria-hidden>🎙️</span>
          <span>Ses</span>
        </Link>
        <Link to="/ble" className="small-btn">
          <span className="text-xl" aria-hidden>📡</span>
          <span>Yakın</span>
        </Link>
      </div>
    </div>
  )
}
