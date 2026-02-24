# Proforma Portal

Denizcilik acentesi için Streamlit tabanlı otomatik proforma hesaplama portalı.

## Özellikler

- Kullanıcı kayıt ve giriş (SQLite)
- Otomatik proforma hesaplaması (tüm tarife kalemleri)
- Desteklenen limanlar: Tekirdağ, İzmir, Aliaga, Mersin
- USD / EUR dönüşümü

## Kurulum

```bash
cd proforma-portal
pip install -r requirements.txt
streamlit run app.py
```

Replit için `.replit` dosyası hazır; projeyi import edip Run ile başlatabilirsiniz.

## Proje Yapısı

- `app.py` - Ana giriş, login/kayıt
- `pages/` - Proforma Oluştur, Geçmiş, Ayarlar
- `calculators/` - Tarife hesaplama modülleri
- `config/` - Tarifeler ve port ayarları
- `auth/` - SQLite kimlik doğrulama
