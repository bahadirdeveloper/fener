import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { getProfile } from '../lib/db.js'

export default function CardShow() {
  const [profile, setProfile] = useState(null)
  const [qr, setQr] = useState('')

  useEffect(() => {
    (async () => {
      const p = await getProfile()
      setProfile(p)
      if (p) {
        const payload = JSON.stringify({
          v: 1,
          app: 'fener',
          name: p.name,
          birthYear: p.birthYear,
          bloodGroup: p.bloodGroup,
          allergies: p.allergies,
          medications: p.medications,
          conditions: p.conditions,
          ec: p.emergencyContact,
          ep: p.emergencyPhone,
          notes: p.notes
        })
        const url = await QRCode.toDataURL(payload, {
          errorCorrectionLevel: 'M',
          margin: 1,
          width: 512,
          color: { dark: '#0A0A08', light: '#F5F0E8' }
        })
        setQr(url)
      }
      // tam ekran parlaklık
      try {
        await document.documentElement.requestFullscreen?.()
      } catch { /* noop */ }
    })()
    return () => { try { document.exitFullscreen?.() } catch { /* noop */ } }
  }, [])

  if (!profile) {
    return (
      <div className="flex flex-col gap-3 items-center text-center pt-10">
        <div className="text-5xl">🪪</div>
        <p className="opacity-70">Acil bilgi kartı boş.</p>
        <a href="/kart" className="underline text-[--color-fener-gold]">Doldur →</a>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 items-center">
      <div className="w-full rounded-2xl p-4 bg-[--color-fener-cream] text-[--color-fener-bg] flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <div className="text-2xl font-extrabold">{profile.name || 'Adsız'}</div>
          <div className="text-sm">{profile.birthYear || ''}</div>
        </div>
        <Row icon="🩸" label="Kan Grubu" value={profile.bloodGroup} big />
        <Row icon="⚠️" label="Alerjiler" value={profile.allergies} />
        <Row icon="💊" label="Kullandığı İlaçlar" value={profile.medications} />
        <Row icon="🏥" label="Hastalıklar" value={profile.conditions} />
        <Row icon="📞" label="Acil Kişi" value={profile.emergencyContact && `${profile.emergencyContact} · ${profile.emergencyPhone || ''}`} />
        {profile.notes && <Row icon="📝" label="Not" value={profile.notes} />}
      </div>

      {qr && (
        <div className="rounded-2xl p-4 bg-[--color-fener-cream] flex flex-col items-center gap-2">
          <img src={qr} alt="Acil kart QR kodu" className="w-64 h-64" />
          <div className="text-xs text-[--color-fener-bg] opacity-80 text-center">
            Kurtarıcılar Fener ile okuyabilir. Veri cihazda kalır.
          </div>
        </div>
      )}

      <a
        href="/kart"
        className="text-sm underline opacity-80"
      >
        Bilgileri düzenle
      </a>
    </div>
  )
}

function Row({ label, value, big, icon }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-2">
      {icon && <div className={big ? 'text-3xl' : 'text-lg'} aria-hidden>{icon}</div>}
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-wider opacity-70">{label}</div>
        <div className={big ? 'text-3xl font-extrabold' : 'text-base font-medium'}>{value}</div>
      </div>
    </div>
  )
}
