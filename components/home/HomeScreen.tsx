"use client";
import { useRouter } from "next/navigation";
import type { UserProfile, Transaction } from "@/types";
import { formatRupiah, getBudgetStatus } from "@/types";

interface Props {
  profile: UserProfile | null;
  spent: number;
  transactions: Transaction[];
  username: string;
}

// Circular progress ring
function BudgetRing({ pct, status }: { pct: number; status: string }) {
  const r = 54; const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = status === "safe" ? "#22C55E" : status === "warning" ? "#EAB308" : status === "danger" ? "#F97316" : "#EF4444";
  return (
    <svg width="140" height="140" viewBox="0 0 140 140">
      <circle cx="70" cy="70" r={r} fill="none" stroke="#E5E7EB" strokeWidth="12" />
      <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 70 70)" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      <text x="70" y="64" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="22" fill={color}>{Math.round(pct)}%</text>
      <text x="70" y="82" textAnchor="middle" fontFamily="Poppins,sans-serif" fontWeight="500" fontSize="11" fill="#6B7280">tersisa</text>
    </svg>
  );
}

const QUICK = [
  { icon: "☕", label: "Kopi",      hint: "kopi ",      color: "#22C55E", bg: "#F0FDF4" },
  { icon: "🍔", label: "Makan",     hint: "makan ",     color: "#F97316", bg: "#FFF7ED" },
  { icon: "🚌", label: "Transport", hint: "transport ", color: "#3B82F6", bg: "#EFF6FF" },
  { icon: "🛍", label: "Belanja",   hint: "belanja ",   color: "#A855F7", bg: "#FAF5FF" },
];

const STATUS_CONFIG: Record<string, { label: string; desc: string; color: string; bg: string }> = {
  safe:    { label: "Aman",         desc: "Pengeluaran masih dalam batas 😎",  color: "#16A34A", bg: "#F0FDF4" },
  warning: { label: "Waspada",      desc: "Mulai hati-hati ya 👀",             color: "#A16207", bg: "#FEFCE8" },
  danger:  { label: "Hampir Habis", desc: "Budget hampir habis! 😬",           color: "#C2410C", bg: "#FFF7ED" },
  over:    { label: "Over Budget",  desc: "Sudah melebihi budget hari ini 😰", color: "#DC2626", bg: "#FEF2F2" },
};

export default function HomeScreen({ profile, spent, transactions, username }: Props) {
  const router = useRouter();
  const budget = profile?.daily_budget ?? 50000;
  const remaining = Math.max(0, budget - spent);
  const pct = budget > 0 ? Math.min((remaining / budget) * 100, 100) : 0;
  const status = getBudgetStatus(spent, budget);
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.safe;
  const streak = profile?.streak_days ?? 0;

  const hour = new Date().getHours();
  const greetEmoji = hour < 12 ? "☀️" : hour < 17 ? "🌤️" : "🌙";
  const greetText  = hour < 12 ? "Selamat pagi" : hour < 17 ? "Selamat siang" : "Selamat malam";

  // Rekap singkat — baca dari semua transactions yang dikirim (sudah difilter mulai awal bulan di page.tsx)
  const nowWib = new Date(Date.now() + 7*60*60*1000);
  const today = nowWib.toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7*86400000 + 7*60*60*1000).toISOString().split("T")[0];
  const monthStart = today.slice(0,7)+"-01";

  const todayTxs  = transactions.filter(t => t.date === today);
  const weekTxs   = transactions.filter(t => t.date >= weekAgo);
  const monthTxs  = transactions.filter(t => t.date >= monthStart);

  const todayTotal = todayTxs.reduce((s, t) => s + t.amount, 0);
  const weekTotal  = weekTxs.reduce((s, t)  => s + t.amount, 0);
  const monthTotal = monthTxs.reduce((s, t) => s + t.amount, 0);

  return (
    <div className="h-full overflow-y-auto no-scrollbar" style={{ background: "var(--bg)" }}>
      <div className="max-w-lg mx-auto px-4 pb-6"
        style={{ paddingTop: "max(env(safe-area-inset-top), 20px)" }}>

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-5 anim-fadeup">
          <div>
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              {greetEmoji} {greetText}, {username}!
            </p>
            {/* Logo Ngirit — pakai img tag dengan width fixed agar tidak terpotong */}
            <div className="mt-0.5" style={{ lineHeight: 1 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/logo-ngirit.png"
                alt="Ngirit"
                style={{ height: 36, width: "auto", maxWidth: 140, objectFit: "contain", objectPosition: "left center", display: "block" }}
              />
            </div>
            <p className="text-sm font-medium mt-1" style={{ color: "var(--text-secondary)" }}>
              Teman dompetmu hari ini 💚
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Streak */}
            <div className="ng-card-sm px-3 py-2 text-center" style={{ minWidth: 64 }}>
              <div className="text-xl leading-none">🔥</div>
              <div className="font-bold text-sm font-inter" style={{ color: "var(--text)" }}>{streak}</div>
              <div className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>hari aman</div>
            </div>
            {/* Bell */}
            <div className="ng-card-sm w-11 h-11 flex items-center justify-center relative cursor-pointer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: "var(--green)" }} />
            </div>
          </div>
        </div>

        {/* ── Budget Hero Card ── */}
        <div className="ng-card p-5 mb-4 anim-fadeup" style={{ background: "linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 60%)", animationDelay: "0.05s" }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BudgetRing pct={pct} status={status} />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--green)" }}>BUDGET HARI INI</p>
                <p className="text-3xl font-black font-inter" style={{ color: "var(--text)", letterSpacing: "-0.02em" }}>
                  {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(remaining)}
                </p>
                <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>tersisa dari {formatRupiah(budget)}</p>
                <div className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full w-fit"
                  style={{ background: statusCfg.bg }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: statusCfg.color }} />
                  <span className="text-xs font-bold" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
                </div>
                <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{statusCfg.desc}</p>
              </div>
            </div>
            {/* Giri mascot */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={
              status === "over"    ? "/brand/giri-shock.png" :
              status === "danger"  ? "/brand/giri-shock.png" :
              status === "warning" ? "/brand/giri-idea.png"  :
              "/brand/giri-happy.png"
            } alt="Giri" className="w-28 h-28 object-contain flex-shrink-0" />
          </div>
        </div>

        {/* ── Insight + Giri cards (2 col) ── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Insight */}
          <div className="ng-card p-4 anim-fadeup" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-base">💡</span>
              <span className="text-xs font-bold" style={{ color: "var(--text)" }}>Insight Hari Ini</span>
            </div>
            <p className="text-sm font-semibold leading-snug" style={{ color: "var(--text)" }}>
              {todayTotal === 0
                ? <span>Belum ada <span style={{ color: "var(--green)" }}>catatan</span> hari ini.</span>
                : <span>Pengeluaran <span style={{ color: spent > budget * 0.7 ? "#EF4444" : "var(--green)" }}>{formatRupiah(todayTotal)}</span> hari ini.</span>
              }
            </p>
            <div className="mt-2">
              <svg viewBox="0 0 100 40" className="w-full h-10">
                <polyline points="0,35 20,28 35,30 50,20 65,22 80,15 100,8"
                  fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round"/>
                <polyline points="0,35 20,28 35,30 50,20 65,22 80,15 100,8 100,40 0,40"
                  fill="url(#g1)" opacity="0.15"/>
                <defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E"/>
                  <stop offset="100%" stopColor="#22C55E" stopOpacity="0"/>
                </linearGradient></defs>
              </svg>
            </div>
            <button className="mt-2 text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: "var(--green-light)", color: "var(--green-dark)" }}>
              {status === "safe" ? "Pertahankan! 🔥" : "Hati-hati ya 👀"}
            </button>
          </div>

          {/* Giri quote */}
          <div className="ng-card p-4 anim-fadeup" style={{ background: "#F0FDF4", animationDelay: "0.12s" }}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-base">🐿️</span>
              <span className="text-xs font-bold" style={{ color: "var(--text)" }}>Giri</span>
            </div>
            <p className="text-sm font-bold leading-snug" style={{ color: "var(--text)" }}>
              {status === "over" ? "'Udah over budget nih... 😱'" :
               status === "danger" ? "'Hampir habis, ayo hati-hati! 😬'" :
               status === "warning" ? "'Mulai waspada ya, jangan boros! 👀'" :
               "'Ngopi boleh.\nJajan impulsif jangan ya 😏'"}
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={status === "over" ? "/brand/giri-shock.png" : "/brand/giri-idea.png"} alt="Giri" className="w-20 h-20 object-contain mx-auto mt-1" />
          </div>
        </div>

        {/* ── Catat Cepat ── */}
        <div className="mb-4 anim-fadeup" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base" style={{ color: "var(--text)" }}>Catat Cepat ⚡</h3>
            <button className="text-xs font-semibold" style={{ color: "var(--green)" }}>Lihat semua &gt;</button>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {QUICK.map(q => (
              <button key={q.label} onClick={() => router.push(`/chat?prompt=${encodeURIComponent(q.hint)}`)}
                className="quick-chip flex-shrink-0 px-4 py-3 flex flex-col items-center gap-1" style={{ minWidth: 72 }}>
                <span className="text-2xl">{q.icon}</span>
                <span className="text-xs font-bold" style={{ color: "var(--text)" }}>{q.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Rekap Singkat — baca dari transaksi nyata ── */}
        <div className="mb-6 anim-fadeup" style={{ animationDelay: "0.18s" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base" style={{ color: "var(--text)" }}>Rekap Singkat</h3>
            <button onClick={() => router.push("/recap")} className="text-xs font-semibold" style={{ color: "var(--green)" }}>Lihat detail &gt;</button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Hari Ini",   total: todayTotal, count: todayTxs.length,  color: "var(--green)" },
              { label: "Minggu Ini", total: weekTotal,  count: weekTxs.length,   color: "#3B82F6" },
              { label: "Bulan Ini",  total: monthTotal, count: monthTxs.length,  color: "#A855F7" },
            ].map(r => (
              <div key={r.label} className="ng-card-sm p-3">
                <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--text-muted)" }}>{r.label}</p>
                <p className="font-black text-sm font-inter leading-tight" style={{ color: r.color }}>
                  {formatRupiah(r.total)}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{r.count} transaksi</p>
                <svg viewBox="0 0 60 20" className="w-full h-5 mt-1">
                  <polyline points="0,18 12,14 24,15 36,8 48,10 60,4"
                    fill="none" stroke={r.color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* Spacer for FAB */}
        <div className="h-16" />
      </div>

      {/* ── Floating CTA ── */}
      <div className="fixed bottom-20 left-0 right-0 flex justify-center px-4 z-20"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        <button onClick={() => router.push("/chat")} className="ng-btn flex items-center gap-2 px-8"
          style={{ fontSize: "16px", fontWeight: 700 }}>
          <span className="text-xl">+</span> Catat Pengeluaran ✨
        </button>
      </div>
    </div>
  );
}
