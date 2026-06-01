"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { PERSONALITIES, BUDGET_PRESETS, formatRupiah, getUserLevel, type Personality, type UserProfile } from "@/types";

interface Props {
  user: User;
  profile: UserProfile | null;
  weekSpent?: number;
}

const GIRI_MODES = [
  { id: "balanced", name: "Balanced",       sub: "Ramah & Supportive",      img: "/brand/giri-happy.png"     },
  { id: "frugal",   name: "Frugal Master",  sub: "Disiplin & Fokus Hemat",  img: "/brand/giri-cheer.png"     },
  { id: "chill",    name: "Chill Mode",     sub: "Santai & Positif",        img: "/brand/giri-idea.png"      },
  { id: "sultan",   name: "Sultan Mode",    sub: "Lucu & Dramatis",         img: "/brand/giri-celebrate.png" },
  { id: "roast",    name: "Roast Mode",     sub: "Nyindir tapi Sayang",     img: "/brand/giri-shock.png"     },
];

export default function ProfileScreen({ user, profile, weekSpent = 0 }: Props) {
  const router = useRouter();
  const [budget, setBudget]           = useState(profile?.daily_budget ?? 50000);
  const [personality, setPersonality] = useState<Personality>((profile?.personality as Personality) ?? "balanced");
  const [customBudget, setCustomBudget] = useState("");
  const [isCustom, setIsCustom]       = useState(!BUDGET_PRESETS.includes(profile?.daily_budget ?? 50000));
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);

  const finalBudget = isCustom ? (parseInt(customBudget.replace(/\D/g, "")) || budget) : budget;
  const fmt = (n: number) => `Rp${(n/1000).toFixed(0)}rb`;
  const displayName = profile?.username ?? user.email?.split("@")[0] ?? "Pengguna";
  const streak      = profile?.streak_days ?? 0;
  const safeDays    = profile?.total_safe_days ?? 0;
  const levelInfo   = getUserLevel(safeDays);
  const weekBudget  = budget * 7;
  const weekRemaining = Math.max(0, weekBudget - weekSpent);

  const currentMode = GIRI_MODES.find(m => m.id === personality) ?? GIRI_MODES[0];

  async function handleSave() {
    setSaving(true);
    await createClient().from("profiles").update({ daily_budget: finalBudget, personality }).eq("id", user.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setSaving(false);
    router.refresh();
  }

  async function handleLogout() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="h-full overflow-y-auto no-scrollbar" style={{ background: "var(--bg)" }}>
      <div className="max-w-lg mx-auto px-4 pb-8"
        style={{ paddingTop: "max(env(safe-area-inset-top), 16px)" }}>

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/brand/logo-ngirit.png"
            alt="Ngirit"
            style={{ height: 36, width: "auto", maxWidth: 140, objectFit: "contain", objectPosition: "left center", display: "block" }}
          />
          <div className="flex items-center gap-2">
            <div className="ng-card-sm w-10 h-10 flex items-center justify-center cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="var(--text-muted)"/>
              </svg>
            </div>
            {/* Settings icon */}
            <div className="ng-card-sm w-10 h-10 flex items-center justify-center cursor-pointer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="var(--text-muted)" strokeWidth="2"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" stroke="var(--text-muted)" strokeWidth="2"/>
              </svg>
            </div>
          </div>
        </div>

        {/* ── Profile Hero Card ── */}
        <div className="ng-card p-5 mb-4 anim-fadeup">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center font-black text-2xl text-white flex-shrink-0"
                style={{ background: "linear-gradient(135deg, var(--green), var(--green-dark))", boxShadow: "0 4px 20px rgba(34,197,94,0.35)" }}>
                {displayName.slice(0,2).toUpperCase()}
              </div>
              {/* Edit icon */}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center"
                style={{ background: "var(--green)", boxShadow: "0 2px 8px rgba(34,197,94,0.4)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-xl" style={{ color: "var(--text)" }}>{displayName}</p>
              <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{user.email}</p>
              {/* Level badge */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                  style={{ background: "var(--green-light)" }}>
                  <span className="text-sm">⭐</span>
                  <span className="text-xs font-bold" style={{ color: "var(--green-dark)" }}>
                    Level {levelInfo.level} • {levelInfo.name}
                  </span>
                </div>
              </div>
              {/* XP bar */}
              <div className="mt-2">
                <div className="h-1.5 rounded-full" style={{ background: "#E5E7EB" }}>
                  <div className="h-1.5 rounded-full transition-all" style={{
                    width: `${Math.min((safeDays % 30) / 30 * 100, 100)}%`,
                    background: "var(--green)"
                  }}/>
                </div>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {safeDays * 100} / {(levelInfo.level) * 1000} XP
                </p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-2 mt-4 pt-4" style={{ borderTop: "1px solid var(--border)" }}>
            {[
              { icon: "🛡", label: "Hari Aman",    val: safeDays,           unit: "hari"      },
              { icon: "🔥", label: "Streak",        val: streak,             unit: "hari"      },
              { icon: "💰", label: "Budget Sisa",   val: formatRupiah(weekRemaining), unit: "minggu" },
              { icon: "⭐", label: "Poin",          val: (safeDays*100+streak*50).toLocaleString(), unit: "poin" },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="text-xl mb-0.5">{s.icon}</div>
                <div className="font-black text-sm font-inter" style={{ color: "var(--text)" }}>{s.val}</div>
                <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{s.unit}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Mode Kepribadian Giri ── */}
        <div className="mb-4 anim-fadeup" style={{ animationDelay: "0.05s" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base" style={{ color: "var(--text)" }}>Mode Kepribadian Giri</h3>
            <span className="text-xs font-semibold" style={{ color: "var(--green)" }}>Lihat semua &gt;</span>
          </div>
          {/* Active mode — card besar */}
          <div className="ng-card p-4 mb-3" style={{ background: "linear-gradient(135deg, #F0FDF4, #FFFFFF)" }}>
            <div className="flex items-center gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentMode.img} alt={currentMode.name} className="w-20 h-20 object-contain"/>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "var(--green)" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                      <polyline points="20 6 9 17 4 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <span className="font-black text-base" style={{ color: "var(--text)" }}>{currentMode.name}</span>
                </div>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{currentMode.sub}</p>
                <div className="mt-2 px-2.5 py-1 rounded-full w-fit"
                  style={{ background: "var(--green-light)" }}>
                  <span className="text-[10px] font-bold" style={{ color: "var(--green-dark)" }}>● Aktif</span>
                </div>
              </div>
            </div>
          </div>
          {/* Mode selector — scroll horizontal */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {GIRI_MODES.map(m => (
              <button key={m.id}
                onClick={() => setPersonality(m.id as Personality)}
                className="flex-shrink-0 ng-card-sm p-3 flex flex-col items-center gap-1 transition-all"
                style={{
                  minWidth: 100,
                  border: personality === m.id ? "2px solid var(--green)" : "1px solid var(--border)",
                  background: personality === m.id ? "var(--green-bg)" : "var(--card)"
                }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.img} alt={m.name} className="w-14 h-14 object-contain"/>
                <span className="text-xs font-bold text-center" style={{ color: personality === m.id ? "var(--green-dark)" : "var(--text)" }}>
                  {m.name}
                </span>
                <span className="text-[10px] text-center" style={{ color: "var(--text-muted)" }}>{m.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Budget Settings ── */}
        <div className="ng-card p-5 mb-4 anim-fadeup" style={{ animationDelay: "0.08s" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base" style={{ color: "var(--text)" }}>Budget Harian</h3>
            <span className="px-3 py-1 rounded-full text-xs font-bold"
              style={{ background: "var(--green-light)", color: "var(--green-dark)" }}>
              {formatRupiah(profile?.daily_budget ?? 50000)}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {BUDGET_PRESETS.map(p => (
              <button key={p}
                onClick={() => { setBudget(p); setIsCustom(false); }}
                className="py-2.5 rounded-2xl text-xs font-bold transition-all"
                style={{
                  background: !isCustom && budget === p ? "var(--green)" : "var(--green-bg)",
                  color: !isCustom && budget === p ? "white" : "var(--green-dark)",
                }}>
                {fmt(p)}
              </button>
            ))}
            <button onClick={() => setIsCustom(true)}
              className="col-span-3 py-2.5 rounded-2xl text-xs font-bold"
              style={{
                background: isCustom ? "var(--green)" : "var(--green-bg)",
                color: isCustom ? "white" : "var(--green-dark)",
              }}>
              Custom 🎯
            </button>
          </div>
          {isCustom && (
            <input type="number" value={customBudget}
              onChange={e => setCustomBudget(e.target.value)}
              placeholder="Masukkan jumlah..."
              className="ng-input text-center"
            />
          )}
        </div>

        {/* ── Menu List ── */}
        <div className="ng-card overflow-hidden mb-4 anim-fadeup" style={{ animationDelay: "0.1s" }}>
          {[
            { icon: "🎯", label: "Tujuan Budget",        sub: "Atur tujuan dan target hematmu",     badge: null,          action: () => {} },
            { icon: "💼", label: "Budget & Kategori",    sub: "Kelola budget harian dan kategori",  badge: null,          action: () => {} },
            { icon: "📋", label: "Riwayat Transaksi",    sub: "Lihat semua catatan pengeluaranmu",  badge: null,          action: () => router.push("/recap") },
            { icon: "📤", label: "Export Data",          sub: "Export ke CSV, Excel, atau PDF",     badge: "Premium",     action: () => {} },
            { icon: "🎨", label: "Tema Aplikasi",        sub: "Atur tampilan aplikasi sesuai selera",badge: null,         action: () => {} },
            { icon: "🔒", label: "Privasi & Keamanan",   sub: "Kelola keamanan akunmu",             badge: null,          action: () => {} },
            { icon: "❓", label: "Bantuan & Feedback",   sub: "Pusat bantuan dan kirim masukan",    badge: null,          action: () => {} },
          ].map((item, idx, arr) => (
            <button key={item.label}
              onClick={item.action}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-gray-50 transition-colors"
              style={{ borderBottom: idx < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: "var(--green-bg)" }}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: "var(--text)" }}>{item.label}</p>
                <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>{item.sub}</p>
              </div>
              {item.badge ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                  style={{ background: "#FEF3C7", color: "#92400E" }}>
                  👑 {item.badge}
                </span>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18l6-6-6-6" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>

        {/* ── Ngirit Premium Banner ── */}
        <div className="ng-card p-4 mb-4 flex items-center gap-4 anim-fadeup" style={{ animationDelay: "0.12s", background: "linear-gradient(135deg, #F0FDF4, #DCFCE7)" }}>
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl flex-shrink-0"
            style={{ background: "var(--green)", boxShadow: "0 4px 16px rgba(34,197,94,0.4)" }}>
            🛡
          </div>
          <div className="flex-1">
            <p className="font-black text-sm" style={{ color: "var(--text)" }}>Ngirit Premium 👑</p>
            <p className="text-xs" style={{ color: "var(--text-secondary)" }}>Nikmati fitur premium tanpa batas</p>
          </div>
          <button className="px-4 py-2 rounded-2xl text-xs font-bold flex-shrink-0"
            style={{ border: "2px solid var(--green)", color: "var(--green)", background: "white" }}>
            Lihat Paket
          </button>
        </div>

        {/* ── Save button ── */}
        <div className="anim-fadeup" style={{ animationDelay: "0.14s" }}>
          {saved ? (
            <div className="text-center py-3 font-black" style={{ color: "var(--green)" }}>✅ Tersimpan!</div>
          ) : (
            <button onClick={handleSave} disabled={saving}
              className="w-full ng-btn"
              style={{ fontSize: 16 }}>
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          )}
          <button onClick={handleLogout}
            className="w-full mt-3 py-3.5 rounded-2xl text-sm font-bold"
            style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626" }}>
            🚪 Keluar dari Akun
          </button>
        </div>

        <div className="h-4"/>
      </div>
    </div>
  );
}
