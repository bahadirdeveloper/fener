import { useEffect, useState } from 'react'
import { isBleSupported, isAvailable, discoverFener, connect, send, onReceive } from '../lib/ble.js'
import { signMessage } from '../lib/sign.js'

export default function Ble() {
  const [supported] = useState(isBleSupported())
  const [available, setAvailable] = useState(null)
  const [device, setDevice] = useState(null)
  const [conn, setConn] = useState(null)
  const [messages, setMessages] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (supported) isAvailable().then(setAvailable)
  }, [supported])

  async function scan() {
    setError('')
    try {
      const d = await discoverFener()
      setDevice(d)
      d.addEventListener('gattserverdisconnected', () => setConn(null))
    } catch (e) {
      setError(e.message || 'Arama iptal edildi')
    }
  }

  async function openConn() {
    setError('')
    try {
      const c = await connect(device)
      setConn(c)
      onReceive(c.rx, (env) => setMessages((m) => [env, ...m].slice(0, 50)))
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

      <div>
        <div className="text-xs opacity-70 mb-1">Gelen mesajlar</div>
        <ul className="flex flex-col gap-2">
          {messages.length === 0 && (
            <li className="text-xs opacity-50 text-center py-4">Henüz yok</li>
          )}
          {messages.map((m, i) => (
            <li key={i} className="rounded-lg p-2 bg-[--color-fener-card] border border-[--color-fener-border] text-xs font-mono break-all">
              {JSON.stringify(m).slice(0, 200)}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
