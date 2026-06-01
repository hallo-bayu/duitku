import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const sb = await createClient();
  const { data: { user } } = await sb.auth.getUser();

  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  // Default to current month if not provided
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const month = searchParams.get("month") ?? defaultMonth;

  // Validate format YYYY-MM
  if (!/^\d{4}-\d{2}$/.test(month)) {
    return new Response("Invalid month format. Use YYYY-MM", { status: 400 });
  }

  const [year, mon] = month.split("-").map(Number);
  const lastDay = new Date(year, mon, 0).getDate();
  const startDate = `${month}-01`;
  const endDate = `${month}-${String(lastDay).padStart(2, "0")}`;

  const { data: txs, error } = await sb
    .from("transactions")
    .select("date, description, category, amount")
    .eq("user_id", user.id)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (error) {
    return new Response("Gagal mengambil data transaksi", { status: 500 });
  }

  // Build CSV with BOM for Excel compatibility
  const BOM = "\uFEFF";
  const header = "Tanggal,Deskripsi,Kategori,Jumlah (Rp)\n";
  const rows = (txs ?? [])
    .map(t => {
      const desc = `"${(t.description ?? "").replace(/"/g, '""')}"`;
      const cat  = `"${(t.category ?? "").replace(/"/g, '""')}"`;
      return `${t.date},${desc},${cat},${t.amount}`;
    })
    .join("\n");

  const csv = BOM + header + rows;
  const filename = `ngirit-${month}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
