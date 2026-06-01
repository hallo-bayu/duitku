import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import HomeScreen from "@/components/home/HomeScreen";
export const dynamic = "force-dynamic";
export const revalidate = 0;
export default async function HomePage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await sb.from("profiles").select("*").eq("id", user.id).single();
  const now = new Date();
  const wib = new Date(now.getTime() + 7*60*60*1000);
  const today = wib.toISOString().split("T")[0];
  const monthStart = today.slice(0,7)+"-01";
  const { data: txs } = await sb.from("transactions").select("*").eq("user_id", user.id).gte("date", monthStart).order("date", { ascending: false });
  const todayTxs = (txs||[]).filter(t => t.date === today);
  const spent = todayTxs.reduce((s,t) => s+t.amount, 0);
  const displayName = profile?.username ?? user.email?.split("@")[0] ?? "Pengguna";
  return <HomeScreen profile={profile} spent={spent} transactions={txs||[]} username={displayName} />;
}
