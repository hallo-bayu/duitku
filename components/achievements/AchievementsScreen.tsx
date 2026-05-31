"use client";
import { getLevelInfo, getAchievements } from "@/lib/engine/gamification";
import { USER_LEVELS, type UserProfile } from "@/types";

export default function AchievementsScreen({ profile }: { profile: UserProfile|null }) {
  const safeDays = profile?.total_safe_days??0;
  const { current, next, progress } = getLevelInfo(safeDays);
  const achievements = getAchievements({ streak_days:profile?.streak_days??0, total_safe_days:safeDays, total_over_days:profile?.total_over_days??0 });
  const unlocked = achievements.filter(a=>a.unlocked).length;

  return (
    <div className="max-w-lg mx-auto px-4 space-y-5 pb-8 overflow-y-auto h-full"
      style={{paddingTop:"max(env(safe-area-inset-top),20px)"}}>
      <div><h2 className="text-xl font-black text-white">Pencapaian</h2><p className="text-[#555] text-xs">Level up kebiasaan keuanganmu</p></div>

      {/* Level card */}
      <div className="glass-card p-5" style={{background:"rgba(255,59,92,0.05)",borderColor:"rgba(255,59,92,0.15)"}}>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl" style={{background:"rgba(255,59,92,0.12)",border:"1px solid rgba(255,59,92,0.2)"}}>
            {current.emoji}
          </div>
          <div>
            <p className="text-[#555] text-xs">Level {current.level}</p>
            <p className="text-white font-black text-lg leading-tight">{current.name}</p>
            {next&&<p className="text-[#555] text-xs mt-0.5">Menuju {next.emoji} {next.name}</p>}
          </div>
        </div>
        {next&&(
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-[#555]"><span>{safeDays} hari aman</span><span>{next.minDays} hari</span></div>
            <div className="budget-track h-2">
              <div className="budget-fill" style={{width:`${progress}%`,background:"linear-gradient(90deg,#FF3B5C,#FF6B6B)",boxShadow:"0 0 8px rgba(255,59,92,0.4)"}} />
            </div>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[{l:"Streak",v:profile?.streak_days??0,i:"🔥",c:"#FF3B5C"},{l:"Hari Aman",v:safeDays,i:"✅",c:"#4ade80"},{l:"Badge",v:`${unlocked}/${achievements.length}`,i:"🏅",c:"#FF3B5C"}].map(s=>(
          <div key={s.l} className="glass-card p-3 text-center">
            <span className="text-2xl">{s.i}</span>
            <p className="font-black text-lg mt-1" style={{color:s.c}}>{s.v}</p>
            <p className="text-[#555] text-[10px]">{s.l}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="space-y-2">
        <h3 className="font-black text-white text-sm px-1">Badge</h3>
        <div className="grid grid-cols-2 gap-3">
          {achievements.map(a=>(
            <div key={a.id} className="glass-card p-4 text-center space-y-1.5"
              style={a.unlocked?{borderColor:"rgba(255,59,92,0.25)",background:"rgba(255,59,92,0.05)"}:{opacity:0.4}}>
              <span className={`text-3xl block ${!a.unlocked?"grayscale":""}`}>{a.emoji}</span>
              <p className="text-xs font-black" style={{color:a.unlocked?"#fff":"#555"}}>{a.name}</p>
              <p className="text-[10px] text-[#555]">{a.desc}</p>
              {a.unlocked&&<p className="text-[10px] font-bold" style={{color:"#FF3B5C"}}>✓ Unlocked!</p>}
            </div>
          ))}
        </div>
      </div>

      {/* All levels */}
      <div className="space-y-2 pb-4">
        <h3 className="font-black text-white text-sm px-1">Semua Level</h3>
        {USER_LEVELS.map(l=>{
          const reached=safeDays>=l.minDays;
          return (
            <div key={l.level} className="glass-card p-4 flex items-center gap-3"
              style={reached?{borderColor:"rgba(255,59,92,0.2)"}:{opacity:0.4}}>
              <span className={`text-2xl ${!reached?"grayscale":""}`}>{l.emoji}</span>
              <div className="flex-1">
                <p className="font-bold text-sm" style={{color:reached?"#fff":"#555"}}>{l.name}</p>
                <p className="text-[#555] text-xs">{l.minDays} hari aman</p>
              </div>
              {reached&&<span className="font-black" style={{color:"#FF3B5C"}}>✓</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
