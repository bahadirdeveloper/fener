import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KIT_KEY as KEY, readKit, readKitTs, writeKitTs, kitStale } from '../lib/kit.js'

const SECTIONS = [
  {
    title: 'Çanta (72 saat)',
    items: [
      { id: 'water', label: 'Kişi başı 6 L su (2L/gün × 3 gün)' },
      { id: 'food', label: '3 gün dayanıklı gıda (konserve, bisküvi, kuruyemiş)' },
      { id: 'kit', label: 'İlk yardım çantası + kullandığın ilaçlar' },
      { id: 'whistle', label: 'Düdük (enkaz altında ses için)' },
      { id: 'flash', label: 'Pilli el feneri + yedek pil' },
      { id: 'radio', label: 'Pilli/şarjlı radyo' },
      { id: 'powerbank', label: 'Dolu power bank (≥10.000 mAh)' },
      { id: 'cash', label: 'Nakit (banka/POS çalışmayabilir)' },
      { id: 'docs', label: 'Kimlik fotokopisi + tapu/sağlık kartı (su geçirmez)' },
      { id: 'warm', label: 'Battaniye, yedek kıyafet, yağmurluk' },
      { id: 'mask', label: 'Toz maskesi (N95) ve eldiven' },
      { id: 'tool', label: 'Maket bıçağı / çakı, çok amaçlı alet' }
    ]
  },
  {
    title: 'Ev',
    items: [
      { id: 'anchor', label: 'Ağır mobilya ve televizyon duvara sabitlendi' },
      { id: 'gas', label: 'Doğalgaz vanası yerini biliyorum' },
      { id: 'water-off', label: 'Ana su vanası yerini biliyorum' },
      { id: 'exit', label: 'İki çıkış yolu planım var' },
      { id: 'meet', label: 'Aile toplanma noktası belirlendi' }
    ]
  },
  {
    title: 'Fener uygulama',
    items: [
      { id: 'card', label: 'Acil bilgi kartım dolu (kan grubu, alerji, ilaç)' },
      { id: 'family', label: 'Aile listem eklendi' },
      { id: 'tiles', label: 'Harita offline indirildi (Ayarlar)' },
      { id: 'identity', label: 'İmza anahtarım oluşturuldu' },
      { id: 'install', label: 'Fener telefona kuruldu (PWA)' }
    ]
  }
]

function save(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* noop */ }
}

function fmtDate(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  return d.toLocaleDateString('tr-TR', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function Kit() {
  const { t } = useTranslation()
  const [state, setState] = useState(() => readKit())
  const [ts, setTs] = useState(() => readKitTs())
  const first = useRef(true)

  useEffect(() => {
    if (first.current) { first.current = false; return }
    save(state)
    const now = Date.now()
    writeKitTs(now)
    setTs(now)
  }, [state])

  function toggle(id) {
    setState((s) => ({ ...s, [id]: !s[id] }))
  }

  const stale = kitStale(ts)

  const allItems = SECTIONS.flatMap((s) => s.items)
  const done = allItems.filter((it) => state[it.id]).length
  const pct = Math.round((done / allItems.length) * 100)

  function shareProgress() {
    const missing = SECTIONS.flatMap((s) =>
      s.items.filter((it) => !state[it.id]).map((it) => `• ${it.label}`)
    )
    const text = [
      `Fener afet hazırlığım: %${pct} (${done}/${allItems.length})`,
      missing.length > 0 ? '\nEksik:' : '',
      ...missing.slice(0, 10),
      missing.length > 10 ? `… ve ${missing.length - 10} madde daha` : '',
      '\n— Hazır mısın? github.com/bahadirdeveloper/fener'
    ].filter(Boolean).join('\n')
    if (navigator.share) {
      navigator.share({ text, title: 'Fener hazırlığım' }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(text)
      alert('Panoya kopyalandı.')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">{t('page.kit')}</h2>
      <p className="text-sm opacity-75">
        AFAD ve Kızılay'ın 72 saat hayatta kalma önerilerine göre hazırlandı. Hazırlığını kontrol et.
      </p>

      <div className="rounded-xl p-3 bg-[--color-fener-card] border border-[--color-fener-border] flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="font-semibold">Hazırlık</span>
          <span>{done}/{allItems.length} · {pct}%</span>
        </div>
        <div className="h-2 rounded bg-[--color-fener-bg] overflow-hidden">
          <div
            className="h-full bg-[--color-fener-gold] transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <button
          onClick={shareProgress}
          className="text-xs py-2 rounded-lg bg-[--color-fener-bg] border border-[--color-fener-border] font-semibold mt-1"
        >
          ↗ Aileme gönder (eksikleriyle)
        </button>
        <div className="text-[11px] opacity-60 mt-1">
          Son güncelleme: {fmtDate(ts)}
        </div>
      </div>

      {stale && (
        <div className="rounded-xl p-3 bg-[--color-fener-help] text-white text-xs font-semibold">
          ⚠️ 6 aydır güncellenmedi. Su, piller ve ilaç son kullanma tarihlerini kontrol et. Değiştirdikçe maddeyi tıkla — tarih yenilenecek.
        </div>
      )}

      {SECTIONS.map((sec) => (
        <div key={sec.title} className="flex flex-col gap-2">
          <h3 className="text-sm uppercase tracking-wider opacity-70">{sec.title}</h3>
          <ul className="flex flex-col gap-1">
            {sec.items.map((it) => (
              <li key={it.id}>
                <label className="flex items-start gap-3 p-3 rounded-xl bg-[--color-fener-card] border border-[--color-fener-border] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!state[it.id]}
                    onChange={() => toggle(it.id)}
                    className="w-6 h-6 mt-0.5 flex-shrink-0"
                  />
                  <span className={`text-sm ${state[it.id] ? 'line-through opacity-60' : ''}`}>
                    {it.label}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
