let sentinel = null

export async function acquireWakeLock() {
  if (!('wakeLock' in navigator)) return false
  try {
    sentinel = await navigator.wakeLock.request('screen')
    sentinel.addEventListener?.('release', () => { sentinel = null })
    const onVis = async () => {
      if (document.visibilityState === 'visible' && !sentinel) {
        try { sentinel = await navigator.wakeLock.request('screen') } catch {}
      }
    }
    document.addEventListener('visibilitychange', onVis)
    return true
  } catch {
    return false
  }
}

export async function releaseWakeLock() {
  try { await sentinel?.release() } catch {}
  sentinel = null
}

export function hasWakeLock() {
  return 'wakeLock' in navigator
}
