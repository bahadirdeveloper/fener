import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { haptic } from '../lib/prefs.js'
import { useLiveQuery } from 'dexie-react-hooks'
import QuickDial from '../components/QuickDial.jsx'
import { startBeacon } from '../lib/beacon.js'
import { db } from '../lib/db.js'

function fmtAgo(ms) {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s önce`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}dk önce`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}sa önce`
  return `${Math.floor(h / 24)}g önce`
}

function kitPct() {
  try {
    const raw = localStorage.getItem('fener.kit.v1')
    if (!raw) return 0
    const s = JSON.parse(raw)
    const TOTAL = 22
    const done = Object.values(s).filter(Boolean).length
    return Math.min(100, Math.round((done / TOTAL) * 100))
  } catch { return 0 }
}

export default function Home() {
  const nav = useNavigate()
  const { t } = useTranslation()
  const pressTimer = useRef(null)
  const longFired = useRef(false)
  const [kit, setKit] = useState(0)
  useEffect(() => { setKit(kitPct()) }, [])
  const lastOk = useLiveQuery(
    () => db.outbox.where('type').equals('status:ok').reverse().sortBy('createdAt').then((r) => r[0]),
    []
  )
  const recentReports = useLiveQuery(
    () => db.reports.where('createdAt').above(Date.now() - 86400000).count(),
    []
  ) ?? 0

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
        <h1 className="text-3xl font-bold">{t('app.tagline')}</h1>
        <p className="text-sm opacity-70 mt-1">{t('app.subline')}</p>
      </div>

      <Link to="/durum?t=ok" onClick={() => haptic(20)} className="big-btn big-btn-ok" aria-label={t('home.imOk')}>
        <span className="text-5xl" aria-hidden>👋</span>
        <span>{t('home.imOk')}</span>
        {lastOk?.createdAt && (
          <span className="text-[10px] opacity-80 font-normal">
            Son: {fmtAgo(Date.now() - lastOk.createdAt)}
          </span>
        )}
      </Link>

      <button
        onPointerDown={onHelpDown}
        onPointerUp={onHelpUp}
        onPointerLeave={() => clearTimeout(pressTimer.current)}
        className="big-btn big-btn-help"
        aria-label={t('home.needHelp')}
      >
        <span className="text-5xl" aria-hidden>🆘</span>
        <span>{t('home.needHelp')}</span>
        <span className="text-[10px] opacity-80 font-normal">{t('home.needHelpHint')}</span>
      </button>

      <Link to="/kart" className="big-btn big-btn-card" aria-label={t('home.card')}>
        <span className="text-5xl" aria-hidden>🪪</span>
        <span>{t('home.card')}</span>
      </Link>

      <QuickDial />

      <div className="grid grid-cols-3 gap-2 mt-2">
        {[
          ['/harita', '🗺️', t('home.map')],
          ['/aile', '👨‍👩‍👧', t('home.family')],
          ['/rapor', '🚩', t('home.report')],
          ['/rehber', '📖', t('home.guide')],
          ['/pusula', '🧭', t('home.compass')],
          ['/ilkyardim', '🚑', t('home.firstAid')],
          ['/dudluk', '📢', t('home.whistle')],
          ['/sessiz-sos', '🆘', t('home.silentSos')],
          ['/isik', '🔦', t('home.flash')],
          ['/ses', '🎙️', t('home.voice')],
          ['/oku', '📷', t('home.scan')],
          ['/alfabe', '📻', t('home.alphabet')],
          ['/noktalarim', '⭐', t('home.points')],
          ['/giden', '📤', t('home.outbox')],
          ['/ble', '📡', t('home.near')],
          ['/hazirlik', '🎒', t('home.kit')]
        ].map(([to, emoji, label]) => (
          <Link key={to} to={to} className="small-btn min-h-[4.5rem] relative">
            <span className="text-2xl" aria-hidden>{emoji}</span>
            <span>{label}</span>
            {to === '/hazirlik' && kit > 0 && (
              <span
                className="absolute top-1 right-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[--color-fener-gold] text-[--color-fener-bg] font-bold"
                aria-label={`Hazırlık yüzde ${kit}`}
              >
                %{kit}
              </span>
            )}
            {to === '/rapor' && recentReports > 0 && (
              <span
                className="absolute top-1 right-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[--color-fener-help] text-white font-bold"
                aria-label={`Son 24 saatte ${recentReports} rapor`}
              >
                {recentReports}
              </span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
