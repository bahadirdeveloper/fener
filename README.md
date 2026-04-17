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

- **Acil iletişim**: "Ben iyiyim" / "Yardım lazım" butonları, WhatsApp + SMS derin bağlantılar
- **Acil kart**: kan grubu, alerji, ilaç, acil kişi — QR kod ile paylaşılır
- **Harita**: Silifke toplanma alanları + tehlike poligonları (sel/heyelan/kıyı) + saha raporu pinleri; offline tile prefetch
- **SOS araçları**: Sessiz SOS (Mors titreşim + 3 kHz düdük), Işık SOS (ekran strobe), Pusula (en yakın toplanmaya)
- **Aile durumu**: üye listesi, hızlı arama, iyi/yardım/bilinmiyor dashboard
- **Ses kaydı**: MediaRecorder ile cihazda kalan notlar
- **İlk yardım**: CPR, kanama, yanık, kırık, şok hızlı kartları
- **Telsiz alfabesi**: Türk alfabesi hecelemesi + TTS
- **Kimlik + imza**: Ed25519 / ECDSA-P256 anahtar çifti, envelope tabanlı imzalı mesajlar
- **BLE prototip**: yakın Fener cihazı keşif + imza doğrulamalı mesaj gönder/al
- **Yedek**: tüm cihaz verisinin JSON export/import
- **Çok dilli**: tr / en / ar (RTL otomatik)
- **PWA**: kurulumu desteklenir, yeni sürüm bildirimi, Wake Lock, yüksek kontrast, enerji tasarrufu modu

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
