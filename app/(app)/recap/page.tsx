import { createClient } from "@/lib/supabase/server";
import RecapScreen from "@/components/recap/RecapScreen";

export default async function RecapPage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sb.from("profiles").select("*").eq("id", user.id).single();
  const today = new Date().toISOString().split("T")[0];
  const startOfMonth = today.slice(0, 7) + "-01";
  const { data: txs } = await sb.from("transactions").select("*")
    .eq("user_id", user.id).gte("date", startOfMonth).order("date", { ascending: false });
  return (
    <div className="h-full overflow-y-auto">
      <RecapScreen profile={profile} transactions={txs ?? []} userId={user.id} />
    </div>
  );
}
