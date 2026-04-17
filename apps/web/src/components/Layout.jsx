import { Outlet, useLocation, Link } from 'react-router-dom'
import OnlineBadge from './OnlineBadge.jsx'

export default function Layout() {
  const location = useLocation()
  const isHome = location.pathname === '/'

  return (
    <div className="min-h-full flex flex-col max-w-md mx-auto px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <header className="flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl" aria-hidden>🔦</span>
          <span className="font-bold tracking-wider">FENER</span>
        </Link>
        <OnlineBadge />
      </header>
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
