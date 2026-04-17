export function getPosition(options = {}) {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Konum servisi desteklenmiyor'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        ts: pos.timestamp
      }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000, ...options }
    )
  })
}
