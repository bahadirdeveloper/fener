import { useEffect, useState } from 'react'
import { isBleSupported, isAvailable, discoverFener, connect, send, onReceive } from '../lib/ble.js'
import { signMessage } from '../lib/sign.js'
import { notifyLocal } from '../lib/notify.js'
import { verify } from '../lib/crypto.js'
import { pushOutbox, db } from '../lib/db.js'
import { useLiveQuery } from 'dexie-react-hooks'

function fmtAgo(ts) {
  if (!ts) return '—'
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s önce`
  if (s < 3600) return `${Math.floor(s / 60)}dk önce`
  if (s < 86400) return `${Math.floor(s / 3600)}sa önce`
  return `${Math.floor(s / 86400)}g önce`
}

export default function Ble() {
  const [supported] = useState(isBleSupported())
  const [available, setAvailable] = useState(null)
  const [device, setDevice] = useState(null)
  const [conn, setConn] = useState(null)
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')
  const [chatInput, setChatInput] = useState('')
  const knownPeers = useLiveQuery(() => db.nodes.toArray(), []) ?? []

  useEffect(() => {
    if (supported) isAvailable().then(setAvailable)
  }, [supported])

  async function scan() {
    setError('')
    try {
      const d = await discoverFener()
      setDevice(d)
      d.addEventListener('gattserverdisconnected', () => setConn(null))
      try {
        await db.nodes.put({ id: d.id || d.name || `peer-${Date.now()}`, kind: 'ble', name: d.name || 'Fener peer', lastSeen: Date.now() })
      } catch { /* noop */ }
    } catch (e) {
      setError(e.message || 'Arama iptal edildi')
    }
  }

  async function openConn() {
    setError('')
    try {
      const c = await connect(device)
      setConn(c)
      onReceive(c.rx, async (env) => {
        let ok = null
        try {
          if (env.pub && env.sig && env.body) ok = await verify(env.pub, env.body, env.sig, env.alg)
        } catch { ok = false }
        const stamped = { ...env, verified: ok }
        setMessages((m) => [stamped, ...m].slice(0, 50))
        try {
          const body = typeof env.body === 'string' ? JSON.parse(env.body) : env.body
          const kind = body?.kind || env.kind
          if (kind === 'sos' || body?.kind === 'sos') {
            notifyLocal('🆘 Yakında SOS', `${env.from?.slice(0, 12) || 'bilinmeyen'} yardım istiyor`, { url: '/ble' })
          }
          await pushOutbox({ type: `ble-in:${kind || 'msg'}`, text: JSON.stringify(stamped), incoming: true })
        } catch { /* noop */ }
      })
    } catch (e) {
      setError('Bağlantı hatası: ' + e.message)
    }
  }

  async function ping() {
    if (!conn?.tx) return
    const env = await signMessage({ kind: 'ping', t: Date.now() })
    await send(conn.tx, env)
  }

  async function sendChat() {
    const txt = chatInput.trim()
    if (!txt || !conn?.tx) return
    const env = await signMessage({ kind: 'chat', text: txt, t: Date.now() })
    await send(conn.tx, env)
    setMessages((m) => [{ ...env, verified: true, outgoing: true }, ...m].slice(0, 50))
    setChatInput('')
  }

  async function drainOutbox() {
    if (!conn?.tx) return
    const pending = await db.outbox.where('status').notEqual('sent').and((x) => !x.incoming).toArray()
    let n = 0
    for (const item of pending) {
      try {
        let payload
        try { payload = JSON.parse(item.text) } catch { payload = { kind: item.type, text: item.text } }
        await send(conn.tx, payload)
        await db.outbox.update(item.id, { status: 'sent', sentAt: Date.now() })
        n++
      } catch { /* skip failed */ }
    }
    setMessages((m) => [{ kind: 'info', body: JSON.stringify({ text: `${n} mesaj gönderildi` }), outgoing: true, verified: true, ts: Date.now() }, ...m].slice(0, 50))
  }

  async function sendQuickOk() {
    if (!conn?.tx) return
    const env = await signMessage({ kind: 'ok', text: 'Ben iyiyim', t: Date.now() })
    await send(conn.tx, env)
    setMessages((m) => [{ ...env, verified: true, outgoing: true }, ...m].slice(0, 50))
  }

  if (!supported) {
    return (
      <div className="flex flex-col gap-3">
        <h2 className="text-2xl font-bold">Yakın Cihaz (BLE)</h2>
        <div className="rounded-xl p-4 bg-[--color-fener-card] border border-[--color-fener-border] text-sm">
          Web Bluetooth bu cihazda desteklenmiyor. Android Chrome veya desktop Chrome/Edge dene.
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-2xl font-bold">Yakın Cihaz (BLE)</h2>
      <p className="text-sm opacity-70">
        Yakındaki Fener cihazlarıyla internet olmadan mesaj alışverişi.
        <span className="opacity-60"> Faz 2 prototip — karşı cihaz GATT sunucusu çalıştırmalı.</span>
      </p>

      <div className="rounded-xl p-3 bg-[--color-fener-card] border border-[--color-fener-border] text-xs">
        <div>Destek: <strong>{supported ? 'var' : 'yok'}</strong></div>
        <div>Adaptör: <strong>{available == null ? '…' : available ? 'açık' : 'kapalı'}</strong></div>
        <div>Cihaz: <strong>{device?.name || 'bağlı değil'}</strong></div>
        <div>Bağlantı: <strong>{conn ? 'açık' : 'kapalı'}</strong></div>
      </div>

      <button onClick={scan} className="rounded-xl p-3 bg-[--color-fener-gold] text-[--color-fener-bg] font-bold">
        🔍 Cihaz ara
      </button>

      {device && !conn && (
        <button onClick={openConn} className="rounded-xl p-3 bg-[--color-fener-ok] text-white font-bold">
          🔗 Bağlan ({device.name})
        </button>
      )}

      {conn && (
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button onClick={ping} className="flex-1 rounded-xl p-3 bg-[--color-fener-card] border border-[--color-fener-border] text-sm font-semibold">
              📤 Ping
            </button>
            <button onClick={sendQuickOk} className="flex-1 rounded-xl p-3 bg-[--color-fener-ok] text-white text-sm font-semibold">
              ✅ Ben iyiyim
            </button>
          </div>
          <button onClick={drainOutbox} className="rounded-xl p-3 bg-[--color-fener-card] border border-[--color-fener-gold] text-sm font-semibold">
            📦 Bekleyen outbox'ı bu cihaza gönder
          </button>
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendChat()}
              placeholder="Mesaj..."
              className="flex-1 rounded-xl px-3 py-2 bg-[--color-fener-card] border border-[--color-fener-border]"
            />
            <button onClick={sendChat} className="px-4 rounded-xl bg-[--color-fener-gold] text-[--color-fener-bg] font-bold">
              Gönder
            </button>
          </div>
        </div>
      )}

      {error && <div className="text-sm text-[--color-fener-help]">{error}</div>}

      {knownPeers.length > 0 && (
        <div>
          <div className="text-xs opacity-70 mb-1">Bilinen cihazlar</div>
          <ul className="flex flex-col gap-1">
            {knownPeers.map((p) => (
              <li key={p.id} className="rounded-lg p-2 bg-[--color-fener-card] border border-[--color-fener-border] text-xs flex items-center justify-between gap-2">
                <span className="truncate">📡 {p.name}</span>
                <span className="opacity-60 whitespace-nowrap">{fmtAgo(p.lastSeen)}</span>
                <button
                  onClick={() => db.nodes.delete(p.id)}
                  className="text-[--color-fener-help] px-1"
                  aria-label="Sil"
                >✕</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <div className="text-xs opacity-70 mb-1">Gelen mesajlar</div>
        <ul className="flex flex-col gap-2">
          {messages.length === 0 && (
            <li className="text-xs opacity-50 text-center py-4">Henüz yok</li>
          )}
          {messages.map((m, i) => (
            <li key={i} className={`rounded-lg p-2 text-xs ${m.outgoing ? 'bg-[--color-fener-ok]/20 border border-[--color-fener-ok]/40 ml-6' : 'bg-[--color-fener-card] border border-[--color-fener-border] mr-6'}`}>
              <div className="flex items-center justify-between">
                <span className={m.verified ? 'text-[--color-fener-ok]' : m.verified === false ? 'text-[--color-fener-help]' : 'opacity-60'}>
                  {m.outgoing ? '→' : '←'} {m.verified ? '✓' : m.verified === false ? '✗' : '?'} {m.from?.slice(0, 12) || 'peer'}
                </span>
                <span className="opacity-60">{new Date(m.ts || Date.now()).toLocaleTimeString('tr-TR')}</span>
              </div>
              <div className="mt-1 font-sans break-words">
                {(() => {
                  try {
                    const b = typeof m.body === 'string' ? JSON.parse(m.body) : m.body
                    return b?.text || b?.kind || JSON.stringify(b).slice(0, 120)
                  } catch { return m.body || JSON.stringify(m).slice(0, 120) }
                })()}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
