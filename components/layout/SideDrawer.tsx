"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatRupiah, type UserProfile } from "@/types";

interface Props {
  open: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  spent: number;
}

const MENU = [
  { icon: "👤", label: "Profil",             href: "/profile", download: false },
  { icon: "🎯", label: "Target Keuangan",     href: "/profile", download: false },
  { icon: "📂", label: "Kategori",            href: "/recap",   download: false },
  { icon: "🤖", label: "Pengaturan AI",       href: "/profile", download: false },
  { icon: "📤", label: "Export CSV",          href: "/api/export", download: true },
];

export default function SideDrawer({ open, onClose, profile, spent }: Props) {
  const router = useRouter();
  const budget = profile?.daily_budget ?? 50000;
  const remaining = Math.max(0, budget - spent);
  const displayName = profile?.username ?? "Pengguna";

  // Current month for export filename
  const currentMonth = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  async function handleLogout() {
    const sb = createClient();
    await sb.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function handleMenuClick(item: typeof MENU[0]) {
    if (item.download) {
      // Trigger file download — router.push tidak bisa download file
      const url = `${item.href}?month=${currentMonth}`;
      const a = document.createElement("a");
      a.href = url;
      a.download = `ngirit-${currentMonth}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      onClose();
      return;
    }
    router.push(item.href);
    onClose();
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 transition-all duration-300"
        style={{
          background: open ? "rgba(0,0,0,0.7)" : "transparent",
          backdropFilter: open ? "blur(4px)" : "none",
          pointerEvents: open ? "auto" : "none",
        }}
      />

      {/* Drawer panel */}
      <div
        className="fixed top-0 left-0 h-full z-50 flex flex-col"
        style={{
          width: "80%",
          maxWidth: "320px",
          background: "rgba(12,12,12,0.95)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderRight: "1px solid rgba(255,255,255,0.08)",
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 300ms ease-out",
          boxShadow: open ? "4px 0 40px rgba(34,197,94,0.10)" : "none",
          paddingTop: "env(safe-area-inset-top, 0px)",
        }}
      >
        {/* Profile section */}
        <div className="px-6 pt-6 pb-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black text-white flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #22C55E, #16A34A)", boxShadow: "0 4px 16px rgba(34,197,94,0.4)" }}>
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-black text-base leading-tight">{displayName}</p>
              <p className="text-[#666] text-xs mt-0.5">{profile?.email ?? ""}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Pengeluaran", value: formatRupiah(spent),     color: "#f87171" },
              { label: "Budget",      value: formatRupiah(budget),    color: "#fff"    },
              { label: "Sisa",        value: formatRupiah(remaining), color: remaining > 0 ? "#4ade80" : "#f87171" },
            ].map(s => (
              <div key={s.label} className="rounded-xl p-2.5 text-center"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="font-black text-sm leading-none" style={{ color: s.color }}>{s.value}</p>
                <p className="text-[#555] text-[9px] mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {MENU.map(item => (
            <button key={item.label}
              onClick={() => handleMenuClick(item)}
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all hover:bg-white/[0.05] active:bg-white/[0.08]">
              <span className="text-lg w-6 text-center">{item.icon}</span>
              <span className="text-white text-sm font-medium">{item.label}</span>
              {item.download && (
                <span className="ml-1 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}>
                  CSV
                </span>
              )}
              <span className="ml-auto text-[#444] text-xs">›</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-6 border-t border-white/[0.06] pt-4"
          style={{ paddingBottom: "max(env(safe-area-inset-bottom), 24px)" }}>
          <div className="flex items-center justify-between px-2 mb-3">
            <span className="text-[#444] text-xs">🔥 {profile?.streak_days ?? 0} hari streak</span>
            <span className="text-[#444] text-xs">Ngirit v1</span>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold transition-all"
            style={{ background: "rgba(239,68,68,0.10)", border: "1px solid rgba(239,68,68,0.20)", color: "#f87171" }}>
            <span>🚪</span> Keluar
          </button>
        </div>
      </div>
    </>
  );
}
