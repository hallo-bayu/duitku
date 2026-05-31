export type Personality = "frugal" | "balanced" | "chill" | "sultan" | "roast";

export interface PersonalityConfig {
  id: Personality; name: string; emoji: string; description: string; color: string;
}
export const PERSONALITIES: PersonalityConfig[] = [
  { id: "frugal",   name: "Frugal Master", emoji: "🐿️", description: "Disiplin, motivasional, budget-focused", color: "#10B981" },
  { id: "balanced", name: "Balanced",      emoji: "⚖️",  description: "Friendly, reasonable, supportive",     color: "#7C3AED" },
  { id: "chill",    name: "Chill Mode",    emoji: "😎",  description: "Santai, positif, casual",              color: "#06B6D4" },
  { id: "sultan",   name: "Sultan",        emoji: "👑",  description: "Funny, playful, drama reactions",      color: "#F59E0B" },
  { id: "roast",    name: "Roast Mode",    emoji: "🔥",  description: "Sarkastik, lucu, playful roasting",    color: "#EF4444" },
];

export type BudgetStatus = "safe" | "warning" | "danger" | "over";

export interface UserProfile {
  id: string; email: string; username: string | null; avatar_url: string | null;
  daily_budget: number; personality: string;
  streak_days: number; total_safe_days: number; total_over_days: number;
  last_active_date: string | null; created_at: string;
}

export interface Transaction {
  id: string; user_id: string; amount: number; category: string;
  description: string; raw_input: string; date: string; created_at: string;
}

export const CATEGORY_EMOJI: Record<string, string> = {
  makanan: "🍽️", minuman: "☕", transportasi: "🚗", belanja: "🛍️",
  hiburan: "🎮", kesehatan: "💊", tagihan: "💡", lainnya: "📦",
};

export const BUDGET_PRESETS = [20000, 30000, 50000, 75000, 100000, 150000, 200000];

export const USER_LEVELS = [
  { level: 1, name: "Budget Beginner",    emoji: "🌱", minDays: 0  },
  { level: 2, name: "Wallet Guardian",    emoji: "💰", minDays: 7  },
  { level: 3, name: "Impulse Controller", emoji: "🔥", minDays: 14 },
  { level: 4, name: "Frugal Champion",    emoji: "🏆", minDays: 30 },
  { level: 5, name: "Controlled Sultan",  emoji: "👑", minDays: 60 },
];

export function getUserLevel(safeDays: number) {
  return [...USER_LEVELS].reverse().find(l => safeDays >= l.minDays) ?? USER_LEVELS[0];
}

export function getBudgetStatus(spent: number, budget: number): BudgetStatus {
  if (budget <= 0) return "safe";
  const pct = spent / budget;
  if (pct >= 1)    return "over";
  if (pct >= 0.85) return "danger";
  if (pct >= 0.65) return "warning";
  return "safe";
}

export function formatRupiah(amount: number): string {
  if (amount >= 1_000_000) return `Rp${(amount / 1_000_000 % 1 === 0 ? (amount/1_000_000).toFixed(0) : (amount/1_000_000).toFixed(1))}jt`;
  if (amount >= 1_000)     return `Rp${Math.round(amount / 1_000)}rb`;
  return `Rp${amount.toLocaleString("id-ID")}`;
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
