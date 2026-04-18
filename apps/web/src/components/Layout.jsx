import { useEffect, useState } from 'react'
import { Outlet, useLocation, Link } from 'react-router-dom'
import OnlineBadge from './OnlineBadge.jsx'
import { onBeaconChange, getState as getBeaconState, stopBeacon } from '../lib/beacon.js'

export default function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const [beacon, setBeacon] = useState(getBeaconState())
  useEffect(() => onBeaconChange(setBeacon), [])

  return (
    <div className="min-h-full flex flex-col max-w-md mx-auto px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <header className="flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>🔦</span>
          <span className="font-bold tracking-wider">FENER</span>
        </Link>
        <div className="flex items-center gap-3">
          <OnlineBadge />
          <Link to="/ayarlar" aria-label="Ayarlar" className="text-xl leading-none">⚙️</Link>
        </div>
      </header>
      {beacon?.active && (
        <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-[--color-fener-help] text-white text-xs font-semibold mb-2">
          <span className="animate-pulse">🆘</span>
          <span className="flex-1">
            SOS beacon aktif — her {Math.round((beacon.periodMs || 30000) / 1000)} sn · {beacon.count || 0} gönderildi
          </span>
          <button onClick={() => stopBeacon()} className="underline">durdur</button>
        </div>
      )}
      {!isHome && (
        <div className="mb-2">
          <Link to="/" className="text-sm text-[--color-fener-gold] underline">← Ana ekran</Link>
        </div>
      )}
      <main className="flex-1 flex flex-col pb-6">
        <Outlet />
      </main>
      <footer className="text-center text-xs opacity-50 py-3">
        Fener · Silifke Teknoloji Topluluğu · Apache-2.0
      </footer>
    </div>
  )
}
