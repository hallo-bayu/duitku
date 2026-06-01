"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
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
        router.push("/home");
      }
    }
  }

  return (
    <>
      <style>{`
        .ng-login-wrap {
          min-height: 100vh;
          background: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          font-family: 'Poppins', -apple-system, sans-serif;
        }
        .ng-card {
          background: #ffffff;
          width: 100%;
          max-width: 360px;
          border-radius: 36px;
          border: 1px solid #E5E7EB;
          overflow: hidden;
          box-shadow: 0 8px 40px rgba(15,23,42,0.08);
        }
        /* Hero section */
        .ng-hero {
          position: relative;
          background: #F4FBF0;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 28px 24px 0;
          overflow: hidden;
          min-height: 200px;
        }
        .ng-hero-glow {
          position: absolute;
          top: 20px; left: 50%;
          transform: translateX(-50%);
          width: 180px; height: 180px;
          border-radius: 50%;
          background: #DFF5D0;
        }
        .ng-leaf-left {
          position: absolute;
          bottom: 0; left: -10px;
          opacity: 0.55;
        }
        .ng-leaf-right {
          position: absolute;
          bottom: 0; right: -10px;
          opacity: 0.55;
        }
        .ng-mascot {
          position: relative; z-index: 2;
          width: 185px; height: 185px;
          object-fit: contain;
          object-position: center top;
          display: block;
          margin-bottom: -8px;
        }
        /* Brand */
        .ng-brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 14px 28px 0;
        }
        .ng-wordmark {
          display: flex;
          align-items: flex-start;
          line-height: 1;
        }
        .ng-wordmark-text {
          font-size: 44px;
          font-weight: 900;
          color: #1A2E1A;
          letter-spacing: -2px;
        }
        .ng-tagline {
          font-size: 15px;
          font-weight: 400;
          color: #4B5563;
          text-align: center;
          margin-top: 5px;
          margin-bottom: 20px;
          line-height: 1.4;
        }
        /* Form */
        .ng-form { padding: 0 24px 28px; }
        .ng-label {
          font-size: 13px; font-weight: 700;
          color: #1F2937; margin-bottom: 7px;
          display: block;
        }
        .ng-input-wrap {
          display: flex; align-items: center; gap: 10px;
          height: 54px;
          border: 1.5px solid #D1D5DB;
          border-radius: 14px;
          padding: 0 16px;
          background: #ffffff !important;
          margin-bottom: 14px;
          transition: border-color 0.15s;
        }
        .ng-input-wrap:focus-within { border-color: #22C55E; }
        .ng-input-wrap svg { flex-shrink: 0; color: #9CA3AF; }
        .ng-input-wrap input {
          flex: 1; border: none; outline: none;
          font-family: 'Poppins', sans-serif;
          font-size: 15px; font-weight: 500;
          color: #111827 !important;
          background: #ffffff !important;
          -webkit-appearance: none; appearance: none;
        }
        .ng-input-wrap input::placeholder { color: #9CA3AF !important; font-weight: 400; }
        .ng-input-wrap input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #ffffff inset !important;
          -webkit-text-fill-color: #111827 !important;
        }
        .ng-eye {
          cursor: pointer; color: #9CA3AF; flex-shrink: 0;
          background: none; border: none; padding: 0;
          display: flex; align-items: center;
        }
        .ng-forgot {
          text-align: right; font-size: 13px; font-weight: 500;
          color: #22C55E; display: block;
          margin-top: -6px; margin-bottom: 20px;
          background: none; border: none; cursor: pointer;
          font-family: 'Poppins', sans-serif;
          width: 100%;
        }
        .ng-btn-masuk {
          display: block; width: 100%; height: 54px;
          background-color: #22C55E !important;
          border: none; border-radius: 14px;
          font-family: 'Poppins', sans-serif;
          font-size: 22px; font-weight: 800;
          color: #ffffff !important;
          cursor: pointer; margin-bottom: 12px;
          -webkit-appearance: none; appearance: none;
          text-align: center; letter-spacing: -0.3px;
          transition: opacity 0.15s, transform 0.1s;
          box-shadow: 0 4px 16px rgba(34,197,94,0.35);
        }
        .ng-btn-masuk:active { transform: scale(0.97); opacity: 0.9; }
        .ng-btn-masuk:disabled { opacity: 0.5; cursor: not-allowed; }
        .ng-btn-daftar {
          display: block; width: 100%; height: 54px;
          background-color: #ffffff !important;
          border: 2px solid #22C55E; border-radius: 14px;
          font-family: 'Poppins', sans-serif;
          font-size: 22px; font-weight: 800;
          color: #22C55E !important;
          cursor: pointer; margin-bottom: 20px;
          -webkit-appearance: none; appearance: none;
          text-align: center; letter-spacing: -0.3px;
          transition: background 0.15s, transform 0.1s;
        }
        .ng-btn-daftar:active { transform: scale(0.97); }
        .ng-or {
          text-align: center; font-size: 13px;
          color: #9CA3AF; margin-bottom: 12px;
        }
        .ng-error {
          border-radius: 12px; padding: 10px 14px;
          background: #FEF2F2; border: 1px solid #FECACA;
          margin-bottom: 14px;
        }
        .ng-error p { color: #DC2626; font-size: 13px; text-align: center; }
        .ng-footer {
          text-align: center; font-size: 12px;
          color: #6B7280; line-height: 1.7;
        }
        .ng-footer a { color: #22C55E; font-weight: 600; text-decoration: none; }
        .ng-spinner {
          width: 18px; height: 18px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="ng-login-wrap">
        <div className="ng-card">

          {/* ── Hero ── */}
          <div className="ng-hero">
            <div className="ng-hero-glow" />
            {/* Leaf left */}
            <svg className="ng-leaf-left" width="90" height="130" viewBox="0 0 90 130" fill="none">
              <path d="M20 120 Q-10 80 10 40 Q30 0 70 20 Q40 50 20 120Z" fill="#A7F3D0"/>
              <path d="M35 115 Q10 75 25 45" stroke="#6EE7B7" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M50 95 Q15 85 10 60" stroke="#6EE7B7" strokeWidth="1" fill="none" strokeLinecap="round"/>
            </svg>
            {/* Leaf right */}
            <svg className="ng-leaf-right" width="90" height="130" viewBox="0 0 90 130" fill="none">
              <path d="M70 120 Q100 80 80 40 Q60 0 20 20 Q50 50 70 120Z" fill="#A7F3D0"/>
              <path d="M55 115 Q80 75 65 45" stroke="#6EE7B7" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              <path d="M40 95 Q75 85 80 60" stroke="#6EE7B7" strokeWidth="1" fill="none" strokeLinecap="round"/>
            </svg>
            {/* Giri mascot */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="ng-mascot" src="/brand/giri-wallet.png" alt="Giri" />
          </div>

          {/* ── Brand ── */}
          <div className="ng-brand">
            <div className="ng-wordmark">
              <span className="ng-wordmark-text">Ngirit</span>
              {/* Leaf on i */}
              <svg width="13" height="20" viewBox="0 0 14 20" fill="none" style={{ marginLeft: 3, marginTop: 8, flexShrink: 0 }}>
                <path d="M7 18 Q1 12 3 5 Q7 0 13 4 Q8 8 7 18Z" fill="#22C55E"/>
              </svg>
            </div>
            <p className="ng-tagline">
              Catat pengeluaran <strong style={{ color: "#22C55E", fontWeight: 700 }}>semudah chat.</strong>
            </p>
          </div>

          {/* ── Form ── */}
          <form className="ng-form" onSubmit={handleSubmit}>

            <label className="ng-label">Email</label>
            <div className="ng-input-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <input type="email" placeholder="Masukkan email" value={email}
                onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>

            <label className="ng-label">Password</label>
            <div className="ng-input-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input type={showPw ? "text" : "password"} placeholder="Masukkan password"
                value={password} onChange={e => setPassword(e.target.value)}
                required minLength={6} autoComplete={mode === "login" ? "current-password" : "new-password"} />
              <button type="button" className="ng-eye" onClick={() => setShowPw(v => !v)} aria-label="Toggle password">
                {showPw ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>

            {mode === "login" && (
              <button type="button" className="ng-forgot">Lupa password?</button>
            )}

            {error && (
              <div className="ng-error">
                <p>{error}</p>
              </div>
            )}

            {/* Masuk button */}
            <button type={mode === "login" ? "submit" : "button"}
              className="ng-btn-masuk"
              disabled={loading && mode === "login"}
              onClick={mode === "register" ? () => { setMode("login"); setError(null); } : undefined}>
              {loading && mode === "login"
                ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <span className="ng-spinner" /> Masuk...
                  </span>
                : "Masuk"}
            </button>

            <p className="ng-or">Belum punya akun?</p>

            {/* Daftar button */}
            <button type={mode === "register" ? "submit" : "button"}
              className="ng-btn-daftar"
              disabled={loading && mode === "register"}
              onClick={mode === "login" ? () => { setMode("register"); setError(null); } : undefined}>
              {loading && mode === "register"
                ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                    <span className="ng-spinner" style={{ borderTopColor: "#22C55E", borderColor: "rgba(34,197,94,0.3)" }} /> Daftar...
                  </span>
                : "Daftar Gratis"}
            </button>

            <p className="ng-footer">
              Dengan melanjutkan, kamu menyetujui<br />
              <a href="#">Syarat &amp; Ketentuan</a> dan <a href="#">Kebijakan Privasi</a> kami
            </p>
          </form>

        </div>
      </div>
    </>
  );
}
