"use client";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/lib/hooks/useChat";
import ChatWindow from "@/components/chat/ChatWindow";
import InputBar from "@/components/chat/InputBar";
import { getBudgetStatus, formatRupiah, PERSONALITIES, type UserProfile } from "@/types";

interface Props {
  userId: string;
  profile: UserProfile | null;
  initialSpent: number;
}

function SideDrawer({ open, onClose, profile, spent }: {
  open: boolean; onClose: () => void; profile: UserProfile | null; spent: number;
}) {
  const router = useRouter();
  const budget = profile?.daily_budget ?? 50000;
  const remaining = Math.max(0, budget - spent);
  const displayName = profile?.username ?? profile?.email?.split("@")[0] ?? "Pengguna";
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOver = spent > budget;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function handleLogout() {
    const { createClient } = await import("@/lib/supabase/client");
    const sb = createClient();
    await sb.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const MENU = [
    { icon: "👤", label: "Profil",          href: "/profile" },
    { icon: "📊", label: "Recap",           href: "/recap" },
    { icon: "🏆", label: "Pencapaian",       href: "/achievements" },
    { icon: "📤", label: "Export Data CSV",  href: "/api/export?format=csv" },
  ];

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 transition-all duration-300"
        style={{
          background: open ? "rgba(0,0,0,0.75)" : "transparent",
          backdropFilter: open ? "blur(4px)" : "none",
          WebkitBackdropFilter: open ? "blur(4px)" : "none",
          pointerEvents: open ? "auto" : "none",
        }} />
      <div className="fixed top-0 left-0 h-full z-50 flex flex-col"
        style={{
          width: "80%", maxWidth: "300px",
          background: "rgba(10,10,10,0.97)",
          backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 280ms cubic-bezier(0.32,0.72,0,1)",
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}>
        <div className="px-5 pt-6 pb-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #FF3B5C, #CC2D48)", boxShadow: "0 4px 16px rgba(255,59,92,0.4)" }}>
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-black text-sm">{displayName}</p>
              <p className="text-[#555] text-xs">{profile?.email ?? ""}</p>
              <p className="text-[#F59E0B] text-xs font-bold mt-0.5">🔥 {profile?.streak_days ?? 0} hari streak</p>
            </div>
          </div>
          <div className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-[#555]">Pengeluaran hari ini</span>
              <span className="font-bold" style={{ color: isOver ? "#FF3B5C" : "#fff" }}>{Math.round(pct)}%</span>
            </div>
            <div className="budget-track mb-2">
              <div className="budget-fill" style={{ width: `${pct}%`, background: isOver ? "#FF3B5C" : "#6C63FF" }} />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-[#555]">Sisa: <span className="font-bold text-white">{formatRupiah(remaining)}</span></span>
              <span className="text-[#555]">Budget: {formatRupiah(budget)}</span>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
          {MENU.map(item => (
            <button key={item.label} onClick={() => { router.push(item.href); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all active:bg-white/[0.08]"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span className="text-lg">{item.icon}</span>
              <span className="text-white text-sm font-medium">{item.label}</span>
              <span className="ml-auto text-[#444]">›</span>
            </button>
          ))}
        </nav>
        <div className="px-4 pt-3 border-t border-white/[0.06]"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}>
          <div className="flex justify-between px-1 mb-3 text-xs text-[#444]">
            <span>✅ {profile?.total_safe_days ?? 0} hari aman</span>
            <span>⚠️ {profile?.total_over_days ?? 0} hari over</span>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold"
            style={{ background: "rgba(255,59,92,0.10)", border: "1px solid rgba(255,59,92,0.20)", color: "#FF3B5C" }}>
            🚪 Keluar
          </button>
        </div>
      </div>
    </>
  );
}

export default function ChatScreen({ userId, profile, initialSpent }: Props) {
  const router = useRouter();

  // ── REALTIME SPENT ────────────────────────────────────────
  // Gunakan state lokal — langsung update dari stats API response
  // Tidak perlu router.refresh() yang lambat
  const [spent, setSpent] = useState(initialSpent);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const update = () =>
      document.documentElement.style.setProperty(
        "--real-vh",
        `${window.visualViewport?.height ?? window.innerHeight}px`
      );
    update();
    window.visualViewport?.addEventListener("resize", update);
    return () => window.visualViewport?.removeEventListener("resize", update);
  }, []);

  const budget = profile?.daily_budget ?? 50000;
  const personality = PERSONALITIES.find(p => p.id === profile?.personality) ?? PERSONALITIES[1];
  const displayName = profile?.username ?? profile?.email?.split("@")[0] ?? "Pengguna";

  // Callback: dipanggil setiap kali transaksi berhasil disimpan
  // stats.totalSpent dari API = nilai terbaru dari DB → update spent langsung
  const handleTransactionSaved = useCallback((totalSpent?: number) => {
    if (typeof totalSpent === "number") {
      setSpent(totalSpent); // ← update instan, no reload
    } else {
      router.refresh(); // fallback jika stats tidak ada
    }
  }, [router]);

  const { messages, isLoading, sendMessage, clearMessages } = useChat({
    userId,
    onTransactionSaved: handleTransactionSaved,
  });

  // Derived values — otomatis recompute saat spent berubah
  const status = getBudgetStatus(spent, budget);
  const remaining = budget - spent;
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOver = spent > budget;
  const barColor = { safe: "#6C63FF", warning: "#F59E0B", danger: "#FF3B5C", over: "#FF3B5C" }[status];
  const streak = profile?.streak_days ?? 0;

  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Selamat Pagi" : hour < 15 ? "Selamat Siang" : hour < 18 ? "Selamat Sore" : "Selamat Malam";

  return (
    <div style={{ height: "var(--real-vh, 100dvh)" }} className="flex flex-col bg-[#050505] overflow-hidden relative">

      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} profile={profile} spent={spent} />

      {/* Header */}
      <div className="flex-shrink-0 px-5 relative z-10"
        style={{ paddingTop: "max(env(safe-area-inset-top), 16px)", paddingBottom: "12px" }}>

        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[#888] text-sm font-medium">{greeting}, {displayName}</p>
            <h1 className="text-3xl font-black text-white tracking-tight leading-none mt-0.5">Duitku</h1>
            <p className="text-[#666] text-xs mt-0.5">Financial Assistant</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Streak badge */}
            <div className="flex flex-col items-center justify-center px-3 py-2 rounded-2xl"
              style={{
                background: streak > 0 ? "rgba(255,59,92,0.12)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${streak > 0 ? "rgba(255,59,92,0.25)" : "rgba(255,255,255,0.07)"}`,
              }}>
              <span className="text-lg leading-none">🔥</span>
              <span className="text-white font-black text-sm leading-none mt-0.5">{streak}</span>
              <span className="text-[#555] text-[9px] leading-none mt-0.5">streak</span>
            </div>
            <button className="glass-btn w-10 h-10 flex items-center justify-center relative">
              <span className="text-base">🔔</span>
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#FF3B5C]" />
            </button>
            <button onClick={() => setDrawerOpen(true)} className="glass-btn w-10 h-10 flex items-center justify-center">
              <span className="text-base">☰</span>
            </button>
          </div>
        </div>

        {/* Personality pill */}
        <div className="mb-3">
          <button onClick={() => setDrawerOpen(true)} className="glass-btn flex items-center gap-2 px-4 py-2.5">
            <span className="text-base">{personality.emoji}</span>
            <span className="text-white text-sm font-semibold">{personality.name}</span>
            <span className="text-[#666] text-xs">›</span>
          </button>
        </div>

        {/* Budget card — langsung rerender saat spent berubah */}
        <div className="glass-card p-4"
          style={{ boxShadow: isOver ? "0 4px 30px rgba(255,59,92,0.15)" : "0 4px 20px rgba(0,0,0,0.3)" }}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-[#666] text-[10px] font-bold tracking-widest uppercase mb-1">Budget Hari Ini</p>
              {/* Angka ini langsung update tanpa reload */}
              <p className="text-2xl font-black text-white leading-none"
                style={{ transition: "all 0.3s ease" }}>
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(spent)}
              </p>
              <p className="text-[#666] text-xs mt-1">dari {formatRupiah(budget)}</p>
            </div>
            <div className="text-right">
              <p className="text-[#666] text-[10px] font-bold tracking-widest uppercase mb-1">Sisa Budget</p>
              {/* Angka ini juga langsung update */}
              <p className="text-xl font-black leading-none"
                style={{
                  color: isOver ? "#FF3B5C" : "#fff",
                  textShadow: isOver ? "0 0 16px rgba(255,59,92,0.6)" : "none",
                  transition: "all 0.3s ease",
                }}>
                {isOver ? `-${formatRupiah(Math.abs(remaining))}` : formatRupiah(remaining)}
              </p>
              <div className="mt-1.5 inline-block rounded-full px-2.5 py-0.5"
                style={{
                  background: isOver ? "rgba(255,59,92,0.15)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${isOver ? "rgba(255,59,92,0.3)" : "rgba(255,255,255,0.08)"}`,
                  transition: "all 0.3s ease",
                }}>
                <p className="text-[11px] font-bold" style={{ color: isOver ? "#FF3B5C" : "#888" }}>
                  {Math.round(pct)}% terpakai
                </p>
              </div>
            </div>
          </div>
          {/* Progress bar — smooth transition */}
          <div className="budget-track">
            <div className="budget-fill" style={{
              width: `${pct}%`,
              background: isOver ? "linear-gradient(90deg, #FF3B5C, #FF6B6B)" : `linear-gradient(90deg, ${barColor}, ${barColor}aa)`,
              boxShadow: isOver ? "0 0 12px rgba(255,59,92,0.6)" : "none",
            }} />
          </div>
        </div>
      </div>

      <ChatWindow messages={messages} isLoading={isLoading} />
      <InputBar onSend={sendMessage} isLoading={isLoading} onClear={clearMessages} hasMessages={messages.length > 1} />
    </div>
  );
}
