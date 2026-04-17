# Fener Yol Haritası

## Faz 0 — Kuruluş (1 hafta)
- [x] Repo açılışı
- [x] MANIFESTO + ROADMAP + LICENSE (Apache-2.0)
- [ ] Domain: fener.silifketeknoloji.org
- [ ] Landing page

## Faz 1 — PWA MVP (2-3 hafta)
**Hedef:** Silifkeli bir yurttaşın telefonuna kurabileceği, internet kesikken bile çalışan bir uygulama.

- [x] PWA shell (manifest + service worker)
- [x] Ana ekran: 3 buton (BEN İYİYİM / YARDIM LAZIM / ACİL BİLGİLERİM)
- [x] Acil bilgi kartı (kan grubu, alerji, ilaç, acil kişi) — IndexedDB
- [x] Aile protokolü — ekleme + WhatsApp/SMS mesaj outbox
- [x] Harita — MapLibre + OSM raster + örnek toplanma noktaları + en yakın nokta
- [x] "Ben iyiyim" / "Yardım lazım" → WhatsApp deep-link
- [x] Enkaz düdüğü (WebAudio 3kHz darbeli)
- [x] Sesli rehber (Web Speech API tr-TR)
- [x] tr + en dil desteği
- [x] İlk açılış onboarding + iOS install hint
- [x] Erişilebilirlik: font ölçeği (S/M/L/XL) + yüksek kontrast
- [x] Ayarlar: dil, kontrast, font, veri silme, kimlik
- [x] Silifke bölgesi offline tile pre-fetch (opsiyonel)
- [x] Ed25519 / ECDSA-P256 kimlik + imza lib
- [x] beforeinstallprompt (Android/desktop) + IosInstallHint
- [x] Error boundary
- [x] Bundle < 200KB gzipped (ana 135KB, Map lazy 286KB)
- [ ] Lighthouse PWA 100/100 (cihazda doğrulama)
- [ ] Gerçek AFAD/belediye toplanma noktaları verisi
- [ ] MBTiles/PMTiles ile tam offline vector harita

## Faz 2 — P2P (Bluetooth + WebRTC) (2-3 hafta)
- [ ] Web Bluetooth ile yakın telefon eşleşmesi
- [ ] libp2p browser build
- [ ] WebRTC DataChannel (aynı Wi-Fi)
- [ ] Ed25519 imzalı mesaj (Web Crypto API)
- [ ] 10-hop TTL routing

## Faz 3 — LoRa Pilot (4-6 hafta)
**Hedef:** Silifke'de 2-3 gateway, telefon ↔ gateway ↔ uzaktaki gateway.

- [ ] Heltec ESP32 V3 + SX1262 ile prototip
- [ ] Meshtastic firmware üstü uygulama katmanı
- [ ] BLE ↔ LoRa köprüsü
- [ ] 20W solar + LiFePO4 pil enclosure (IP65)
- [ ] Cami minaresi / tepe / su deposu lokasyonları

## Faz 4 — Tam Ağ (3-4 ay)
- [ ] 10 gateway Silifke genelinde
- [ ] Belediye + Kaymakamlık entegrasyonu
- [ ] AFAD protokol görüşmeleri
- [ ] Eğitim programı (mahalle muhtarları, gönüllüler)

## Faz 5 — Türkiye Replikasyonu (Sürekli)
- [ ] İlçe-ilçe kurulum şablonu (dokümantasyon + kit)
- [ ] İkinci ilçe pilot (aday: Anamur veya Erdemli)
- [ ] TÜBİTAK 1512 BiGG başvurusu
- [ ] AB UCPM hibe başvurusu
- [ ] 20+ ilçede ağ

## Başarı Metrikleri

**3 ay:** 500+ yüklü PWA, 3 gateway, belediye toplantısı
**12 ay:** 5000+ yüklü, 10 gateway, ikinci ilçe pilot
**36 ay:** 20+ ilçe, AFAD protokolü, AB hibe, referans altyapı
