import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProfile } from '../lib/db.js'
import { getPosition, getLastKnownPosition } from '../lib/location.js'
import { buildStatusText, familyWhatsAppLinks, queueStatus, smsLink } from '../lib/outbox.js'
import { startBeacon, stopBeacon, onBeaconChange, getState as getBeaconState } from '../lib/beacon.js'
import { acquireWakeLock, releaseWakeLock } from '../lib/wakeLock.js'

export default function Status() {
  const [params] = useSearchParams()
  const type = params.get('t') === 'help' ? 'help' : 'ok'
  const [loc, setLoc] = useState(null)
  const [text, setText] = useState('')
  const [links, setLinks] = useState([])
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)
  const [beacon, setBeacon] = useState(getBeaconState())

  useEffect(() => {
    (async () => {
      const p = await getProfile()
      setProfile(p)
      try {
        const pos = await getPosition()
        setLoc(pos)
      } catch (e) {
        const last = getLastKnownPosition()
        if (last) {
          setLoc(last)
          setError('Canlı konum yok; son bilinen nokta kullanılıyor.')
        } else {
          setError(e.message || 'Konum alınamadı')
        }
      }
    })()
    const off = onBeaconChange(setBeacon)
    return () => { off(); releaseWakeLock() }
  }, [])

  useEffect(() => {
    if (type === 'help') acquireWakeLock()
    else releaseWakeLock()
  }, [type])

  useEffect(() => {
    (async () => {
      const t = buildStatusText({
        type,
        name: profile?.name,
        lat: loc?.lat,
        lng: loc?.lng
      })
      setText(t)
      const l = await familyWhatsAppLinks(t)
      setLinks(l)
      await queueStatus({ type, lat: loc?.lat, lng: loc?.lng, name: profile?.name })
    })()
  }, [type, profile, loc])

  const color = type === 'ok' ? 'big-btn-ok' : 'big-btn-help'
  const title = type === 'ok' ? 'BEN İYİYİM' : 'YARDIM LAZIM'
  const emoji = type === 'ok' ? '✅' : '🆘'

  return (
    <div className="flex flex-col gap-4">
      <div className={`big-btn ${color}`}>
        <span className="text-5xl">{emoji}</span>
        <span>{title}</span>
      </div>

      <div className="rounded-xl p-4 bg-[--color-fener-card] border border-[--color-fener-border] flex flex-col gap-2">
        <div className="text-sm font-semibold opacity-90">Gönderilecek mesaj</div>
        <pre className="whitespace-pre-wrap text-base font-sans leading-relaxed">{text}</pre>
        <div className="flex gap-2 text-sm">
          <button
            onClick={() => { navigator.clipboard?.writeText(text); }}
            className="flex-1 py-3 rounded-xl bg-[--color-fener-bg] border border-[--color-fener-border] font-semibold min-h-[48px]"
          >
            📋 Kopyala
          </button>
          {typeof navigator !== 'undefined' && navigator.share && (
            <button
              onClick={() => navigator.share({ text, title: title }).catch(() => {})}
              className="flex-1 py-3 rounded-xl bg-[--color-fener-bg] border border-[--color-fener-border] font-semibold min-h-[48px]"
            >
              ↗ Paylaş
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="text-sm text-[--color-fener-help] rounded-lg p-3 border border-[--color-fener-help]/40">
          Uyarı: {error} — Mesaj konum olmadan hazırlandı.
        </div>
      )}

      {links.length > 0 ? (
        <div className="flex flex-col gap-2">
          <div className="text-base font-semibold">Ailene gönder</div>
          {links.map((l, i) => (
            <a
              key={i}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl py-4 bg-[--color-fener-ok] text-white font-bold text-center text-lg min-h-[56px] flex items-center justify-center"
            >
              WhatsApp · {l.name}
            </a>
          ))}
          <a
            href={smsLink('', text)}
            className="rounded-2xl py-4 bg-[--color-fener-card] border border-[--color-fener-border] text-center font-semibold text-base min-h-[52px] flex items-center justify-center"
          >
            SMS olarak paylaş
          </a>
        </div>
      ) : (
        <div className="text-base opacity-80 p-4 rounded-xl bg-[--color-fener-card] border border-[--color-fener-border]">
          Aile kişisi yok. <a href="/aile" className="underline text-[--color-fener-gold] font-semibold">Aile ekle →</a>
        </div>
      )}

      {type === 'help' && (
        <div className="rounded-xl p-4 bg-[--color-fener-card] border border-[--color-fener-help]/50 flex flex-col gap-3">
          <div>
            <div className="font-semibold text-[--color-fener-help]">SOS Beacon</div>
            <div className="text-xs opacity-80 mt-1">
              Her 30 saniyede bir konumunu imzalı olarak outbox'a yazar.
              Faz 2 (BLE/LoRa) ile ağdaki cihazlara yayılır.
            </div>
          </div>
          {beacon?.active ? (
            <button
              onClick={() => stopBeacon()}
              className="rounded-xl p-3 bg-[--color-fener-help] text-white font-bold"
            >
              ⏹ Beacon'ı durdur
            </button>
          ) : (
            <button
              onClick={() => startBeacon({ kind: 'sos', periodMs: 30000 })}
              className="rounded-xl p-3 bg-[--color-fener-help] text-white font-bold"
            >
              🆘 Beacon'ı başlat
            </button>
          )}
        </div>
      )}
    </div>
  )
}
