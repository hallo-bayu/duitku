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

  // Timezone WIB
  const nowWib = new Date(Date.now() + 7 * 60 * 60 * 1000);
  const today = nowWib.toISOString().split("T")[0];

  // Fetch dari 8 hari lalu agar rekap minggu ini selalu lengkap
  // (mencakup kasus awal bulan baru tapi transaksi bulan lalu masih dalam 7 hari)
  const eightDaysAgo = new Date(Date.now() - 8 * 86400000 + 7 * 60 * 60 * 1000)
    .toISOString().split("T")[0];

  const { data: txs } = await sb
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", eightDaysAgo)
    .order("date", { ascending: false });

  const allTxs = txs ?? [];
  const todayTxs = allTxs.filter(t => t.date === today);
  const spent = todayTxs.reduce((s, t) => s + t.amount, 0);
  const displayName = profile?.username ?? user.email?.split("@")[0] ?? "Pengguna";

  return (
    <HomeScreen
      profile={profile}
      spent={spent}
      transactions={allTxs}
      username={displayName}
    />
  );
}
