"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, ArrowDownToLine, TrendingUp, ArrowUpFromLine, Activity, ShieldCheck, LogOut, Menu, X } from "lucide-react";
import { deleteCookie } from "@/lib/cookies";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/deposit", label: "Deposit", icon: ArrowDownToLine },
  { href: "/stake", label: "Stake", icon: TrendingUp },
  { href: "/withdraw", label: "Withdraw", icon: ArrowUpFromLine },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/kyc", label: "KYC", icon: ShieldCheck },
];

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    deleteCookie("token");
    setMenuOpen(false);
    router.push("/login");
  }

  function navLinkClick() { setMenuOpen(false); }

  return (
    <div className="min-h-screen flex" style={{backgroundColor:"#0a0a0f"}}>
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between border-b border-white/[0.06]"
        style={{background:"rgba(10,10,15,0.92)", backdropFilter:"blur(12px)"}}>
        <Link href="/dashboard"><Image src="/logo.png" alt="CryptVest" width={165} height={48} className="h-12 w-auto brightness-0 invert" priority /></Link>
        <button onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-lg transition-all"
          style={{color:"rgba(226,232,240,0.7)", background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)"}}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-30 bg-black/70 md:hidden" onClick={() => setMenuOpen(false)} />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-56 flex-shrink-0 flex flex-col border-r border-white/[0.06] transform transition-transform duration-300 md:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{background:"rgba(255,255,255,0.02)", backdropFilter:"blur(12px)"}}>
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <Link href="/dashboard"><Image src="/logo.png" alt="CryptVest" width={180} height={53} className="h-[3.25rem] w-auto brightness-0 invert" /></Link>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link key={href} href={href} onClick={navLinkClick}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                  active ? "text-cyan" : "hover:text-white"
                }`}
                style={active
                  ? {background:"rgba(0,240,255,0.08)", border:"1px solid rgba(0,240,255,0.18)", color:"#00f0ff"}
                  : {color:"rgba(226,232,240,0.55)", border:"1px solid transparent"}
                }
                onMouseEnter={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)";
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                  }
                }}
                onMouseLeave={e => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                    (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                  }
                }}>
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/[0.06]">
          <button onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all"
            style={{color:"rgba(226,232,240,0.5)", border:"1px solid transparent"}}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.color = "#f87171";
              (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.06)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(239,68,68,0.15)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.color = "rgba(226,232,240,0.5)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.borderColor = "transparent";
            }}>
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto md:pt-0 pt-14" style={{backgroundColor:"#0a0a0f"}}>
        {children}
      </main>
    </div>
  );
}
