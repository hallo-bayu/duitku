import { createClient } from "@/lib/supabase/server";
import AchievementsScreen from "@/components/achievements/AchievementsScreen";

export default async function AchievementsPage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sb.from("profiles").select("*").eq("id", user.id).single();
  return (
    <div className="h-full overflow-y-auto">
      <AchievementsScreen profile={profile} />
    </div>
  );
}
