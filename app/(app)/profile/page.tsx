import { createClient } from "@/lib/supabase/server";
import ProfileScreen from "@/components/dashboard/ProfileScreen";

export default async function ProfilePage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sb.from("profiles").select("*").eq("id", user.id).single();
  return (
    <div className="h-full overflow-y-auto">
      <ProfileScreen user={user} profile={profile} />
    </div>
  );
}
