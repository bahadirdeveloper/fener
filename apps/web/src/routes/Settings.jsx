import { useEffect, useState } from 'react'
import { SCALES, getScale, setScale, getContrast, setContrast } from '../lib/a11y.js'
import { prefetchTiles, estimatedSizeMB } from '../lib/tilePrefetch.js'
import { ensureIdentity, getIdentity, forgetIdentity } from '../lib/crypto.js'
import { db } from '../lib/db.js'
import { exportAll, downloadBackup, importBackup } from '../lib/backup.js'
import { ensureNotifyPerm, hasNotify } from '../lib/notify.js'
import { isEnergySave, setEnergySave } from '../lib/prefs.js'
import InstallButton from '../components/InstallButton.jsx'
import { useTranslation } from 'react-i18next'
import i18n from '../i18n/index.js'

export default function Settings() {
  const { t } = useTranslation()
  const [scale, setScaleState] = useState(getScale())
  const [hc, setHc] = useState(getContrast())
  const [identity, setIdentity] = useState(null)
  const [prefetch, setPrefetch] = useState(null)
  const [lang, setLang] = useState(i18n.language)
  const [notifyPerm, setNotifyPerm] = useState(
    hasNotify() ? Notification.permission : 'unsupported'
  )
  const [esave, setEsave] = useState(isEnergySave())

  useEffect(() => { (async () => setIdentity(await getIdentity()))() }, [])

  async function doPrefetch() {
    setPrefetch({ done: 0, total: 0, failed: 0, running: true })
    const ac = new AbortController()
    const res = await prefetchTiles({
      onProgress: (p) => setPrefetch({ ...p, running: true })
    }).catch((e) => ({ error: e?.message }))
    setPrefetch({ ...res, running: false })
    ac.abort()
  }

  async function makeIdentity() {
    const id = await ensureIdentity()
    setIdentity(id)
  }

  async function clearData() {
    if (!confirm('Tüm cihaz verisi silinecek (profil, aile, outbox, kimlik). Emin misin?')) return
    await db.delete()
    forgetIdentity()
    localStorage.clear()
    location.reload()
  }

  function changeLang(l) {
    setLang(l)
    i18n.changeLanguage(l)
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold">Ayarlar</h2>

      <InstallButton />

      <Section title="Yazı boyutu">
        <div className="grid grid-cols-4 gap-2">
          {SCALES.map((s) => (
            <button
              key={s.id}
              onClick={() => { setScale(s.id); setScaleState(s.id) }}
              className={`rounded-lg py-3 font-bold ${scale === s.id ? 'bg-[--color-fener-gold] text-[--color-fener-bg]' : 'bg-[--color-fener-card] border border-[--color-fener-border]'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Yüksek kontrast">
        <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[--color-fener-card] border border-[--color-fener-border]">
          <span className="text-sm">Siyah-beyaz yüksek kontrast mod</span>
          <input
            type="checkbox"
            checked={hc}
            onChange={(e) => { setContrast(e.target.checked); setHc(e.target.checked) }}
            className="w-6 h-6"
          />
        </label>
      </Section>

      <Section title="Dil">
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'tr', label: 'Türkçe' },
            { id: 'en', label: 'English' },
            { id: 'ar', label: 'العربية' }
          ].map((l) => (
            <button
              key={l.id}
              onClick={() => changeLang(l.id)}
              className={`rounded-lg py-3 font-bold ${lang.startsWith(l.id) ? 'bg-[--color-fener-gold] text-[--color-fener-bg]' : 'bg-[--color-fener-card] border border-[--color-fener-border]'}`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Enerji tasarrufu">
        <label className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[--color-fener-card] border border-[--color-fener-border]">
          <span className="text-sm">
            Animasyonları ve titreşimi kapat, daha koyu arka plan. Pil uzar.
          </span>
          <input
            type="checkbox"
            checked={esave}
            onChange={(e) => { setEnergySave(e.target.checked); setEsave(e.target.checked) }}
            className="w-6 h-6"
          />
        </label>
      </Section>

      <Section title="Bildirimler">
        <div className="rounded-xl p-4 bg-[--color-fener-card] border border-[--color-fener-border] text-sm flex flex-col gap-2">
          <div className="text-xs opacity-70">
            Yakın cihazlardan (BLE) SOS ya da durum mesajı geldiğinde bildirim çıkar.
          </div>
          <div className="text-xs">Durum: <strong>{notifyPerm}</strong></div>
          {notifyPerm !== 'granted' && notifyPerm !== 'unsupported' && (
            <button
              onClick={async () => setNotifyPerm(await ensureNotifyPerm())}
              className="rounded-lg py-3 bg-[--color-fener-gold] text-[--color-fener-bg] font-bold"
            >
              Bildirim izni iste
            </button>
          )}
        </div>
      </Section>

      <Section title="Offline harita">
        <div className="rounded-xl p-4 bg-[--color-fener-card] border border-[--color-fener-border] text-sm flex flex-col gap-3">
          <div>
            Silifke bölgesi tile'larını arka planda indir. Afette harita açılmasa
            bile ekranda kalır. (~{estimatedSizeMB().toFixed(1)} MB, OSM raster)
          </div>
          <StorageInfo needMB={estimatedSizeMB()} />
          {prefetch?.running && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span>İndiriliyor…</span>
                <span>{prefetch.done}/{prefetch.total || '?'}</span>
              </div>
              <div className="h-2 rounded bg-[--color-fener-bg] overflow-hidden">
                <div
                  className="h-full bg-[--color-fener-gold] transition-all"
                  style={{ width: prefetch.total ? `${(prefetch.done / prefetch.total) * 100}%` : '0%' }}
                />
              </div>
            </div>
          )}
          {prefetch && !prefetch.running && (
            <div className="text-xs opacity-80">
              {prefetch.error
                ? `Hata: ${prefetch.error}`
                : `Tamam: ${prefetch.done}/${prefetch.total} · Hata: ${prefetch.failed}`}
            </div>
          )}
          <button
            onClick={doPrefetch}
            disabled={prefetch?.running}
            className="rounded-lg py-3 bg-[--color-fener-gold] text-[--color-fener-bg] font-bold disabled:opacity-50"
          >
            {prefetch?.running ? 'İndiriliyor…' : 'Haritayı indir'}
          </button>
          <div className="text-xs opacity-60">
            Not: SW sadece tarayıcı açıkken indirir. Yüklemede sekmenin kapanmaması gerek.
          </div>
        </div>
      </Section>

      <Section title="Kimlik (imzalı mesaj)">
        <div className="rounded-xl p-4 bg-[--color-fener-card] border border-[--color-fener-border] text-sm flex flex-col gap-3">
          {identity ? (
            <>
              <div>
                <div className="text-xs opacity-70">Algoritma</div>
                <div className="font-mono">{identity.alg}</div>
              </div>
              <div>
                <div className="text-xs opacity-70">Parmak izi</div>
                <div className="font-mono text-xs break-all">{identity.fingerprint}</div>
              </div>
              <div className="text-xs opacity-60">
                Mesajların bu anahtarla imzalanır. Alıcı kimliğini doğrulayabilir.
              </div>
            </>
          ) : (
            <>
              <div>Kimlik yok.</div>
              <button
                onClick={makeIdentity}
                className="rounded-lg py-3 bg-[--color-fener-gold] text-[--color-fener-bg] font-bold"
              >
                Kimlik oluştur
              </button>
            </>
          )}
        </div>
      </Section>

      <Section title="Yedek">
        <div className="flex flex-col gap-2">
          <button
            onClick={async () => downloadBackup(await exportAll())}
            className="rounded-xl p-3 bg-[--color-fener-card] border border-[--color-fener-border] font-semibold"
          >
            💾 Dışa aktar (JSON)
          </button>
          <label className="rounded-xl p-3 bg-[--color-fener-card] border border-[--color-fener-border] font-semibold text-center cursor-pointer">
            📂 İçe aktar
            <input
              type="file"
              accept="application/json"
              hidden
              onChange={async (e) => {
                const f = e.target.files?.[0]
                if (!f) return
                try {
                  const obj = JSON.parse(await f.text())
                  await importBackup(obj, { merge: true })
                  alert('Yedek geri yüklendi.')
                } catch (err) {
                  alert('Yedek okunamadı: ' + err.message)
                }
              }}
            />
          </label>
        </div>
      </Section>

      <Section title="Tehlikeli">
        <button
          onClick={clearData}
          className="rounded-xl p-3 bg-[--color-fener-help] text-white font-bold"
        >
          Tüm veriyi sil
        </button>
        <div className="text-xs opacity-60 mt-2">
          {t('footer') /* noop i18n guard */}
        </div>
      </Section>

      <Section title="Hakkında">
        <div className="rounded-xl p-4 bg-[--color-fener-card] border border-[--color-fener-border] text-sm flex flex-col gap-2">
          <div className="text-xs opacity-80">
            Fener açık kaynak, Apache-2.0 lisanslıdır. Silifke Teknoloji Topluluğu tarafından geliştirilir; katkıya açıktır.
          </div>
          <div className="flex flex-col gap-2">
            <a
              href="https://github.com/bahadirdeveloper/fener"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg py-2 px-3 bg-[--color-fener-bg] border border-[--color-fener-border] font-semibold text-center"
            >
              GitHub deposu ↗
            </a>
            <a
              href="https://github.com/bahadirdeveloper/fener/issues/new"
              target="_blank"
              rel="noreferrer"
              className="rounded-lg py-2 px-3 bg-[--color-fener-bg] border border-[--color-fener-border] font-semibold text-center"
            >
              Hata bildir / öneri ↗
            </a>
          </div>
        </div>
      </Section>

      <BuildInfo />
    </div>
  )
}

function BuildInfo() {
  const sha = typeof __BUILD_SHA__ !== 'undefined' ? __BUILD_SHA__ : 'dev'
  const builtAt = typeof __BUILD_AT__ !== 'undefined' ? __BUILD_AT__ : ''
  const date = builtAt ? new Date(builtAt).toLocaleString() : ''
  return (
    <div className="text-center text-xs opacity-50 pt-2">
      Sürüm {sha}{date && ` · ${date}`}
    </div>
  )
}

function StorageInfo({ needMB }) {
  const [info, setInfo] = useState(null)
  useEffect(() => {
    (async () => {
      if (!navigator.storage?.estimate) return
      try {
        const e = await navigator.storage.estimate()
        setInfo({
          usedMB: (e.usage || 0) / 1048576,
          quotaMB: (e.quota || 0) / 1048576
        })
      } catch { /* noop */ }
    })()
  }, [])
  if (!info) return null
  const free = info.quotaMB - info.usedMB
  const tight = free < needMB * 1.5
  return (
    <div className={`text-xs ${tight ? 'text-[--color-fener-help]' : 'opacity-70'}`}>
      Depolama: {info.usedMB.toFixed(1)} / {info.quotaMB.toFixed(0)} MB
      {tight && ' · yer yetersiz olabilir'}
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm uppercase tracking-wider opacity-70">{title}</h3>
      {children}
    </div>
  )
}
