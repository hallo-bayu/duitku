export interface ParsedTransaction {
  amount: number;
  category: string;
  description: string;
  isValid: boolean;
  error?: string;
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  makanan: ["makan","nasi","ayam","sate","bakso","mie","gado","soto","rendang","burger",
    "pizza","kebab","warteg","kantin","geprek","bakar","goreng","rice","food","lauk",
    "sayur","gorengan","dimsum","ramen","pecel","lontong","ketoprak","noodle","sarapan","makan siang","makan malam"],
  minuman: ["kopi","teh","susu","jus","boba","bubble","es","starbucks","kenangan",
    "jiwa","fore","pop ice","thai tea","matcha","smoothie","juice","minuman","drink",
    "cola","sprite","aqua","air mineral","isotonic","cincau"],
  transportasi: ["grab","gojek","ojek","bensin","bbm","pertalite","parkir","tol","bus",
    "angkot","kereta","mrt","lrt","transjakarta","taxi","motor","pertamax","solar","isi bensin","maxim"],
  belanja: ["shopee","tokopedia","lazada","blibli","tiktok","mall","minimarket","indomaret",
    "alfamart","supermarket","baju","sepatu","tas","celana","kaos","jaket","aksesoris",
    "kosmetik","skincare","elektronik","beli"],
  hiburan: ["netflix","spotify","youtube","game","steam","bioskop","cinema","konser",
    "tiket","nonton","main","disney","hbo","prime","ps","playstation","xbox","top up",
    "diamond","voucher","ml","ff","mobile legend","free fire","dota","valorant"],
  kesehatan: ["obat","apotek","dokter","rumah sakit","rs","klinik","puskesmas","vitamin",
    "suplemen","masker","serum","sunscreen"],
  tagihan: ["listrik","air","pdam","internet","wifi","indihome","pulsa","paket data",
    "telkomsel","xl","axis","im3","iuran","cicilan","kos","sewa","tagihan","bayar tagihan"],
};

export function parseTransaction(input: string): ParsedTransaction {
  const text = input.trim();
  const lower = text.toLowerCase();

  const amount = extractAmount(lower);
  if (!amount || amount <= 0) {
    return {
      amount: 0, category: "lainnya", description: text, isValid: false,
      error: "Jumlah tidak ditemukan. Contoh: *kopi 15rb* atau *makan 25000*",
    };
  }

  // Sanity check: amount too large (>= 100 juta) likely parse error
  if (amount >= 100_000_000) {
    return {
      amount: 0, category: "lainnya", description: text, isValid: false,
      error: "Jumlah terlalu besar. Cek kembali formatnya ya.",
    };
  }

  const category = detectCategory(lower);
  const description = cleanDescription(text);

  return { amount, category, description, isValid: true };
}

function extractAmount(text: string): number | null {
  // Order matters: most specific first
  const patterns: [RegExp, number][] = [
    [/(\d+(?:[.,]\d+)?)\s*(?:juta|jt)\b/i, 1_000_000],
    [/(\d+(?:[.,]\d+)?)\s*(?:ribu|rb|k)\b/i, 1_000],
    [/(\d{1,3}(?:\.\d{3})+)/, 1],   // 25.000
    [/(\d{1,3}(?:,\d{3})+)/, 1],    // 25,000
    [/\b(\d{5,8})\b/, 1],            // 25000–99999999
    [/\b(\d{4})\b/, 1],              // 1000–9999
  ];

  for (const [pat, multiplier] of patterns) {
    const m = text.match(pat);
    if (m) {
      const raw = m[1].replace(/,/g, "").replace(/\./g, "");
      const num = parseFloat(raw);
      if (!isNaN(num) && num > 0) return num * multiplier;
    }
  }
  return null;
}

function detectCategory(text: string): string {
  for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) return cat;
  }
  return "lainnya";
}

function cleanDescription(raw: string): string {
  const cleaned = raw
    .replace(/\d+(?:[.,]\d+)?\s*(?:juta|jt|ribu|rb|k)\b/gi, "")
    .replace(/\b\d{4,}\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return raw.trim();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export function isRecapRequest(text: string): boolean {
  return /recap|ringkasan|laporan|rekapan|statistik|hari ini|minggu ini|bulan ini|analisis|spending report/.test(
    text.toLowerCase()
  );
}

export function isHelpRequest(text: string): boolean {
  return /^(help|bantuan|cara|gimana|bagaimana|bisa apa|fitur|contoh|\?)/.test(
    text.toLowerCase().trim()
  );
}
