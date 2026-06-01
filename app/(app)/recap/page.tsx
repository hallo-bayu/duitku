import { createClient } from "@/lib/supabase/server";
import RecapScreen from "@/components/recap/RecapScreen";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function RecapPage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sb.from("profiles").select("*").eq("id", user.id).single();
  // Fetch data seluruh tahun ini agar tab Tahunan bisa tampil data yang benar
  const today = new Date().toISOString().split("T")[0];
  const startOfYear = today.slice(0, 4) + "-01-01";
  const { data: txs } = await sb.from("transactions").select("*")
    .eq("user_id", user.id).gte("date", startOfYear).order("date", { ascending: false });
  return (
    <div className="h-full overflow-y-auto">
      <RecapScreen profile={profile} transactions={txs ?? []} userId={user.id} />
    </div>
  );
}
