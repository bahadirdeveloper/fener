// beforeinstallprompt (Android Chrome, desktop Chrome/Edge).
// iOS Safari bu eventi yaymaz — IosInstallHint ayrı ilgilenir.

let deferred = null
const listeners = new Set()

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e
    listeners.forEach((fn) => fn(true))
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    listeners.forEach((fn) => fn(false))
  })
}

export function canInstall() {
  return !!deferred
}

export function onAvailabilityChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export async function promptInstall() {
  if (!deferred) return { ok: false, reason: 'unavailable' }
  deferred.prompt()
  const choice = await deferred.userChoice
  const ok = choice?.outcome === 'accepted'
  deferred = null
  listeners.forEach((fn) => fn(false))
  return { ok, outcome: choice?.outcome }
}
