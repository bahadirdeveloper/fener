// Kit (hazırlık) ilerleme yüzdesi hesabı. Kit.jsx ve Home.jsx ortak kullanır.
// localStorage'da { itemId: boolean } formunda tutulur.

export const KIT_KEY = 'fener.kit.v1'
export const KIT_TS_KEY = 'fener.kit.ts.v1'
export const KIT_TOTAL = 22
export const KIT_STALE_MS = 180 * 24 * 60 * 60 * 1000 // 6 ay

export function readKit() {
  try {
    const raw = localStorage.getItem(KIT_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export function readKitTs() {
  try {
    const raw = localStorage.getItem(KIT_TS_KEY)
    return raw ? Number(raw) : 0
  } catch { return 0 }
}

export function writeKitTs(now = Date.now()) {
  try { localStorage.setItem(KIT_TS_KEY, String(now)) } catch { /* noop */ }
}

export function kitStale(ts, now = Date.now()) {
  if (!ts) return false
  return (now - ts) >= KIT_STALE_MS
}

export function kitDone(state) {
  return Object.values(state).filter(Boolean).length
}

export function kitPct(state) {
  const done = kitDone(state)
  if (!KIT_TOTAL) return 0
  return Math.min(100, Math.round((done / KIT_TOTAL) * 100))
}
