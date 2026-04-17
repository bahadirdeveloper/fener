import { useState } from 'react'

const STEPS = [
  {
    title: 'Sarsıntı sırasında',
    body: 'ÇÖK – KAPAN – TUTUN. Sağlam bir masa altına çök, başını ve ensenı koru, sarsıntı bitene kadar tutun. Pencere ve düşebilecek eşyalardan uzak dur.'
  },
  {
    title: 'Sarsıntı bittiğinde',
    body: 'Sakin ol. Hızla çevreni değerlendir. Yaralı var mı bak. Dumanı ve gaz kokusunu kontrol et. Gaz vanasını, elektrik şalterini kapat. Binadan sakin çık, asansör kullanma.'
  },
  {
    title: 'Dışarı çıkınca',
    body: 'Toplanma noktasına git. Binalardan, direklerden, camlardan uzak dur. Yetkililerin talimatını bekle. Ailene "Ben İyiyim" mesajı gönder.'
  },
  {
    title: 'Enkaz altındaysan',
    body: 'Enerji harcama, bağırma. Fener düdüğünü aç. Cep telefonu varsa konum paylaş. Tozu önlemek için ağzını bez ile kapat. Kıpırdama, duvara vurarak sinyal ver.'
  },
  {
    title: 'Aileni bulmak için',
    body: 'Önceden belirlenen buluşma noktasına git. Telefon çalışmıyorsa komşu şehirdeki yakınını ortak kontak olarak ara. Her birey farklı bir yöne dağıldıysa panik yapma.'
  }
]

export default function Guide() {
  const [speaking, setSpeaking] = useState(null)

  function speak(i) {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(`${STEPS[i].title}. ${STEPS[i].body}`)
    u.lang = 'tr-TR'
    u.rate = 0.95
    u.onend = () => setSpeaking(null)
    setSpeaking(i)
    window.speechSynthesis.speak(u)
  }

  function stop() {
    window.speechSynthesis.cancel()
    setSpeaking(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Sesli Rehber</h2>
      <p className="text-sm opacity-70">Cihazın kendi sesi ile çalar, internet gerekmez.</p>

      <div className="grid grid-cols-2 gap-2">
        <a href="/sessiz-sos" className="rounded-xl p-3 bg-[--color-fener-help] text-white font-bold text-center text-sm">
          🆘 Sessiz SOS
        </a>
        <a href="/isik" className="rounded-xl p-3 bg-[--color-fener-card] border border-[--color-fener-gold] text-center text-sm font-bold">
          🔦 Işık SOS
        </a>
        <a href="/ilkyardim" className="rounded-xl p-3 bg-[--color-fener-card] border border-[--color-fener-border] text-center text-sm font-bold">
          🚑 İlk yardım
        </a>
        <a href="/alfabe" className="rounded-xl p-3 bg-[--color-fener-card] border border-[--color-fener-border] text-center text-sm font-bold">
          📻 Telsiz alfabesi
        </a>
      </div>

      <ol className="flex flex-col gap-3">
        {STEPS.map((s, i) => (
          <li key={i} className="rounded-xl p-4 bg-[--color-fener-card] border border-[--color-fener-border]">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold text-[--color-fener-gold-bright]">{i + 1}. {s.title}</h3>
              <button
                onClick={() => speaking === i ? stop() : speak(i)}
                className="text-sm px-3 py-1 rounded-md bg-[--color-fener-gold] text-[--color-fener-bg] font-semibold"
                aria-label={speaking === i ? 'Durdur' : 'Sesli oku'}
              >
                {speaking === i ? '⏹' : '🔊'}
              </button>
            </div>
            <p className="text-sm opacity-90 leading-relaxed">{s.body}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
