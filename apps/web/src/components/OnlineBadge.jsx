import { useEffect, useState } from 'react'

export default function OnlineBadge() {
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)

  useEffect(() => {
    const up = () => setOnline(true)
    const down = () => setOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => {
      window.removeEventListener('online', up)
      window.removeEventListener('offline', down)
    }
  }, [])

  return (
    <span
      className="flex items-center gap-2 text-xs"
      aria-label={online ? 'Çevrimiçi' : 'Çevrimdışı'}
    >
      <span
        className={`inline-block w-2 h-2 rounded-full ${online ? 'bg-[--color-fener-ok]' : 'bg-[--color-fener-help]'}`}
      />
      {online ? 'Çevrimiçi' : 'Çevrimdışı'}
    </span>
  )
}
