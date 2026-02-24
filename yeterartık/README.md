# 🚢 MarinePortal — Gemi Acentesi Yönetim Sistemi

Türkiye'nin modern gemi acentesi yönetim platformu. Armatörler ve acenteler için cookie-based auth ile güvenli, Vercel-ready full-stack Next.js uygulaması.

## 🏗️ Mimari

```
maritime-portal/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── layout.tsx                  # Root layout (Toaster)
│   ├── globals.css                 # Global styles (Tailwind + Maritime theme)
│   ├── auth/
│   │   ├── layout.tsx              # Auth layout (split panel)
│   │   ├── login/page.tsx          # Giriş sayfası
│   │   └── register/page.tsx       # Kayıt sayfası
│   └── dashboard/
│       ├── layout.tsx              # Dashboard layout (Navbar + Sidebar)
│       ├── page.tsx                # Ana dashboard
│       ├── ships/
│       │   ├── page.tsx            # Server: Veri çek
│       │   └── ShipsClient.tsx     # Client: CRUD UI
│       ├── demands/
│       │   ├── page.tsx            # Server: Veri çek
│       │   └── DemandsClient.tsx   # Client: CRUD UI
│       └── profile/
│           ├── page.tsx            # Server: Veri çek
│           └── ProfileClient.tsx   # Client: Profil düzenleme
├── components/
│   ├── navbar/Navbar.tsx           # Client: Auth state listener
│   └── dashboard/Sidebar.tsx      # Navigation sidebar
├── lib/
│   ├── supabase/
│   │   ├── server.ts               # Server-side Supabase client (getUser, getProfile)
│   │   └── client.ts               # Browser-side Supabase client (singleton)
│   └── utils/index.ts             # Utility functions
├── types/
│   ├── database.ts                 # Full TypeScript types for DB
│   └── index.ts
├── middleware.ts                   # Auth middleware (Invalid Refresh Token korumalı)
├── supabase-schema.sql             # Tam veritabanı şeması + RLS politikaları
├── tailwind.config.js              # Maritime tema
└── .env.local.example             # Çevre değişkenleri şablonu
```

## 🔐 Güvenlik Mimarisi

### 1. Cookie-Based Auth (`@supabase/ssr`)
- Tüm auth işlemleri `@supabase/ssr` paketi ile yapılır
- Server Components için `createServerClient`, Client Components için `createBrowserClient`
- Hiçbir yerde `@supabase/auth-helpers-nextjs` kullanılmaz

### 2. Middleware Koruması
```typescript
// middleware.ts - Invalid Refresh Token koruması
try {
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    // Tüm sb-* çerezleri temizle
    // /auth/login'e zorla yönlendir
  }
} catch (unexpectedError) {
  // Yine de güvenli yönet
}
```

### 3. Login/Logout Cookie Senkronizasyonu
```typescript
// Tam sayfa yenilemesi ile çerez senkronizasyonu
window.location.href = '/dashboard'  // router.push KULLANILMAZ
```

### 4. Vercel Caching Önlemi
```typescript
// Tüm dashboard sayfalarında
export const dynamic = 'force-dynamic'
export const revalidate = 0
```

### 5. Hydration Error Önlemi
```typescript
// Date nesneleri için serialize
const safeData = serialize(data)  // JSON.parse(JSON.stringify(data))
```

## 🗄️ Veritabanı Kurulumu

### 1. Supabase projesi oluşturun
[supabase.com](https://supabase.com) → New Project

### 2. SQL şemasını çalıştırın
Supabase Dashboard → SQL Editor → `supabase-schema.sql` dosyasını yapıştırıp çalıştırın

### 3. Tablo yapısı:
```sql
profiles (id, role: 'armator'|'agency', full_name, phone, company_name)
ships    (id, name, imo_no, bayrak, grt, nrt, dwt, yil, gemi_tipi, armator_id)
demands  (id, ship_id, agency_id, status, details, port, priority, cargo_*)
```

### 4. RLS Politikaları (otomatik oluşturulur):
- Armatörler sadece kendi gemilerini görür/yönetir
- Acenteler tüm gemileri ve talepleri görür
- Herkes sadece kendi profilini düzenler

## ⚙️ Kurulum

### 1. Bağımlılıkları yükleyin
```bash
cd maritime-portal
npm install
```

### 2. Çevre değişkenlerini ayarlayın
```bash
cp .env.local.example .env.local
```

`.env.local` dosyasını düzenleyin:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

Supabase Dashboard → Project Settings → API bölümünden alın.

### 3. Geliştirme sunucusunu başlatın
```bash
npm run dev
```

`http://localhost:3000` adresine gidin.

### 4. Vercel'e deploy edin
```bash
npm install -g vercel
vercel
```

Environment variables'ları Vercel dashboard'dan ekleyin.

## 🎨 Tasarım Sistemi

- **Renk Paleti:** Navy Blue (#0a1628) + Ocean Blue (#00a8e8) + Gold (#f0a500)
- **Font:** Playfair Display (başlıklar) + DM Sans (gövde)
- **Komponenler:** `maritime-card`, `btn-primary`, `input-maritime`, `badge-status`, vb.
- **Animasyonlar:** Fade-in, slide-up, wave, float

## 🧩 Özellikler

### Armatör Paneli:
- 📊 Dashboard: Gemi sayısı, talep istatistikleri, son talepler
- 🚢 Gemi Yönetimi: CRUD (Ekle, Düzenle, Sil, Görüntüle)
- 📋 Talep Yönetimi: Oluştur, düzenle, takip et
- 👤 Profil: Bilgi güncelleme, şifre değiştirme

### Acente Paneli:
- 📊 Dashboard: Tüm talepler, istatistikler
- 📋 Talep Yönetimi: Tüm talepleri görüntüle, durum güncelle
- ✅ Hızlı durum: İncele → Onayla/Reddet → Tamamla
- 👤 Profil: Bilgi güncelleme

## 🔧 Teknoloji Stack

| Teknoloji | Versiyon | Kullanım |
|-----------|---------|---------|
| Next.js | 15.1.3 | App Router, Server Components |
| Supabase | @ssr 0.5.2 | Cookie-based auth, DB |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.4 | Styling |
| react-hot-toast | 2.4 | Bildirimler |
| lucide-react | 0.469 | İkonlar |

## 🚀 Vercel Deployment Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` environment variable eklendi
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variable eklendi
- [ ] Supabase'de `supabase-schema.sql` çalıştırıldı
- [ ] Supabase'de email auth etkin
- [ ] RLS politikaları aktif
- [ ] Auth email template'leri Türkçe'ye çevrildi (opsiyonel)

## 📝 Notlar

- `middleware.ts` her request'te çalışır, Invalid Refresh Token otomatik temizlenir
- Dashboard sayfaları `force-dynamic` ile Vercel cache'den muaf tutulur
- Tüm DB tarihleri `serialize()` ile hydration hatasından korunur
- Login/Logout `window.location.href` ile tam senkronizasyon sağlanır
