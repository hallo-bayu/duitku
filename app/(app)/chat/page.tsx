import { createClient } from "@/lib/supabase/server";
import ChatScreen from "@/components/chat/ChatScreen";

export default async function ChatPage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;
  const { data: profile } = await sb.from("profiles").select("*").eq("id", user.id).single();
  const today = new Date().toISOString().split("T")[0];
  const { data: todayTxs } = await sb.from("transactions").select("amount")
    .eq("user_id", user.id).eq("date", today);
  const totalSpent = (todayTxs||[]).reduce((s,t) => s+t.amount, 0);
  return (
    <div className="h-full flex flex-col">
      <ChatScreen userId={user.id} profile={profile} initialSpent={totalSpent} />
    </div>
  );
}
