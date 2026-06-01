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
  const color =
    status === "safe"    ? "#22C55E" :
    status === "warning" ? "#EAB308" :
    status === "danger"  ? "#F97316" : "#EF4444";
  return (
    <svg width="130" height="130" viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="#E5E7EB" strokeWidth="12" />
      <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform="rotate(-90 70 70)" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      <text x="70" y="64" textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="22" fill={color}>{Math.round(pct)}%</text>
      <text x="70" y="82" textAnchor="middle" fontFamily="Poppins,sans-serif" fontWeight="500" fontSize="11" fill="#6B7280">tersisa</text>
    </svg>
  );
}

const STATUS_CONFIG: Record<string, { label: string; desc: string; color: string; bg: string }> = {
  safe:    { label: "Aman",         desc: "Pengeluaran masih dalam batas 😎",   color: "#16A34A", bg: "#F0FDF4" },
  warning: { label: "Waspada",      desc: "Mulai hati-hati ya 👀",              color: "#A16207", bg: "#FEFCE8" },
  danger:  { label: "Hampir Habis", desc: "Budget hampir habis! 😬",            color: "#C2410C", bg: "#FFF7ED" },
  over:    { label: "Over Budget",  desc: "Sudah melebihi budget hari ini 😰",  color: "#DC2626", bg: "#FEF2F2" },
};

// Quick actions dengan nominal terakhir
const QUICK_BASE = [
  { icon: "☕", label: "Kopi",      hint: "kopi ",       category: "minuman"      },
  { icon: "🍔", label: "Makan",     hint: "makan ",      category: "makanan"      },
  { icon: "🚌", label: "Transport", hint: "transport ",  category: "transportasi" },
  { icon: "🛍", label: "Belanja",   hint: "belanja ",    category: "belanja"      },
];

export default function HomeScreen({ profile, spent, transactions, username }: Props) {
  const router = useRouter();
  const budget    = profile?.daily_budget ?? 50000;
  const remaining = Math.max(0, budget - spent);
  const pct       = budget > 0 ? Math.min((remaining / budget) * 100, 100) : 100;
  const status    = getBudgetStatus(spent, budget);
  const statusCfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.safe;
  const streak    = profile?.streak_days ?? 0;

  // Greeting berdasarkan jam WIB
  const hourWib = new Date(Date.now() + 7 * 60 * 60 * 1000).getUTCHours();
  const greetEmoji = hourWib < 11 ? "☀️" : hourWib < 15 ? "🌤️" : hourWib < 19 ? "🌇" : "🌙";
  const greetText  = hourWib < 11 ? "Selamat pagi" : hourWib < 15 ? "Selamat siang" : hourWib < 19 ? "Selamat sore" : "Selamat malam";

  // ── Rekap Singkat — baca dari transactions nyata ──
  const nowWib    = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const today     = nowWib.toISOString().split("T")[0];
  const weekAgo   = new Date(Date.now() - 7 * 86400000 + 7 * 60 * 60 * 1000).toISOString().split("T")[0];
  const monthStart = today.slice(0, 7) + "-01";

  const todayTxs  = transactions.filter(t => t.date === today);
  const weekTxs   = transactions.filter(t => t.date >= weekAgo);
  const monthTxs  = transactions.filter(t => t.date >= monthStart);

  const todayTotal  = todayTxs.reduce((s, t) => s + t.amount, 0);
  const weekTotal   = weekTxs.reduce((s, t) => s + t.amount, 0);
  const monthTotal  = monthTxs.reduce((s, t) => s + t.amount, 0);

  // ── Quick Action: nominal terakhir per kategori ──
  const lastAmounts: Record<string, number> = {};
  transactions.forEach(t => {
    if (!lastAmounts[t.category]) lastAmounts[t.category] = t.amount;
  });
  const quickItems = QUICK_BASE.map(q => ({
    ...q,
    lastAmount: lastAmounts[q.category] ?? null,
  }));

  // ── Insight: bandingkan hari ini vs kemarin ──
  const yesterday  = new Date(Date.now() - 86400000 + 7 * 60 * 60 * 1000).toISOString().split("T")[0];
  const yestTotal  = transactions.filter(t => t.date === yesterday).reduce((s, t) => s + t.amount, 0);
  const hasToday   = todayTotal > 0;
  const hasYest    = yestTotal > 0;

  let insightText = "";
  let showChart   = false;
  if (!hasToday) {
    insightText = "Belum ada transaksi hari ini.\nMulai catat pengeluaran pertamamu 💚";
    showChart   = false;
  } else if (hasYest && todayTotal < yestTotal) {
    const pctSave = Math.round(((yestTotal - todayTotal) / yestTotal) * 100);
    insightText = `Kamu lebih hemat ${pctSave}%\ndibanding kemarin! 🔥`;
    showChart   = true;
  } else if (hasYest && todayTotal > yestTotal) {
    const pctMore = Math.round(((todayTotal - yestTotal) / yestTotal) * 100);
    insightText = `Pengeluaran naik ${pctMore}%\ndibanding kemarin 👀`;
    showChart   = true;
  } else {
    insightText = `Pengeluaran hari ini\n${formatRupiah(todayTotal)}`;
    showChart   = true;
  }

  // Giri ekspresi sesuai status
  const giriImg =
    status === "over"    ? "/brand/giri-shock.png" :
    status === "danger"  ? "/brand/giri-shock.png" :
    status === "warning" ? "/brand/giri-idea.png"  :
    "/brand/giri-happy.png";

  const giriQuote =
    status === "over"    ? "Udah over budget nih… 😱\nCatat dulu biar Giri bantu!" :
    status === "danger"  ? "Hampir habis, ayo hati-hati! 😬" :
    status === "warning" ? "Mulai waspada ya,\njangan boros! 👀" :
    "Ngopi boleh.\nJajan impulsif jangan ya 😏";

  return (
    <div className="h-full overflow-y-auto no-scrollbar" style={{ background: "var(--bg)" }}>
      <div className="max-w-lg mx-auto px-4 pb-6"
        style={{ paddingTop: "max(env(safe-area-inset-top), 20px)" }}>

        {/* ── Header ── */}
        <div className="flex items-start justify-between mb-5 anim-fadeup">
          <div>
            <p className="text-sm font-semibold mb-1" style={{ color: "var(--text-secondary)" }}>
              {greetEmoji} {greetText}, {username}!
            </p>
            {/* Logo SVG — selalu terlihat di background terang */}
            <div style={{ lineHeight: 1 }}>
              <svg viewBox="0 0 180 50" xmlns="http://www.w3.org/2000/svg"
                style={{ height: 36, width: "auto", display: "block" }}>
                <text x="0" y="40"
                  fontFamily="'Poppins','SF Pro Display',-apple-system,sans-serif"
                  fontSize="44" fontWeight="900" fill="#111827" letterSpacing="-1">
                  Ngirit
                </text>
                {/* Daun pada huruf i pertama */}
                <ellipse cx="79" cy="5" rx="5.5" ry="7.5" fill="#22C55E" transform="rotate(-20 79 5)"/>
                <ellipse cx="84.5" cy="2.5" rx="3.5" ry="5.5" fill="#4ADE80" transform="rotate(-20 84.5 2.5)"/>
              </svg>
            </div>
            <p className="text-xs font-medium mt-1" style={{ color: "var(--text-secondary)" }}>
              Teman dompetmu hari ini 💚
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Streak card */}
            <div className="ng-card-sm px-3 py-2 text-center" style={{ minWidth: 60 }}>
              <div className="text-xl leading-none">🔥</div>
              <div className="font-bold text-sm font-inter" style={{ color: "var(--text)" }}>{streak}</div>
              <div className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>hari aman</div>
            </div>
            {/* Bell */}
            <div className="ng-card-sm w-11 h-11 flex items-center justify-center relative cursor-pointer">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"
                  stroke="#374151" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ background: "var(--green)" }} />
            </div>
          </div>
        </div>

        {/* ── Budget Hero Card ── */}
        <div className="ng-card p-5 mb-4 anim-fadeup"
          style={{ background: "linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 60%)", animationDelay: "0.05s" }}>
          <div className="flex items-center gap-3">
            <BudgetRing pct={pct} status={status} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: "var(--green)" }}>
                BUDGET HARI INI
              </p>
              {/* Gunakan formatRupiah untuk konsistensi — tidak ada Rp29.999 */}
              <p className="text-3xl font-black font-inter" style={{ color: "var(--text)", letterSpacing: "-0.02em" }}>
                {formatRupiah(remaining)}
              </p>
              <p className="text-sm mt-0.5" style={{ color: "var(--text-secondary)" }}>
                {spent > 0
                  ? `sudah pakai ${formatRupiah(spent)} dari ${formatRupiah(budget)}`
                  : `dari budget ${formatRupiah(budget)}`}
              </p>
              <div className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full w-fit"
                style={{ background: statusCfg.bg }}>
                <div className="w-2 h-2 rounded-full" style={{ background: statusCfg.color }} />
                <span className="text-xs font-bold" style={{ color: statusCfg.color }}>{statusCfg.label}</span>
              </div>
              <p className="text-xs mt-1" style={{ color: "var(--text-secondary)" }}>{statusCfg.desc}</p>
            </div>
            {/* Giri — ekspresi sesuai status */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={giriImg} alt="Giri" className="w-20 h-20 object-contain flex-shrink-0" />
          </div>
        </div>

        {/* ── Insight + Giri cards ── */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {/* Insight */}
          <div className="ng-card p-4 anim-fadeup" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-base">💡</span>
              <span className="text-xs font-bold" style={{ color: "var(--text)" }}>Insight Hari Ini</span>
            </div>
            <p className="text-sm font-semibold leading-snug whitespace-pre-line" style={{ color: "var(--text)" }}>
              {insightText.split("\n").map((line, i) => (
                <span key={i}>
                  {i === 0 && hasToday
                    ? <span>{line.split(formatRupiah(todayTotal)).map((part, j, arr) =>
                        j < arr.length - 1
                          ? <span key={j}>{part}<span style={{ color: "var(--green)" }}>{formatRupiah(todayTotal)}</span></span>
                          : <span key={j}>{part}</span>
                      )}</span>
                    : line}
                  {i < insightText.split("\n").length - 1 && <br/>}
                </span>
              ))}
            </p>
            {/* Chart hanya jika ada data */}
            {showChart && (
              <div className="mt-2">
                <svg viewBox="0 0 100 40" className="w-full h-10">
                  <polyline points="0,35 20,28 35,30 50,20 65,22 80,15 100,8"
                    fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round"/>
                  <polyline points="0,35 20,28 35,30 50,20 65,22 80,15 100,8 100,40 0,40"
                    fill="url(#g1)" opacity="0.15"/>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22C55E"/>
                      <stop offset="100%" stopColor="#22C55E" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            )}
            <button className="mt-2 text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: "var(--green-light)", color: "var(--green-dark)" }}>
              {status === "safe" ? "Pertahankan! 🔥" : status === "over" ? "Catat yuk 📝" : "Hati-hati ya 👀"}
            </button>
          </div>

          {/* Giri quote */}
          <div className="ng-card p-4 anim-fadeup" style={{ background: "#F0FDF4", animationDelay: "0.12s" }}>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-base">🐿️</span>
              <span className="text-xs font-bold" style={{ color: "var(--text)" }}>Giri</span>
            </div>
            <p className="text-sm font-bold leading-snug whitespace-pre-line" style={{ color: "var(--text)" }}>
              &apos;{giriQuote}&apos;
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={giriImg} alt="Giri" className="w-16 h-16 object-contain mx-auto mt-2" />
          </div>
        </div>

        {/* ── Catat Cepat ── */}
        <div className="mb-4 anim-fadeup" style={{ animationDelay: "0.15s" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base" style={{ color: "var(--text)" }}>Catat Cepat ⚡</h3>
            <button className="text-xs font-semibold" style={{ color: "var(--green)" }}>Lihat semua &gt;</button>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {quickItems.map(q => (
              <button key={q.label}
                onClick={() => router.push(`/chat?prompt=${encodeURIComponent(q.hint + (q.lastAmount ? q.lastAmount : ""))}`)}
                className="quick-chip flex-shrink-0 px-3 py-3 flex flex-col items-center gap-0.5"
                style={{ minWidth: 72 }}>
                <span className="text-2xl">{q.icon}</span>
                <span className="text-xs font-bold" style={{ color: "var(--text)" }}>{q.label}</span>
                {q.lastAmount ? (
                  <span className="text-[10px] font-semibold" style={{ color: "var(--green)" }}>
                    {formatRupiah(q.lastAmount)}
                  </span>
                ) : (
                  <span className="text-[10px]" style={{ color: "var(--text-muted)" }}>catat</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Rekap Singkat — data dari transactions nyata ── */}
        <div className="mb-6 anim-fadeup" style={{ animationDelay: "0.18s" }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base" style={{ color: "var(--text)" }}>Rekap Singkat</h3>
            <button onClick={() => router.push("/recap")}
              className="text-xs font-semibold" style={{ color: "var(--green)" }}>
              Lihat detail &gt;
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Hari Ini",   total: todayTotal, txs: todayTxs, color: "var(--green)" },
              { label: "Minggu Ini", total: weekTotal,  txs: weekTxs,  color: "#3B82F6"      },
              { label: "Bulan Ini",  total: monthTotal, txs: monthTxs, color: "#A855F7"      },
            ].map(r => (
              <div key={r.label} className="ng-card-sm p-3">
                <p className="text-[10px] font-semibold mb-1" style={{ color: "var(--text-muted)" }}>{r.label}</p>
                <p className="font-black text-sm font-inter leading-tight" style={{ color: r.color }}>
                  {formatRupiah(r.total)}
                </p>
                <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {r.txs.length} transaksi
                </p>
                {/* Mini sparkline */}
                <svg viewBox="0 0 60 20" className="w-full h-5 mt-1">
                  {r.total > 0
                    ? <polyline points="0,18 12,14 24,15 36,8 48,10 60,4"
                        fill="none" stroke={r.color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
                    : <polyline points="0,15 12,15 24,15 36,15 48,15 60,15"
                        fill="none" stroke="#E5E7EB" strokeWidth="1.5" strokeLinecap="round"/>
                  }
                </svg>
              </div>
            ))}
          </div>
        </div>

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
