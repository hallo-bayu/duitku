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
    <nav
      className="flex-shrink-0 relative z-10"
      style={{
        background: "rgba(0,0,0,0.75)",
        backdropFilter: "blur(32px)",
        WebkitBackdropFilter: "blur(32px)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <ul className="flex max-w-lg mx-auto">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                style={{ minHeight: "60px" }}
                className="flex flex-col items-center justify-center gap-1.5 relative"
              >
                {active && (
                  <div
                    className="absolute top-2 rounded-2xl"
                    style={{
                      width: "52px", height: "36px",
                      background: "rgba(255,59,92,0.14)",
                      border: "1px solid rgba(255,59,92,0.22)",
                    }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 1, display: "flex" }}>
                  <Icon active={active} />
                </span>
                <span style={{
                  fontSize: "10px",
                  fontWeight: active ? 700 : 400,
                  position: "relative", zIndex: 1,
                  color: active ? "#FF3B5C" : "#4a4a4a",
                  letterSpacing: "0.01em",
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

/* ── Crisp HD SVG icons — 48px viewBox, sharp strokes ──────── */
/* Semua senada: stroke style, rounded caps, same weight       */

function IconChat({ active }: { active: boolean }) {
  const C = active ? "#FF3B5C" : "#5a5a5a";
  const F = active ? "rgba(255,59,92,0.18)" : "none";
  return (
    <svg width="26" height="26" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: "crisp-edges" }}>
      {/* Bubble body */}
      <rect x="4" y="6" width="32" height="26" rx="8" fill={F} stroke={C} strokeWidth="3" strokeLinejoin="round"/>
      {/* Dots */}
      <circle cx="14" cy="19" r="2.5" fill={C}/>
      <circle cx="20" cy="19" r="2.5" fill={C}/>
      <circle cx="26" cy="19" r="2.5" fill={C}/>
      {/* Tail */}
      <path d="M8 32 L4 42 L16 36" stroke={C} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill={F}/>
    </svg>
  );
}

function IconRecap({ active }: { active: boolean }) {
  const C = active ? "#FF3B5C" : "#5a5a5a";
  const F = active ? "rgba(255,59,92,0.14)" : "none";
  return (
    <svg width="26" height="26" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: "crisp-edges" }}>
      {/* Card bg */}
      <rect x="4" y="4" width="40" height="40" rx="9" fill={F} stroke={C} strokeWidth="3"/>
      {/* 3 bars — left short, mid tall, right mid */}
      <rect x="11" y="26" width="7" height="12" rx="2.5" fill={C} opacity={active ? 1 : 0.7}/>
      <rect x="20.5" y="18" width="7" height="20" rx="2.5" fill={C}/>
      <rect x="30" y="22" width="7" height="16" rx="2.5" fill={C} opacity={active ? 1 : 0.7}/>
    </svg>
  );
}

function IconTrophy({ active }: { active: boolean }) {
  const C = active ? "#FF3B5C" : "#5a5a5a";
  const F = active ? "rgba(255,59,92,0.18)" : "none";
  return (
    <svg width="26" height="26" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: "crisp-edges" }}>
      {/* Cup body */}
      <path d="M14 6h20v18a10 10 0 0 1-20 0V6z" fill={F} stroke={C} strokeWidth="3" strokeLinejoin="round"/>
      {/* Left handle */}
      <path d="M14 10H8a1 1 0 0 0-1 1v6a7 7 0 0 0 7 7" stroke={C} strokeWidth="3" strokeLinecap="round"/>
      {/* Right handle */}
      <path d="M34 10h6a1 1 0 0 1 1 1v6a7 7 0 0 1-7 7" stroke={C} strokeWidth="3" strokeLinecap="round"/>
      {/* Stem */}
      <line x1="24" y1="34" x2="24" y2="40" stroke={C} strokeWidth="3" strokeLinecap="round"/>
      {/* Base */}
      <rect x="14" y="40" width="20" height="4" rx="2" fill={C}/>
    </svg>
  );
}

function IconProfile({ active }: { active: boolean }) {
  const C = active ? "#FF3B5C" : "#5a5a5a";
  const F = active ? "rgba(255,59,92,0.18)" : "none";
  return (
    <svg width="26" height="26" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ imageRendering: "crisp-edges" }}>
      {/* Avatar circle */}
      <circle cx="24" cy="16" r="9" fill={F} stroke={C} strokeWidth="3"/>
      {/* Body / shoulders */}
      <path d="M6 42c0-9.941 8.059-18 18-18s18 8.059 18 18" stroke={C} strokeWidth="3" strokeLinecap="round"/>
    </svg>
  );
}
