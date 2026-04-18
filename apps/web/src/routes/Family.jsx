import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../lib/db.js'
import { normalizeTrPhone } from '../lib/phone.js'

const RELATIONS = ['Eş', 'Anne', 'Baba', 'Kardeş', 'Çocuk', 'Akraba', 'Arkadaş', 'Komşu', 'Diğer']

export default function Family() {
  const family = useLiveQuery(() => db.family.toArray(), []) ?? []
  const [form, setForm] = useState({ name: '', phone: '', relation: 'Eş', isPrimary: false })

  async function add(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    await db.family.add({ ...form })
    setForm({ name: '', phone: '', relation: 'Eş', isPrimary: false })
  }

  async function remove(id) {
    await db.family.delete(id)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Ailem</h2>
        <a href="/aile/durum" className="text-sm px-3 py-2 rounded-lg bg-[--color-fener-card] border border-[--color-fener-border] font-semibold">
          📊 Durum
        </a>
      </div>
      <p className="text-sm opacity-70">
        Acil durumda "Ben İyiyim" mesajı bu kişilere WhatsApp ile gönderilecek.
      </p>

      <form onSubmit={add} className="flex flex-col gap-2 rounded-xl p-3 bg-[--color-fener-card] border border-[--color-fener-border]">
        <input
          className="inp-f"
          placeholder="Ad Soyad"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <input
          className="inp-f"
          type="tel"
          inputMode="tel"
          placeholder="Telefon (5xx...)"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        <select
          className="inp-f"
          value={form.relation}
          onChange={(e) => setForm({ ...form, relation: e.target.value })}
        >
          {RELATIONS.map((r) => <option key={r}>{r}</option>)}
        </select>
        <button type="submit" className="rounded-lg p-3 bg-[--color-fener-gold] text-[--color-fener-bg] font-bold">
          Ekle
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {family.map((m) => {
          const phone = (m.phone || '').replace(/\s+/g, '')
          const msg = encodeURIComponent('Ben iyiyim. — Fener')
          const waPhone = normalizeTrPhone(phone)
          return (
            <li key={m.id} className="flex flex-col gap-2 rounded-xl p-3 bg-[--color-fener-card] border border-[--color-fener-border]">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-xs opacity-70">{m.relation} · {m.phone || '—'}</div>
                </div>
                <button
                  onClick={() => remove(m.id)}
                  className="text-sm text-[--color-fener-help] px-3 py-2"
                  aria-label={`${m.name} sil`}
                >
                  Sil
                </button>
              </div>
              {phone && (
                <div className="flex gap-1 text-xs">
                  <a href={`tel:${phone}`} className="flex-1 text-center py-2 rounded-lg bg-[--color-fener-bg] border border-[--color-fener-border] font-semibold">📞 Ara</a>
                  <a href={`sms:${phone}?body=${msg}`} className="flex-1 text-center py-2 rounded-lg bg-[--color-fener-bg] border border-[--color-fener-border] font-semibold">💬 SMS</a>
                  <a href={`https://wa.me/${waPhone}?text=${msg}`} target="_blank" rel="noreferrer" className="flex-1 text-center py-2 rounded-lg bg-[--color-fener-ok] text-white font-semibold">WhatsApp</a>
                </div>
              )}
            </li>
          )
        })}
        {family.length === 0 && (
          <li className="text-center text-sm opacity-50 py-4">Henüz kimse eklenmedi.</li>
        )}
      </ul>

      <style>{`
        .inp-f {
          width: 100%;
          background: var(--color-fener-bg);
          border: 1px solid var(--color-fener-border);
          border-radius: 0.5rem;
          padding: 0.75rem;
          color: var(--color-fener-cream);
        }
        .inp-f:focus { outline: 2px solid var(--color-fener-gold); }
      `}</style>
    </div>
  )
}
