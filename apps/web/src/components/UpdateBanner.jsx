import { useEffect, useState } from 'react'
import { registerSW } from 'virtual:pwa-register'

export default function UpdateBanner() {
  const [needRefresh, setNeedRefresh] = useState(false)
  const [updateSW, setUpdateSW] = useState(null)

  useEffect(() => {
    const fn = registerSW({
      onNeedRefresh() { setNeedRefresh(true) },
      onOfflineReady() {},
    })
    setUpdateSW(() => fn)
  }, [])

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3">
      <div className="mx-auto max-w-md rounded-xl border border-[--color-fener-border] bg-[--color-fener-card] p-3 shadow-lg flex items-center gap-3">
        <div className="flex-1 text-sm">
          <div className="font-semibold text-[--color-fener-gold-bright]">Yeni sürüm hazır</div>
          <div className="text-xs opacity-70">Güncellemek için yenile.</div>
        </div>
        <button
          onClick={() => updateSW && updateSW(true)}
          className="rounded-lg px-3 py-2 bg-[--color-fener-gold] text-[--color-fener-bg] font-bold text-sm"
        >
          Yenile
        </button>
        <button
          onClick={() => setNeedRefresh(false)}
          className="rounded-lg px-2 py-2 text-xs opacity-70"
          aria-label="Kapat"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
