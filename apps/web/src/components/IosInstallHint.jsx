import { useEffect, useState } from 'react'
import { getFlag, setFlag, isIos, isStandalone } from '../lib/prefs.js'

export default function IosInstallHint() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (!isIos()) return
    if (isStandalone()) return
    if (getFlag('installDismissed')) return
    const t = setTimeout(() => setShow(true), 2000)
    return () => clearTimeout(t)
  }, [])

  function dismiss() {
    setFlag('installDismissed')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 p-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)]">
      <div className="max-w-md mx-auto rounded-2xl bg-[--color-fener-card] border border-[--color-fener-gold]/40 shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="text-3xl" aria-hidden>📲</div>
          <div className="flex-1 text-sm">
            <div className="font-semibold mb-1">Fener'i ana ekrana ekle</div>
            <div className="opacity-80 leading-snug">
              Safari'de <strong>Paylaş</strong> <span aria-hidden>⬆️</span> butonuna bas,
              ardından <strong>"Ana Ekrana Ekle"</strong> seçeneğini seç. Afette ikondan direkt aç.
            </div>
          </div>
          <button
            onClick={dismiss}
            className="text-xs opacity-60 px-2"
            aria-label="Kapat"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}
