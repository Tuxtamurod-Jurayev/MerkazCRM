# O'quv Markaz CRM (React + Vite)

Bu loyiha o'quv markaz jarayonlarini avtomatlashtirish uchun frontend CRM:

- 2 rol: `admin`, `qabulxona`
- `localStorage` + Supabase snapshot sync
- real vaqt ko'rinishidagi dashboard va hisobotlar
- light/dark (`night mode`) theme
- mobil/planshet/notebook/PC uchun responsive UI
- GitHub + Vercel deployga tayyor

## Modullar

1. Login tizimi
2. Dashboard
3. Fanlar boshqaruvi
4. O'qituvchilar boshqaruvi
5. O'quvchilar boshqaruvi
6. Guruhlar boshqaruvi
7. To'lov tizimi
8. Xarajatlar moduli
9. Qarzdorlar moduli
10. Hisobotlar moduli

## Rollar

- `admin`:
  - fanlar CRUD
  - o'qituvchilar CRUD
  - dashboard/statistika
  - to'lovlar nazorati (read-only)
  - qarzdorlar ro'yxati
  - hisobotlar (daromad/xarajat/foyda)
- `qabulxona`:
  - o'quvchilar CRUD
  - guruhlar CRUD
  - o'quvchini guruhga biriktirish
  - to'lov qabul qilish
  - xarajat kiritish
  - hisobotlar

## Ishga tushirish

```bash
npm install
npm run dev
```

Agar Windows'da `npm` PATH'da bo'lmasa:

```powershell
$env:Path='C:\Program Files\nodejs;' + $env:Path
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Supabase ulash

1. `.env` fayl yarating yoki mavjudiga quyidagini kiriting:
```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```
2. Supabase SQL Editor'da [`supabase/schema.sql`](supabase/schema.sql) skriptini ishga tushiring.
3. Ilovani qayta ishga tushiring (`npm run dev`).

Izoh:
- Supabase jadvali mavjud bo'lsa CRM holati `crm_snapshots` jadvaliga saqlanadi.
- Jadval bo'lmasa tizim local storage bilan ishlashda davom etadi.

## Ma'lumotlar bazasi modeli (frontend)

- `subjects`
- `teachers`
- `students`
- `groups`
- `studentGroups`
- `payments`
- `expenses`

Qarzdorlik hisoblash:

`qarz = (oylik_narx * o'tgan_oylar) - jami_to'lov`

## GitHub ga joylash

```bash
git init
git add .
git commit -m "Initial CRM MVP"
git branch -M main
git remote add origin https://github.com/<USERNAME>/<REPO>.git
git push -u origin main
```

## Vercel deploy

1. `https://vercel.com/new` ga kiring.
2. GitHub repo ni tanlang.
3. Framework: `Vite` (auto aniqlanadi).
4. Build command: `npm run build`
5. Output directory: `dist`
6. Deploy bosing.

`vercel.json` ichida SPA route rewrite qo'shilgan, shuning uchun `react-router` sahifalari refresh bo'lganda ham ishlaydi.
