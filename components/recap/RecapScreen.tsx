"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatRupiah, CATEGORY_EMOJI, getBudgetStatus, type Transaction, type UserProfile } from "@/types";
type Period = "today"|"week"|"month"|"year";

const CAT_COLORS: Record<string,string> = {
  makanan:"#22C55E", minuman:"#F97316", transportasi:"#3B82F6",
  belanja:"#A855F7", hiburan:"#EC4899", kesehatan:"#14B8A6",
  tagihan:"#F59E0B", lainnya:"#6B7280",
};

function Ring({ pct, color, size=100 }: { pct:number; color:string; size?:number }) {
  const r = size/2 - 10; const circ = 2*Math.PI*r;
  const offset = circ - (pct/100)*circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#E5E7EB" strokeWidth="10"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="10"
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${size/2} ${size/2})`} style={{transition:"stroke-dashoffset 0.8s ease"}}/>
      <text x={size/2} y={size/2-4} textAnchor="middle" fontFamily="Inter,sans-serif" fontWeight="700" fontSize="16" fill={color}>{Math.round(pct)}%</text>
      <text x={size/2} y={size/2+12} textAnchor="middle" fontFamily="Poppins,sans-serif" fontWeight="500" fontSize="9" fill="#6B7280">tersisa</text>
    </svg>
  );
}

// Komponen empty state dengan Giri
function EmptyState({ message }: { message: string }) {
  return (
    <div className="ng-card p-8 text-center flex flex-col items-center gap-3 mb-4">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/giri-sleep.png" alt="Giri" className="w-24 h-24 object-contain"/>
      <p className="font-bold text-sm" style={{color:"var(--text)"}}>Belum Ada Data</p>
      <p className="text-xs text-center" style={{color:"var(--text-muted)"}}>{message}</p>
    </div>
  );
}

export default function RecapScreen({ profile, transactions, userId }: { profile:UserProfile|null; transactions:Transaction[]; userId:string }) {
  const router = useRouter();
  const [period, setPeriod] = useState<Period>("today");

  // Timezone WIB
  const nowWib = new Date(Date.now() + 7*60*60*1000);
  const today = nowWib.toISOString().split("T")[0];
  const weekAgo = new Date(Date.now()-7*86400000+7*60*60*1000).toISOString().split("T")[0];
  const monthStart = today.slice(0,7)+"-01";
  const yearStart  = today.slice(0,4)+"-01-01";

  const filtered = transactions.filter(t =>
    period==="today" ? t.date===today :
    period==="week"  ? t.date>=weekAgo :
    period==="month" ? t.date>=monthStart :
    /* year */         t.date>=yearStart
  );

  const total = filtered.reduce((s,t)=>s+t.amount,0);
  const budget = profile?.daily_budget ?? 50000;

  // Hitung budget berdasarkan periode - gunakan hari kalendar aktual
  const getDaysInPeriod = () => {
    const now = new Date();
    if (period==="today") return 1;
    if (period==="week") return 7;
    if (period==="month") {
      return new Date(now.getFullYear(), now.getMonth()+1, 0).getDate();
    }
    // year - gunakan hari yang sudah berlalu di tahun ini
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const elapsed = Math.ceil((now.getTime() - startOfYear.getTime()) / 86400000);
    return Math.max(elapsed, 1);
  };

  const budgetTotal = budget * getDaysInPeriod();
  const remaining = Math.max(0, budgetTotal-total);
  const pct = (budgetTotal>0 && total>0) ? Math.min((remaining/budgetTotal)*100,100) : (total===0?100:0);
  const status = getBudgetStatus(total, budgetTotal);
  const isOver = status==="over"||status==="danger";
  const ringColor = status==="safe"?"#22C55E":status==="warning"?"#EAB308":status==="danger"?"#F97316":"#EF4444";

  const byCategory: Record<string,number> = {};
  filtered.forEach(t=>{byCategory[t.category]=(byCategory[t.category]||0)+t.amount;});
  const cats = Object.entries(byCategory).sort(([,a],[,b])=>b-a);

  // Trend: last 7 days — dari seluruh transactions yang dipass
  const days7 = Array.from({length:7},(_,i)=>{
    const d = new Date(Date.now()+7*60*60*1000-i*86400000).toISOString().split("T")[0];
    return { date:d, total: transactions.filter(t=>t.date===d).reduce((s,t)=>s+t.amount,0) };
  }).reverse();
  const maxDay = Math.max(...days7.map(d=>d.total), 1);
  const hasTrendData = days7.some(d=>d.total>0);

  const periodLabel: Record<Period,string> = {today:"Harian",week:"Mingguan",month:"Bulanan",year:"Tahunan"};
  const PERIODS: {id:Period; label:string}[] = [
    {id:"today",label:"Harian"},{id:"week",label:"Mingguan"},
    {id:"month",label:"Bulanan"},{id:"year",label:"Tahunan"},
  ];

  const giriMascot = isOver ? "/brand/giri-shock.png" :
    status==="danger" ? "/brand/giri-shock.png" :
    total===0 ? "/brand/giri-sleep.png" :
    "/brand/giri-idea.png";

  const statusLabel = status==="safe"?"Aman":status==="warning"?"Waspada":status==="danger"?"Hampir Habis":"Over Budget";
  const statusDesc = total===0?"Belum ada pengeluaran di periode ini." :
    status==="safe"? `Hemat ${formatRupiah(remaining)} dari budget. Pertahankan! 🔥` :
    status==="warning" ? "Mulai hati-hati ya 👀" :
    status==="danger" ? "Budget hampir habis! 😬" :
    "Sudah melebihi budget! 😰";

  return (
    <div className="h-full overflow-y-auto no-scrollbar" style={{background:"var(--bg)"}}>
      <div className="max-w-lg mx-auto px-4 pb-6" style={{paddingTop:"max(env(safe-area-inset-top),16px)"}}>

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <svg viewBox="0 0 180 50" xmlns="http://www.w3.org/2000/svg" style={{height:32,width:"auto",display:"block",marginBottom:4}}><text x="0" y="40" fontFamily="'Poppins',-apple-system,sans-serif" fontSize="44" fontWeight="900" fill="#111827" letterSpacing="-1">Ngirit</text><ellipse cx="79" cy="5" rx="5.5" ry="7.5" fill="#22C55E" transform="rotate(-20 79 5)"/><ellipse cx="84.5" cy="2.5" rx="3.5" ry="5.5" fill="#4ADE80" transform="rotate(-20 84.5 2.5)"/></svg>
            <h2 className="text-2xl font-black" style={{color:"var(--text)"}}>Rekap</h2>
            <p className="text-xs" style={{color:"var(--text-secondary)"}}>Lihat perjalanan hematmu di sini 💚</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="ng-card-sm px-3 py-2 flex items-center gap-1.5 text-sm" style={{color:"var(--text-secondary)"}}>
              <span>📅</span>
              <span className="font-medium text-xs">{new Date().toLocaleDateString("id-ID",{day:"numeric",month:"short",year:"numeric"})}</span>
            </div>
          </div>
        </div>

        {/* Period tabs */}
        <div className="ng-card-sm p-1 mb-4 flex gap-1">
          {PERIODS.map(p=>(
            <button key={p.id} onClick={()=>setPeriod(p.id)}
              className="flex-1 py-2 text-xs font-bold rounded-xl transition-all"
              style={period===p.id?{background:"var(--green)",color:"white",boxShadow:"0 2px 8px rgba(34,197,94,0.3)"}:{color:"var(--text-muted)"}}>
              {p.label}
            </button>
          ))}
        </div>

        {/* Summary hero */}
        {total === 0 ? (
          // Empty state yang proper
          <div className="ng-card p-5 mb-4 flex flex-col items-center gap-3 text-center" style={{background:"linear-gradient(135deg,#F0FDF4,#FFFFFF)"}}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/giri-sleep.png" alt="Giri" className="w-20 h-20 object-contain"/>
            <div>
              <p className="font-black text-lg" style={{color:"var(--text)"}}>
                Belum ada transaksi
              </p>
              <p className="text-sm mt-1" style={{color:"var(--text-secondary)"}}>
                {period==="today" ? "Catat pengeluaran hari ini yuk! 📝" :
                 period==="week"  ? "Belum ada pengeluaran minggu ini." :
                 period==="month" ? "Belum ada pengeluaran bulan ini." :
                 "Belum ada transaksi tahun ini. Hemat sekali! 🌟"}
              </p>
              <button onClick={()=>router.push("/chat")}
                className="mt-3 ng-btn px-6 text-sm" style={{minHeight:40, fontSize:14}}>
                + Catat Sekarang
              </button>
            </div>
          </div>
        ) : (
          <div className="ng-card p-5 mb-4" style={{background:"linear-gradient(135deg,#F0FDF4,#FFFFFF)"}}>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-xs font-semibold mb-1" style={{color:"var(--text-secondary)"}}>Total Pengeluaran {periodLabel[period]}</p>
                <p className="text-3xl font-black font-inter" style={{color:isOver?"#EF4444":"var(--text)"}}>{formatRupiah(total)}</p>
                <p className="text-sm mt-0.5" style={{color:"var(--text-secondary)"}}>dari Budget {formatRupiah(budgetTotal)}</p>
                <div className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full w-fit"
                  style={{background:isOver?"#FEF2F2":"#F0FDF4"}}>
                  <div className="w-2 h-2 rounded-full" style={{background:ringColor}}/>
                  <span className="text-xs font-bold" style={{color:ringColor}}>{statusLabel}</span>
                </div>
                <p className="text-xs mt-1" style={{color:"var(--text-secondary)"}}>{statusDesc}</p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Ring pct={pct} color={ringColor} size={100}/>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={giriMascot} alt="Giri" className="w-16 h-16 object-contain"/>
              </div>
            </div>
          </div>
        )}

        {/* Trend chart */}
        <div className="ng-card p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="font-bold text-sm flex items-center gap-1" style={{color:"var(--text)"}}>
                <span>📈</span> Tren Pengeluaran
              </p>
              <p className="text-xs" style={{color:"var(--text-muted)"}}>7 hari terakhir</p>
            </div>
          </div>
          {!hasTrendData ? (
            <div className="flex flex-col items-center gap-2 py-4">
              <p className="text-xs" style={{color:"var(--text-muted)"}}>Belum ada data untuk ditampilkan</p>
              <svg viewBox="0 0 300 50" className="w-full h-12">
                <line x1="10" y1="45" x2="290" y2="45" stroke="#E5E7EB" strokeWidth="1.5" strokeDasharray="4 4"/>
                {[0,1,2,3,4,5,6].map(i=>{
                  const x=(i/6)*280+10;
                  return <circle key={i} cx={x} cy={45} r="3" fill="#E5E7EB"/>;
                })}
                {days7.map((d,i)=>{
                  const x=(i/(days7.length-1))*280+10;
                  return (
                    <text key={d.date} x={x} y={62} textAnchor="middle" fontFamily="Poppins" fontSize="7" fill="#9CA3AF">
                      {new Date(d.date+"T00:00:00").toLocaleDateString("id-ID",{day:"numeric",month:"short"})}
                    </text>
                  );
                })}
              </svg>
            </div>
          ) : (
            <svg viewBox="0 0 300 80" className="w-full h-20">
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22C55E" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#22C55E" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {days7.map((d,i) => {
                const x = (i/(days7.length-1))*280+10;
                const y = 70 - (d.total/maxDay)*60;
                return (
                  <g key={d.date}>
                    {i>0&&<line x1={((i-1)/(days7.length-1))*280+10} y1={70-(days7[i-1].total/maxDay)*60} x2={x} y2={y} stroke="#22C55E" strokeWidth="2" strokeLinecap="round"/>}
                    <circle cx={x} cy={y} r={d.total>0?"3.5":"2"} fill={d.total>0?"#22C55E":"#E5E7EB"}/>
                    {i===days7.length-1 && d.total>0 &&(
                      <>
                        <rect x={x-28} y={y-22} width={56} height={16} rx={8} fill="#22C55E"/>
                        <text x={x} y={y-11} textAnchor="middle" fontFamily="Inter" fontSize="8" fontWeight="700" fill="white">
                          {formatRupiah(d.total)}
                        </text>
                      </>
                    )}
                    <text x={x} y={78} textAnchor="middle" fontFamily="Poppins" fontSize="7" fill="#9CA3AF">
                      {new Date(d.date+"T00:00:00").toLocaleDateString("id-ID",{day:"numeric",month:"short"})}
                    </text>
                  </g>
                );
              })}
            </svg>
          )}
        </div>

        {/* Category breakdown */}
        {cats.length > 0 && (
          <div className="ng-card p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-sm" style={{color:"var(--text)"}}>Pengeluaran per Kategori</p>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <svg width="90" height="90" viewBox="0 0 90 90">
                  {(() => {
                    let offset = 0;
                    const circ = 2*Math.PI*30;
                    return cats.map(([cat,amt])=>{
                      const pctCat = total>0?(amt/total)*100:0;
                      const dash = (pctCat/100)*circ;
                      const el = (
                        <circle key={cat} cx="45" cy="45" r="30" fill="none"
                          stroke={CAT_COLORS[cat]??"#6B7280"} strokeWidth="14"
                          strokeDasharray={`${dash} ${circ-dash}`}
                          strokeDashoffset={-offset+circ/4}
                          transform="rotate(-90 45 45)"/>
                      );
                      offset += dash;
                      return el;
                    });
                  })()}
                  <text x="45" y="42" textAnchor="middle" fontFamily="Poppins" fontSize="7" fontWeight="600" fill="#6B7280">Total</text>
                  <text x="45" y="53" textAnchor="middle" fontFamily="Inter" fontSize="8" fontWeight="700" fill="#111827">{formatRupiah(total)}</text>
                </svg>
              </div>
              <div className="flex-1 space-y-2">
                {cats.slice(0,5).map(([cat,amt])=>(
                  <div key={cat}>
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{CATEGORY_EMOJI[cat]??"📦"}</span>
                        <span className="text-xs font-medium capitalize" style={{color:"var(--text)"}}>{cat}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold font-inter" style={{color:"var(--text)"}}>{formatRupiah(amt)}</span>
                        <span className="text-[10px] ml-1" style={{color:"var(--text-muted)"}}>{total>0?Math.round((amt/total)*100):0}%</span>
                      </div>
                    </div>
                    <div className="budget-track h-1.5">
                      <div className="budget-fill" style={{width:`${total>0?(amt/total)*100:0}%`,background:CAT_COLORS[cat]??"#6B7280"}}/>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent transactions */}
        {filtered.length > 0 && (
          <div className="ng-card p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-bold text-sm" style={{color:"var(--text)"}}>Transaksi Terakhir</p>
            </div>
            <div className="space-y-3">
              {filtered.slice(0,5).map(tx=>(
                <div key={tx.id} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{background:(CAT_COLORS[tx.category]??"#6B7280")+"18"}}>
                    {CATEGORY_EMOJI[tx.category]??"📦"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{color:"var(--text)"}}>{tx.description||tx.raw_input}</p>
                    <p className="text-xs flex items-center gap-1.5" style={{color:"var(--text-muted)"}}>
                      <span className="capitalize">{tx.category}</span>
                      <span className="w-1 h-1 rounded-full inline-block" style={{background:CAT_COLORS[tx.category]??"#6B7280"}}/>
                      <span>{tx.date}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold font-inter" style={{color:"#EF4444"}}>-{formatRupiah(tx.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insight dari Giri */}
        <div className="ng-card p-4 flex items-center gap-4" style={{background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)"}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/giri-celebrate.png" alt="Giri" className="w-20 h-20 object-contain flex-shrink-0"/>
          <div className="flex-1">
            <p className="font-bold text-sm mb-1" style={{color:"var(--green)"}}>Insight Ngirit ✨</p>
            <p className="text-sm" style={{color:"var(--text)"}}>
              {total === 0 ? "Belum ada pengeluaran. Hemat banget nih! 🌟" :
               status === "safe" ? `Kamu hemat ${formatRupiah(remaining)} dari budget. Pertahankan! 🔥` :
               `Pengeluaran ${formatRupiah(total)} dari budget ${formatRupiah(budgetTotal)}.`}
            </p>
            <button onClick={()=>router.push("/chat")}
              className="mt-2 px-4 py-2 rounded-full text-xs font-bold text-white"
              style={{background:"var(--green)"}}>
              Tanya Giri &gt;
            </button>
          </div>
        </div>

        <div className="h-4"/>
      </div>
    </div>
  );
}
