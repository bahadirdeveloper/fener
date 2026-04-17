import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

// Türk telsiz alfabesi (TRT/TSK geleneği).
const TR_MAP = {
  a: 'Adana', b: 'Bolu', c: 'Ceyhan', ç: 'Çanakkale', d: 'Denizli',
  e: 'Edirne', f: 'Fatsa', g: 'Giresun', ğ: 'Yumuşak G', h: 'Hatay',
  ı: 'Isparta', i: 'İzmir', j: 'Jandarma', k: 'Kars', l: 'Lüleburgaz',
  m: 'Manisa', n: 'Niğde', o: 'Ordu', ö: 'Ödemiş', p: 'Polatlı',
  r: 'Rize', s: 'Sinop', ş: 'Şırnak', t: 'Tokat', u: 'Uşak',
  ü: 'Ünye', v: 'Van', y: 'Yozgat', z: 'Zonguldak',
  '0': 'Sıfır', '1': 'Bir', '2': 'İki', '3': 'Üç', '4': 'Dört',
  '5': 'Beş', '6': 'Altı', '7': 'Yedi', '8': 'Sekiz', '9': 'Dokuz'
}

export default function Alphabet() {
  const { t } = useTranslation()
  const [input, setInput] = useState('')
  const spelled = useMemo(() => {
    return Array.from(input.toLocaleLowerCase('tr-TR')).map((ch) => {
      if (ch === ' ') return { ch: ' ', word: '· boşluk ·' }
      if (TR_MAP[ch]) return { ch, word: TR_MAP[ch] }
      if (/[a-zçğıöşü0-9]/i.test(ch)) return { ch, word: ch.toUpperCase() }
      return null
    }).filter(Boolean)
  }, [input])

  function read() {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    const text = spelled.map((s) => `${s.ch === ' ' ? 'boşluk' : s.ch.toUpperCase()} gibi ${s.word}`).join('. ')
    const u = new SpeechSynthesisUtterance(text)
    u.lang = 'tr-TR'
    u.rate = 0.9
    window.speechSynthesis.speak(u)
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">{t('page.alphabet')}</h2>
      <p className="text-sm opacity-70">
        İsim ya da adres hecele. Telefonla diktiğinde karışmaz.
      </p>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Ad veya adres"
        className="rounded-xl p-3 bg-[--color-fener-card] border border-[--color-fener-border]"
      />
      <button
        onClick={read}
        disabled={!spelled.length}
        className="rounded-xl p-3 bg-[--color-fener-gold] text-[--color-fener-bg] font-bold disabled:opacity-40"
      >
        🔊 Oku
      </button>
      <ul className="flex flex-col gap-1">
        {spelled.map((s, i) => (
          <li key={i} className="rounded-lg p-2 bg-[--color-fener-card] border border-[--color-fener-border] flex justify-between">
            <span className="font-mono text-lg uppercase">{s.ch}</span>
            <span className="text-sm opacity-80">{s.word}</span>
          </li>
        ))}
      </ul>

      <details className="text-xs opacity-70">
        <summary>Tüm alfabe</summary>
        <ul className="mt-2 grid grid-cols-2 gap-1">
          {Object.entries(TR_MAP).map(([k, v]) => (
            <li key={k} className="flex justify-between">
              <span className="font-mono uppercase">{k}</span>
              <span>{v}</span>
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}
