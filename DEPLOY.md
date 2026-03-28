# GOS — Yayın (Firebase)

## Ön koşul: Google Cloud IAM (403 hatası çözümü)

`firebase deploy` veya App Hosting komutlarında şuna benzer hata alıyorsanız:

`Caller does not have required permission ... roles/serviceusage.serviceUsageConsumer`

1. Proje sahibi hesabıyla [Google Cloud IAM](https://console.cloud.google.com/iam-admin/iam?project=gosbcgirisim) sayfasını açın.
2. Firebase CLI ile kullandığınız e-postayı bulun (veya ekleyin).
3. Bu hesaba en azından şu rollerden biri verin (genelde yeterli olanlar):
   - **Editor** (veya **Owner**), veya
   - **Service Usage Consumer** (`roles/serviceusage.serviceUsageConsumer`)
4. Birkaç dakika bekleyip tekrar deneyin.

Ardından yerelde:

```bash
firebase login
cd d:\PROJELER\GOS
npm run deploy:firestore
```

Bu komut `firestore.rules` ve `firestore.indexes.json` dosyalarını `gosbcgirisim` projesine yükler.

---

## Next.js uygulaması — Firebase App Hosting

1. [Firebase Console](https://console.firebase.google.com) → proje **gosbcgirisim** → **App Hosting**.
2. GitHub (veya desteklenen Git) ile repoyu bağlayın.
3. **Root directory**: `web` (içinde `package.json` ve Next uygulaması olan klasör).
4. **Environment variables**: `web/.env.example` içindeki tüm `NEXT_PUBLIC_*` değişkenlerini (ve isteğe bağlı `NEXT_PUBLIC_BOOTSTRAP_ADMIN_EMAIL`) App Hosting ortamına ekleyin; mümkünse hem **build** hem **runtime** için tanımlayın.
5. Dalı seçip kaydedin; ilk deploy otomatik veya manuel başlar.

`web/apphosting.yaml` dosyasındaki `runConfig` App Hosting tarafından kullanılır.

`web/next.config.ts` içinde **`output: "standalone"`** ve **`turbopack.root`** (monorepo + çift lockfile uyarısı / App Hosting adapter) tanımlıdır; bunları kaldırmayın.

Uygulama ayrıca **`/api/firebase-config`** ile sunucu ortamındaki `NEXT_PUBLIC_FIREBASE_*` değerlerini okur. App Hosting’te bu değişkenler yalnızca **runtime**’da tanımlı olsa bile (build’te gömülü olmasa) giriş ekranı çalışabilir; yine de mümkünse Console’da **build + runtime** için tanımlayın.

---

## Yerel doğrulama

```bash
npm run build
```

(`web/` içinde `next build` çalışır.)

---

## Özet

| Ne | Nasıl |
|----|--------|
| Firestore kuralları + indeksler | `npm run deploy:firestore` (IAM + `firebase login` gerekli) |
| Next.js canlı site | App Hosting + Git push + Console’daki env değişkenleri |

`.env.local` repoda yoktur; üretimde env’leri yalnızca App Hosting Console’dan verin.
