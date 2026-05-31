# 🚀 Cara Deploy Duitku ke Vercel

## Step 1 — Buat Supabase Project
1. Buka https://supabase.com → New Project
2. Catat **Project URL** dan **Anon Key** (Settings → API)
3. Buka **SQL Editor** → paste isi file `supabase/schema.sql` → Run

## Step 2 — Isi .env.local
Edit file `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

## Step 3 — Test Lokal
```bash
npm install
npm run dev
```
Buka http://localhost:3000 — harus bisa login.

## Step 4 — Deploy ke Vercel
**Cara A: Via GitHub (Rekomendasi)**
1. Upload folder project ke GitHub (github.com → New Repository)
2. Buka https://vercel.com → New Project → Import dari GitHub
3. Di bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL` = URL supabase kamu
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = anon key supabase kamu
4. Klik Deploy → tunggu 2-3 menit
5. Dapat URL gratis: `https://duitku-xxx.vercel.app`

**Cara B: Via Vercel CLI**
```bash
npm i -g vercel
vercel
# Ikuti instruksi, masukkan env variables saat diminta
```

## Step 5 — Install ke HP Android
1. Buka URL Vercel di **Chrome**
2. Tap menu (3 titik) → **Add to Home Screen**
3. Selesai! App muncul di home screen seperti app native

## Step 6 — Install ke iPhone
1. Buka URL Vercel di **Safari** (HARUS Safari)
2. Tap tombol Share (kotak panah atas)
3. **Add to Home Screen**
4. Selesai!

---
💡 **Tips:** Setelah deploy, enable Authentication di Supabase:
Authentication → Providers → Email → Enable
