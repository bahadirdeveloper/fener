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

## Faz 1 (şu anki durum)

PWA çalışıyor. İnternetsiz devreye giren bölümler:

- **Acil iletişim**: "Ben iyiyim" / "Yardım lazım" butonları, WhatsApp + SMS derin bağlantılar, native Web Share
- **Acil kart**: kan grubu, alerji, ilaç, acil kişi — QR kod ile paylaşılır (görüntüleme sırasında wake lock)
- **Harita**: Silifke toplanma alanları + tehlike poligonları (sel/heyelan/kıyı) + saha raporu pinleri; uzun bas → kendi nokta; konum hazard içindeyse uyarı; offline tile prefetch
- **Saha raporu**: yıkık/yangın/sel/yol kapalı/güvenli/diğer — konumla imzalı zarf, haritada pin
- **SOS araçları**: Sessiz SOS (Mors titreşim + 3 kHz düdük), Işık SOS (kamera torch + ekran strobe), SOS beacon sayacı
- **Pusula**: hedef seçici (tüm toplanma + kendi noktaların, mesafeye göre sıralı)
- **Aile durumu**: üye listesi, çağrı/SMS/WhatsApp hızlı aksiyonlar, iyi/yardım/bilinmiyor dashboard
- **Ses kaydı**: MediaRecorder ile cihazda kalan notlar, outbox'a referans gönderme
- **İlk yardım**: CPR, kanama, yanık, kırık, şok hızlı kartları
- **Sesli rehber**: adım adım TTS + "Tüm rehberi oku"
- **Telsiz alfabesi**: Türk alfabesi hecelemesi + TTS
- **Kimlik + imza**: Ed25519 / ECDSA-P256 anahtar çifti, envelope tabanlı imzalı mesajlar
- **BLE prototip**: yakın Fener cihazı keşif + imza doğrulamalı mesaj gönder/al + outbox drain
- **QR import**: taranan Fener kartı tek dokunuşla aile listesine eklenir
- **Yedek**: tüm cihaz verisinin JSON export/import
- **Çok dilli**: tr / en / ar (RTL otomatik)
- **PWA**: kurulumu desteklenir, yeni sürüm bildirimi, Wake Lock, yüksek kontrast, enerji tasarrufu modu, offline timer

Saha testi rehberi: [USAGE.md](USAGE.md).

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
