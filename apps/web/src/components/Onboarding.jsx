import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { setFlag, haptic } from '../lib/prefs.js'

const STEPS = [
  {
    emoji: '🔦',
    title: 'Fener',
    body: 'İnternet yokken bile çalışan açık kaynak afet iletişim uygulaması. 3 dakikada hazır ol.',
    primary: 'Başla'
  },
  {
    emoji: '📍',
    title: 'Konum izni',
    body: 'Depremde "Ben iyiyim" mesajı konumunu otomatik ekler. Konum sadece cihazında kalır, kimseye gönderilmez.',
    primary: 'İzin ver',
    secondary: 'Sonra',
    action: 'location'
  },
  {
    emoji: '🪪',
    title: 'Acil bilgi kartı',
    body: 'Kan grubu, alerji, kullandığın ilaç… Kurtarıcılar için hayati bilgi. 1 dakikada doldur.',
    primary: 'Şimdi doldur',
    secondary: 'Atla',
    action: 'card'
  },
  {
    emoji: '👨‍👩‍👧',
    title: 'Ailen',
    body: 'Depremde tek dokunuşla hepsine "Ben iyiyim" mesajı gitsin. Ekleyebileceğin kişileri ekle.',
    primary: 'Aile ekle',
    secondary: 'Atla',
    action: 'family'
  }
]

export default function Onboarding({ onDone }) {
  const [i, setI] = useState(0)
  const nav = useNavigate()
  const step = STEPS[i]

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
    if (i < STEPS.length - 1) setI(i + 1)
    else finish()
  }

  function secondary() {
    haptic()
    if (i < STEPS.length - 1) setI(i + 1)
    else finish()
  }

  function finish() {
    setFlag('onboarded')
    onDone?.()
  }

  return (
    <div className="fixed inset-0 z-50 bg-[--color-fener-bg] flex flex-col px-4 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-end pt-3">
        <button
          onClick={finish}
          className="text-xs opacity-50 px-3 py-2"
          aria-label="Atla"
        >
          Atla
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center max-w-md mx-auto text-center gap-6">
        <div className="text-7xl" aria-hidden>{step.emoji}</div>
        <h2 className="text-3xl font-bold">{step.title}</h2>
        <p className="text-base opacity-85 leading-relaxed px-4">{step.body}</p>
      </div>

      <div className="max-w-md mx-auto w-full flex flex-col gap-2 pb-4">
        <div className="flex justify-center gap-1.5 mb-2">
          {STEPS.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${idx === i ? 'w-6 bg-[--color-fener-gold]' : 'w-1.5 bg-[--color-fener-border]'}`}
            />
          ))}
        </div>
        <button
          onClick={primary}
          className="rounded-xl p-4 bg-[--color-fener-gold] text-[--color-fener-bg] font-bold text-lg"
        >
          {step.primary}
        </button>
        {step.secondary && (
          <button
            onClick={secondary}
            className="rounded-xl p-3 text-sm opacity-70"
          >
            {step.secondary}
          </button>
        )}
      </div>
    </div>
  )
}
