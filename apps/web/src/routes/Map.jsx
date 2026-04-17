export default function Map() {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Toplanma Noktaları</h2>
      <div className="rounded-xl p-6 bg-[--color-fener-card] border border-[--color-fener-border] text-center">
        <div className="text-5xl mb-2">🗺️</div>
        <div className="text-sm opacity-80">
          Offline harita Faz 1.1'de eklenecek.
        </div>
        <div className="text-xs opacity-50 mt-2">
          MapLibre GL + Silifke MBTiles (~50MB) + AFAD toplanma noktaları.
        </div>
      </div>
      <div className="rounded-xl p-4 bg-[--color-fener-card] border border-[--color-fener-border]">
        <div className="font-semibold mb-2">Bilinen toplanma noktası</div>
        <ul className="text-sm opacity-80 list-disc pl-5 space-y-1">
          <li>Silifke Belediyesi meydanı</li>
          <li>Atatürk Mahallesi parkı</li>
          <li>Göksu köprüsü güneyi</li>
        </ul>
        <div className="text-xs opacity-50 mt-3">
          Gerçek AFAD verisi Faz 1.1'de entegre edilecek.
        </div>
      </div>
    </div>
  )
}
