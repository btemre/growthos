# GOS Web — Growth Operating System

Eğitim, satış ve iş geliştirme yönetim paneli (Next.js 16 + Firebase).

## Kurulum

```bash
cd web
npm install
cp .env.example .env.local   # Firebase istemci anahtarları
npm run dev
```

Giriş: http://localhost:3000/login

## Roller ve menü

| Rol | Erişim |
|-----|--------|
| `admin` | Tüm modüller |
| `education_sales` | Dashboard, lead, eğitim pipeline, görevler, takvim, programlar |
| `business_dev` | Dashboard, lead, kurumsal pipeline, teklifler, raporlar |
| `operations` | Lead, pipeline, programlar, teklifler, raporlar |
| `mentor` | Dashboard, görevler, takvim, programlar |

Menü filtreleme: `src/lib/navigation.ts`

## Ekran haritası

- `/dashboard` — KPI ve uyarılar
- `/leads` — Lead listesi ve detay
- `/pipeline/education` — Eğitim Kanban
- `/pipeline/corporate` — Kurumsal Kanban
- `/tasks` — Görevler
- `/calendar` — Takvim (görev due tarihleri)
- `/programs` — Programlar ve kayıtlar
- `/proposals` — Teklifler
- `/team` — Personel (yalnızca admin)
- `/reports` — Raporlar
- `/settings` — Profil ve tema

## Ortak UI bileşenleri

`src/components/shared/` — `PageHeader`, `EmptyState`, `LoadingSkeleton`, `ConfirmDialog`, `StatusBadge`

## Deploy

Kök dizinde `DEPLOY.md` ve `npm run deploy:firestore` (Firestore kuralları).
