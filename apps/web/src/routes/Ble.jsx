import { useEffect, useState } from 'react'
import { isBleSupported, isAvailable, discoverFener, connect, send, onReceive } from '../lib/ble.js'
import { signMessage } from '../lib/sign.js'
import { notifyLocal } from '../lib/notify.js'
import { verify } from '../lib/crypto.js'
import { pushOutbox, db } from '../lib/db.js'
import { useLiveQuery } from 'dexie-react-hooks'

export default function Ble() {
  const [supported] = useState(isBleSupported())
  const [available, setAvailable] = useState(null)
  const [device, setDevice] = useState(null)
  const [conn, setConn] = useState(null)
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')
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
        <button onClick={ping} className="rounded-xl p-3 bg-[--color-fener-card] border border-[--color-fener-border] font-semibold">
          📤 İmzalı ping gönder
        </button>
      )}

      {error && <div className="text-sm text-[--color-fener-help]">{error}</div>}

      {knownPeers.length > 0 && (
        <div>
          <div className="text-xs opacity-70 mb-1">Bilinen cihazlar</div>
          <ul className="flex flex-col gap-1">
            {knownPeers.map((p) => (
              <li key={p.id} className="rounded-lg p-2 bg-[--color-fener-card] border border-[--color-fener-border] text-xs flex justify-between">
                <span>📡 {p.name}</span>
                <span className="opacity-60">{new Date(p.lastSeen).toLocaleTimeString('tr-TR')}</span>
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
            <li key={i} className="rounded-lg p-2 bg-[--color-fener-card] border border-[--color-fener-border] text-xs font-mono break-all">
              <span className={m.verified ? 'text-[--color-fener-ok]' : m.verified === false ? 'text-[--color-fener-help]' : 'opacity-60'}>
                {m.verified ? '✓ doğrulandı' : m.verified === false ? '✗ imza geçersiz' : '? imzasız'}
              </span>{' '}
              {JSON.stringify(m).slice(0, 200)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
