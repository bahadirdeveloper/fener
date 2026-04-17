import { useEffect, useState } from 'react'
import { canInstall, onAvailabilityChange, promptInstall } from '../lib/installPrompt.js'
import { haptic } from '../lib/prefs.js'

export default function InstallButton() {
  const [avail, setAvail] = useState(canInstall())
  useEffect(() => onAvailabilityChange(setAvail), [])
  if (!avail) return null
  return (
    <button
      onClick={async () => { haptic(); await promptInstall() }}
      className="rounded-xl p-3 bg-[--color-fener-gold] text-[--color-fener-bg] font-bold"
    >
      📲 Ana ekrana kur
    </button>
  )
}
