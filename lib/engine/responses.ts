import type { Personality, BudgetStatus } from "@/types";

type Pool = Record<Personality, string[]>;

const SAFE: Pool = {
  frugal:   ["Budget aman! Pertahankan ritme ini 💪","Disiplin finansialmu patut diacungi jempol 👍","Excellent! Pengeluaran terkontrol.","Ini yang namanya kontrol diri 🎯","Mantap! Budget masih tersenyum 😊"],
  balanced: ["Dompetmu masih tersenyum hari ini 😊","Masih aman. Terus jaga ritme ini!","Good job! Budget masih bersahabat.","Bagus! Masih di jalur yang benar 🟢","Pengeluaran wajar, dompet happy 🎉"],
  chill:    ["Santai, masih oke nih 😌","Adem ayem, budget masih tenang~","Vibe-nya pas, dompet aman!","No stress, masih banyak sisa 😎","Budget masih chill, keep it up~"],
  sultan:   ["Mantap jiwa! Budget masih berdaulat 👑","Sultan sejati tahu kapan harus hemat!","Dompet masih full power 💎","Kelas atas dalam penghematan! 🎩","Sultan selalu punya kontrol! 👑✨"],
  roast:    ["Wah, masih hemat? Ini beneran kamu? 😂","Selamat! Akhirnya bisa nahan diri.","Ternyata dompetmu bisa napas hari ini 😅","Ajaib! Budget masih utuh. Screenshot dulu! 📸","Nggak belanja impulsif? Growth! 🌱"],
};

const WARNING: Pool = {
  frugal:   ["Perhatian! Budget mulai menipis. Tahan dulu 🟡","Waspada — 35% tersisa. Bijak!","Zona kuning. Pertimbangkan tiap pengeluaran.","Budget 65% terpakai. Rem sedikit!","Hampir setengah jalan habis. Stay focused!"],
  balanced: ["Budget mulai waspada 👀","Tinggal sedikit sebelum zona bahaya.","Dompet mulai deg-degan nih 😅","70% budget terpakai. Hati-hati ya!","Masih bisa, tapi pelan-pelan."],
  chill:    ["Hmm, mulai agak banyak nih. Slow down~","Santai tapi tetap lirik budget ya 👀","Budget lumayan, maybe pause dulu?","Masih oke sih, jangan kebablasan 😬","Waktunya slow spending mode 🐢"],
  sultan:   ["Sultan waspada! Keuangan perlu dijaga 👑","Bahkan Sultan punya batas!","Singgasana mulai goyang kalau begini terus.","Sultan bijak tahu kapan berhenti.","Warning dari bendahara kerajaan! ⚠️"],
  roast:    ["Dompet udah mulai ngerengek tuh 😂","Wah, konsisten banget abisnya. Salut!","Budget kelelahan ngeliatin transaksimu.","Hampir KO nih budgetnya 😅","Tangan gatel mulu ya belanjanya?"],
};

const DANGER: Pool = {
  frugal:   ["STOP! Budget hampir habis. Darurat! 🚨","15% tersisa. Ini bukan latihan!","Mode emergency! Jangan tambah pengeluaran.","Budget kritis. Hanya untuk kebutuhan vital!","Alarm merah! Budget hampir batas."],
  balanced: ["Budget tinggal sedikit banget 😬","Zona bahaya! Budget hampir KO.","Perlu rem keras sekarang!","Hampir habis nih budgetnya 😰","Last chance to stop! Budget kritis."],
  chill:    ["Eh bro, udah parah nih 😬","Budget udah hampir game over...","Maybe stop dulu ya? Serius ini.","Dompet udah minta tolong 🙏","Oke ini udah nggak chill lagi 😅"],
  sultan:   ["SULTAN DALAM BAHAYA! 🚨👑","Istana mulai guncang! Budget kritis!","Bahkan Sultan butuh emergency brake!","SOS dari bendahara kerajaan! 🆘","Budget hampir jatuh dari singgasana! 💸"],
  roast:    ["Selamat! Hampir berhasil bunuh budget sendiri 🏆","Cepet banget ngabisinnya, rekor?","Dompet udah nangis minta ampun.","Ini bukan YOLO, ini finansial suicide 😂","Budget tinggal napas doang nih."],
};

const OVER: Pool = {
  frugal:   ["Budget terlampaui. Evaluasi besok 📝","Lesson learned. Besok mulai baru.","Over budget. Catat dan perbaiki.","Budget gugur. Analisis dan improve.","Hari ini sulit, besok lebih baik 💪"],
  balanced: ["Budget hari ini sudah KO 🥊","Dompet meminta cuti sementara 😭","Kamu berhasil mengalahkan budget-mu sendiri 😂","Over budget! Besok semangat lagi ya.","Budget hari ini selesai. Sampai besok!"],
  chill:    ["Ya sudahlah, hari ini memang begitu 😅","Budget habis, tapi hidup terus~","Oops, over budget. It's fine, besok lebih baik.","Udah kelewatan, santai aja lanjut besok.","Hari ini over, besok fresh start 🌅"],
  sultan:   ["Sultan telah jatuh dari singgasana! 💸👑","Kerajaan finansial guncang hebat! SOS!","Budget digulingkan! Drama tingkat dewa! 😂","Bahkan Sultan kadang kehabisan.","Singgasana kosong, budget habis! 👑💀"],
  roast:    ["Selamat! Budget hari ini resmi KO kamu 🥊","Achievement unlocked: Mengalahkan budget sendiri 🏆","Dompet minta resign 😂","Budget sudah mengibarkan bendera putih 🏳️","Rekor baru! Habis sebelum malam 🎉"],
};

const FIRST_TX: Pool = {
  frugal:   ["Transaksi pertama hari ini! Budget-mu diaktifkan 💪","Hari baru dimulai. Track terus pengeluaranmu!"],
  balanced: ["Halo! Pengeluaran pertama hari ini tercatat ✨","Hari baru dimulai! Semangat jaga budget 🌅"],
  chill:    ["Yoo, transaksi pertama! Budget mulai jalan~","Day started! Santai tapi tetap track ya 😎"],
  sultan:   ["Sultan memulai harinya! Budget diaktifkan 👑","Hari baru, Sultan baru! Budget siap bertempur 💎"],
  roast:    ["Eh, mulai belanja lagi? Cepet banget 😂","Baru pagi udah keluar duit. Konsisten banget!"],
};

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function buildBar(pct: number): string {
  const filled = Math.min(Math.round(pct / 10), 10);
  return "█".repeat(filled) + "░".repeat(10 - filled);
}

export interface ResponseContext {
  personality: Personality;
  status: BudgetStatus;
  spent: number;
  budget: number;
  remaining: number;
  isFirstToday: boolean;
  amount: number;
}

export function generateResponse(ctx: ResponseContext): string {
  const { personality, status, spent, budget, remaining, isFirstToday, amount } = ctx;

  const pct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
  const fmt = (n: number) => n >= 1_000_000 ? `Rp${(n/1_000_000).toFixed(1)}jt` : n >= 1_000 ? `Rp${Math.round(n/1_000)}rb` : `Rp${n}`;

  const reaction = isFirstToday
    ? pick(FIRST_TX[personality])
    : pick({ safe: SAFE, warning: WARNING, danger: DANGER, over: OVER }[status][personality]);

  const bar = buildBar(pct);
  const statusEmoji = { safe: "🟢", warning: "🟡", danger: "🟠", over: "🔴" }[status];

  const stats = status === "over"
    ? `${bar} ${pct}% ${statusEmoji}\n💸 Hari ini: **${fmt(spent)}** / ${fmt(budget)}\n🚨 Over budget **${fmt(spent - budget)}**`
    : `${bar} ${pct}% ${statusEmoji}\n💸 Hari ini: **${fmt(spent)}** / ${fmt(budget)}\n💰 Sisa: **${fmt(remaining)}**`;

  return `${reaction}\n\n${stats}`;
}
