"use client";
import { useCallback, useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useChat } from "@/lib/hooks/useChat";
import { getBudgetStatus, formatRupiah, PERSONALITIES, type UserProfile } from "@/types";

interface Props { userId: string; profile: UserProfile | null; initialSpent: number; }

const QUICK_ACTIONS = [
  { icon: "☕", label: "Kopi",      prompt: "kopi ",      color: "#22C55E", bg: "#F0FDF4" },
  { icon: "🍔", label: "Makan",     prompt: "makan ",     color: "#F97316", bg: "#FFF7ED" },
  { icon: "🚌", label: "Transport", prompt: "transport ", color: "#3B82F6", bg: "#EFF6FF" },
  { icon: "🛍", label: "Belanja",   prompt: "belanja ",   color: "#A855F7", bg: "#FAF5FF" },
  { icon: "⚡", label: "Lainnya",   prompt: "",           color: "#6B7280", bg: "#F9FAFB" },
];

function BudgetBar({ spent, budget, status }: { spent: number; budget: number; status: string }) {
  const pct = budget > 0 ? Math.min((spent / budget) * 100, 100) : 0;
  const remaining = Math.max(0, budget - spent);
  const isOver = spent > budget;
  const barColor = status === "safe" ? "#22C55E" : status === "warning" ? "#EAB308" : status === "danger" ? "#F97316" : "#EF4444";
  return (
    <div className="mx-4 mb-2 rounded-2xl p-3" style={{ background: "white", border: "1px solid #E5E7EB" }}>
      <div className="flex justify-between items-center mb-2">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#6B7280" }}>Budget Hari Ini</p>
          <p className="text-lg font-black font-inter" style={{ color: "#111827", transition: "all 0.3s" }}>
            {new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(spent)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#6B7280" }}>Sisa</p>
          <p className="text-lg font-black font-inter" style={{ color: isOver ? "#EF4444" : barColor, transition: "all 0.3s" }}>
            {isOver ? `-${formatRupiah(Math.abs(remaining))}` : formatRupiah(remaining)}
          </p>
        </div>
      </div>
      <div className="budget-track">
        <div className="budget-fill" style={{ width: `${pct}%`, background: barColor }} />
      </div>
    </div>
  );
}

export default function ChatScreen({ userId, profile, initialSpent }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [spent, setSpent] = useState(initialSpent);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const update = () => document.documentElement.style.setProperty("--real-vh", `${window.visualViewport?.height ?? window.innerHeight}px`);
    update();
    window.visualViewport?.addEventListener("resize", update);
    return () => window.visualViewport?.removeEventListener("resize", update);
  }, []);

  // Handle prompt from Home quick action
  useEffect(() => {
    const prompt = searchParams.get("prompt");
    if (prompt) { setInput(decodeURIComponent(prompt)); inputRef.current?.focus(); }
  }, [searchParams]);

  const budget = profile?.daily_budget ?? 50000;
  const personality = PERSONALITIES.find(p => p.id === profile?.personality) ?? PERSONALITIES[1];
  const displayName = profile?.username ?? profile?.email?.split("@")[0] ?? "Pengguna";
  const status = getBudgetStatus(spent, budget);

  const handleTransactionSaved = useCallback((totalSpent?: number) => {
    if (typeof totalSpent === "number") setSpent(totalSpent);
    else router.refresh();
  }, [router]);

  const { messages, isLoading, sendMessage, clearMessages } = useChat({ userId, onTransactionSaved: handleTransactionSaved });

  function handleSend() {
    const msg = input.trim();
    if (!msg || isLoading) return;
    sendMessage(msg);
    setInput("");
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); handleSend(); }
  }

  return (
    <div style={{ height: "var(--real-vh, 100dvh)", background: "var(--bg)" }} className="flex flex-col overflow-hidden">

      {/* ── Header ── */}
      <div className="flex-shrink-0 bg-white border-b" style={{ borderColor: "#E5E7EB", paddingTop: "max(env(safe-area-inset-top), 12px)" }}>
        <div className="flex items-center justify-between px-4 pb-3">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/logo-ngirit.png" alt="Ngirit" className="h-8 object-contain" />
            <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>Catat pengeluaran semudah chat.</p>
          </div>
          <div className="flex items-center gap-2">
            {/* streak */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl" style={{ background: "#FFF7ED", border: "1px solid #FED7AA" }}>
              <span className="text-sm">🔥</span>
              <span className="text-sm font-bold font-inter" style={{ color: "#C2410C" }}>{profile?.streak_days ?? 0}</span>
              <span className="text-xs" style={{ color: "#9A3412" }}>hari</span>
            </div>
            {/* personality */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl"
              style={{ background: "#F0FDF4", border: "1px solid #BBF7D0" }}>
              <span className="text-sm">{personality.emoji}</span>
              <span className="text-xs font-bold" style={{ color: "#16A34A" }}>{personality.name}</span>
            </div>
          </div>
        </div>

        {/* Budget bar */}
        <BudgetBar spent={spent} budget={budget} status={status} />

        {/* Date divider */}
        <div className="flex items-center gap-3 px-4 pb-2">
          <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
          <span className="text-xs font-medium" style={{ color: "#9CA3AF" }}>Hari ini</span>
          <div className="flex-1 h-px" style={{ background: "#E5E7EB" }} />
        </div>
      </div>

      {/* ── Messages ── */}
      <div className="chat-messages px-4 py-3 space-y-3">
        {messages.map(m => <Bubble key={m.id} message={m} displayName={displayName} />)}
        {isLoading && <LoadingBubble />}

        {/* Quick actions row setelah welcome message */}
        {messages.length <= 2 && !isLoading && (
          <div className="anim-fadeup" style={{ animationDelay: "0.2s" }}>
            <p className="text-xs font-bold mb-2" style={{ color: "#6B7280" }}>Catat Cepat ⚡</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {QUICK_ACTIONS.map(q => (
                <button key={q.label}
                  onClick={() => { setInput(q.prompt); inputRef.current?.focus(); }}
                  className="quick-chip flex-shrink-0 px-3 py-2.5 flex flex-col items-center gap-1" style={{ minWidth: 64 }}>
                  <span className="text-xl">{q.icon}</span>
                  <span className="text-[11px] font-bold" style={{ color: "#374151" }}>{q.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="h-1" id="bottom-anchor" />
      </div>

      {/* ── Input area ── */}
      <div className="flex-shrink-0 bg-white border-t px-4 py-3" style={{ borderColor: "#E5E7EB", paddingBottom: "max(env(safe-area-inset-bottom), 12px)" }}>
        <div className="flex items-center gap-2">
          <input ref={inputRef} type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey} disabled={isLoading}
            placeholder="Ketik pengeluaran kamu..."
            className="ng-input flex-1" style={{ fontSize: "16px" }} />
          {/* Attachment placeholder */}
          <button className="w-11 h-11 flex items-center justify-center rounded-full flex-shrink-0"
            style={{ background: "#F3F4F6" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"
                stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          {/* Send */}
          <button onClick={handleSend} disabled={!input.trim() || isLoading}
            className="w-11 h-11 flex items-center justify-center rounded-full flex-shrink-0 transition-all active:scale-95"
            style={{ background: input.trim() && !isLoading ? "var(--green)" : "#E5E7EB", boxShadow: input.trim() ? "0 4px 14px rgba(34,197,94,0.35)" : "none" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                stroke={input.trim() && !isLoading ? "white" : "#9CA3AF"}
                strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className="flex items-end gap-2 anim-msgin">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/giri-happy.png" alt="Giri" width={36} height={36} className="object-contain flex-shrink-0 mb-1" />
      <div className="bubble-giri px-4 py-3">
        <div className="flex gap-1.5">
          <span className="loading-dot w-2 h-2 rounded-full" style={{ background: "#D1D5DB" }} />
          <span className="loading-dot w-2 h-2 rounded-full" style={{ background: "#D1D5DB" }} />
          <span className="loading-dot w-2 h-2 rounded-full" style={{ background: "#D1D5DB" }} />
        </div>
      </div>
    </div>
  );
}

import type { Message } from "@/lib/hooks/useChat";

function Bubble({ message, displayName }: { message: Message; displayName: string }) {
  const isUser = message.role === "user";
  const time = message.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const budgetStatus = message.stats?.status ?? "safe";
  const mascotSrc =
    budgetStatus === "over"    ? "/brand/giri-shock.png"     :
    budgetStatus === "danger"  ? "/brand/giri-shock.png"     :
    budgetStatus === "warning" ? "/brand/giri-idea.png"      :
    message.type === "recap"   ? "/brand/giri-celebrate.png" :
    "/brand/giri-happy.png";

  if (isUser) {
    return (
      <div className="flex justify-end anim-msgin">
        <div className="max-w-[78%]">
          <div className="bubble-user px-4 py-3">
            <p style={{ fontSize: "15px", lineHeight: "1.55", color: "white", fontFamily: "Poppins, sans-serif" }}>
              {message.content}
            </p>
          </div>
          <p className="text-right mt-1 mr-1 text-[11px]" style={{ color: "#9CA3AF" }}>{time} ✓✓</p>
        </div>
      </div>
    );
  }

  const html = message.content
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#111827;font-weight:700">$1</strong>')
    .replace(/`(.*?)`/g, '<code style="background:#F0FDF4;padding:2px 7px;border-radius:6px;color:#16A34A;font-size:12px;font-family:monospace">$1</code>')
    .split("\n").join("<br/>");

  return (
    <div className="flex items-end gap-2 anim-msgin">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={mascotSrc} alt="Giri" width={40} height={40} className="object-contain flex-shrink-0 mb-1" />
      <div className="max-w-[78%]">
        <div className="bubble-giri px-4 py-3">
          <p style={{ fontSize: "14px", lineHeight: "1.65", color: "#374151", fontFamily: "Poppins, sans-serif" }}
            dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        <p className="mt-1 ml-1 text-[11px]" style={{ color: "#9CA3AF" }}>{time}</p>
      </div>
    </div>
  );
}
