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
      <p className="text-base opacity-80">
        Buraya eklediğin kişilere tek tuşla "Ben iyiyim" mesajı gidebilir.
      </p>

      <form onSubmit={add} className="flex flex-col gap-3 rounded-xl p-4 bg-[--color-fener-card] border border-[--color-fener-border]">
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Adı</span>
          <input
            className="inp-f"
            placeholder="Örn: Ayşe Anne"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Telefon</span>
          <input
            className="inp-f"
            type="tel"
            inputMode="tel"
            placeholder="05xx xxx xx xx"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold">Yakınlığı</span>
          <select
            className="inp-f"
            value={form.relation}
            onChange={(e) => setForm({ ...form, relation: e.target.value })}
          >
            {RELATIONS.map((r) => <option key={r}>{r}</option>)}
          </select>
        </label>
        <button type="submit" className="rounded-2xl py-4 bg-[--color-fener-gold] text-[--color-fener-bg] font-bold text-lg min-h-[56px]">
          + Ekle
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
                <div className="flex gap-2 text-sm">
                  <a href={`tel:${phone}`} className="flex-1 text-center py-3 rounded-xl bg-[--color-fener-bg] border border-[--color-fener-border] font-semibold min-h-[48px] flex items-center justify-center">📞 Ara</a>
                  <a href={`sms:${phone}?body=${msg}`} className="flex-1 text-center py-3 rounded-xl bg-[--color-fener-bg] border border-[--color-fener-border] font-semibold min-h-[48px] flex items-center justify-center">💬 SMS</a>
                  <a href={`https://wa.me/${waPhone}?text=${msg}`} target="_blank" rel="noreferrer" className="flex-1 text-center py-3 rounded-xl bg-[--color-fener-ok] text-white font-semibold min-h-[48px] flex items-center justify-center">WhatsApp</a>
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
          border-radius: 0.75rem;
          padding: 0.875rem 1rem;
          min-height: 52px;
          color: var(--color-fener-cream);
          font-size: 17px;
        }
        .inp-f:focus { outline: 2px solid var(--color-fener-gold); }
      `}</style>
    </div>
  )
}
