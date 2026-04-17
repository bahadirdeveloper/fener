import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, pushOutbox } from '../lib/db.js'

function fmt(ms) {
  const s = Math.floor(ms / 1000)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

export default function Voice() {
  const notes = useLiveQuery(() => db.voiceNotes.orderBy('createdAt').reverse().toArray(), []) ?? []
  const [recording, setRecording] = useState(false)
  const [err, setErr] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const recRef = useRef(null)
  const chunksRef = useRef([])
  const startRef = useRef(0)
  const tickRef = useRef(null)

  useEffect(() => () => {
    if (recRef.current && recRef.current.state !== 'inactive') recRef.current.stop()
    clearInterval(tickRef.current)
  }, [])

  async function start() {
    setErr('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      chunksRef.current = []
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      rec.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || 'audio/webm' })
        await db.voiceNotes.add({
          blob,
          mime: blob.type,
          size: blob.size,
          duration: Date.now() - startRef.current,
          createdAt: Date.now()
        })
        stream.getTracks().forEach((t) => t.stop())
      }
      recRef.current = rec
      startRef.current = Date.now()
      rec.start()
      setRecording(true)
      setElapsed(0)
      tickRef.current = setInterval(() => setElapsed(Date.now() - startRef.current), 250)
    } catch (e) {
      setErr(e.message || 'Mikrofona erişilemedi')
    }
  }

  function stop() {
    recRef.current?.stop()
    clearInterval(tickRef.current)
    setRecording(false)
  }

  async function remove(id) {
    await db.voiceNotes.delete(id)
  }

  async function queue(n) {
    await pushOutbox({
      type: 'voice',
      text: `Ses notu · ${Math.round((n.duration || 0) / 1000)} sn`,
      voiceNoteId: n.id,
      size: n.size,
      mime: n.mime
    })
    alert('Gidene eklendi. BLE/LoRa bağlantısında gönderilecek.')
  }

  async function download(n) {
    const url = URL.createObjectURL(n.blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fener-ses-${n.id}.webm`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Ses mesajı</h2>
      <p className="text-sm opacity-70">
        Konuşamadığında ya da yazı yazamadığında sesini kaydet. Cihazında kalır.
      </p>

      <div className="rounded-xl p-4 bg-[--color-fener-card] border border-[--color-fener-border] flex flex-col items-center gap-3">
        {recording ? (
          <>
            <div className="text-3xl font-mono">{fmt(elapsed)}</div>
            <button
              onClick={stop}
              className="w-full rounded-xl p-4 bg-[--color-fener-help] text-white font-bold"
            >
              ⏹ Durdur ve kaydet
            </button>
          </>
        ) : (
          <button
            onClick={start}
            className="w-full rounded-xl p-4 bg-[--color-fener-gold] text-[--color-fener-bg] font-bold"
          >
            🎙️ Kayda başla
          </button>
        )}
        {err && <div className="text-xs text-[--color-fener-help]">{err}</div>}
      </div>

      <ul className="flex flex-col gap-2">
        {notes.map((n) => (
          <li key={n.id} className="rounded-xl p-3 bg-[--color-fener-card] border border-[--color-fener-border] flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs opacity-70">
              <span>{new Date(n.createdAt).toLocaleString('tr-TR')}</span>
              <span>{fmt(n.duration || 0)} · {Math.round((n.size || 0) / 1024)} KB</span>
            </div>
            <audio controls src={URL.createObjectURL(n.blob)} className="w-full" />
            <div className="flex gap-2">
              <button onClick={() => queue(n)} className="flex-1 text-sm py-2 rounded-lg bg-[--color-fener-gold] text-[--color-fener-bg] font-semibold">
                📤 Gidene ekle
              </button>
              <button onClick={() => download(n)} className="text-sm py-2 px-3 rounded-lg bg-[--color-fener-bg] border border-[--color-fener-border]">
                ⬇
              </button>
              <button onClick={() => remove(n.id)} className="text-sm py-2 px-3 rounded-lg text-[--color-fener-help]">
                Sil
              </button>
            </div>
          </li>
        ))}
        {notes.length === 0 && (
          <li className="text-center text-sm opacity-50 py-4">Henüz kayıt yok.</li>
        )}
      </ul>
    </div>
  )
}
