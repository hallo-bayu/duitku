"use client";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useChat } from "@/lib/hooks/useChat";
import ChatWindow from "@/components/chat/ChatWindow";
import InputBar from "@/components/chat/InputBar";
import { getBudgetStatus, formatRupiah, PERSONALITIES, type UserProfile } from "@/types";

interface Props { userId: string; profile: UserProfile | null; initialSpent: number; }

/* ── SVG Icons untuk drawer menu (HD, senada) ── */
function MenuIcon({ type }: { type: "profile"|"recap"|"trophy"|"export" }) {
  const C = "#FF3B5C";
  const F = "rgba(255,59,92,0.14)";
  if (type === "profile") return (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
      <circle cx="24" cy="16" r="9" fill={F} stroke={C} strokeWidth="3"/>
      <path d="M6 44c0-9.941 8.059-18 18-18s18 8.059 18 18" stroke={C} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
  if (type === "recap") return (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
      <rect x="4" y="4" width="40" height="40" rx="9" fill={F} stroke={C} strokeWidth="3"/>
      <rect x="11" y="26" width="7" height="14" rx="2.5" fill={C} opacity="0.7"/>
      <rect x="20.5" y="18" width="7" height="22" rx="2.5" fill={C}/>
      <rect x="30" y="22" width="7" height="18" rx="2.5" fill={C} opacity="0.7"/>
    </svg>
  );
  if (type === "trophy") return (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
      <path d="M14 6h20v18a10 10 0 0 1-20 0V6z" fill={F} stroke={C} strokeWidth="3" strokeLinejoin="round"/>
      <path d="M14 10H8a1 1 0 0 0-1 1v6a7 7 0 0 0 7 7" stroke={C} strokeWidth="3" strokeLinecap="round"/>
      <path d="M34 10h6a1 1 0 0 1 1 1v6a7 7 0 0 1-7 7" stroke={C} strokeWidth="3" strokeLinecap="round"/>
      <line x1="24" y1="34" x2="24" y2="40" stroke={C} strokeWidth="3" strokeLinecap="round"/>
      <rect x="14" y="40" width="20" height="4" rx="2" fill={C}/>
    </svg>
  );
  // export
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
      <rect x="6" y="8" width="36" height="32" rx="6" fill={F} stroke={C} strokeWidth="3"/>
      <line x1="16" y1="20" x2="32" y2="20" stroke={C} strokeWidth="3" strokeLinecap="round"/>
      <line x1="16" y1="28" x2="26" y2="28" stroke={C} strokeWidth="3" strokeLinecap="round"/>
      <path d="M30 32 L36 38 M36 32 L30 38" stroke={C} strokeWidth="3" strokeLinecap="round"/>
      <path d="M24 4 L24 14 M20 10 L24 14 L28 10" stroke={C} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/* ─── Side Drawer ─────────────────────────────────────────── */
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
    await (createClient()).auth.signOut();
    router.push("/login"); router.refresh();
  }

  const MENU: { icon: "profile"|"recap"|"trophy"|"export"; label: string; href: string }[] = [
    { icon: "profile", label: "Profil",          href: "/profile" },
    { icon: "recap",   label: "Recap",           href: "/recap" },
    { icon: "trophy",  label: "Pencapaian",       href: "/achievements" },
    { icon: "export",  label: "Export Data CSV",  href: "/api/export?format=csv" },
  ];

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40"
        style={{
          background: open ? "rgba(0,0,0,0.70)" : "transparent",
          backdropFilter: open ? "blur(6px)" : "none",
          WebkitBackdropFilter: open ? "blur(6px)" : "none",
          pointerEvents: open ? "auto" : "none",
          transition: "background 0.25s",
        }} />
      <div className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: "82%", maxWidth: "320px",
          background: "rgba(6,6,6,0.97)",
          backdropFilter: "blur(32px)", WebkitBackdropFilter: "blur(32px)",
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 280ms cubic-bezier(0.32,0.72,0,1)",
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}>

        {/* Header */}
        <div className="px-5 pt-6 pb-4 border-b border-white/[0.06]">
          {/* Logo SVG — HD, bukan gambar PNG */}
          <div className="flex items-center gap-2 mb-5">
            <svg viewBox="0 0 200 68" height="32" xmlns="http://www.w3.org/2000/svg">
              <text x="2" y="56" fontFamily="'SF Pro Display',-apple-system,'Helvetica Neue',Arial,sans-serif"
                fontSize="60" fontWeight="900" fill="#ffffff" letterSpacing="-1">Ngirit</text>
              <ellipse cx="118" cy="8" rx="6" ry="8.5" fill="#43A047" transform="rotate(-25 118 8)"/>
              <ellipse cx="124" cy="5" rx="3.5" ry="5.5" fill="#66BB6A" transform="rotate(-25 124 5)"/>
              <line x1="120" y1="13" x2="122" y2="20" stroke="#43A047" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg,#FF3B5C,#CC2D48)", boxShadow: "0 4px 16px rgba(255,59,92,0.4)" }}>
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-black text-sm">{displayName}</p>
              <p className="text-[#555] text-xs">{profile?.email ?? ""}</p>
              <p className="text-xs font-bold mt-0.5" style={{ color: "#F59E0B" }}>🔥 {profile?.streak_days ?? 0} hari streak</p>
            </div>
          </div>

          {/* Budget mini */}
          <div className="rounded-2xl p-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-white font-medium">Pengeluaran hari ini</span>
              <span className="font-bold" style={{ color: isOver ? "#FF3B5C" : "#fff" }}>{Math.round(pct)}%</span>
            </div>
            <div className="budget-track mb-2">
              <div className="budget-fill" style={{ width: `${pct}%`, background: isOver ? "#FF3B5C" : "#22c55e" }} />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white">Sisa: <span className="font-bold">{formatRupiah(remaining)}</span></span>
              <span className="text-[#666]">Budget: {formatRupiah(budget)}</span>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs">
            <span style={{ color: "#22c55e" }}>✅ {profile?.total_safe_days ?? 0} hari aman</span>
            <span style={{ color: "#FF3B5C" }}>⚠️ {profile?.total_over_days ?? 0} hari over</span>
          </div>
        </div>

        {/* Menu dengan SVG icons */}
        <nav className="flex-1 px-3 py-3 space-y-1.5 overflow-y-auto">
          {MENU.map(item => (
            <button key={item.label} onClick={() => { router.push(item.href); onClose(); }}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all active:bg-white/[0.08]"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,59,92,0.10)" }}>
                <MenuIcon type={item.icon} />
              </div>
              <span className="text-white text-sm font-semibold">{item.label}</span>
              <svg className="ml-auto" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18l6-6-6-6" stroke="#444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-8 pt-3 border-t border-white/[0.06]">
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold"
            style={{ background: "rgba(255,59,92,0.10)", border: "1px solid rgba(255,59,92,0.20)", color: "#FF3B5C" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="#FF3B5C" strokeWidth="2.5" strokeLinecap="round"/>
              <polyline points="16 17 21 12 16 7" stroke="#FF3B5C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke="#FF3B5C" strokeWidth="2.5" strokeLinecap="round"/>
            </svg>
            Keluar dari Akun
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Main Chat Screen ────────────────────────────────────── */
export default function ChatScreen({ userId, profile, initialSpent }: Props) {
  const router = useRouter();
  const [spent, setSpent] = useState(initialSpent);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const update = () => document.documentElement.style.setProperty("--real-vh", `${window.visualViewport?.height ?? window.innerHeight}px`);
    update();
    window.visualViewport?.addEventListener("resize", update);
    return () => window.visualViewport?.removeEventListener("resize", update);
  }, []);

  const budget = profile?.daily_budget ?? 50000;
  const personality = PERSONALITIES.find(p => p.id === profile?.personality) ?? PERSONALITIES[1];
  const displayName = profile?.username ?? profile?.email?.split("@")[0] ?? "Pengguna";
  const streak = profile?.streak_days ?? 0;

  const handleTransactionSaved = useCallback((totalSpent?: number) => {
    if (typeof totalSpent === "number") setSpent(totalSpent);
    else router.refresh();
  }, [router]);

  const { messages, isLoading, sendMessage, clearMessages } = useChat({ userId, onTransactionSaved: handleTransactionSaved });

  const status = getBudgetStatus(spent, budget);
  const remaining = budget - spent;
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const isOver = spent > budget;
  const barColor = { safe: "#22c55e", warning: "#F59E0B", danger: "#FF3B5C", over: "#FF3B5C" }[status];

  const hour = new Date().getHours();
  const greeting = hour < 11 ? "Selamat Pagi" : hour < 15 ? "Selamat Siang" : hour < 18 ? "Selamat Sore" : "Selamat Malam";

  return (
    <div style={{ height: "var(--real-vh, 100dvh)" }} className="flex flex-col overflow-hidden relative">
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} profile={profile} spent={spent} />

      {/* Header */}
      <div className="flex-shrink-0 px-5 relative z-10"
        style={{ paddingTop: "max(env(safe-area-inset-top), 16px)", paddingBottom: "12px" }}>

        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-white/50 text-sm">{greeting}, {displayName}</p>
            {/* Logo Giri — HD SVG inline */}
            <svg viewBox="0 0 200 68" height="44" xmlns="http://www.w3.org/2000/svg" className="mt-1">
              <text x="2" y="56" fontFamily="'SF Pro Display',-apple-system,'Helvetica Neue',Arial,sans-serif"
                fontSize="60" fontWeight="900" fill="#ffffff" letterSpacing="-1">Ngirit</text>
              <ellipse cx="118" cy="8" rx="6" ry="8.5" fill="#43A047" transform="rotate(-25 118 8)"/>
              <ellipse cx="124" cy="5" rx="3.5" ry="5.5" fill="#66BB6A" transform="rotate(-25 124 5)"/>
              <line x1="120" y1="13" x2="122" y2="20" stroke="#43A047" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p className="text-white/40 text-xs mt-0.5">Catat pengeluaran semudah chat.</p>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <div className="flex flex-col items-center px-2.5 py-1.5 rounded-2xl"
              style={{
                background: streak > 0 ? "rgba(255,59,92,0.12)" : "rgba(255,255,255,0.05)",
                border: `1px solid ${streak > 0 ? "rgba(255,59,92,0.25)" : "rgba(255,255,255,0.07)"}`,
              }}>
              <span className="text-base leading-none">🔥</span>
              <span className="text-white font-black text-sm leading-none mt-0.5">{streak}</span>
              <span className="text-white/30 text-[9px]">streak</span>
            </div>
            <button onClick={() => setDrawerOpen(true)} className="glass-btn w-11 h-11 flex items-center justify-center">
              <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                <rect y="0" width="20" height="2.5" rx="1.25" fill="white"/>
                <rect y="6.75" width="16" height="2.5" rx="1.25" fill="white"/>
                <rect y="13.5" width="12" height="2.5" rx="1.25" fill="white"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Personality pill */}
        <div className="mb-3">
          <button onClick={() => setDrawerOpen(true)} className="glass-btn flex items-center gap-2 px-3 py-2">
            <span className="text-base">{personality.emoji}</span>
            <span className="text-white text-sm font-semibold">{personality.name}</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="ml-0.5">
              <path d="M9 18l6-6-6-6" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Budget card */}
        <div className="glass-card p-4"
          style={{ boxShadow: isOver ? "0 4px 32px rgba(255,59,92,0.18)" : "0 4px 24px rgba(0,0,0,0.4)" }}>
          <div className="flex justify-between items-start mb-3">
            <div>
              <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase mb-1">Budget Hari Ini</p>
              <p className="text-2xl font-black text-white leading-none" style={{ transition: "all 0.3s" }}>
                {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(spent)}
              </p>
              <p className="text-white/40 text-xs mt-1">dari {formatRupiah(budget)}</p>
            </div>
            <div className="text-right">
              <p className="text-white/40 text-[10px] font-bold tracking-widest uppercase mb-1">Sisa Budget</p>
              <p className="text-xl font-black leading-none" style={{
                color: isOver ? "#FF3B5C" : "#fff",
                textShadow: isOver ? "0 0 20px rgba(255,59,92,0.6)" : "none",
                transition: "all 0.3s",
              }}>
                {isOver ? `-${formatRupiah(Math.abs(remaining))}` : formatRupiah(remaining)}
              </p>
              <div className="mt-1.5 inline-block rounded-full px-2.5 py-0.5"
                style={{
                  background: isOver ? "rgba(255,59,92,0.15)" : "rgba(255,255,255,0.06)",
                  border: `1px solid ${isOver ? "rgba(255,59,92,0.3)" : "rgba(255,255,255,0.08)"}`,
                }}>
                <p className="text-[11px] font-bold" style={{ color: isOver ? "#FF3B5C" : "rgba(255,255,255,0.5)" }}>
                  {Math.round(pct)}% terpakai
                </p>
              </div>
            </div>
          </div>
          <div className="budget-track">
            <div className="budget-fill" style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
              boxShadow: isOver ? "0 0 12px rgba(255,59,92,0.6)" : "none",
            }} />
          </div>
        </div>
      </div>

      <ChatWindow messages={messages} isLoading={isLoading} personality={profile?.personality ?? "balanced"} />
      <InputBar onSend={sendMessage} isLoading={isLoading} onClear={clearMessages} hasMessages={messages.length > 1} />
    </div>
  );
}
