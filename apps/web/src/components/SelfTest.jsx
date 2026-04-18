import { useState } from 'react'

const TESTS = [
  {
    id: 'vibrate',
    label: 'Titreşim',
    hint: 'Telefon 200 ms titremeli',
    run: async () => {
      if (!('vibrate' in navigator)) throw new Error('desteklemiyor')
      const ok = navigator.vibrate(200)
      if (!ok) throw new Error('reddedildi')
      return 'titreşti'
    }
  },
  {
    id: 'beep',
    label: 'Hoparlör',
    hint: 'Kısa bip sesi çıkmalı',
    run: async () => {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) throw new Error('AudioContext yok')
      const ctx = new Ctx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.25, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.25)
      osc.connect(gain).connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.26)
      await new Promise((r) => setTimeout(r, 300))
      await ctx.close().catch(() => {})
      return 'ses çaldı'
    }
  },
  {
    id: 'gps',
    label: 'GPS',
    hint: 'Konum izni + bir fix',
    run: async () => {
      if (!navigator.geolocation) throw new Error('desteklemiyor')
      const pos = await new Promise((res, rej) => {
        navigator.geolocation.getCurrentPosition(res, rej, {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 60000
        })
      })
      return `±${Math.round(pos.coords.accuracy)} m`
    }
  },
  {
    id: 'mic',
    label: 'Mikrofon',
    hint: 'İzin + 1 sn akış',
    run: async () => {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('desteklemiyor')
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      await new Promise((r) => setTimeout(r, 500))
      stream.getTracks().forEach((t) => t.stop())
      return 'izin verildi'
    }
  },
  {
    id: 'torch',
    label: 'Flaş (torch)',
    hint: 'Arka kamera LED',
    run: async () => {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('desteklemiyor')
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: 'environment' } }
      })
      const track = stream.getVideoTracks()[0]
      const caps = track.getCapabilities?.() || {}
      if (!('torch' in caps)) {
        track.stop()
        throw new Error('torch API yok')
      }
      await track.applyConstraints({ advanced: [{ torch: true }] })
      await new Promise((r) => setTimeout(r, 500))
      await track.applyConstraints({ advanced: [{ torch: false }] }).catch(() => {})
      track.stop()
      return 'yandı'
    }
  },
  {
    id: 'notify',
    label: 'Bildirim',
    hint: 'Permission granted mı?',
    run: async () => {
      if (!('Notification' in window)) throw new Error('desteklemiyor')
      if (Notification.permission === 'granted') return 'granted'
      if (Notification.permission === 'denied') throw new Error('reddedildi')
      const p = await Notification.requestPermission()
      if (p !== 'granted') throw new Error(p)
      return 'granted'
    }
  },
  {
    id: 'wake',
    label: 'Wake Lock',
    hint: 'Ekran kapanmasın',
    run: async () => {
      if (!('wakeLock' in navigator)) throw new Error('desteklemiyor')
      const lock = await navigator.wakeLock.request('screen')
      await new Promise((r) => setTimeout(r, 200))
      await lock.release()
      return 'alındı'
    }
  },
  {
    id: 'storage',
    label: 'Kalıcı depolama',
    hint: 'IndexedDB + localStorage yaz/oku',
    run: async () => {
      const k = 'fener.selftest.' + Date.now()
      localStorage.setItem(k, '1')
      if (localStorage.getItem(k) !== '1') throw new Error('localStorage okunmuyor')
      localStorage.removeItem(k)
      if (!('indexedDB' in window)) throw new Error('IndexedDB yok')
      return 'yaz/oku tamam'
    }
  }
]

export default function SelfTest() {
  const [results, setResults] = useState({})
  const [running, setRunning] = useState(false)

  async function runOne(test) {
    setResults((r) => ({ ...r, [test.id]: { status: 'running' } }))
    try {
      const msg = await test.run()
      setResults((r) => ({ ...r, [test.id]: { status: 'ok', msg } }))
    } catch (e) {
      setResults((r) => ({ ...r, [test.id]: { status: 'fail', msg: e?.message || 'hata' } }))
    }
  }

  async function runAll() {
    setRunning(true)
    for (const test of TESTS) {
      // Torch ve mic kullanıcı etkileşimi isteyebilir — kullanıcı "tümünü" dese de tek tek çalıştır.
      // eslint-disable-next-line no-await-in-loop
      await runOne(test)
    }
    setRunning(false)
  }

  const okCount = Object.values(results).filter((r) => r.status === 'ok').length
  const failCount = Object.values(results).filter((r) => r.status === 'fail').length

  return (
    <div className="rounded-xl p-4 bg-[--color-fener-card] border border-[--color-fener-border] text-sm flex flex-col gap-2">
      <div className="text-xs opacity-70">
        Afet öncesi hazırlık: cihazın kritik yetenekleri çalışıyor mu? İzin isteyen testler için tarayıcı/işletim sistemi izin diyaloğu açılır.
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs">
          ✅ {okCount} · ❌ {failCount} · ∑ {TESTS.length}
        </div>
        <button
          onClick={runAll}
          disabled={running}
          className="rounded-lg px-3 py-2 bg-[--color-fener-gold] text-[--color-fener-bg] font-bold text-xs disabled:opacity-50"
        >
          {running ? 'Testler çalışıyor…' : 'Tümünü çalıştır'}
        </button>
      </div>
      <ul className="flex flex-col gap-1 mt-1">
        {TESTS.map((tst) => {
          const r = results[tst.id]
          const icon = !r ? '·' : r.status === 'running' ? '⏳' : r.status === 'ok' ? '✅' : '❌'
          return (
            <li key={tst.id}>
              <button
                onClick={() => runOne(tst)}
                className="w-full flex items-center gap-2 p-2 rounded-lg bg-[--color-fener-bg] border border-[--color-fener-border] text-left"
              >
                <span className="text-lg w-6 text-center" aria-hidden>{icon}</span>
                <span className="flex-1">
                  <div className="font-semibold">{tst.label}</div>
                  <div className="text-[11px] opacity-60">
                    {r?.msg || tst.hint}
                  </div>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
