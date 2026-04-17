import { useEffect, useState } from 'react'
import { getProfile, saveProfile } from '../lib/db.js'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', '0+', '0-', 'Bilinmiyor']

const empty = {
  name: '',
  birthYear: '',
  bloodGroup: '',
  allergies: '',
  medications: '',
  conditions: '',
  emergencyContact: '',
  emergencyPhone: '',
  notes: ''
}

export default function Card() {
  const [form, setForm] = useState(empty)
  const [saved, setSaved] = useState(false)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    (async () => {
      const p = await getProfile()
      if (p) setForm({ ...empty, ...p })
      setLoaded(true)
    })()
  }, [])

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
    setSaved(false)
  }

  const phoneOk = !form.emergencyPhone || /^[+0-9 ()-]{7,}$/.test(form.emergencyPhone.trim())

  async function onSubmit(e) {
    e.preventDefault()
    if (!phoneOk) return
    await saveProfile(form)
    setSaved(true)
  }

  if (!loaded) return null

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Acil Bilgi Kartım</h2>
        <a href="/kart/goster" className="text-sm underline text-[--color-fener-gold]">QR Göster →</a>
      </div>
      <p className="text-sm opacity-70">
        Bu bilgi sadece cihazında saklanır. Afet anında kurtarıcılara gösterebilirsin.
      </p>

      <Field label="Ad Soyad">
        <input className="inp" value={form.name} onChange={(e) => set('name', e.target.value)} autoComplete="name" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Doğum Yılı">
          <input type="number" inputMode="numeric" className="inp" value={form.birthYear} onChange={(e) => set('birthYear', e.target.value)} />
        </Field>
        <Field label="Kan Grubu">
          <select className="inp" value={form.bloodGroup} onChange={(e) => set('bloodGroup', e.target.value)}>
            <option value="">Seç</option>
            {BLOOD_GROUPS.map((g) => <option key={g}>{g}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Alerjiler">
        <textarea rows={2} className="inp" value={form.allergies} onChange={(e) => set('allergies', e.target.value)} placeholder="Penisilin, fındık..." />
      </Field>

      <Field label="Kullandığı İlaçlar">
        <textarea rows={2} className="inp" value={form.medications} onChange={(e) => set('medications', e.target.value)} placeholder="Doz ve saatiyle" />
      </Field>

      <Field label="Kronik Hastalıklar">
        <textarea rows={2} className="inp" value={form.conditions} onChange={(e) => set('conditions', e.target.value)} placeholder="Diyabet, astım..." />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Acil Kişi">
          <input className="inp" value={form.emergencyContact} onChange={(e) => set('emergencyContact', e.target.value)} />
        </Field>
        <Field label="Telefon">
          <input type="tel" inputMode="tel" className="inp" value={form.emergencyPhone} onChange={(e) => set('emergencyPhone', e.target.value)} aria-invalid={!phoneOk} />
          {!phoneOk && <span className="text-[10px] text-[--color-fener-help]">Geçersiz telefon</span>}
        </Field>
      </div>

      <Field label="Not">
        <textarea rows={2} className="inp" value={form.notes} onChange={(e) => set('notes', e.target.value)} />
      </Field>

      <button type="submit" className="rounded-xl p-4 bg-[--color-fener-gold] text-[--color-fener-bg] font-bold text-lg mt-2">
        {saved ? '✓ Kaydedildi' : 'Kaydet'}
      </button>

      <style>{`
        .inp {
          width: 100%;
          background: var(--color-fener-card);
          border: 1px solid var(--color-fener-border);
          border-radius: 0.75rem;
          padding: 0.75rem;
          color: var(--color-fener-cream);
          font-size: 1rem;
        }
        .inp:focus {
          outline: 2px solid var(--color-fener-gold);
        }
      `}</style>
    </form>
  )
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs opacity-70 uppercase tracking-wider">{label}</span>
      {children}
    </label>
  )
}
