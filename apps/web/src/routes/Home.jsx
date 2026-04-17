import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="flex flex-col gap-4 flex-1">
      <div className="text-center pt-2 pb-4">
        <h1 className="text-3xl font-bold">Silifke Acil İletişim</h1>
        <p className="text-sm opacity-70 mt-1">İnternet olmasa da çalışır.</p>
      </div>

      <Link to="/durum?t=ok" className="big-btn big-btn-ok" aria-label="Ben iyiyim">
        <span className="text-5xl" aria-hidden>👋</span>
        <span>BEN İYİYİM</span>
      </Link>

      <Link to="/durum?t=help" className="big-btn big-btn-help" aria-label="Yardım lazım">
        <span className="text-5xl" aria-hidden>🆘</span>
        <span>YARDIM LAZIM</span>
      </Link>

      <Link to="/kart" className="big-btn big-btn-card" aria-label="Acil bilgilerim">
        <span className="text-5xl" aria-hidden>🪪</span>
        <span>ACİL BİLGİLERİM</span>
      </Link>

      <div className="flex gap-2 mt-4">
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
      </div>
    </div>
  )
}
