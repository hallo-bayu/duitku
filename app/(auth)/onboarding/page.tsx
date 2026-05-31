"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PERSONALITIES, BUDGET_PRESETS, type Personality } from "@/types";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [budget, setBudget] = useState(50000);
  const [customBudget, setCustomBudget] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [personality, setPersonality] = useState<Personality>("balanced");
  const [saving, setSaving] = useState(false);
  const finalBudget = isCustom ? (parseInt(customBudget.replace(/\D/g,"")) || 50000) : budget;
  const fmt = (n: number) => `Rp${(n/1000).toFixed(0)}rb`;

  async function handleFinish() {
    setSaving(true);
    const sb = createClient();
    const { data: { user } } = await sb.auth.getUser();
    if (!user) { router.push("/login"); return; }
    await sb.from("profiles").upsert({ id: user.id, email: user.email!, daily_budget: finalBudget, personality, streak_days: 0, total_safe_days: 0, total_over_days: 0 });
    router.push("/chat");
  }

  return (
    <div className="space-y-6 animate-[fadeUp_0.3s_ease-out] pt-4">
      <div className="flex gap-2">
        {[1,2,3].map(s => (
          <div key={s} className="h-1.5 flex-1 rounded-full transition-all duration-300"
            style={{ background: s <= step ? "#FF3B5C" : "rgba(255,255,255,0.1)" }} />
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-5 animate-[fadeIn_0.2s_ease-out]">
          <div className="text-center"><div className="text-4xl mb-2">💰</div>
            <h2 className="text-2xl font-black text-white">Budget Harian</h2>
            <p className="text-[#666] text-sm mt-1">Berapa target pengeluaran harianmu?</p></div>
          <div className="grid grid-cols-2 gap-2.5">
            {BUDGET_PRESETS.map(p => (
              <button key={p} onClick={() => { setBudget(p); setIsCustom(false); }}
                className="py-4 rounded-2xl text-sm font-bold transition-all"
                style={{ background: !isCustom && budget === p ? "rgba(255,59,92,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${!isCustom && budget === p ? "rgba(255,59,92,0.4)" : "rgba(255,255,255,0.08)"}`, color: !isCustom && budget === p ? "#FF3B5C" : "#888" }}>
                {fmt(p)}
              </button>
            ))}
            <button onClick={() => setIsCustom(true)}
              className="col-span-2 py-4 rounded-2xl text-sm font-bold transition-all"
              style={{ background: isCustom ? "rgba(255,59,92,0.15)" : "rgba(255,255,255,0.04)", border: `1px solid ${isCustom ? "rgba(255,59,92,0.4)" : "rgba(255,255,255,0.08)"}`, color: isCustom ? "#FF3B5C" : "#888" }}>
              Custom 🎯
            </button>
          </div>
          {isCustom && <input type="number" value={customBudget} onChange={e => setCustomBudget(e.target.value)} placeholder="Masukkan jumlah (Rp)" className="dk-input text-center text-lg font-bold" />}
          <button onClick={() => setStep(2)} className="red-btn w-full">Lanjut →</button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
          <div className="text-center"><div className="text-4xl mb-2">🎭</div>
            <h2 className="text-2xl font-black text-white">Kepribadian DOMI</h2>
            <p className="text-[#666] text-sm mt-1">Bagaimana DOMI merespons?</p></div>
          <div className="space-y-2.5">
            {PERSONALITIES.map(p => (
              <button key={p.id} onClick={() => setPersonality(p.id)}
                className="w-full flex items-center gap-3 p-4 rounded-2xl text-left transition-all"
                style={{ background: personality === p.id ? "rgba(255,59,92,0.10)" : "rgba(255,255,255,0.03)", border: `1px solid ${personality === p.id ? "rgba(255,59,92,0.35)" : "rgba(255,255,255,0.07)"}` }}>
                <span className="text-2xl">{p.emoji}</span>
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: personality === p.id ? "#FF3B5C" : "#fff" }}>{p.name}</p>
                  <p className="text-[#555] text-xs">{p.description}</p>
                </div>
                {personality === p.id && <span style={{ color: "#FF3B5C" }}>✓</span>}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 rounded-2xl text-sm font-semibold" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#888" }}>← Kembali</button>
            <button onClick={() => setStep(3)} className="red-btn flex-1">Lanjut →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5 animate-[fadeIn_0.2s_ease-out]">
          <div className="text-center"><div className="text-4xl mb-2">🎉</div>
            <h2 className="text-2xl font-black text-white">Siap!</h2>
            <p className="text-[#666] text-sm mt-1">Setup selesai</p></div>
          <div className="glass-card p-5 space-y-3">
            <div className="flex justify-between"><span className="text-[#666]">Budget Harian</span><span className="font-bold" style={{ color: "#FF3B5C" }}>{fmt(finalBudget)}</span></div>
            <div className="h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <div className="flex justify-between"><span className="text-[#666]">Kepribadian</span><span className="font-bold text-white">{PERSONALITIES.find(p => p.id === personality)?.emoji} {PERSONALITIES.find(p => p.id === personality)?.name}</span></div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-3 rounded-2xl text-sm font-semibold" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "#888" }}>← Kembali</button>
            <button onClick={handleFinish} disabled={saving} className="red-btn flex-1">{saving ? "Menyimpan..." : "Mulai! 🚀"}</button>
          </div>
        </div>
      )}
    </div>
  );
}
