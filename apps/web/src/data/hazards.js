// Silifke bölgesi için örnek tehlike poligonları.
// KAYNAK: Placeholder — saha doğrulaması + AFAD/belediye verisi bekliyor.
// Amaç: katmanın çalışması, gerçek veriyi kolayca takmak.

export const HAZARDS = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: { id: 'goksu-flood', kind: 'flood', name: 'Göksu Nehri taşkın riski', severity: 'high' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [33.9255, 36.3820],
          [33.9340, 36.3812],
          [33.9395, 36.3765],
          [33.9420, 36.3700],
          [33.9380, 36.3660],
          [33.9295, 36.3685],
          [33.9240, 36.3740],
          [33.9255, 36.3820]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'tasucu-coastal', kind: 'tsunami', name: 'Taşucu sahil bölgesi (tsunami/fırtına)', severity: 'medium' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [33.8770, 36.3180],
          [33.9020, 36.3180],
          [33.9020, 36.3080],
          [33.8770, 36.3080],
          [33.8770, 36.3180]
        ]]
      }
    },
    {
      type: 'Feature',
      properties: { id: 'akdere-land', kind: 'landslide', name: 'Akdere mevkii heyelan riski', severity: 'medium' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [33.9780, 36.4120],
          [33.9870, 36.4120],
          [33.9870, 36.4030],
          [33.9780, 36.4030],
          [33.9780, 36.4120]
        ]]
      }
    }
  ]
}

export const HAZARD_COLORS = {
  flood: '#2A8FD6',
  tsunami: '#4FB3D9',
  landslide: '#D6892A',
  fire: '#D6452A'
}

function pointInRing(point, ring) {
  const [x, y] = point
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    const intersect = ((yi > y) !== (yj > y)) &&
      (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi)
    if (intersect) inside = !inside
  }
  return inside
}

export function hazardAt(lngLat) {
  for (const f of HAZARDS.features) {
    if (pointInRing(lngLat, f.geometry.coordinates[0])) return f
  }
  return null
}
