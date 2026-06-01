"use client";
import { useRouter } from "next/navigation";
import { getLevelInfo, getAchievements } from "@/lib/engine/gamification";
import { USER_LEVELS, type UserProfile } from "@/types";

const JOURNEY_LEVELS = [
  { lv:1,  name:"Pemula",         emoji:"🌱" },
  { lv:5,  name:"Hemat Pemula",   emoji:"🛡" },
  { lv:10, name:"Hemat Expert",   emoji:"⭐" },
  { lv:15, name:"Budget Pro",     emoji:"🔒" },
  { lv:20, name:"Financial Master",emoji:"🔒" },
];

const CHALLENGES = [
  { icon:"🎯", title:"Tantangan 7 Hari Hemat", desc:"Catat pengeluaran setiap hari selama 7 hari", progress:5, total:7, reward:200, color:"#22C55E" },
  { icon:"👛", title:"Sisa Budget Challenge",  desc:"Sisa budget > 30% selama 5 hari",            progress:3, total:5, reward:150, color:"#F59E0B" },
];

export default function AchievementsScreen({ profile }: { profile:UserProfile|null }) {
  const router = useRouter();
  const safeDays = profile?.total_safe_days ?? 0;
  const { current, next, progress } = getLevelInfo(safeDays);
  const achievements = getAchievements({
    streak_days: profile?.streak_days??0,
    total_safe_days: safeDays,
    total_over_days: profile?.total_over_days??0,
  });
  const unlocked = achievements.filter(a=>a.unlocked).length;
  const streak = profile?.streak_days ?? 0;
  const totalPoints = safeDays * 100 + streak * 50 + unlocked * 200;
  const goalPct = achievements.length > 0 ? Math.round((unlocked/achievements.length)*100) : 0;

  return (
    <div className="h-full overflow-y-auto no-scrollbar" style={{background:"var(--bg)"}}>
      <div className="max-w-lg mx-auto px-4 pb-6" style={{paddingTop:"max(env(safe-area-inset-top),16px)"}}>

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <svg viewBox="0 0 180 50" xmlns="http://www.w3.org/2000/svg" style={{height:30,width:"auto",display:"block",marginBottom:4}}>
              <text x="0" y="40" fontFamily="'Poppins',-apple-system,sans-serif" fontSize="44" fontWeight="900" fill="#111827" letterSpacing="-1">Ngirit</text>
              <ellipse cx="79" cy="5" rx="5.5" ry="7.5" fill="#22C55E" transform="rotate(-20 79 5)"/>
              <ellipse cx="84.5" cy="2.5" rx="3.5" ry="5.5" fill="#4ADE80" transform="rotate(-20 84.5 2.5)"/>
            </svg>
            <h2 className="text-2xl font-black" style={{color:"var(--text)"}}>Achievement</h2>
            <p className="text-xs" style={{color:"var(--text-secondary)"}}>Setiap langkah kecil, hasil yang besar! 💚</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="ng-card-sm px-3 py-2 text-center">
              <div className="text-xl">🔥</div>
              <div className="font-bold text-sm font-inter" style={{color:"var(--text)"}}>{streak}</div>
              <div className="text-[10px]" style={{color:"var(--text-muted)"}}>hari streak</div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/giri-celebrate.png" alt="Giri" className="w-12 h-12 object-contain"/>
          </div>
        </div>

        {/* Level hero card */}
        <div className="ng-card p-5 mb-4" style={{background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)"}}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold mb-1" style={{color:"var(--green)"}}>Level Kamu</p>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black" style={{color:"var(--text)"}}>{current.name}</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold text-white" style={{background:"var(--green)"}}>
                  Lv.{current.level}
                </span>
              </div>
              {next && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1" style={{color:"var(--text-secondary)"}}>
                    <span>{safeDays * 100} / {next.minDays * 100} EXP</span>
                  </div>
                  <div className="budget-track h-2.5">
                    <div className="budget-fill" style={{width:`${progress}%`,background:"var(--green)"}}/>
                  </div>
                </div>
              )}
              <p className="text-xs mt-2" style={{color:"var(--text-secondary)"}}>
                Terus catat dan kelola keuanganmu bersama Giri! 🍃
              </p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brand/giri-happy.png" alt="Giri" className="w-28 h-28 object-contain flex-shrink-0"/>
          </div>
        </div>

        {/* Stats 4 col */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[
            {icon:"🏅",val:`${unlocked}`,sub:"Total Badge",sub2:`dari ${achievements.length} badge`,color:"#22C55E"},
            {icon:"🔥",val:`${streak}`,sub:"Best Streak",sub2:"hari berturut-turut",color:"#F97316"},
            {icon:"🎯",val:`${goalPct}%`,sub:"Goal Tercapai",sub2:`${unlocked} dari ${achievements.length} goal`,color:"#3B82F6"},
            {icon:"⭐",val:`${totalPoints.toLocaleString()}`,sub:"Total Poin",sub2:"Ngirit Points",color:"#A855F7"},
          ].map(s=>(
            <div key={s.sub} className="ng-card-sm p-3 text-center">
              <span className="text-xl">{s.icon}</span>
              <p className="font-black text-base mt-1 font-inter" style={{color:s.color}}>{s.val}</p>
              <p className="text-[9px] font-bold" style={{color:"var(--text)"}}>{s.sub}</p>
              <p className="text-[8px]" style={{color:"var(--text-muted)"}}>{s.sub2}</p>
            </div>
          ))}
        </div>

        {/* Badge kamu */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base" style={{color:"var(--text)"}}>Badge Kamu <span style={{color:"var(--text-muted)"}}>({unlocked}/{achievements.length})</span></h3>
            <button className="text-xs font-semibold" style={{color:"var(--green)"}}>Lihat semua &gt;</button>
          </div>
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {achievements.map(a=>(
              <div key={a.id} className="flex-shrink-0 w-28 ng-card-sm p-3 text-center"
                style={a.unlocked?{borderColor:"#BBF7D0",background:"#F0FDF4"}:{opacity:0.5}}>
                {/* Hexagon badge */}
                <div className="relative w-14 h-14 mx-auto mb-2">
                  <svg viewBox="0 0 56 56" className="w-full h-full">
                    <polygon points="28,2 50,14 50,42 28,54 6,42 6,14"
                      fill={a.unlocked?"var(--green)":"#E5E7EB"} stroke="none"/>
                    <text x="28" y="36" textAnchor="middle" fontSize="20">{a.emoji}</text>
                  </svg>
                </div>
                <p className="text-xs font-bold" style={{color:a.unlocked?"var(--text)":"var(--text-muted)"}}>{a.name}</p>
                <p className="text-[9px] mt-0.5" style={{color:"var(--text-muted)"}}>{a.desc}</p>
                {a.unlocked && (
                  <div className="flex items-center justify-center gap-1 mt-1.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" fill="#22C55E"/>
                      <polyline points="8 12 11 15 16 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-[9px] font-bold" style={{color:"var(--green)"}}>Selesai</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Journey */}
        <div className="ng-card p-4 mb-4">
          <h3 className="font-bold text-base mb-4" style={{color:"var(--text)"}}>Achievement Journey</h3>
          <div className="flex items-end justify-between relative">
            {/* Connector line */}
            <div className="absolute top-6 left-8 right-8 h-0.5 border-t-2 border-dashed" style={{borderColor:"#D1D5DB"}}/>
            {JOURNEY_LEVELS.map((jl,i)=>{
              const isCurrentLevel = current.level >= jl.lv;
              const isNow = current.level >= jl.lv && (i===JOURNEY_LEVELS.length-1 || current.level < JOURNEY_LEVELS[i+1].lv);
              return (
                <div key={jl.lv} className="flex flex-col items-center gap-1 relative z-10">
                  {isNow && (
                    <div className="px-2 py-0.5 rounded-full text-[9px] font-bold text-white mb-1" style={{background:"var(--green)"}}>Sekarang</div>
                  )}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl border-2 ${isCurrentLevel?"border-green-400 bg-green-50":"border-gray-200 bg-white"}`}
                    style={isNow?{boxShadow:"0 0 0 4px rgba(34,197,94,0.2)"}:{}}>
                    {isCurrentLevel ? (i===JOURNEY_LEVELS.length-1||current.level<JOURNEY_LEVELS[i+1].lv ?
                      <img src="/brand/giri-cheer.png" alt="Giri" className="w-10 h-10 object-contain"/> :
                      <span>✅</span>) :
                      <span className="text-gray-400 text-lg">🔒</span>
                    }
                  </div>
                  <p className="text-[9px] font-bold text-center leading-tight" style={{color:isCurrentLevel?"var(--text)":"var(--text-muted)"}}>{jl.name}</p>
                  <p className="text-[8px]" style={{color:"var(--text-muted)"}}>Lv.{jl.lv}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tantangan Aktif */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-base" style={{color:"var(--text)"}}>Tantangan Aktif</h3>
            <button className="text-xs font-semibold" style={{color:"var(--green)"}}>Lihat semua &gt;</button>
          </div>
          <div className="space-y-3">
            {CHALLENGES.map(c=>(
              <div key={c.title} className="ng-card p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{background:c.color+"18"}}>
                  {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm" style={{color:"var(--text)"}}>{c.title}</p>
                  <p className="text-xs mb-2" style={{color:"var(--text-muted)"}}>{c.desc}</p>
                  <div className="budget-track h-1.5">
                    <div className="budget-fill" style={{width:`${(c.progress/c.total)*100}%`,background:c.color}}/>
                  </div>
                  <p className="text-[10px] mt-1" style={{color:"var(--text-muted)"}}>{c.progress} / {c.total} hari</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px]" style={{color:"var(--text-muted)"}}>Reward</p>
                  <p className="font-bold text-sm">🪙 {c.reward}</p>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="ml-auto mt-1">
                    <path d="M9 18l6-6-6-6" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Giri motivasi */}
        <div className="ng-card p-4 flex items-center gap-4" style={{background:"linear-gradient(135deg,#F0FDF4,#DCFCE7)"}}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/giri-cheer.png" alt="Giri" className="w-20 h-20 object-contain flex-shrink-0"/>
          <div>
            <p className="font-black text-base" style={{color:"var(--text)"}}>Kamu hebat! 🎉</p>
            <p className="text-sm mt-1" style={{color:"var(--text-secondary)"}}>
              {streak > 0 ? `${streak} hari streak! Pertahankan terus ya!` : "Mulai streak hematmu hari ini!"}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
