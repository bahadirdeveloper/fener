// Kit (hazırlık) ilerleme yüzdesi hesabı. Kit.jsx ve Home.jsx ortak kullanır.
// localStorage'da { itemId: boolean } formunda tutulur.

export const KIT_KEY = 'fener.kit.v1'
export const KIT_TOTAL = 22

export function readKit() {
  try {
    const raw = localStorage.getItem(KIT_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export function kitDone(state) {
  return Object.values(state).filter(Boolean).length
}

export function kitPct(state) {
  const done = kitDone(state)
  if (!KIT_TOTAL) return 0
  return Math.min(100, Math.round((done / KIT_TOTAL) * 100))
}
