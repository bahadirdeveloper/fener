// Fener mesaj zarfı. İmzalı payload'ı outbox'a yazmak için.

import { ensureIdentity, sign } from './crypto.js'

export async function signMessage(payload) {
  const id = await ensureIdentity()
  const body = typeof payload === 'string' ? payload : JSON.stringify(payload)
  const sig = await sign(id, body)
  return {
    v: 1,
    from: id.fingerprint,
    pub: id.pub,
    alg: id.alg,
    body,
    sig,
    ts: Date.now()
  }
}

export function envelopeToText(env) {
  return [
    `== FENER ==`,
    `from: ${env.from}`,
    `alg:  ${env.alg}`,
    `t:    ${new Date(env.ts).toISOString()}`,
    ``,
    env.body,
    ``,
    `sig:  ${env.sig}`,
    `pub:  ${env.pub}`
  ].join('\n')
}
