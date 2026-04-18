// Konum yardımcıları. Başarılı her ölçümde son konum cache'e yazılır;
// GPS ulaşamadığında (bina içi, afet sonrası) son bilinen nokta hâlâ kullanılabilir.

const LAST_KEY = 'fener.lastPos.v1'

export function getLastKnownPosition() {
  try {
    const raw = localStorage.getItem(LAST_KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    if (typeof p?.lat !== 'number' || typeof p?.lng !== 'number') return null
    return p
  } catch { return null }
}

function saveLast(p) {
  try { localStorage.setItem(LAST_KEY, JSON.stringify(p)) } catch { /* noop */ }
}

export function getPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Konum servisi desteklenmiyor'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          ts: pos.timestamp
        }
        saveLast(p)
        resolve(p)
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000, ...options }
    )
  })
}
