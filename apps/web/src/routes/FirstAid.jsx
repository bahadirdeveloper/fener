import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const CARDS = [
  {
    id: 'cpr',
    title: 'Kalp masajı (CPR)',
    emoji: '💓',
    steps: [
      'Yaralı yanıt vermiyor ve nefes almıyorsa 112 ara / biri arasın.',
      'Göğsün ortasına iki elinle dik bas. Dakikada 100–120 bası.',
      '5–6 cm derinlik, her basıdan sonra göğsün geri yükselmesini bekle.',
      '30 bası + 2 kurtarıcı nefes döngüsü. Eğitim yoksa sadece bası yeterli.',
      'Ekip gelene ya da yaralı hareket edene kadar durma.'
    ]
  },
  {
    id: 'bleed',
    title: 'Şiddetli kanama',
    emoji: '🩸',
    steps: [
      'Temiz bez/tişört ile kanayan yere doğrudan sert bas.',
      'Bezi kaldırma, üstüne başka bez koyarak basıya devam et.',
      'Yarayı kalp seviyesinin üstünde tutmaya çalış.',
      'Şok belirtisi (solgun, titreme): üşütme, bacaklarını hafif yukarı kaldır.',
      '112 gelene kadar basıyı bırakma.'
    ]
  },
  {
    id: 'burn',
    title: 'Yanık',
    emoji: '🔥',
    steps: [
      'Yanan yeri 10–20 dk soğuk (buzlu değil) akan suyun altında tut.',
      'Takı, sıkı kıyafeti şişme başlamadan çıkar.',
      'Yapışan kumaşı çekme, su döktür ve kes.',
      'Kabarcıkları patlatma. Üstüne temiz, nemli bez kapat.',
      '2. ve 3. derece yanıklarda 112 ara.'
    ]
  },
  {
    id: 'fracture',
    title: 'Kırık şüphesi',
    emoji: '🦴',
    steps: [
      'Uzuvu oynatma; bulunduğu şekilde destekle.',
      'Karton/tahta ile iki ucunu sabitle, sıkma.',
      'Açık kırık: temiz bezle örtüp bas, ama kırığa dokunma.',
      'Sıcak tut, su verme, 112 ara.'
    ]
  },
  {
    id: 'shock',
    title: 'Şok',
    emoji: '⚠️',
    steps: [
      'Sırtüstü yatır, bacaklarını 20–30 cm yükselt (kırık yoksa).',
      'Üstünü ört, üşütme.',
      'Ağızdan sıvı verme.',
      'Nefes durursa CPR başlat, 112 ara.'
    ]
  }
]

export default function FirstAid() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(null)
  const [metronome, setMetronome] = useState(false)
  const audioRef = useRef(null)
  const timerRef = useRef(null)

  function stopMetronome() {
    clearInterval(timerRef.current)
    timerRef.current = null
    try { audioRef.current?.close() } catch { /* noop */ }
    audioRef.current = null
    setMetronome(false)
  }

  function startMetronome() {
    if (metronome) { stopMetronome(); return }
    const Ctx = window.AudioContext || window.webkitAudioContext
    if (!Ctx) return
    const ctx = new Ctx()
    audioRef.current = ctx
    const click = () => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = 1000
      osc.type = 'square'
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.002)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05)
      osc.connect(gain).connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.06)
    }
    click()
    // 110 BPM = 60000/110 ≈ 545 ms (100-120 CPR range ortası)
    timerRef.current = setInterval(click, 545)
    setMetronome(true)
  }

  useEffect(() => () => stopMetronome(), [])

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-2xl font-bold">{t('page.firstAid')}</h2>
      <p className="text-sm opacity-70">
        Kısa talimatlar. Eğitim değil — ama hiçbir şey yapmamaktan iyidir.
      </p>

      {CARDS.map((c) => (
        <div key={c.id} className="rounded-xl bg-[--color-fener-card] border border-[--color-fener-border] overflow-hidden">
          <button
            onClick={() => setOpen(open === c.id ? null : c.id)}
            className="w-full flex items-center gap-3 p-4 text-left"
          >
            <span className="text-3xl" aria-hidden>{c.emoji}</span>
            <span className="flex-1 font-semibold">{c.title}</span>
            <span className="opacity-60">{open === c.id ? '▾' : '▸'}</span>
          </button>
          {open === c.id && (
            <div className="pb-4">
              <ol className="list-decimal ml-8 pr-4 flex flex-col gap-2 text-sm">
                {c.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
              {c.id === 'cpr' && (
                <div className="mx-4 mt-3">
                  <button
                    onClick={startMetronome}
                    className={`w-full rounded-lg py-3 font-bold ${metronome ? 'bg-[--color-fener-help] text-white animate-pulse' : 'bg-[--color-fener-gold] text-[--color-fener-bg]'}`}
                  >
                    {metronome ? '⏹ Metronomu durdur' : '🥁 110 BPM metronom (CPR temposu)'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <a href="tel:112" className="rounded-xl p-4 bg-[--color-fener-help] text-white font-bold text-center">
        📞 112'yi ara
      </a>
    </div>
  )
}
