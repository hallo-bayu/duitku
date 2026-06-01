import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month") ?? new Date().toISOString().slice(0, 7);

  // Calculate proper end-of-month date
  const [year, mon] = month.split("-").map(Number);
  const lastDay = new Date(year, mon, 0).getDate(); // day 0 of next month = last day of this month
  const endDate = `${month}-${String(lastDay).padStart(2, "0")}`;

  const { data: txs } = await sb
    .from("transactions")
    .select("*")
    .eq("user_id", user.id)
    .gte("date", `${month}-01`)
    .lte("date", endDate)
    .order("date", { ascending: true });

  const header = "Tanggal,Deskripsi,Kategori,Jumlah\n";
  const body = (txs || [])
    .map(t => `${t.date},"${t.description.replace(/"/g, '""')}",${t.category},${t.amount}`)
    .join("\n");

  return new Response(header + body, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="domi-${month}.csv"`,
    },
  });
}
