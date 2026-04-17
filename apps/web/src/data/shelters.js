// Silifke örnek toplanma noktaları.
// Faz 1.2'de AFAD açık veri / belediye listesi ile değiştirilecek.
// Koordinatlar gerçek Silifke lokasyonlarına yakın ama doğrulanmamış — saha doğrulaması gerekli.

export const SILIFKE_CENTER = [33.9336, 36.3775] // [lng, lat]

export const SHELTERS = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      properties: {
        id: 'silifke-meydan',
        name: 'Atatürk Caddesi Meydanı',
        kind: 'toplanma',
        capacity: 2000,
        notes: 'Belediye meydanı, geniş açık alan.'
      },
      geometry: { type: 'Point', coordinates: [33.9336, 36.3775] }
    },
    {
      type: 'Feature',
      properties: {
        id: 'ataturk-park',
        name: 'Atatürk Parkı',
        kind: 'toplanma',
        capacity: 800,
        notes: 'Kent içi yeşil alan.'
      },
      geometry: { type: 'Point', coordinates: [33.9298, 36.3790] }
    },
    {
      type: 'Feature',
      properties: {
        id: 'tasucu-liman',
        name: 'Taşucu Limanı Açık Alanı',
        kind: 'toplanma',
        capacity: 1500,
        notes: 'Sahil, geniş beton zemin.'
      },
      geometry: { type: 'Point', coordinates: [33.8908, 36.3122] }
    },
    {
      type: 'Feature',
      properties: {
        id: 'goksu-koprusu',
        name: 'Göksu Köprüsü Güneyi',
        kind: 'toplanma',
        capacity: 500,
        notes: 'Nehir yakını, açık alan.'
      },
      geometry: { type: 'Point', coordinates: [33.9402, 36.3701] }
    },
    {
      type: 'Feature',
      properties: {
        id: 'stadyum',
        name: 'Silifke İlçe Stadyumu',
        kind: 'toplanma',
        capacity: 3500,
        notes: 'Büyük açık alan, pist.'
      },
      geometry: { type: 'Point', coordinates: [33.9441, 36.3808] }
    },
    {
      type: 'Feature',
      properties: {
        id: 'universite',
        name: 'MEÜ Silifke MYO Bahçesi',
        kind: 'toplanma',
        capacity: 1200,
        notes: 'Kampüs açık alanı.'
      },
      geometry: { type: 'Point', coordinates: [33.9172, 36.3646] }
    }
  ]
}

export function haversineKm(a, b) {
  const R = 6371
  const toRad = (d) => (d * Math.PI) / 180
  const [lng1, lat1] = a
  const [lng2, lat2] = b
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const sa = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(sa))
}

export function nearestShelter(userLngLat) {
  let best = null
  let bestKm = Infinity
  for (const f of SHELTERS.features) {
    const km = haversineKm(userLngLat, f.geometry.coordinates)
    if (km < bestKm) { bestKm = km; best = f }
  }
  return { feature: best, distanceKm: bestKm }
}
