"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  ClipboardList,
  TrendingUp,
  ArrowUpFromLine,
  ArrowDownToLine,
  Users,
  BarChart2,
  Wallet,
  LogOut,
  Menu,
  X,
  MessageSquare,
} from "lucide-react";
import { deleteCookie } from "@/lib/cookies";

const navItems = [
  { href: "/admin/kyc", label: "KYC Queue", icon: ClipboardList },
  { href: "/admin/deposits", label: "Deposits", icon: ArrowDownToLine },
  { href: "/admin/plans", label: "Stake Plans", icon: TrendingUp },
  { href: "/admin/withdrawals", label: "Withdrawals", icon: ArrowUpFromLine },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/support", label: "Support", icon: MessageSquare },
  { href: "/admin/reports", label: "Reports", icon: BarChart2 },
  { href: "/admin/wallets", label: "Wallets", icon: Wallet },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    deleteCookie("admin_token");
    setMenuOpen(false);
    router.push("/admin/login");
  }

  if (pathname === "/admin/login") {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#0a0a0f" }}>
        {children}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#0a0a0f" }}>
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between border-b border-white/[0.06]"
        style={{
          background: "rgba(10,10,15,0.92)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="CryptVest"
            width={150}
            height={44}
            className="h-11 w-auto brightness-0 invert"
            priority
          />
          <span className="badge badge-purple">Admin</span>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 rounded-lg transition-all"
          style={{
            color: "rgba(226,232,240,0.7)",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/70 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-60 flex-shrink-0 flex flex-col border-r border-white/[0.06] transform transition-transform duration-300 md:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{
          background: "rgba(255,255,255,0.02)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="px-5 py-5 border-b border-white/[0.06] flex items-center justify-between">
          <Image
            src="/logo.png"
            alt="CryptVest"
            width={150}
            height={44}
            className="h-11 w-auto brightness-0 invert"
          />
          <span className="badge badge-purple">Admin</span>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                  active ? "text-cyan" : "hover:text-white"
                }`}
                style={
                  active
                    ? {
                        background: "rgba(0,240,255,0.08)",
                        border: "1px solid rgba(0,240,255,0.18)",
                        color: "#00f0ff",
                      }
                    : {
                        color: "rgba(226,232,240,0.55)",
                        border: "1px solid transparent",
                      }
                }
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background =
                      "rgba(255,255,255,0.04)";
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "rgba(255,255,255,0.08)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLElement).style.background =
                      "transparent";
                    (e.currentTarget as HTMLElement).style.borderColor =
                      "transparent";
                  }
                }}
              >
                <Icon size={15} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/[0.06]">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-all"
            style={{
              color: "rgba(226,232,240,0.5)",
              border: "1px solid transparent",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#f87171";
              (e.currentTarget as HTMLElement).style.background =
                "rgba(239,68,68,0.06)";
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(239,68,68,0.15)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color =
                "rgba(226,232,240,0.5)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.borderColor =
                "transparent";
            }}
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>
      <main
        className="flex-1 overflow-auto md:pt-0 pt-14"
        style={{ backgroundColor: "#0a0a0f" }}
      >
        {children}
      </main>
    </div>
  );
}
