export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-5 relative overflow-hidden">
      {/* Red ambient glow */}
      <div className="absolute bottom-0 left-0 w-2/3 h-2/3 pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(255,59,92,0.15) 0%, transparent 70%)" }} />
      <div className="w-full max-w-sm relative z-10">{children}</div>
    </div>
  );
}
