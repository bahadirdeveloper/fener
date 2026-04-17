import { describe, it, expect, beforeAll, vi } from 'vitest'
import { webcrypto } from 'node:crypto'

// Polyfill crypto.subtle for Node/jsdom
if (!globalThis.crypto || !globalThis.crypto.subtle) {
  globalThis.crypto = webcrypto
}

// Minimal localStorage shim
class LS {
  constructor() { this.m = new Map() }
  getItem(k) { return this.m.has(k) ? this.m.get(k) : null }
  setItem(k, v) { this.m.set(k, String(v)) }
  removeItem(k) { this.m.delete(k) }
  clear() { this.m.clear() }
}
globalThis.localStorage = new LS()

beforeAll(() => {
  vi.stubGlobal('btoa', (s) => Buffer.from(s, 'binary').toString('base64'))
  vi.stubGlobal('atob', (s) => Buffer.from(s, 'base64').toString('binary'))
})

describe('crypto identity + sign', () => {
  it('creates identity and signs a message', async () => {
    const { ensureIdentity, sign, verify } = await import('../crypto.js')
    const id = await ensureIdentity()
    expect(id.pub).toBeTruthy()
    expect(id.fingerprint).toMatch(/^[0-9a-f:]+$/)

    const msg = 'hello fener'
    const sig = await sign(id, msg)
    const ok = await verify(id.pub, msg, sig, id.alg)
    expect(ok).toBe(true)
  })

  it('reuses identity across calls', async () => {
    const { ensureIdentity } = await import('../crypto.js')
    const a = await ensureIdentity()
    const b = await ensureIdentity()
    expect(a.fingerprint).toBe(b.fingerprint)
  })

  it('signMessage returns envelope with verifiable sig', async () => {
    const { signMessage } = await import('../sign.js')
    const { verify } = await import('../crypto.js')
    const env = await signMessage({ kind: 'test', v: 1 })
    expect(env.v).toBe(1)
    expect(env.sig).toBeTruthy()
    expect(env.body).toContain('"kind":"test"')
    const ok = await verify(env.pub, env.body, env.sig, env.alg)
    expect(ok).toBe(true)
  })
})
