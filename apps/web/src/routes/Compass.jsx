import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getPosition } from '../lib/location.js'
import { nearestShelter, haversineKm } from '../data/shelters.js'

function bearing(from, to) {
  const toRad = (d) => d * Math.PI / 180
  const toDeg = (r) => r * 180 / Math.PI
  const [lng1, lat1] = from
  const [lng2, lat2] = to
  const φ1 = toRad(lat1), φ2 = toRad(lat2)
  const Δλ = toRad(lng2 - lng1)
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  return (toDeg(Math.atan2(y, x)) + 360) % 360
}

export default function Compass() {
  const { t } = useTranslation()
  const [pos, setPos] = useState(null)
  const [target, setTarget] = useState(null)
  const [heading, setHeading] = useState(null)
  const [permErr, setPermErr] = useState('')
  const [listening, setListening] = useState(false)

  useEffect(() => {
    (async () => {
      try {
        const p = await getPosition()
        setPos(p)
        const near = nearestShelter([p.lng, p.lat])
        setTarget({
          name: near.feature.properties.name,
          coord: near.feature.geometry.coordinates,
          distanceKm: near.distanceKm
        })
      } catch (e) {
        setPermErr(e.message || 'Konum alınamadı')
      }
    })()
  }, [])

  async function startOrient() {
    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && DeviceOrientationEvent.requestPermission) {
        const r = await DeviceOrientationEvent.requestPermission()
        if (r !== 'granted') throw new Error('Yön sensörü izin verilmedi')
      }
      const handler = (e) => {
        const h = e.webkitCompassHeading ?? (e.alpha != null ? 360 - e.alpha : null)
        if (h != null) setHeading(h)
      }
      window.addEventListener('deviceorientationabsolute', handler, true)
      window.addEventListener('deviceorientation', handler, true)
      setListening(true)
    } catch (e) {
      setPermErr(e.message || 'Pusula hatası')
    }
  }

  const bear = pos && target ? bearing([pos.lng, pos.lat], target.coord) : null
  const rel = bear != null && heading != null ? (bear - heading + 360) % 360 : bear

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">{t('page.compass')}</h2>
      {permErr && <div className="text-sm text-[--color-fener-help]">{permErr}</div>}

      {target && (
        <div className="text-center">
          <div className="text-xs uppercase tracking-wider opacity-70">En yakın toplanma</div>
          <div className="text-lg font-bold">{target.name}</div>
          <div className="text-sm opacity-80">{target.distanceKm.toFixed(2)} km · ~{Math.round(target.distanceKm * 12)} dk</div>
        </div>
      )}

      <div className="mx-auto w-64 h-64 rounded-full bg-[--color-fener-card] border border-[--color-fener-border] flex items-center justify-center relative">
        {rel != null ? (
          <div
            className="absolute inset-0 flex items-center justify-center transition-transform"
            style={{ transform: `rotate(${rel}deg)` }}
          >
            <div className="flex flex-col items-center">
              <div className="text-6xl" style={{ lineHeight: 1 }}>⬆️</div>
              <div className="text-xs opacity-70 mt-1">hedef</div>
            </div>
          </div>
        ) : (
          <div className="text-sm opacity-60">Konum bekleniyor…</div>
        )}
      </div>

      {!listening && (
        <button
          onClick={startOrient}
          className="rounded-xl p-3 bg-[--color-fener-gold] text-[--color-fener-bg] font-bold"
        >
          🧭 Pusula sensörünü aç
        </button>
      )}
      {!listening && rel != null && (
        <div className="text-xs opacity-60 text-center">
          Sensör açık değil — ok kuzey'e göre yön gösterir. Gerçek pusula için butona dokun.
        </div>
      )}
    </div>
  )
}
