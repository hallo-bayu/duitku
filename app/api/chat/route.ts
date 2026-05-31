import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { parseTransaction, isRecapRequest, isHelpRequest } from "@/lib/engine/parser";
import { generateResponse } from "@/lib/engine/responses";
import { getBudgetStatus, formatRupiah, type Personality } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { message } = await request.json();
    if (!message?.trim()) return NextResponse.json({ error: "Empty" }, { status: 400 });

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (!profile) return NextResponse.json({ error: "No profile" }, { status: 404 });

    const today = new Date().toISOString().split("T")[0];
    const personality = (profile.personality as Personality) ?? "balanced";
    const dailyBudget = profile.daily_budget ?? 50000;

    // ── HELP ────────────────────────────────────────────────
    if (isHelpRequest(message)) {
      return NextResponse.json({
        type: "help",
        message: `**Cara pakai DOMI** 💬\n\nKetik pengeluaran langsung:\n• \`kopi 15rb\`\n• \`makan siang 25000\`\n• \`bensin 50rb\`\n\nUntuk laporan:\n• \`recap hari ini\`\n• \`ringkasan minggu ini\`\n• \`laporan bulan ini\``,
      });
    }

    // ── TIPS HEMAT ───────────────────────────────────────────
    const lower = message.toLowerCase();
    if (lower.includes("tips hemat") || lower.includes("saran hemat") || lower.includes("tips") && lower.includes("hemat")) {
      const tips: Record<Personality, string[]> = {
        frugal:   ["Bawa bekal dari rumah, hemat 30-50rb/hari 🥗","Catat pengeluaran setiap hari — awareness = kontrol 📝","Hindari impuls: tunggu 24 jam sebelum beli barang mahal ⏳","Prioritaskan kebutuhan, bukan keinginan 🎯","Coba metode 50/30/20: kebutuhan/keinginan/tabungan 💰"],
        balanced: ["Bawa tumbler sendiri daripada beli minuman terus ☕","Manfaatkan promo & diskon tapi jangan kalap 🤏","Masak sendiri minimal 3x seminggu 🍳","Bikin list belanja sebelum ke minimarket 📋","Unsubscribe layanan streaming yang jarang dipakai 📺"],
        chill:    ["Santai aja, tapi tetap track ya~ 😎","Kopi di rumah juga enak kok, hemat 20rb sehari ☕","Jalan kaki kalau deket, good for wallet & health 🚶","Share cost sama teman kalau bisa 👥","Nikmati yang gratis: taman, perpustakaan, hiking 🌿"],
        sultan:   ["Sultan sejati investasi, bukan cuma belanja 👑","Diversifikasi: sebagian nabung, sebagian nikmati 💎","Luxury experience > luxury goods, more memories 🎭","Belanja quality over quantity, tahan lama 🏆","Sultan tahu kapan harus hemat untuk goal besar 🎯"],
        roast:    ["Coba deh nggak order GoFood 3 hari aja, bisa nggak? 😂","Dompetmu nelpon minta liburan dari kamu 📞","Tantangan: 1 minggu tanpa beli kopi di luar 💪","Cek rekening, lalu tanya diri sendiri: worth it? 🤔","Budget bukan musuh, dia teman yang jujur 🔥"],
      };
      const personalityTips = tips[personality] ?? tips.balanced;
      const tip = personalityTips[Math.floor(Math.random() * personalityTips.length)];
      return NextResponse.json({ type: "help", message: `💡 **Tips Hemat Hari Ini**\n\n${tip}\n\n*Ketik \`tips hemat\` lagi untuk tips berikutnya!*` });
    }

    // ── RECAP ────────────────────────────────────────────────
    if (isRecapRequest(message)) {
      let startDate = today;
      if (lower.includes("minggu") || lower.includes("week")) {
        startDate = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];
      } else if (lower.includes("bulan") || lower.includes("month")) {
        startDate = today.slice(0, 7) + "-01";
      }
      const { data: txs } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .gte("date", startDate)
        .order("date", { ascending: false });

      const total = (txs || []).reduce((s, t) => s + t.amount, 0);
      const byCategory: Record<string, number> = {};
      (txs || []).forEach(t => { byCategory[t.category] = (byCategory[t.category] || 0) + t.amount; });
      const topCat = Object.entries(byCategory).sort(([, a], [, b]) => b - a)[0];

      const isWeek = lower.includes("minggu");
      const isMonth = lower.includes("bulan");
      const period = isMonth ? "bulan ini" : isWeek ? "minggu ini" : "hari ini";

      let recap = `📊 **Recap ${period}**\n\n💸 Total: **${formatRupiah(total)}**\n`;
      if (!isWeek && !isMonth) {
        const status = getBudgetStatus(total, dailyBudget);
        recap += `🎯 Budget: ${formatRupiah(dailyBudget)}\n`;
        recap += `💰 Sisa: **${formatRupiah(Math.max(0, dailyBudget - total))}** ${status === "over" ? "⚠️" : "✅"}\n`;
      }
      recap += `📝 Transaksi: ${(txs || []).length}x\n`;
      if (topCat) recap += `🏆 Terbesar: ${topCat[0]} (${formatRupiah(topCat[1])})`;
      return NextResponse.json({ type: "recap", message: recap, transactions: txs });
    }

    // ── TRANSACTION ──────────────────────────────────────────
    const parsed = parseTransaction(message);
    if (!parsed.isValid) {
      return NextResponse.json({
        type: "error",
        message: `❓ ${parsed.error}\n\nContoh:\n• \`kopi 15rb\`\n• \`makan 25000\`\n• \`bensin 50rb\``,
      });
    }

    await supabase.from("transactions").insert({
      user_id: user.id,
      amount: parsed.amount,
      category: parsed.category,
      description: parsed.description,
      raw_input: message.trim(),
      date: today,
    });

    const { data: todayTxs } = await supabase
      .from("transactions")
      .select("amount")
      .eq("user_id", user.id)
      .eq("date", today);

    const totalSpent = (todayTxs || []).reduce((s, t) => s + t.amount, 0);
    const remaining = dailyBudget - totalSpent;
    const status = getBudgetStatus(totalSpent, dailyBudget);
    const isFirstToday = (todayTxs || []).length === 1;

    const responseText = generateResponse({
      personality, status, spent: totalSpent,
      budget: dailyBudget, remaining, isFirstToday, amount: parsed.amount,
    });

    // Upsert daily summary
    await supabase.from("daily_summaries").upsert({
      user_id: user.id, date: today, total_spent: totalSpent, budget: dailyBudget, status,
    }, { onConflict: "user_id,date" });

    // ── Update streak & stats ─────────────────────────────────
    const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
    const isNewDay = profile.last_active_date !== today;

    if (isNewDay) {
      if (status !== "over") {
        // Safe day
        const newStreak = profile.last_active_date === yesterday ? (profile.streak_days || 0) + 1 : 1;
        await supabase.from("profiles").update({
          streak_days: newStreak,
          total_safe_days: (profile.total_safe_days || 0) + 1,
          last_active_date: today,
        }).eq("id", user.id);
      } else {
        // Over budget day
        await supabase.from("profiles").update({
          streak_days: 0,
          total_over_days: (profile.total_over_days || 0) + 1,
          last_active_date: today,
        }).eq("id", user.id);
      }
    } else if (status === "over" && profile.streak_days > 0) {
      // Same day but just went over — reset streak, add over_day if not yet counted
      // We avoid double counting by only updating if streak was > 0
      await supabase.from("profiles").update({
        streak_days: 0,
      }).eq("id", user.id);
    }

    return NextResponse.json({
      type: "transaction",
      message: responseText,
      transaction: { amount: parsed.amount, category: parsed.category, description: parsed.description },
      stats: { totalSpent, remaining, budget: dailyBudget, status, pct: Math.round((totalSpent / dailyBudget) * 100) },
    });
  } catch (err) {
    console.error("[chat]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
