// Fener kimlik + imza. Web Crypto API, Ed25519.
// Not: Ed25519 Web Crypto API yaygınlaşmakta ama tüm tarayıcılarda yok.
// ECDSA P-256 fallback ekleyeceğiz. Amaç: imzalı mesajlar.

const IDENTITY_KEY = 'fener.identity.v1'

const ALGO_PRIMARY = { name: 'Ed25519' }
const ALGO_FALLBACK = { name: 'ECDSA', namedCurve: 'P-256' }

let supportsEd25519 = null

async function detectEd25519() {
  if (supportsEd25519 !== null) return supportsEd25519
  try {
    await crypto.subtle.generateKey(ALGO_PRIMARY, true, ['sign', 'verify'])
    supportsEd25519 = true
  } catch {
    supportsEd25519 = false
  }
  return supportsEd25519
}

function algo() {
  return supportsEd25519 ? ALGO_PRIMARY : ALGO_FALLBACK
}

function signAlgo() {
  return supportsEd25519 ? ALGO_PRIMARY : { name: 'ECDSA', hash: 'SHA-256' }
}

function b64e(buf) {
  const bytes = new Uint8Array(buf)
  let s = ''
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i])
  return btoa(s)
}
function b64d(str) {
  const bin = atob(str)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes.buffer
}

export async function ensureIdentity() {
  await detectEd25519()
  const stored = load()
  if (stored) return stored
  const kp = await crypto.subtle.generateKey(algo(), true, ['sign', 'verify'])
  const priv = await crypto.subtle.exportKey(supportsEd25519 ? 'pkcs8' : 'pkcs8', kp.privateKey)
  const pub = await crypto.subtle.exportKey(supportsEd25519 ? 'raw' : 'raw', kp.publicKey)
  const identity = {
    alg: supportsEd25519 ? 'Ed25519' : 'ECDSA-P256',
    priv: b64e(priv),
    pub: b64e(pub),
    createdAt: Date.now(),
    fingerprint: await fingerprint(pub)
  }
  save(identity)
  return identity
}

export async function getIdentity() {
  const id = load()
  if (!id) return null
  await detectEd25519()
  return id
}

async function fingerprint(raw) {
  const h = await crypto.subtle.digest('SHA-256', raw)
  const b = new Uint8Array(h).slice(0, 8)
  return Array.from(b).map((x) => x.toString(16).padStart(2, '0')).join(':')
}

export async function sign(identity, message) {
  const priv = await crypto.subtle.importKey(
    'pkcs8', b64d(identity.priv), algo(), false, ['sign']
  )
  const data = new TextEncoder().encode(message)
  const sig = await crypto.subtle.sign(signAlgo(), priv, data)
  return b64e(sig)
}

export async function verify(pubB64, message, sigB64, alg = null) {
  const useEd = alg ? alg === 'Ed25519' : supportsEd25519
  const a = useEd ? ALGO_PRIMARY : ALGO_FALLBACK
  const sa = useEd ? ALGO_PRIMARY : { name: 'ECDSA', hash: 'SHA-256' }
  const pub = await crypto.subtle.importKey('raw', b64d(pubB64), a, false, ['verify'])
  return crypto.subtle.verify(sa, pub, b64d(sigB64), new TextEncoder().encode(message))
}

function save(id) {
  try { localStorage.setItem(IDENTITY_KEY, JSON.stringify(id)) } catch { /* noop */ }
}
function load() {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function forgetIdentity() {
  try { localStorage.removeItem(IDENTITY_KEY) } catch { /* noop */ }
}
