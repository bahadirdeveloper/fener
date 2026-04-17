import { useEffect, useRef, useState } from 'react'

export default function Scan() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [scanning, setScanning] = useState(false)

  useEffect(() => () => stop(), [])

  async function start() {
    setError('')
    setResult(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      })
      streamRef.current = stream
      videoRef.current.srcObject = stream
      await videoRef.current.play()
      setScanning(true)
      if ('BarcodeDetector' in window) {
        loopNative()
      } else {
        loopJsQR()
      }
    } catch (e) {
      setError('Kamera açılamadı: ' + (e.message || e.name))
    }
  }

  async function loopNative() {
    const detector = new window.BarcodeDetector({ formats: ['qr_code'] })
    const tick = async () => {
      if (!scanning && !streamRef.current) return
      try {
        const codes = await detector.detect(videoRef.current)
        if (codes?.[0]) {
          handle(codes[0].rawValue)
          return
        }
      } catch { /* ignore */ }
      rafRef.current = requestAnimationFrame(tick)
    }
    tick()
  }

  async function loopJsQR() {
    const { default: jsQR } = await import('jsqr')
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    const tick = () => {
      const v = videoRef.current
      if (!v || v.readyState !== 4) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }
      canvas.width = v.videoWidth
      canvas.height = v.videoHeight
      ctx.drawImage(v, 0, 0, canvas.width, canvas.height)
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' })
      if (code) {
        handle(code.data)
        return
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    tick()
  }

  function handle(raw) {
    stop()
    let parsed = null
    try { parsed = JSON.parse(raw) } catch { /* not json */ }
    setResult({ raw, parsed })
  }

  function stop() {
    setScanning(false)
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-2xl font-bold">QR Oku</h2>
      <p className="text-sm opacity-70">
        Başka bir Fener kullanıcısının acil bilgi kartını oku.
      </p>

      {!scanning && !result && (
        <button onClick={start} className="rounded-xl p-4 bg-[--color-fener-gold] text-[--color-fener-bg] font-bold text-lg">
          📷 Kamerayı aç
        </button>
      )}

      <div
        className={`relative w-full rounded-xl overflow-hidden border border-[--color-fener-border] bg-black ${scanning ? 'block' : 'hidden'}`}
        style={{ aspectRatio: '3/4' }}
      >
        <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="absolute inset-6 border-2 border-[--color-fener-gold]/60 rounded-2xl pointer-events-none" />
      </div>

      {scanning && (
        <button onClick={stop} className="rounded-xl p-3 bg-[--color-fener-card] border border-[--color-fener-border] font-semibold">
          Durdur
        </button>
      )}

      {error && <div className="text-sm text-[--color-fener-help]">{error}</div>}

      {result && (
        <div className="rounded-xl p-4 bg-[--color-fener-card] border border-[--color-fener-border] flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-[--color-fener-gold-bright]">Okunan</div>
            <button onClick={start} className="text-xs px-2 py-1 rounded bg-[--color-fener-bg] border border-[--color-fener-border]">
              Tekrar oku
            </button>
          </div>
          {result.parsed?.app === 'fener' ? (
            <CardDisplay data={result.parsed} />
          ) : (
            <pre className="whitespace-pre-wrap break-all text-xs font-mono">{result.raw}</pre>
          )}
        </div>
      )}
    </div>
  )
}

function CardDisplay({ data }) {
  return (
    <div className="rounded-xl p-3 bg-[--color-fener-cream] text-[--color-fener-bg] flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <div className="text-xl font-extrabold">{data.name || 'Adsız'}</div>
        <div className="text-sm">{data.birthYear || ''}</div>
      </div>
      {data.bloodGroup && (
        <div>
          <div className="text-[10px] uppercase opacity-70">Kan Grubu</div>
          <div className="text-2xl font-extrabold">{data.bloodGroup}</div>
        </div>
      )}
      <Row label="Alerjiler" value={data.allergies} />
      <Row label="İlaçlar" value={data.medications} />
      <Row label="Hastalıklar" value={data.conditions} />
      <Row label="Acil kişi" value={data.ec && `${data.ec} · ${data.ep || ''}`} />
      <Row label="Not" value={data.notes} />
    </div>
  )
}
function Row({ label, value }) {
  if (!value) return null
  return (
    <div>
      <div className="text-[10px] uppercase opacity-70">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  )
}
