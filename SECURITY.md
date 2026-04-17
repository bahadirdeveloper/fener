# Güvenlik Politikası

## Güvenlik açığı bildirimi

Fener bir afet iletişim altyapısıdır — güvenlik kritiktir. Yanlış bilginin yayılması, konum sızması veya mesaj manipülasyonu hayati sonuçlar doğurabilir.

## Nasıl bildirilir

Güvenlik açığı bulduysanız **lütfen herkese açık issue açmayın**. Bunun yerine:

- **Email:** (yakında — security@silifketeknoloji.org planlı)
- **GitHub Security Advisory:** [repo > Security > Report a vulnerability](https://github.com/bahadirdeveloper/fener/security/advisories/new)

## Bildirime ne dahil edilmeli

- Açığın açıklaması
- Reproduce adımları
- Etkilenen sürüm / commit
- (Varsa) Önerilen çözüm

## Yanıt süresi

- **72 saat içinde** bildiriminizi aldığımızı teyit ederiz
- **14 gün içinde** ilk değerlendirme ve eylem planı paylaşırız
- Patch sonrası makul süre içinde sorumlu ifşa (coordinated disclosure) yaparız

## Kapsam

| Etkilenen | Önem |
|---|---|
| Mesaj imza/doğrulama | Kritik |
| Konum bilgisi sızması | Kritik |
| Service worker / cache zehirlenmesi | Yüksek |
| Offline veri bütünlüğü | Yüksek |
| XSS / injection | Yüksek |
| Dependency açıkları | Orta |

## Teşekkür

Sorumlu şekilde bildiren araştırmacılara CHANGELOG'ta teşekkür edilir (istemedikleri belirtilmedikçe).
