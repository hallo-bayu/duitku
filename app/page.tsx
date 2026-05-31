import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
export default async function RootPage() {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (user) redirect("/chat");
  else redirect("/login");
}
