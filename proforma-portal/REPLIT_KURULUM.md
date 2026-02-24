# Replit.com'da Proforma Portal Kurulumu

## 1. Projeyi Replit'e Yükleyin

### Seçenek A: GitHub ile (Önerilen)
1. Projenizi GitHub'a push edin.
2. [replit.com](https://replit.com) → **Create Repl** → **Import from GitHub**
3. Repo URL'sini yapıştırın.
4. **Root directory**: `proforma-portal` seçin (veya repo kökü `proforma-portal` ise otomatik algılanır).
5. **Repl** oluşturun.

### Seçenek B: Dosya Yükleme
1. [replit.com](https://replit.com) → **Create Repl** → **Python**
2. **Import project** veya **Upload folder** ile `proforma-portal` klasörünü yükleyin.
3. Tüm dosyaların doğru dizinde olduğundan emin olun.

### Seçenek C: Sıfırdan
1. **Create Repl** → **Python**
2. `proforma-portal` içindeki tüm dosya ve klasörleri kopyalayıp Replit editor'e yapıştırın.

---

## 2. Proje Yapısını Kontrol Edin

Replit'te şu yapı görünmeli:

```
/
├── app.py
├── requirements.txt
├── .replit
├── replit.nix
├── config/
├── auth/
├── calculators/
├── pages/
└── utils/
```

`.replit` ve `replit.nix` dosyaları gizli olabilir; **Show hidden files** ile görünür.

---

## 3. Paketleri Yükleyin

Replit genelde `requirements.txt` dosyasını otomatik okur ve paketleri kurar. Değilse:

1. **Shell** sekmesini açın (alt kısım)
2. Şu komutu çalıştırın:

```bash
pip install -r requirements.txt
```

---

## 4. Uygulamayı Başlatın

1. Üst menüden **Run** butonuna tıklayın.
2. `.replit` içinde tanımlı komut otomatik çalışır:
   ```
   streamlit run app.py --server.port=8080 --server.address=0.0.0.0 --server.headless=true
   ```
   (Replit genelde 8080 portunu kullanır)
3. Replit açılır pencerede veya sağ panelde uygulama görünür.

---

## 5. Harici Erişim (Webview)

Replit’te varsayılan port 3000 ise:

- Sağ tarafta **Webview** sekmesinde uygulama açılır.
- Adres: `https://<repl-adiniz>.<username>.repl.co`
- Bu URL’yi tarayıcıda açarak erişebilirsiniz.

---

## 6. İlk Kullanım

1. **Kayıt Ol** sekmesinden email, şifre, ad ve şirket bilgisiyle kayıt olun.
2. **Giriş Yap** ile giriş yapın.
3. Sol menüden **1_Proforma_Olustur** sayfasına geçin.
4. Gemi ve liman bilgilerini girip **Hesapla** ile proforma oluşturun.

---

## 7. Olası Sorunlar

| Sorun | Çözüm |
|-------|-------|
| "Module not found" | Shell'de `pip install -r requirements.txt` çalıştırın |
| Port hatası | `.replit` içinde `--server.port=8080` olduğundan emin olun |
| Veritabanı sıfırlanıyor | Replit ücretsiz planlarda dosyalar bazen silinir; projeyi GitHub ile senkron tutun |
| Webview açılmıyor | Run’dan sonra Webview sekmesine tıklayın veya URL’yi tarayıcıda manuel açın |

---

## 8. Veritabanı (Önemli)

SQLite `data/users.db` dosyasında saklanır. Replit ücretsiz planda **sessiz kalındığında** proje uğur (sleep) moduna girer ve disk verisi silinebilir. Kullanıcı kayıtları kalıcı olmayabilir.

**Kalıcılık için:**
- Replit **Teams** veya **Hobby** planında **Always-on** veya **Persistent storage**
- Alternatif: Auth için Supabase kullanmak (plan dahilinde)
