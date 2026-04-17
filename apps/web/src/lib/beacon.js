// SOS beacon: belirli aralıklarla konum broadcast.
// Şimdilik sadece outbox'a yazar (Faz 2'de BLE + LoRa ile gerçek broadcast).

import { pushOutbox, getProfile } from './db.js'
import { getPosition } from './location.js'
import { signMessage } from './sign.js'

const STATE_KEY = 'fener.beacon.v1'

let intervalId = null
let listeners = new Set()

export function onBeaconChange(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

function notify() {
  const s = getState()
  listeners.forEach((fn) => fn(s))
}

export function getState() {
  try {
    const raw = localStorage.getItem(STATE_KEY)
    if (!raw) return { active: false }
    const s = JSON.parse(raw)
    return { ...s, active: !!intervalId || s.active }
  } catch { return { active: false } }
}

function setState(s) {
  try { localStorage.setItem(STATE_KEY, JSON.stringify(s)) } catch { /* noop */ }
}

async function emit(type) {
  const p = await getProfile()
  let pos = null
  try { pos = await getPosition({ timeout: 5000, maximumAge: 15000 }) } catch { /* ignore */ }
  const payload = {
    v: 1,
    kind: type, // 'sos' | 'ok-beacon'
    name: p?.name,
    ec: p?.emergencyContact,
    ep: p?.emergencyPhone,
    lat: pos?.lat,
    lng: pos?.lng,
    t: Date.now()
  }
  const signed = await signMessage(payload)
  await pushOutbox({
    type: `beacon:${type}`,
    text: JSON.stringify(signed),
    lat: pos?.lat,
    lng: pos?.lng
  })
}

export async function startBeacon({ kind = 'sos', periodMs = 30000 } = {}) {
  stopBeacon()
  await emit(kind)
  intervalId = setInterval(() => emit(kind).catch(() => {}), periodMs)
  setState({ active: true, kind, periodMs, startedAt: Date.now() })
  notify()
}

export function stopBeacon() {
  if (intervalId) { clearInterval(intervalId); intervalId = null }
  setState({ active: false })
  notify()
}
