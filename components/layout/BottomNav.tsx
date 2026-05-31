"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();
  const NAV = [
    { href: "/chat",         label: "Chat",    Icon: IconChat    },
    { href: "/recap",        label: "Recap",   Icon: IconRecap   },
    { href: "/achievements", label: "Capaian", Icon: IconTrophy  },
    { href: "/profile",      label: "Profil",  Icon: IconProfile },
  ];

  return (
    <nav className="flex-shrink-0 relative z-10"
      style={{
        background: "rgba(10,10,10,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.06)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.5)",
      }}>
      <ul className="flex max-w-lg mx-auto">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link href={href} style={{ minHeight: "56px" }}
                className="flex flex-col items-center justify-center gap-1 transition-all relative">
                {active && (
                  <div className="absolute top-1.5 w-12 h-8 rounded-xl"
                    style={{ background: "rgba(255,59,92,0.10)", border: "1px solid rgba(255,59,92,0.14)" }} />
                )}
                <span style={{ position: "relative", zIndex: 1 }}>
                  <Icon active={active} />
                </span>
                <span style={{
                  fontSize: "10px",
                  fontWeight: active ? 700 : 400,
                  position: "relative",
                  zIndex: 1,
                  color: active ? "#FF3B5C" : "#444",
                }}>
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/* ── 2D Ilustrasi SVG Icons — semua warna sama (#FF3B5C aktif, #444 nonaktif) ── */

function IconChat({ active }: { active: boolean }) {
  const c = active ? "#FF3B5C" : "#444";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="3" width="16" height="13" rx="4" fill={active ? "rgba(255,59,92,0.15)" : "rgba(255,255,255,0.05)"} stroke={c} strokeWidth="1.5"/>
      <circle cx="7" cy="9.5" r="1.2" fill={c}/>
      <circle cx="10" cy="9.5" r="1.2" fill={c}/>
      <circle cx="13" cy="9.5" r="1.2" fill={c}/>
      <path d="M4 16l-2 4 5-2" fill={active ? "rgba(255,59,92,0.15)" : "rgba(255,255,255,0.05)"} stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function IconRecap({ active }: { active: boolean }) {
  const c = active ? "#FF3B5C" : "#444";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="4" fill={active ? "rgba(255,59,92,0.10)" : "rgba(255,255,255,0.04)"} stroke={c} strokeWidth="1.5"/>
      {/* bar chart inside */}
      <rect x="7" y="13" width="3" height="5" rx="1" fill={c} opacity="0.7"/>
      <rect x="11" y="9" width="3" height="9" rx="1" fill={c}/>
      <rect x="15" y="11" width="3" height="7" rx="1" fill={c} opacity="0.7"/>
    </svg>
  );
}

function IconTrophy({ active }: { active: boolean }) {
  const c = active ? "#FF3B5C" : "#444";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M8 3h8v8a4 4 0 0 1-8 0V3z" fill={active ? "rgba(255,59,92,0.15)" : "rgba(255,255,255,0.05)"} stroke={c} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M5 5H3v3a3 3 0 0 0 3 3" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M19 5h2v3a3 3 0 0 1-3 3" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 15v3" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <rect x="8" y="18" width="8" height="2.5" rx="1.25" fill={c} opacity="0.8"/>
    </svg>
  );
}

function IconProfile({ active }: { active: boolean }) {
  const c = active ? "#FF3B5C" : "#444";
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" fill={active ? "rgba(255,59,92,0.15)" : "rgba(255,255,255,0.05)"} stroke={c} strokeWidth="1.5"/>
      <path d="M4 20c0-3.314 3.582-6 8-6s8 2.686 8 6" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
