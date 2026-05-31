import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BottomNav from "@/components/layout/BottomNav";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) redirect("/login");

  return (
    /* background: transparent — biar gradient dari body di globals.css yang tampil */
    <div
      style={{ height: "100dvh", background: "transparent" }}
      className="flex flex-col overflow-hidden"
    >
      <main className="flex-1 overflow-hidden min-h-0" style={{ background: "transparent" }}>
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
