// Silifke bölgesi OSM tile pre-fetch.
// Amaç: kullanıcı haritayı hiç açmadan afet olsa bile bölge tile'ları cache'de olsun.
// SW runtimeCaching (fener-osm-tiles) fetch'leri yakalar, biz sadece arka planda getirip
// cache'i dolduruyoruz.

const SILIFKE_BBOX = {
  west: 33.80,
  south: 36.28,
  east: 34.05,
  north: 36.45
}

const ZOOM_LEVELS = [10, 11, 12, 13, 14]

function lng2tile(lng, z) {
  return Math.floor(((lng + 180) / 360) * Math.pow(2, z))
}
function lat2tile(lat, z) {
  const rad = (lat * Math.PI) / 180
  return Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * Math.pow(2, z)
  )
}

export function tilesFor(bbox = SILIFKE_BBOX, zooms = ZOOM_LEVELS) {
  const tiles = []
  for (const z of zooms) {
    const xMin = lng2tile(bbox.west, z)
    const xMax = lng2tile(bbox.east, z)
    const yMin = lat2tile(bbox.north, z)
    const yMax = lat2tile(bbox.south, z)
    for (let x = xMin; x <= xMax; x++) {
      for (let y = yMin; y <= yMax; y++) {
        tiles.push({ z, x, y })
      }
    }
  }
  return tiles
}

export async function prefetchTiles({ onProgress, signal } = {}) {
  const tiles = tilesFor()
  const total = tiles.length
  let done = 0
  let failed = 0
  const CONCURRENCY = 6
  let idx = 0

  async function worker() {
    while (idx < tiles.length) {
      if (signal?.aborted) return
      const t = tiles[idx++]
      const url = `https://tile.openstreetmap.org/${t.z}/${t.x}/${t.y}.png`
      try {
        const r = await fetch(url, { mode: 'cors', cache: 'default' })
        if (!r.ok) failed++
      } catch {
        failed++
      }
      done++
      onProgress?.({ done, total, failed })
    }
  }

  const workers = Array.from({ length: CONCURRENCY }, worker)
  await Promise.all(workers)
  return { total, done, failed }
}

export function estimatedSizeMB() {
  const count = tilesFor().length
  // ~15KB/tile ortalama OSM raster
  return (count * 15) / 1024
}
