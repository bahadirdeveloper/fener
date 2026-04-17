# Fener'e Katkı

Fener bir topluluk projesi. Her beceri seviyesinden, her alandan katkı kabul edilir.

## Nasıl katkı veririm?

### Kod
1. Repoyu fork et
2. Feature branch aç (`git checkout -b feat/yeni-ozellik`)
3. Değişikliği yap, test et
4. Commit: [Conventional Commits](https://www.conventionalcommits.org/) formatında
5. Pull request aç

### Kod dışı
- **Dokümantasyon** — README, rehber, çeviri
- **Tasarım** — UI/UX, ikon, grafik
- **Test** — saha testi, cihaz uyumluluk, kullanılabilirlik
- **Dil** — Arapça, Kürtçe, İngilizce çeviri
- **Donanım** — LoRa gateway montajı, enclosure tasarımı
- **Topluluk** — eğitim, tanıtım, gönüllü koordinasyonu

## Geliştirme kurulumu

```bash
git clone https://github.com/bahadirdeveloper/fener.git
cd fener/apps/web
npm install
npm run dev
```

## Kod standartları

- Vite + React 19 + Tailwind v4
- Fonksiyonel component, hook-tabanlı
- Türkçe kullanıcı metni, İngilizce kod yorumu
- Offline-first düşünce: her özellik internet olmadan çalışmalı

## Commit mesajları

```
feat: yeni özellik
fix: hata düzeltme
docs: dokümantasyon
style: biçimleme
refactor: kod yeniden düzenleme
test: test ekleme
chore: yardımcı değişiklikler
```

## İletişim

- **Issues** — hata ve özellik önerileri
- **Discussions** — sohbet, soru, fikir
- **Email** — (yakında)

## Davranış kuralları

Projeye katılırken [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) kurallarına uyuyorsun.
