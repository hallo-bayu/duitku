"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah, CATEGORY_EMOJI, getBudgetStatus, type Transaction, type UserProfile } from "@/types";
type Period = "today"|"week"|"month";

function BackButton() {
  const router = useRouter();
  return (
    <button onClick={() => router.push("/chat")} className="flex items-center gap-2 active:opacity-70">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M19 12H5M5 12l7-7M5 12l7 7" stroke="#FF3B5C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span className="text-sm font-bold" style={{color:"#FF3B5C"}}>Kembali</span>
    </button>
  );
}

export default function RecapScreen({ profile, transactions }: { profile: UserProfile|null; transactions: Transaction[]; userId: string }) {
  const [period, setPeriod] = useState<Period>("month");
  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now()-7*86400000).toISOString().split("T")[0];
  const filtered = transactions.filter(t => period==="today"?t.date===today:period==="week"?t.date>=weekAgo:true);
  const total = filtered.reduce((s,t)=>s+t.amount,0);
  const budget = profile?.daily_budget??50000;
  const budgetTotal = budget*(period==="today"?1:period==="week"?7:30);
  const status = getBudgetStatus(total, budgetTotal);
  const pct = budgetTotal>0 ? Math.min((total/budgetTotal)*100,100) : 0;
  const byCategory: Record<string,number> = {};
  filtered.forEach(t=>{byCategory[t.category]=(byCategory[t.category]||0)+t.amount;});
  const cats = Object.entries(byCategory).sort(([,a],[,b])=>b-a);
  const isOver = status==="over"||status==="danger";
  const barColor = isOver?"#FF3B5C":"#22c55e";

  return (
    <div className="max-w-lg mx-auto px-4 space-y-4 pb-8"
      style={{ paddingTop:"max(env(safe-area-inset-top),16px)" }}>

      <div className="flex items-center justify-between pt-1">
        <BackButton />
        <svg viewBox="0 0 260 68" height="26" xmlns="http://www.w3.org/2000/svg">
          <text x="2" y="56" fontFamily="'SF Pro Display',-apple-system,sans-serif" fontSize="60" fontWeight="900" fill="#ffffff" letterSpacing="-1">Ngirit</text>
          <ellipse cx="205" cy="8" rx="6" ry="8.5" fill="#43A047" transform="rotate(-25 205 8)"/>
          <ellipse cx="211" cy="5" rx="3.5" ry="5.5" fill="#66BB6A" transform="rotate(-25 211 5)"/>
        </svg>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Recap</h2>
          <p className="text-white/40 text-xs">Ringkasan pengeluaranmu</p>
        </div>
        <button onClick={()=>window.open(`/api/export?format=csv&month=${today.slice(0,7)}`)}>
          <div className="glass-btn px-3 py-2 text-xs font-bold" style={{color:"#FF3B5C"}}>↓ Export CSV</div>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl" style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)"}}>
        {(["today","week","month"] as Period[]).map((p,i)=>(
          <button key={p} onClick={()=>setPeriod(p)}
            className="flex-1 py-2.5 text-sm font-bold rounded-xl transition-all"
            style={period===p?{background:"linear-gradient(135deg,#FF3B5C,#CC2D48)",color:"#fff",boxShadow:"0 2px 12px rgba(255,59,92,0.3)"}:{color:"rgba(255,255,255,0.4)"}}>
            {["Hari Ini","7 Hari","Bulan"][i]}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div className="glass-card p-5" style={isOver?{boxShadow:"0 4px 24px rgba(255,59,92,0.15)",borderColor:"rgba(255,59,92,0.2)"}:{}}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Total Pengeluaran</p>
            <p className="text-3xl font-black" style={{color:isOver?"#FF3B5C":"#ffffff"}}>{formatRupiah(total)}</p>
          </div>
          <div className="text-right">
            <p className="text-white/40 text-[10px] uppercase tracking-widest mb-1">Sisa</p>
            <p className="text-lg font-black" style={{color:isOver?"#FF3B5C":"#4ade80"}}>{formatRupiah(Math.max(0,budgetTotal-total))}</p>
          </div>
        </div>
        <div className="budget-track">
          <div className="budget-fill" style={{width:`${pct}%`,background:barColor}} />
        </div>
        <p className="text-white/30 text-xs mt-2 text-right">{Math.round(pct)}% dari {formatRupiah(budgetTotal)}</p>
      </div>

      {/* Per Kategori */}
      {cats.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-black text-white text-sm">Per Kategori</h3>
          {cats.map(([cat, amt]) => (
            <div key={cat} className="glass-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{background:"rgba(255,59,92,0.10)"}}>
                    {CATEGORY_EMOJI[cat]??"📦"}
                  </div>
                  <span className="font-semibold text-white text-sm capitalize">{cat}</span>
                </div>
                <span className="font-black text-white text-sm">{formatRupiah(amt)}</span>
              </div>
              <div className="budget-track h-1.5">
                <div className="budget-fill" style={{width:`${total>0?(amt/total)*100:0}%`,background:"#FF3B5C"}} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Riwayat */}
      {filtered.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-black text-white text-sm">Riwayat ({filtered.length})</h3>
          {filtered.slice(0,30).map(tx => (
            <div key={tx.id} className="glass-card p-3.5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0" style={{background:"rgba(255,59,92,0.10)"}}>
                {CATEGORY_EMOJI[tx.category]??"📦"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{tx.description||tx.raw_input}</p>
                <p className="text-white/40 text-xs capitalize">{tx.category} · {new Date(tx.date).toLocaleDateString("id-ID",{day:"numeric",month:"short"})}</p>
              </div>
              <p className="font-black text-sm flex-shrink-0" style={{color:"#FF3B5C"}}>-{formatRupiah(tx.amount)}</p>
            </div>
          ))}
        </div>
      )}
      {filtered.length === 0 && (
        <div className="glass-card p-10 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-white/50 text-sm">Belum ada transaksi</p>
        </div>
      )}
    </div>
  );
}
