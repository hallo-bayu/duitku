"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/home",         label: "Home",        Icon: IconHome        },
  { href: "/chat",         label: "Chat",        Icon: IconChat        },
  { href: "/recap",        label: "Rekap",       Icon: IconRecap       },
  { href: "/achievements", label: "Achievement", Icon: IconAchievement },
  { href: "/profile",      label: "Profil",      Icon: IconProfile     },
];

export default function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="bottom-nav flex-shrink-0" style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <ul className="flex max-w-lg mx-auto">
        {NAV.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <li key={href} className="flex-1">
              <Link href={href} className="flex flex-col items-center justify-center gap-1 py-3 relative">
                {active && (
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full"
                    style={{ background: "var(--green)" }} />
                )}
                <Icon active={active} />
                <span style={{
                  fontSize: "10px", fontWeight: active ? 700 : 500,
                  fontFamily: "Poppins, sans-serif",
                  color: active ? "var(--green)" : "var(--text-muted)",
                }}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

const G = "var(--green)";
const M = "var(--text-muted)";

function IconHome({ active }: { active: boolean }) {
  const c = active ? G : M;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9.5z"
        fill={active ? "#DCFCE7" : "none"} stroke={c} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M9 21V12h6v9" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconChat({ active }: { active: boolean }) {
  const c = active ? G : M;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        fill={active ? "#DCFCE7" : "none"} stroke={c} strokeWidth="1.8" strokeLinejoin="round"/>
      <circle cx="8" cy="10" r="1" fill={c}/>
      <circle cx="12" cy="10" r="1" fill={c}/>
      <circle cx="16" cy="10" r="1" fill={c}/>
    </svg>
  );
}
function IconRecap({ active }: { active: boolean }) {
  const c = active ? G : M;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5"
        fill={active ? "#DCFCE7" : "none"} stroke={c} strokeWidth="1.8"/>
      <path d="M7 17V13M12 17V8M17 17V11" stroke={c} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
function IconAchievement({ active }: { active: boolean }) {
  const c = active ? G : M;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <path d="M8 3h8v10a4 4 0 0 1-8 0V3z"
        fill={active ? "#DCFCE7" : "none"} stroke={c} strokeWidth="1.8" strokeLinejoin="round"/>
      <path d="M8 6H5a1 1 0 0 0-1 1v2a4 4 0 0 0 4 4M16 6h3a1 1 0 0 1 1 1v2a4 4 0 0 1-4 4"
        stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M12 17v3M9 20h6" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
function IconProfile({ active }: { active: boolean }) {
  const c = active ? G : M;
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" fill={active ? "#DCFCE7" : "none"} stroke={c} strokeWidth="1.8"/>
      <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}
