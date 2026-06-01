import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/layout/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  // Auto-create profile if missing
  const { data: profile } = await sb.from("profiles").select("id").eq("id", user.id).single();
  if (!profile) {
    await sb.from("profiles").upsert({
      id: user.id,
      email: user.email!,
      daily_budget: 50000,
      personality: "balanced",
      streak_days: 0,
      total_safe_days: 0,
      total_over_days: 0,
    });
  }

  return (
    <div
      style={{ height: "100dvh", background: "var(--bg)" }}
      className="flex flex-col overflow-hidden"
    >
      <main className="flex-1 overflow-hidden min-h-0">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
