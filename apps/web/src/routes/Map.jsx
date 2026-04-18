import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useLiveQuery } from 'dexie-react-hooks'
import { osmRasterStyle } from '../lib/mapStyle.js'
import { SHELTERS, SILIFKE_CENTER, nearestShelter, haversineKm } from '../data/shelters.js'
import { HAZARDS, hazardAt } from '../data/hazards.js'
import { getPosition } from '../lib/location.js'
import { db } from '../lib/db.js'

export default function Map() {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const userMarkerRef = useRef(null)
  const [selected, setSelected] = useState(null)
  const [userLoc, setUserLoc] = useState(null)
  const [locError, setLocError] = useState('')
  const [hazardWarn, setHazardWarn] = useState(null)
  const [filters, setFilters] = useState({ shelters: true, hazards: true, reports: true, user: true })
  const userPoints = useLiveQuery(() => db.meetingPoints.toArray(), []) ?? []
  const reports = useLiveQuery(() => db.reports.toArray(), []) ?? []

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: osmRasterStyle,
      center: SILIFKE_CENTER,
      zoom: 12,
      attributionControl: { compact: true }
    })
    mapRef.current = map

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right')

    map.on('load', () => {
      map.addSource('guide-line', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      map.addLayer({
        id: 'guide-line',
        type: 'line',
        source: 'guide-line',
        paint: {
          'line-color': '#F5D78E',
          'line-width': 4,
          'line-dasharray': [1, 2]
        }
      })

      map.addSource('hazards', { type: 'geojson', data: HAZARDS })
      map.addLayer({
        id: 'hazards-fill',
        type: 'fill',
        source: 'hazards',
        paint: {
          'fill-color': [
            'match', ['get', 'kind'],
            'flood', '#2A8FD6',
            'tsunami', '#4FB3D9',
            'landslide', '#D6892A',
            'fire', '#D6452A',
            '#888'
          ],
          'fill-opacity': 0.18
        }
      })
      map.addLayer({
        id: 'hazards-line',
        type: 'line',
        source: 'hazards',
        paint: {
          'line-color': [
            'match', ['get', 'kind'],
            'flood', '#2A8FD6',
            'tsunami', '#4FB3D9',
            'landslide', '#D6892A',
            'fire', '#D6452A',
            '#888'
          ],
          'line-width': 1.5,
          'line-dasharray': [2, 2]
        }
      })
      map.on('click', 'hazards-fill', (e) => {
        const f = e.features?.[0]
        if (!f) return
        setSelected({
          name: f.properties.name,
          capacity: '-',
          notes: `Risk: ${f.properties.severity} · ${f.properties.kind}`,
          coordinates: [e.lngLat.lng, e.lngLat.lat]
        })
      })

      map.addSource('shelters', { type: 'geojson', data: SHELTERS })
      map.addSource('user-points', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      map.addSource('reports', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
      map.addLayer({
        id: 'reports-dot',
        type: 'circle',
        source: 'reports',
        paint: {
          'circle-radius': 9,
          'circle-color': [
            'match', ['get', 'kind'],
            'damage', '#D63F2A',
            'fire', '#E85D2A',
            'flood', '#2A8FD6',
            'blocked', '#E0A02A',
            'safe', '#2F9E44',
            'quake', '#8C5AD6',
            '#C4A882'
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#0A0A08'
        }
      })
      map.addLayer({
        id: 'reports-label',
        type: 'symbol',
        source: 'reports',
        layout: {
          'text-field': ['get', 'emoji'],
          'text-size': 14,
          'text-offset': [0, 0],
          'text-anchor': 'center',
          'text-font': ['Open Sans Regular'],
          'text-allow-overlap': true
        }
      })
      map.on('click', 'reports-dot', (e) => {
        const f = e.features?.[0]
        if (!f) return
        setSelected({
          name: f.properties.label,
          capacity: '-',
          notes: f.properties.note || 'Saha raporu',
          coordinates: f.geometry.coordinates
        })
      })
      map.addLayer({
        id: 'user-points-dot',
        type: 'circle',
        source: 'user-points',
        paint: {
          'circle-radius': 10,
          'circle-color': '#2F9E44',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#F5F0E8'
        }
      })
      map.addLayer({
        id: 'user-points-label',
        type: 'symbol',
        source: 'user-points',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 11,
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
          'text-font': ['Open Sans Regular']
        },
        paint: {
          'text-color': '#2F9E44',
          'text-halo-color': '#0A0A08',
          'text-halo-width': 1.5
        }
      })
      map.on('click', 'user-points-dot', (e) => {
        const f = e.features?.[0]
        if (!f) return
        setSelected({
          ...f.properties,
          coordinates: f.geometry.coordinates,
          notes: 'Kendi eklediğin nokta.'
        })
      })

      map.addLayer({
        id: 'shelters-halo',
        type: 'circle',
        source: 'shelters',
        paint: {
          'circle-radius': 18,
          'circle-color': '#C4A882',
          'circle-opacity': 0.15
        }
      })

      map.addLayer({
        id: 'shelters-dot',
        type: 'circle',
        source: 'shelters',
        paint: {
          'circle-radius': 8,
          'circle-color': '#F5D78E',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#0A0A08'
        }
      })

      map.addLayer({
        id: 'shelters-label',
        type: 'symbol',
        source: 'shelters',
        layout: {
          'text-field': ['get', 'name'],
          'text-size': 11,
          'text-offset': [0, 1.4],
          'text-anchor': 'top',
          'text-font': ['Open Sans Regular']
        },
        paint: {
          'text-color': '#F5F0E8',
          'text-halo-color': '#0A0A08',
          'text-halo-width': 1.5
        }
      })

      map.on('click', 'shelters-dot', (e) => {
        const f = e.features?.[0]
        if (!f) return
        setSelected({
          ...f.properties,
          coordinates: f.geometry.coordinates
        })
      })

      map.on('mouseenter', 'shelters-dot', () => {
        map.getCanvas().style.cursor = 'pointer'
      })
      map.on('mouseleave', 'shelters-dot', () => {
        map.getCanvas().style.cursor = ''
      })

      map.on('contextmenu', async (e) => {
        const name = prompt('Nokta adı (örn: Aile buluşma)')
        if (!name) return
        await db.meetingPoints.add({
          name: name.trim(),
          lat: e.lngLat.lat,
          lng: e.lngLat.lng,
          kind: 'meet',
          createdAt: Date.now()
        })
      })
    })

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    const src = map.getSource('user-points')
    if (!src) return
    src.setData({
      type: 'FeatureCollection',
      features: userPoints.map((p) => ({
        type: 'Feature',
        properties: { id: `u-${p.id}`, name: p.name, kind: p.kind || 'meet', custom: true },
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] }
      }))
    })
  }, [userPoints])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    const src = map.getSource('reports')
    if (!src) return
    const KIND_META = {
      damage: { emoji: '🏚️', label: 'Yıkık / hasarlı' },
      fire: { emoji: '🔥', label: 'Yangın' },
      flood: { emoji: '🌊', label: 'Sel / su' },
      blocked: { emoji: '🚧', label: 'Yol kapalı' },
      safe: { emoji: '✅', label: 'Güvenli alan' },
      quake: { emoji: '📳', label: 'Sarsıntı hissettim' },
      other: { emoji: '❕', label: 'Diğer' }
    }
    src.setData({
      type: 'FeatureCollection',
      features: reports.map((r) => {
        const m = KIND_META[r.kind] || KIND_META.other
        return {
          type: 'Feature',
          properties: { id: `r-${r.id}`, kind: r.kind, emoji: m.emoji, label: m.label, note: r.note },
          geometry: { type: 'Point', coordinates: [r.lng, r.lat] }
        }
      })
    })
  }, [reports])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    const src = map.getSource('guide-line')
    if (!src) return
    if (userLoc && selected?.coordinates) {
      src.setData({
        type: 'FeatureCollection',
        features: [{
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[userLoc.lng, userLoc.lat], selected.coordinates]
          },
          properties: {}
        }]
      })
    } else {
      src.setData({ type: 'FeatureCollection', features: [] })
    }
  }, [userLoc, selected])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !map.isStyleLoaded()) return
    const groups = {
      shelters: ['shelters-halo', 'shelters-dot', 'shelters-label'],
      hazards: ['hazards-fill', 'hazards-line'],
      reports: ['reports-dot', 'reports-label'],
      user: ['user-points-dot', 'user-points-label']
    }
    Object.entries(groups).forEach(([k, ids]) => {
      ids.forEach((id) => {
        if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', filters[k] ? 'visible' : 'none')
      })
    })
  }, [filters])

  async function locate() {
    setLocError('')
    try {
      const pos = await getPosition()
      setUserLoc(pos)
      const lngLat = [pos.lng, pos.lat]
      const map = mapRef.current
      if (!map) return
      if (userMarkerRef.current) userMarkerRef.current.remove()
      const el = document.createElement('div')
      el.style.cssText = 'width:20px;height:20px;border-radius:50%;background:#2F9E44;border:3px solid #F5F0E8;box-shadow:0 0 0 6px rgba(47,158,68,0.25);'
      userMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat(lngLat)
        .addTo(map)

      setHazardWarn(hazardAt(lngLat))
      const near = nearestShelter(lngLat)
      map.fitBounds(
        [lngLat, near.feature.geometry.coordinates],
        { padding: 80, maxZoom: 15, duration: 600 }
      )
      setSelected({
        ...near.feature.properties,
        coordinates: near.feature.geometry.coordinates,
        distanceKm: near.distanceKm
      })
    } catch (e) {
      setLocError(e.message || 'Konum alınamadı')
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Toplanma Noktaları</h2>
        <button
          onClick={locate}
          className="text-sm px-3 py-2 rounded-lg bg-[--color-fener-gold] text-[--color-fener-bg] font-semibold"
        >
          📍 Konumum
        </button>
      </div>

      <div className="flex gap-1 flex-wrap text-xs">
        {[
          ['shelters', '📍 Toplanma'],
          ['hazards', '⚠️ Tehlike'],
          ['reports', '🚩 Rapor'],
          ['user', '⭐ Benim']
        ].map(([k, l]) => (
          <button
            key={k}
            onClick={() => setFilters((f) => ({ ...f, [k]: !f[k] }))}
            className={`px-2 py-1 rounded-lg border ${filters[k] ? 'bg-[--color-fener-gold] text-[--color-fener-bg] border-[--color-fener-gold]' : 'bg-[--color-fener-card] border-[--color-fener-border] opacity-60'}`}
          >
            {l}
          </button>
        ))}
      </div>

      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden border border-[--color-fener-border]"
        style={{ height: '60vh', minHeight: 360 }}
      />

      {locError && (
        <div className="text-xs text-[--color-fener-help] rounded-lg p-2 border border-[--color-fener-help]/40">
          {locError}
        </div>
      )}

      {hazardWarn && (
        <div className="rounded-xl p-3 bg-[--color-fener-help]/10 border border-[--color-fener-help] text-sm">
          ⚠️ Şu an <strong>{hazardWarn.properties.name}</strong> sınırı içindesin
          ({hazardWarn.properties.severity}). Toplanma noktasına yönel.
        </div>
      )}

      {selected ? (
        <div className="rounded-xl p-4 bg-[--color-fener-card] border border-[--color-fener-border]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold text-[--color-fener-gold-bright]">{selected.name}</div>
              <div className="text-xs opacity-70 mt-1">Kapasite: ~{selected.capacity} kişi</div>
              {selected.distanceKm != null && (
                <div className="text-xs opacity-90 mt-1">
                  Uzaklık: <strong>{selected.distanceKm.toFixed(2)} km</strong>
                  {' · '}
                  Yürüme: <strong>~{Math.max(1, Math.round(selected.distanceKm * 12))} dk</strong>
                </div>
              )}
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selected.coordinates[1]},${selected.coordinates[0]}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs px-3 py-2 rounded-lg bg-[--color-fener-gold] text-[--color-fener-bg] font-semibold whitespace-nowrap"
            >
              Yol tarifi
            </a>
          </div>
          {selected.notes && (
            <p className="text-sm opacity-80 mt-2">{selected.notes}</p>
          )}
          {userLoc && selected.distanceKm == null && (
            <div className="text-xs opacity-70 mt-2">
              Senden {haversineKm([userLoc.lng, userLoc.lat], selected.coordinates).toFixed(2)} km
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs opacity-60">
          Noktaya dokun veya "Konumum" ile en yakın yeri gör. Haritaya uzun bas → kendi buluşma noktanı ekle.
        </div>
      )}

      <div className="text-xs opacity-50 text-center">
        Harita verileri: © OpenStreetMap · Toplanma listesi saha doğrulaması bekliyor.
      </div>
    </div>
  )
}
