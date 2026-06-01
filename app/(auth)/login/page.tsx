"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const sb = createClient();
    if (mode === "login") {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) { setError("Email atau password salah"); setLoading(false); return; }
      router.push("/home"); router.refresh();
    } else {
      const { data, error } = await sb.auth.signUp({ email, password });
      if (error) { setError(error.message); setLoading(false); return; }
      if (data.user) {
        await sb.from("profiles").upsert({
          id: data.user.id, email: data.user.email!,
          daily_budget: 50000, personality: "balanced",
          streak_days: 0, total_safe_days: 0, total_over_days: 0,
        });
        router.push("/onboarding");
      }
    }
  }

  return (
    <div className="space-y-8 animate-[fadeUp_0.35s_ease-out]">
      {/* Logo & Mascot */}
      <div className="text-center space-y-4 pt-4">
        {/* Mascot image */}
        <div className="flex justify-center">
          <img
            src="/mascot.png"
            alt="Duitku Mascot"
            className="w-36 h-36 object-contain"
            style={{ filter: "drop-shadow(0 8px 32px rgba(255,59,92,0.35))" }}
          />
        </div>
        <div>
          <h1
            className="text-4xl font-black text-white tracking-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            Duitku
          </h1>
          <p className="text-[#666] text-sm mt-1 font-medium">Financial Assistant</p>
        </div>
      </div>

      {/* Card */}
      <div className="glass-card p-6 space-y-4">
        <h2 className="text-lg font-black text-white text-center">
          {mode === "login" ? "Masuk" : "Buat Akun"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="dk-input"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password (min. 6 karakter)"
            required
            minLength={6}
            className="dk-input"
          />

          {error && (
            <div className="rounded-2xl px-4 py-3 text-center"
              style={{ background: "rgba(255,59,92,0.10)", border: "1px solid rgba(255,59,92,0.20)" }}>
              <p className="text-[#FF3B5C] text-sm font-medium">{error}</p>
            </div>
          )}

          <button type="submit" disabled={loading} className="red-btn w-full text-base font-bold">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading...
              </span>
            ) : mode === "login" ? "Masuk 🚀" : "Daftar Gratis 🎉"}
          </button>
        </form>

        <p className="text-center text-sm text-[#666]">
          {mode === "login" ? "Belum punya akun? " : "Sudah punya akun? "}
          <button
            onClick={() => { setMode(m => m === "login" ? "register" : "login"); setError(null); }}
            className="font-bold hover:underline"
            style={{ color: "#FF3B5C" }}
          >
            {mode === "login" ? "Daftar" : "Masuk"}
          </button>
        </p>
      </div>

      <p className="text-center text-xs text-[#444] font-medium">
        Gratis selamanya • Tanpa kartu kredit
      </p>
    </div>
  );
}
