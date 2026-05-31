"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { PERSONALITIES, BUDGET_PRESETS, formatRupiah, type Personality, type UserProfile } from "@/types";

interface Props { user: User; profile: UserProfile | null; }

function BackButton() {
  const router = useRouter();
  return (
    <button onClick={() => router.push("/chat")}
      className="flex items-center gap-2 active:opacity-70 transition-opacity"
      style={{ color: "#FF3B5C" }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="#FF3B5C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="text-sm font-bold">Kembali</span>
    </button>
  );
}

export default function ProfileScreen({ user, profile }: Props) {
  const router = useRouter();
  const [budget, setBudget] = useState(profile?.daily_budget ?? 50000);
  const [personality, setPersonality] = useState<Personality>((profile?.personality as Personality) ?? "balanced");
  const [customBudget, setCustomBudget] = useState("");
  const [isCustom, setIsCustom] = useState(!BUDGET_PRESETS.includes(profile?.daily_budget ?? 50000));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const finalBudget = isCustom ? (parseInt(customBudget.replace(/\D/g, "")) || budget) : budget;
  const fmt = (n: number) => `Rp${(n/1000).toFixed(0)}rb`;
  const displayName = profile?.username ?? user.email?.split("@")[0] ?? "Pengguna";

  async function handleSave() {
    setSaving(true);
    await createClient().from("profiles").update({ daily_budget: finalBudget, personality }).eq("id", user.id);
    setSaved(true); setTimeout(() => setSaved(false), 2000);
    setSaving(false); router.refresh();
  }

  async function handleLogout() {
    await createClient().auth.signOut();
    router.push("/login"); router.refresh();
  }

  return (
    <div className="max-w-lg mx-auto px-4 space-y-4 pb-8"
      style={{ paddingTop: "max(env(safe-area-inset-top), 16px)" }}>

      {/* Header dengan back button */}
      <div className="flex items-center justify-between pt-1">
        <BackButton />
        {/* Logo Ngirit inline SVG HD */}
        <svg viewBox="0 0 260 68" height="28" xmlns="http://www.w3.org/2000/svg">
          <text x="2" y="56" fontFamily="'SF Pro Display',-apple-system,'Helvetica Neue',sans-serif"
            fontSize="60" fontWeight="900" fill="#ffffff" letterSpacing="-1">Ngirit</text>
          <ellipse cx="205" cy="8" rx="6" ry="8.5" fill="#43A047" transform="rotate(-25 205 8)"/>
          <ellipse cx="211" cy="5" rx="3.5" ry="5.5" fill="#66BB6A" transform="rotate(-25 211 5)"/>
        </svg>
      </div>

      <div>
        <h2 className="text-2xl font-black text-white">Profil</h2>
        <p className="text-white/40 text-xs">Atur preferensi Ngirit kamu</p>
      </div>

      {/* Avatar */}
      <div className="glass-card p-5 flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white flex-shrink-0"
          style={{ background: "linear-gradient(135deg,#FF3B5C,#CC2D48)", boxShadow: "0 4px 20px rgba(255,59,92,0.35)" }}>
          {displayName.slice(0,2).toUpperCase()}
        </div>
        <div>
          <p className="text-white font-black text-base">{displayName}</p>
          <p className="text-white/40 text-xs">{user.email}</p>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-xs font-bold" style={{color:"#FF3B5C"}}>🔥 {profile?.streak_days??0} hari</span>
            <span className="text-xs font-bold" style={{color:"#4ade80"}}>✅ {profile?.total_safe_days??0} hari aman</span>
          </div>
        </div>
      </div>

      {/* Budget */}
      <div className="glass-card p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-white">Budget Harian</h3>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{ background:"rgba(255,59,92,0.12)", border:"1px solid rgba(255,59,92,0.2)", color:"#FF3B5C" }}>
            {formatRupiah(profile?.daily_budget??50000)}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {BUDGET_PRESETS.map(p => (
            <button key={p} onClick={() => { setBudget(p); setIsCustom(false); }}
              className="py-2.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: !isCustom && budget===p ? "rgba(255,59,92,0.14)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${!isCustom && budget===p ? "rgba(255,59,92,0.35)" : "rgba(255,255,255,0.08)"}`,
                color: !isCustom && budget===p ? "#FF3B5C" : "#ffffff",
              }}>
              {fmt(p)}
            </button>
          ))}
          <button onClick={() => setIsCustom(true)}
            className="col-span-3 py-2.5 rounded-xl text-xs font-bold"
            style={{
              background: isCustom ? "rgba(255,59,92,0.14)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${isCustom ? "rgba(255,59,92,0.35)" : "rgba(255,255,255,0.08)"}`,
              color: isCustom ? "#FF3B5C" : "#ffffff",
            }}>
            Custom 🎯
          </button>
        </div>
        {isCustom && (
          <input type="number" value={customBudget} onChange={e => setCustomBudget(e.target.value)}
            placeholder="Masukkan jumlah..." className="dk-input text-center" />
        )}
      </div>

      {/* Personality */}
      <div className="glass-card p-5 space-y-3">
        <h3 className="font-black text-white">Kepribadian Giri</h3>
        <div className="space-y-2">
          {PERSONALITIES.map(p => (
            <button key={p.id} onClick={() => setPersonality(p.id)}
              className="w-full flex items-center gap-3 p-3.5 rounded-2xl text-left transition-all"
              style={{
                background: personality===p.id ? "rgba(255,59,92,0.08)" : "rgba(255,255,255,0.03)",
                border: `1px solid ${personality===p.id ? "rgba(255,59,92,0.25)" : "rgba(255,255,255,0.07)"}`,
              }}>
              <span className="text-xl">{p.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-bold" style={{color: personality===p.id ? "#FF3B5C" : "#ffffff"}}>{p.name}</p>
                <p className="text-white/40 text-xs">{p.description}</p>
              </div>
              {personality===p.id && (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <polyline points="20 6 9 17 4 12" stroke="#FF3B5C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* App info */}
      <div className="glass-card p-4 space-y-2 text-sm">
        <div className="flex justify-between"><span className="text-white/40">Versi</span><span className="text-white font-semibold">Ngirit v1.0</span></div>
        <div className="flex justify-between"><span className="text-white/40">Engine</span><span className="text-white font-semibold">Rule-based AI</span></div>
      </div>

      {saved
        ? <div className="text-center py-3 font-black" style={{color:"#4ade80"}}>✅ Tersimpan!</div>
        : <button onClick={handleSave} disabled={saving}
            className="w-full py-3.5 rounded-2xl font-bold text-white"
            style={{ background:"linear-gradient(135deg,#FF3B5C,#CC2D48)", boxShadow:"0 4px 20px rgba(255,59,92,0.35)" }}>
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
      }
      <button onClick={handleLogout}
        className="w-full py-3.5 rounded-2xl text-sm font-bold"
        style={{ background:"rgba(255,59,92,0.08)", border:"1px solid rgba(255,59,92,0.2)", color:"#FF3B5C" }}>
        🚪 Keluar dari Akun
      </button>
    </div>
  );
}
