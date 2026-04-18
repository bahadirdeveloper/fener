import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setFlag, haptic } from '../lib/prefs.js'

// Kısa, net, 7-70 yaşa uygun. Tek cümle ile ne olduğunu söyle.
const STEPS = [
  {
    emoji: '🔦',
    title: 'Hoş geldin',
    body: 'Deprem, sel veya yangın olduğunda internetin çalışmasa bile Fener yanında.',
    primary: 'Başla'
  },
  {
    emoji: '📍',
    title: 'Konum',
    body: 'Yardım istediğinde nerede olduğunu otomatik paylaşır. Konumun sadece senin telefonunda durur.',
    primary: 'İzin ver',
    secondary: 'Şimdi değil',
    action: 'location'
  },
  {
    emoji: '⚠️',
    title: 'Tehlike bölgeleri',
    body: 'Silifke\'de sel, heyelan ve kıyı riskli alanlar haritada işaretli. Oralara girersen uyarı alırsın.',
    primary: 'Anladım'
  },
  {
    emoji: '🗺️',
    title: 'Offline harita',
    body: 'Haritayı bir kez indir, internet kesilse bile Silifke\'yi görmeye devam et.',
    primary: 'Tamam'
  },
  {
    emoji: '🪪',
    title: 'Acil bilgi kartın',
    body: 'Kan grubu, alerji, ilaçlar… Kurtarıcılar için hayati. 1 dakikada doldur.',
    primary: 'Şimdi doldur',
    secondary: 'Sonra',
    action: 'card'
  },
  {
    emoji: '👨‍👩‍👧',
    title: 'Ailen',
    body: 'Tek tuşla hepsine "Ben iyiyim" mesajı gitsin. Telefon numaralarını ekle.',
    primary: 'Aile ekle',
    secondary: 'Sonra',
    action: 'family'
  }
]

export default function Onboarding({ onDone }) {
  const [i, setI] = useState(0)
  const nav = useNavigate()
  const step = STEPS[i]
  const isLast = i === STEPS.length - 1

  async function primary() {
    haptic()
    if (step.action === 'location') {
      setFlag('locationAsked')
      try {
        await new Promise((res, rej) =>
          navigator.geolocation.getCurrentPosition(res, rej, { timeout: 6000 })
        )
      } catch { /* user denied, keep flowing */ }
    }
    if (step.action === 'card') {
      finish()
      nav('/kart')
      return
    }
    if (step.action === 'family') {
      finish()
      nav('/aile')
      return
    }
    if (!isLast) setI(i + 1)
    else finish()
  }

  function secondary() {
    haptic()
    if (!isLast) setI(i + 1)
    else finish()
  }

  function finish() {
    setFlag('onboarded')
    onDone?.()
  }

  function back() {
    if (i > 0) { haptic(); setI(i - 1) }
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[--color-fener-bg]"
         style={{
           paddingTop: 'env(safe-area-inset-top)',
           paddingBottom: 'env(safe-area-inset-bottom)',
           backgroundImage: 'radial-gradient(ellipse at 50% 20%, rgba(196, 168, 130, 0.10) 0%, transparent 60%)'
         }}>
      {/* Üst bar: geri + ilerleme noktaları + atla */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 min-h-[48px]">
        {i > 0 ? (
          <button
            onClick={back}
            aria-label="Geri"
            className="w-10 h-10 flex items-center justify-center text-lg opacity-70 active:opacity-100"
          >
            ←
          </button>
        ) : <span className="w-10" />}

        <div className="flex gap-1.5" aria-label={`Adım ${i + 1} / ${STEPS.length}`}>
          {STEPS.map((_, idx) => (
            <span
              key={idx}
              className="h-1.5 rounded-full transition-all"
              style={{
                width: idx === i ? 28 : 8,
                background: idx <= i ? 'var(--color-fener-gold)' : 'var(--color-fener-border)'
              }}
            />
          ))}
        </div>

        {!isLast ? (
          <button
            onClick={finish}
            className="w-14 h-10 text-sm opacity-60 active:opacity-100"
            aria-label="Sihirbazı atla"
          >
            Atla
          </button>
        ) : <span className="w-14" />}
      </div>

      {/* İçerik: emoji büyük, başlık, gövde. Tek kolon, ortalı, ferah. */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-4 overflow-y-auto">
        <div className="w-full max-w-sm flex flex-col items-center text-center gap-5">
          <div
            className="rounded-full flex items-center justify-center"
            style={{
              width: 144,
              height: 144,
              background: 'radial-gradient(circle, rgba(196,168,130,0.18) 0%, rgba(196,168,130,0) 70%)'
            }}
            aria-hidden
          >
            <span style={{ fontSize: 88, lineHeight: 1 }}>{step.emoji}</span>
          </div>
          <h2 className="text-3xl font-black leading-tight">
            {step.title}
          </h2>
          <p className="text-lg leading-relaxed opacity-85 max-w-[30ch]">
            {step.body}
          </p>
        </div>
      </div>

      {/* Alt: büyük birincil + varsa ikincil. Min yükseklik, safe area. */}
      <div className="w-full max-w-md mx-auto px-4 pb-4 flex flex-col gap-2">
        <button
          onClick={primary}
          className="w-full rounded-2xl py-4 font-bold text-lg active:scale-[0.98] transition-transform"
          style={{
            background: 'var(--color-fener-gold)',
            color: 'var(--color-fener-bg)',
            minHeight: 56
          }}
        >
          {step.primary}
        </button>
        {step.secondary ? (
          <button
            onClick={secondary}
            className="w-full rounded-2xl py-3 text-base opacity-70 active:opacity-100"
            style={{ minHeight: 44 }}
          >
            {step.secondary}
          </button>
        ) : <div style={{ minHeight: 44 }} />}
      </div>
    </div>
  )
}
