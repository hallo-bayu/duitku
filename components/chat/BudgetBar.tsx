import type { BudgetStatus } from "@/types";
export default function BudgetBar({ pct, status }: { pct: number; status: BudgetStatus }) {
  const color = { safe: "#6C63FF", warning: "#F59E0B", danger: "#FF3B5C", over: "#FF3B5C" }[status];
  const glow = status === "over" || status === "danger";
  return (
    <div className="budget-track">
      <div className="budget-fill" style={{ width: `${pct}%`, background: color, boxShadow: glow ? `0 0 12px ${color}88` : "none" }} />
    </div>
  );
}
