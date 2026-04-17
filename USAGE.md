# Fener — Saha Test Turu

Bu rehber gönüllü test kullanıcıları içindir. Her adım internet olmadan da çalışmalıdır.

## 1. Kurulum (internet varken, tek seferlik)
1. Tarayıcıda `https://<host>/` aç.
2. "Ana ekrana ekle" / "Install" seçeneğini onayla (PWA).
3. Açılışta Silifke bölge haritası otomatik önbelleğe alınır (birkaç MB).

## 2. Acil bilgi kartı
- **Ana sayfa → ACİL BİLGİLERİM**
- Ad, kan grubu, alerji, ilaç, acil kişi + telefon doldur.
- **QR Göster →** butonu ekrana QR basar; başka telefon **Oku** ile tarayabilir.

## 3. Durum bildirimi
- **BEN İYİYİM**: tek dokunuş, yerel log.
- **YARDIM LAZIM**: dokun → yardım sayfası; **1.5 sn basılı tut** → panik modu (SOS beacon başlar, kırmızı bant ana sayfada görünür).

## 4. Harita & rapor
- **Harita**: toplanma noktaları, tehlike poligonları, kendi noktaların, raporlar.
- Katman filtreleri üst çubuktan açılır/kapanır.
- **Rapor**: Yıkık / Yangın / Sel / Yol kapalı / Güvenli alan / Diğer — konumu al, kaydet, harita'da görün.

## 5. Aile
- **Aile**: kişileri + telefonları gir.
- **Aile durumu** ekranında her kişi için İyi / Yardım / Bilinmiyor işaretle.

## 6. Offline iletişim denemeleri
- **Yakın (BLE)**: iki telefon arasında Web Bluetooth üzerinden kısa mesaj + ping.
- **Giden**: BLE/LoRa bağlantısı yoksa mesajlar burada bekler.
- **Oku**: QR ile diğer Fener kullanıcılarının kart / imzalı zarflarını doğrula.

## 7. Sessiz / gürültülü SOS
- **Sessiz SOS**: mors örüntülü titreşim + 3 kHz bip (enkaz altı).
- **Işık SOS**: ekran strobu (gece 400–500 m).
- **Düdük**: yüksek frekans düdük tonu.

## 8. Ses notu
- **Ses**: kayda başla → durdur → cihazda kalır.
- "Gidene ekle" ile outbox'a referansı düşer.

## 9. Rehber / ilk yardım / pusula / alfabe
- **Rehber**: sesli okuma ile afet-sonrası adımlar.
- **İlk yardım**: CPR, kanama, yanık, kırık, şok kartları.
- **Pusula**: GPS + yön sensörü ile en yakın toplanma noktasına ok.
- **Alfabe**: Türk telsiz alfabesi ile heceleme + sesli okuma.

## 10. Ayarlar
- **Enerji tasarrufu**: animasyonları kapatır, arka planı koyulaştırır.
- **Bildirimler**: yerel bildirim izni.
- **Dil**: TR / EN / AR (AR seçilince yön otomatik RTL olur).

## Bildirilecek hatalar
- Uçuş modunda açılıyor mu?
- Harita önbelleği yüklendi mi (Ayarlar → Depolama)?
- BLE eşleşme başarısız olursa: cihaz adı + Android/iOS sürümü.
- QR okuma hatası: kamera izni + örnek QR.

Issue: <https://github.com/bahadirdeveloper/fener/issues>
