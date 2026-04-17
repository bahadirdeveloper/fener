# Offline doğrulama

Fener'in iddiası: internet kesilse bile çalışır. Bu belgede doğrulamanın nasıl yapıldığı.

## Chrome DevTools ile (geliştirici)

1. `npm run build && npm run preview --workspace=apps/web` (veya `dev` server)
2. Chrome'da uygulamayı aç, tamamen yükle
3. DevTools → Application → Service Workers → `activated and is running` gör
4. DevTools → Network → "Offline" işaretle
5. Sayfayı F5 ile yenile — uygulama yüklenmeli
6. Tüm rotaları gez: `/`, `/kart`, `/aile`, `/durum?t=ok`, `/harita`, `/dudluk`, `/rehber`, `/ayarlar`

## Fiziksel cihazda (kullanıcı)

### Android Chrome
1. Uygulamayı aç, "Ana ekrana ekle" seç (veya Ayarlar → "Ana ekrana kur")
2. Uçak modu aç
3. Ana ekran simgesinden aç — açılmalı
4. Tüm ekranlar çalışmalı, harita ilk ziyaretten sonra tile cache'inden çalışır

### iOS Safari
1. Safari'de aç, paylaş butonu → "Ana Ekrana Ekle"
2. Uçak modu aç
3. Ana ekran simgesinden aç

## Harita offline stratejisi

- OSM tile'ları Workbox runtime cache (`fener-osm-tiles`) ile CacheFirst
- Kullanıcı harita sayfasını ziyaret ettiğinde görünen tile'lar cache'e düşer
- **Ayarlar → "Haritayı indir"** ile Silifke bölgesi z10-14 tile'ları arka planda toplu indirilir
- Faz 2: MBTiles/PMTiles ile tam offline vector style

## Kontrol listesi

- [ ] App shell offline yüklenir
- [ ] IndexedDB (acil kart, aile) offline okuma/yazma
- [ ] Service worker precache 15+ entry
- [ ] Harita tile cache çalışır (ziyaret sonrası offline)
- [ ] Düdük (WebAudio) offline çalışır
- [ ] Sesli rehber (Web Speech) offline çalışır
- [ ] "Ben iyiyim" outbox'a kaydedilir (link açılışı paylaşım menüsüne düşer)

## Bilinen sınırlar

- WhatsApp deep-link açılımı için kurulu WhatsApp gerekir; yoksa SMS fallback kullanılır
- Web Speech API kalitesi cihaz TTS motoruna bağlı
- BLE P2P ve LoRa gateway fazları henüz yok (Faz 2, Faz 3)
