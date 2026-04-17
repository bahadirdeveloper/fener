import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProfile } from '../lib/db.js'
import { getPosition } from '../lib/location.js'
import { buildStatusText, familyWhatsAppLinks, queueStatus, smsLink } from '../lib/outbox.js'

export default function Status() {
  const [params] = useSearchParams()
  const type = params.get('t') === 'help' ? 'help' : 'ok'
  const [loc, setLoc] = useState(null)
  const [text, setText] = useState('')
  const [links, setLinks] = useState([])
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    (async () => {
      const p = await getProfile()
      setProfile(p)
      try {
        const pos = await getPosition()
        setLoc(pos)
      } catch (e) {
        setError(e.message || 'Konum alınamadı')
      }
    })()
  }, [])

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

      <div className="rounded-xl p-4 bg-[--color-fener-card] border border-[--color-fener-border]">
        <div className="text-xs opacity-70 mb-1">Mesajınız</div>
        <pre className="whitespace-pre-wrap text-sm font-sans">{text}</pre>
      </div>

      {error && (
        <div className="text-sm text-[--color-fener-help] rounded-lg p-3 border border-[--color-fener-help]/40">
          Uyarı: {error} — Mesaj konum olmadan hazırlandı.
        </div>
      )}

      {links.length > 0 ? (
        <div className="flex flex-col gap-2">
          <div className="text-sm opacity-70">Ailene gönder</div>
          {links.map((l, i) => (
            <a
              key={i}
              href={l.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl p-4 bg-[--color-fener-ok] text-white font-semibold text-center"
            >
              WhatsApp · {l.name}
            </a>
          ))}
          <a
            href={smsLink('', text)}
            className="rounded-xl p-4 bg-[--color-fener-card] border border-[--color-fener-border] text-center font-semibold"
          >
            SMS olarak paylaş
          </a>
        </div>
      ) : (
        <div className="text-sm opacity-70">
          Aile kişileri ekli değil. <a href="/aile" className="underline">Aile ekle →</a>
        </div>
      )}
    </div>
  )
}
