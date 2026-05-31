"use client";
import { useRouter } from "next/navigation";
import { getLevelInfo, getAchievements } from "@/lib/engine/gamification";
import { USER_LEVELS, type UserProfile } from "@/types";

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

export default function AchievementsScreen({ profile }: { profile: UserProfile|null }) {
  const safeDays = profile?.total_safe_days??0;
  const { current, next, progress } = getLevelInfo(safeDays);
  const achievements = getAchievements({ streak_days:profile?.streak_days??0, total_safe_days:safeDays, total_over_days:profile?.total_over_days??0 });
  const unlocked = achievements.filter(a=>a.unlocked).length;

  return (
    <div className="max-w-lg mx-auto px-4 space-y-5 pb-8"
      style={{ paddingTop:"max(env(safe-area-inset-top),16px)" }}>

      <div className="flex items-center justify-between pt-1">
        <BackButton />
        <svg viewBox="0 0 260 68" height="26" xmlns="http://www.w3.org/2000/svg">
          <text x="2" y="56" fontFamily="'SF Pro Display',-apple-system,sans-serif" fontSize="60" fontWeight="900" fill="#ffffff" letterSpacing="-1">Ngirit</text>
          <ellipse cx="205" cy="8" rx="6" ry="8.5" fill="#43A047" transform="rotate(-25 205 8)"/>
          <ellipse cx="211" cy="5" rx="3.5" ry="5.5" fill="#66BB6A" transform="rotate(-25 211 5)"/>
        </svg>
      </div>

      <div>
        <h2 className="text-2xl font-black text-white">Pencapaian</h2>
        <p className="text-white/40 text-xs">Level up kebiasaan keuanganmu</p>
      </div>

      <div className="glass-card p-5" style={{background:"rgba(255,59,92,0.05)",borderColor:"rgba(255,59,92,0.15)"}}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl" style={{background:"rgba(255,59,92,0.12)",border:"1px solid rgba(255,59,92,0.2)"}}>
            {current.emoji}
          </div>
          <div>
            <p className="text-white/40 text-xs">Level {current.level}</p>
            <p className="text-white font-black text-lg">{current.name}</p>
            {next&&<p className="text-white/40 text-xs mt-0.5">Menuju {next.emoji} {next.name}</p>}
          </div>
        </div>
        {next&&(
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-white/40"><span>{safeDays} hari aman</span><span>{next.minDays} hari target</span></div>
            <div className="budget-track h-2">
              <div className="budget-fill" style={{width:`${progress}%`,background:"linear-gradient(90deg,#FF3B5C,#FF6B6B)",boxShadow:"0 0 8px rgba(255,59,92,0.4)"}} />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[{l:"Streak",v:profile?.streak_days??0,i:"🔥",c:"#FF3B5C"},{l:"Hari Aman",v:safeDays,i:"✅",c:"#4ade80"},{l:"Badge",v:`${unlocked}/${achievements.length}`,i:"🏅",c:"#FF3B5C"}].map(s=>(
          <div key={s.l} className="glass-card p-3 text-center">
            <span className="text-2xl">{s.i}</span>
            <p className="font-black text-lg mt-1" style={{color:s.c}}>{s.v}</p>
            <p className="text-white/40 text-[10px]">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        <h3 className="font-black text-white text-sm">Badge</h3>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map(a=>(
            <div key={a.id} className="glass-card p-4 text-center space-y-1.5"
              style={a.unlocked?{borderColor:"rgba(255,59,92,0.25)",background:"rgba(255,59,92,0.05)"}:{opacity:0.4}}>
              <span className={`text-3xl block ${!a.unlocked?"grayscale":""}`}>{a.emoji}</span>
              <p className="text-xs font-black text-white">{a.name}</p>
              <p className="text-white/40 text-[10px]">{a.desc}</p>
              {a.unlocked&&<p className="text-[10px] font-bold" style={{color:"#FF3B5C"}}>✓ Unlocked!</p>}
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 pb-4">
        <h3 className="font-black text-white text-sm">Semua Level</h3>
        {USER_LEVELS.map(l=>{
          const reached=safeDays>=l.minDays;
          return (
            <div key={l.level} className="glass-card p-4 flex items-center gap-3"
              style={reached?{borderColor:"rgba(255,59,92,0.2)"}:{opacity:0.4}}>
              <span className={`text-2xl ${!reached?"grayscale":""}`}>{l.emoji}</span>
              <div className="flex-1">
                <p className="font-bold text-sm text-white">{l.name}</p>
                <p className="text-white/40 text-xs">{l.minDays} hari aman</p>
              </div>
              {reached&&<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><polyline points="20 6 9 17 4 12" stroke="#FF3B5C" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
