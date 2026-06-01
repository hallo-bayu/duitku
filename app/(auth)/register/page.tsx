"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Password dan konfirmasi tidak cocok."); return; }
    setLoading(true); setError(null);
    const sb = createClient();
    const { data, error } = await sb.auth.signUp({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    if (data.user) {
      await sb.from("profiles").upsert({
        id: data.user.id, email: data.user.email!,
        username: name.trim() || undefined,
        daily_budget: 50000, personality: "balanced",
        streak_days: 0, total_safe_days: 0, total_over_days: 0,
      });
      router.push("/home");
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap');
        .ng-wrap { min-height:100dvh; background:#fff; display:flex; align-items:center; justify-content:center; padding:12px 16px; font-family:'Poppins',-apple-system,sans-serif; }
        .ng-card { background:#fff; width:100%; max-width:390px; border-radius:32px; border:1px solid #E5E7EB; overflow:hidden; box-shadow:0 8px 40px rgba(15,23,42,0.08); }
        .ng-hero { position:relative; background:#F4FBF0; display:flex; flex-direction:column; align-items:center; padding:16px 24px 0; overflow:hidden; }
        .ng-glow { position:absolute; top:8px; left:50%; transform:translateX(-50%); width:100px; height:100px; border-radius:50%; background:#DFF5D0; opacity:.8; }
        .ng-leaf-l { position:absolute; bottom:0; left:-8px; opacity:.45; }
        .ng-leaf-r { position:absolute; bottom:0; right:-8px; opacity:.45; }
        .ng-mascot { position:relative; z-index:2; width:88px; height:88px; object-fit:contain; object-position:center top; display:block; margin-bottom:-4px; mix-blend-mode:multiply; filter:drop-shadow(0 4px 12px rgba(34,197,94,0.15)); }
        .ng-brand { display:flex; flex-direction:column; align-items:center; padding:8px 24px 0; }
        .ng-wm { display:flex; align-items:flex-start; line-height:1; gap:2px; }
        .ng-wm-t { font-size:30px; font-weight:900; color:#1A2E1A; letter-spacing:-1.5px; }
        .ng-title { font-size:16px; font-weight:800; color:#111827; text-align:center; margin-top:6px; margin-bottom:2px; }
        .ng-sub { font-size:12px; color:#6B7280; text-align:center; margin-bottom:14px; line-height:1.5; }
        .ng-form { padding:0 20px 22px; }
        .ng-lbl { font-size:11px; font-weight:700; color:#374151; margin-bottom:6px; display:block; letter-spacing:.5px; text-transform:uppercase; }
        .ng-inp { display:flex; align-items:center; gap:10px; height:52px; border:1.5px solid #D1D5DB; border-radius:14px; padding:0 14px; background:#ffffff; margin-bottom:12px; transition:border-color .15s; }
        .ng-inp:focus-within { border-color:#22C55E; }
        .ng-inp svg { flex-shrink:0; color:#9CA3AF; }
        .ng-inp input { flex:1; border:none; outline:none; font-family:'Poppins',sans-serif; font-size:15px; font-weight:400; color:#111827; background:#ffffff; -webkit-appearance:none; }
        .ng-inp input::placeholder { color:#9CA3AF; }
        .ng-inp input:-webkit-autofill, .ng-inp input:-webkit-autofill:focus { -webkit-box-shadow:0 0 0 100px #fff inset!important; -webkit-text-fill-color:#111827!important; }
        .ng-eye { cursor:pointer; color:#9CA3AF; flex-shrink:0; background:none; border:none; padding:0; display:flex; align-items:center; }
        .ng-btn-primary { display:block; width:100%; height:52px; background-color:#22C55E; border:none; border-radius:14px; font-family:'Poppins',sans-serif; font-size:18px; font-weight:800; color:#ffffff; cursor:pointer; margin-bottom:10px; -webkit-appearance:none; text-align:center; box-shadow:0 4px 14px rgba(34,197,94,0.3); transition:background .15s,transform .1s; }
        .ng-btn-primary:hover { background-color:#16A34A; }
        .ng-btn-primary:active { transform:scale(0.97); }
        .ng-btn-primary:disabled { opacity:.5; cursor:not-allowed; }
        .ng-divider { text-align:center; font-size:13px; color:#9CA3AF; margin-bottom:10px; }
        .ng-link { text-align:center; font-size:14px; color:#9CA3AF; margin-bottom:10px; }
        .ng-link a { color:#22C55E; font-weight:700; text-decoration:none; }
        .ng-error { border-radius:12px; padding:10px 14px; background:#FEF2F2; border:1px solid #FECACA; margin-bottom:12px; }
        .ng-error p { color:#DC2626; font-size:13px; text-align:center; }
        .ng-footer { text-align:center; font-size:11px; color:#6B7280; line-height:1.7; }
        .ng-footer a { color:#22C55E; font-weight:600; text-decoration:none; }
        .ng-spinner { width:18px; height:18px; border:2.5px solid rgba(255,255,255,.3); border-top-color:white; border-radius:50%; animation:spin .7s linear infinite; display:inline-block; }
        @keyframes spin { to { transform:rotate(360deg); } }
        .pw-hint { font-size:11px; color:#9CA3AF; margin-top:-8px; margin-bottom:12px; padding-left:2px; }
      `}</style>

      <div className="ng-wrap">
        <div className="ng-card">

          {/* Hero — lebih kecil untuk register */}
          <div className="ng-hero">
            <div className="ng-glow" />
            <svg className="ng-leaf-l" width="70" height="100" viewBox="0 0 90 130" fill="none">
              <path d="M20 120 Q-10 80 10 40 Q30 0 70 20 Q40 50 20 120Z" fill="#A7F3D0"/>
              <path d="M35 115 Q10 75 25 45" stroke="#6EE7B7" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            </svg>
            <svg className="ng-leaf-r" width="70" height="100" viewBox="0 0 90 130" fill="none">
              <path d="M70 120 Q100 80 80 40 Q60 0 20 20 Q50 50 70 120Z" fill="#A7F3D0"/>
              <path d="M55 115 Q80 75 65 45" stroke="#6EE7B7" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            </svg>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="ng-mascot" src="/brand/giri-wallet.png" alt="Giri" />
          </div>

          {/* Brand — title register */}
          <div className="ng-brand">
            <div className="ng-wm">
              <span className="ng-wm-t">Ngirit</span>
              <svg width="10" height="15" viewBox="0 0 14 20" fill="none" style={{ marginLeft:2, marginTop:5, flexShrink:0 }}>
                <path d="M7 18 Q1 12 3 5 Q7 0 13 4 Q8 8 7 18Z" fill="#22C55E"/>
              </svg>
            </div>
            <p className="ng-title">Buat Akun Ngirit 🐿️</p>
            <p className="ng-sub">Yuk mulai hemat bareng Giri!<br/>Gratis selamanya.</p>
          </div>

          {/* Form */}
          <form className="ng-form" onSubmit={handleSubmit}>

            <label className="ng-lbl">Nama</label>
            <div className="ng-inp">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <input type="text" placeholder="Nama panggilanmu" value={name}
                onChange={e => setName(e.target.value)} autoComplete="name" />
            </div>

            <label className="ng-lbl">Email</label>
            <div className="ng-inp">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <input type="email" placeholder="nama@email.com" value={email}
                onChange={e => setEmail(e.target.value)} required autoComplete="email" />
            </div>

            <label className="ng-lbl">Password</label>
            <div className="ng-inp">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              <input type={showPw ? "text" : "password"} placeholder="Min. 6 karakter"
                value={password} onChange={e => setPassword(e.target.value)}
                required minLength={6} autoComplete="new-password" />
              <button type="button" className="ng-eye" onClick={() => setShowPw(v => !v)}>
                {showPw
                  ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>

            <label className="ng-lbl">Konfirmasi Password</label>
            <div className="ng-inp">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <input type={showCf ? "text" : "password"} placeholder="Ulangi password"
                value={confirm} onChange={e => setConfirm(e.target.value)}
                required minLength={6} autoComplete="new-password" />
              <button type="button" className="ng-eye" onClick={() => setShowCf(v => !v)}>
                {showCf
                  ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>

            {confirm && password !== confirm && (
              <p className="pw-hint" style={{ color:"#EF4444" }}>⚠️ Password tidak cocok</p>
            )}
            {confirm && password === confirm && confirm.length >= 6 && (
              <p className="pw-hint" style={{ color:"#22C55E" }}>✓ Password cocok</p>
            )}

            {error && <div className="ng-error"><p>{error}</p></div>}

            <button type="submit" className="ng-btn-primary" disabled={loading}>
              {loading
                ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                    <span className="ng-spinner" /> Mendaftar...
                  </span>
                : "Daftar Gratis"}
            </button>

            <p className="ng-link">
              Sudah punya akun? <Link href="/login">Masuk</Link>
            </p>

            <p className="ng-footer">
              Dengan mendaftar, kamu menyetujui<br />
              <a href="#">Syarat &amp; Ketentuan</a> dan <a href="#">Kebijakan Privasi</a> kami
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
