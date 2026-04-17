# Fener

**İnternet yokken, baz istasyonu çökmüşken bile çalışır.**
Yurttaş sahibi, belediye destekli, şirket kontrolsüz.
Silifke'de doğar, Türkiye'nin her ilçesine replikasyon şablonu olur.

Fener, afet anında çalışmaya devam eden açık kaynak bir iletişim ve bilgilendirme ağıdır. Silifke Teknoloji Topluluğu tarafından başlatılmıştır.

## Mimari

4 katman:

1. **PWA** — Cihazda yaşar, internet gerekmez. Offline harita, acil bilgi kartı, "ben iyiyim" butonu.
2. **P2P (BLE + WebRTC)** — Telefonlar birbiriyle mesh ağ kurar.
3. **LoRa Mesh Backbone** — 10 gateway ile şehir ölçeğinde iletişim, altyapısız.
4. **SMS + Radyo fallback** — Son çare.

Detaylı vizyon için [MANIFESTO.md](MANIFESTO.md), plan için [ROADMAP.md](ROADMAP.md).

## Geliştirme

```bash
cd apps/web
npm install
npm run dev
```

## Katkı

Katkı rehberi: [CONTRIBUTING.md](CONTRIBUTING.md). Topluluk kuralları: [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Lisans

[Apache-2.0](LICENSE). Meshtastic firmware ile uyumludur (Faz 3 için kritik).
