import { createClient } from "@/lib/supabase/server";
import ProfileScreen from "@/components/dashboard/ProfileScreen";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProfilePage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sb.from("profiles").select("*").eq("id", user.id).single();

  // Ambil data minggu ini untuk tampilan budget tersisa
  const today = new Date().toISOString().split("T")[0];
  const weekAgo = new Date(Date.now() - 7*86400000).toISOString().split("T")[0];
  const { data: weekTxs } = await sb.from("transactions").select("amount")
    .eq("user_id", user.id).gte("date", weekAgo);
  const weekSpent = (weekTxs ?? []).reduce((s: number, t: {amount: number}) => s + t.amount, 0);

  return (
    <div className="h-full overflow-y-auto">
      <ProfileScreen user={user} profile={profile} weekSpent={weekSpent} />
    </div>
  );
}
