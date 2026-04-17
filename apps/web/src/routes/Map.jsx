import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useLiveQuery } from 'dexie-react-hooks'
import { osmRasterStyle } from '../lib/mapStyle.js'
import { SHELTERS, SILIFKE_CENTER, nearestShelter, haversineKm } from '../data/shelters.js'
import { getPosition } from '../lib/location.js'
import { db } from '../lib/db.js'

export default function Map() {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const userMarkerRef = useRef(null)
  const [selected, setSelected] = useState(null)
  const [userLoc, setUserLoc] = useState(null)
  const [locError, setLocError] = useState('')
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

      {selected ? (
        <div className="rounded-xl p-4 bg-[--color-fener-card] border border-[--color-fener-border]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-semibold text-[--color-fener-gold-bright]">{selected.name}</div>
              <div className="text-xs opacity-70 mt-1">Kapasite: ~{selected.capacity} kişi</div>
              {selected.distanceKm != null && (
                <div className="text-xs opacity-90 mt-1">
                  Uzaklık: <strong>{selected.distanceKm.toFixed(2)} km</strong>
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
          Noktaya dokun veya "Konumum" ile en yakın yeri gör.
        </div>
      )}

      <div className="text-xs opacity-50 text-center">
        Harita verileri: © OpenStreetMap · Toplanma listesi saha doğrulaması bekliyor.
      </div>
    </div>
  )
}
