"use client";
import { useState, useRef } from "react";

interface Props {
  onSend: (msg: string) => void;
  isLoading: boolean;
  onClear: () => void;
  hasMessages: boolean;
}

const QUICK_ACTIONS = [
  { icon: "➕", label: "Tambah Pengeluaran", prompt: "" },
  { icon: "💰", label: "Tambah Pemasukan",   prompt: "terima uang " },
  { icon: "📊", label: "Recap Hari Ini",      prompt: "recap hari ini", send: true },
  { icon: "🎯", label: "Set Budget",          prompt: "" },
  { icon: "💡", label: "Saran Hemat",         prompt: "saran hemat", send: true },
];

export default function InputBar({ onSend, isLoading, onClear, hasMessages }: Props) {
  const [value, setValue] = useState("");
  const [showActions, setShowActions] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  function handleSend() {
    const msg = value.trim();
    if (!msg || isLoading) return;
    onSend(msg); setValue("");
    ref.current?.focus();
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") { e.preventDefault(); handleSend(); }
  }

  function handleAction(a: typeof QUICK_ACTIONS[0]) {
    setShowActions(false);
    if (a.send) { onSend(a.prompt); return; }
    if (a.prompt) { setValue(a.prompt); ref.current?.focus(); }
  }

  return (
    <>
      {/* Quick Actions Bottom Sheet */}
      {showActions && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowActions(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 animate-[fadeUp_0.25s_ease-out]"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
            <div style={{ background: "rgba(14,14,14,0.97)", backdropFilter: "blur(24px)", borderRadius: "28px 28px 0 0", border: "1px solid rgba(255,255,255,0.08)", borderBottom: "none" }}>
              <div className="px-6 pt-5 pb-3">
                <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "rgba(255,255,255,0.15)" }} />
                <p className="text-white font-bold text-base mb-4">Quick Actions</p>
                <div className="space-y-2 pb-4">
                  {QUICK_ACTIONS.map(a => (
                    <button key={a.label} onClick={() => handleAction(a)}
                      className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-all active:scale-98"
                      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                      <span className="text-xl">{a.icon}</span>
                      <span className="text-white text-sm font-medium">{a.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Input bar */}
      <div className="flex-shrink-0 px-4 relative z-10"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 12px)", paddingTop: "10px" }}>
        <div className="flex items-center gap-3"
          style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "30px", padding: "8px 8px 8px 16px", boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
          {/* + Button */}
          <button onClick={() => setShowActions(s => !s)}
            style={{ width: "40px", height: "40px", minWidth: "40px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: "12px" }}
            className="flex items-center justify-center text-white text-lg transition-all active:scale-90">
            +
          </button>

          {/* Input */}
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Tulis pengeluaran hari ini..."
            disabled={isLoading}
            style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "16px", lineHeight: "1.4" }}
            className="placeholder-white/30"
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!value.trim() || isLoading}
            style={{
              width: "44px", height: "44px", minWidth: "44px",
              background: value.trim() && !isLoading ? "linear-gradient(135deg, #FF3B5C, #CC2D48)" : "rgba(255,59,92,0.2)",
              borderRadius: "999px",
              boxShadow: value.trim() && !isLoading ? "0 4px 16px rgba(255,59,92,0.45)" : "none",
              transition: "all 0.2s",
              border: "none",
              cursor: value.trim() && !isLoading ? "pointer" : "not-allowed",
            }}
            className="flex items-center justify-center active:scale-90">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
