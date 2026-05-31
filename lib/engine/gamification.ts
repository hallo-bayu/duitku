import { USER_LEVELS } from "@/types";

export function getLevelInfo(safeDays: number) {
  const current = [...USER_LEVELS].reverse().find(l => safeDays >= l.minDays) ?? USER_LEVELS[0];
  const nextIdx = USER_LEVELS.findIndex(l => l.level === current.level) + 1;
  const next = USER_LEVELS[nextIdx] ?? null;
  const progress = next
    ? Math.min(((safeDays - current.minDays) / (next.minDays - current.minDays)) * 100, 100)
    : 100;
  return { current, next, progress, safeDays };
}

export function getAchievements(profile: { streak_days: number; total_safe_days: number; total_over_days: number }) {
  return [
    { id: "first_tx",  name: "Langkah Pertama",  emoji: "👣", desc: "Catat pengeluaran pertama kali",       unlocked: (profile.total_safe_days + profile.total_over_days) >= 1 },
    { id: "streak_3",  name: "3 Hari Hemat",      emoji: "🔥", desc: "Streak 3 hari dalam budget",           unlocked: profile.streak_days >= 3  },
    { id: "streak_7",  name: "Seminggu Solid",    emoji: "⭐", desc: "Streak 7 hari dalam budget",           unlocked: profile.streak_days >= 7  },
    { id: "streak_14", name: "2 Minggu Juara",    emoji: "🏅", desc: "Streak 14 hari dalam budget",          unlocked: profile.streak_days >= 14 },
    { id: "streak_30", name: "Sebulan Sultan",    emoji: "👑", desc: "Streak 30 hari dalam budget",          unlocked: profile.streak_days >= 30 },
    { id: "safe_10",   name: "10 Hari Aman",      emoji: "🛡️", desc: "Total 10 hari dalam budget",           unlocked: profile.total_safe_days >= 10 },
    { id: "safe_30",   name: "30 Hari Aman",      emoji: "💎", desc: "Total 30 hari dalam budget",           unlocked: profile.total_safe_days >= 30 },
    { id: "no_over",   name: "Konsisten Banget",  emoji: "✨", desc: "0 hari over budget bulan ini",         unlocked: profile.total_over_days === 0 && profile.total_safe_days > 0 },
  ];
}
