const KEYS = {
  onboarded: 'fener.onboarded.v1',
  installDismissed: 'fener.installDismissed.v1',
  locationAsked: 'fener.locationAsked.v1',
  energySave: 'fener.energySave.v1'
}

export function isEnergySave() {
  try { return localStorage.getItem(KEYS.energySave) === '1' } catch { return false }
}
export function setEnergySave(v) {
  try { localStorage.setItem(KEYS.energySave, v ? '1' : '0') } catch { /* noop */ }
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('energy-save', !!v)
  }
}
export function applyEnergySave() {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('energy-save', isEnergySave())
}

export function getFlag(k) {
  try { return localStorage.getItem(KEYS[k]) === '1' } catch { return false }
}
export function setFlag(k, v = true) {
  try { localStorage.setItem(KEYS[k], v ? '1' : '0') } catch { /* noop */ }
}

export function isIos() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  const isIphone = /iPhone|iPad|iPod/i.test(ua)
  const isIpadMacUA = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return isIphone || isIpadMacUA
}

export function isStandalone() {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia?.('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  )
}

export function haptic(ms = 15) {
  if (isEnergySave()) return
  try { navigator.vibrate?.(ms) } catch { /* noop */ }
}
