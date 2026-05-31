# 💸 DOMI v2

> Catat pengeluaran semudah chat. Tahu kondisi dompetmu setiap hari.

## Stack
- **Next.js 15** App Router
- **Supabase** Auth + PostgreSQL  
- **Tailwind CSS** Dark mode
- **Rule-based Engine** (NO OpenAI cost!)
- **TypeScript**

## Setup

### 1. Install
```bash
npm install
```

### 2. Supabase
1. Buat project di [supabase.com](https://supabase.com)
2. SQL Editor → jalankan `supabase/schema.sql`
3. Authentication → Providers → Email → matikan "Confirm email"

### 3. Environment
```bash
cp .env.local.example .env.local
# Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### 4. Run
```bash
npm run dev
```

## Fitur
- 💬 **Chat-based** input pengeluaran
- 🎭 **5 Personality** (Frugal, Balanced, Chill, Sultan, Roast)
- 📊 **Budget tracking** harian real-time  
- 🏆 **Gamification** streak + level + achievements
- 📈 **Recap** harian/mingguan/bulanan
- 📥 **Export CSV**
- 🌙 **Dark mode** mobile-first

## Cara pakai
Ketik langsung: `kopi 15rb`, `makan 25000`, `bensin 50rb`  
Recap: `recap hari ini`, `ringkasan minggu ini`

## Deploy
```bash
vercel deploy
```
