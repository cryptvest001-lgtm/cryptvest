"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { setCookie } from "@/lib/cookies";
import Link from "next/link";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await apiPost("/admin/auth/login", { email, password, code });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Admin login failed");
      return;
    }
    const { token, user } = await res.json();
    localStorage.setItem("admin_token", token);
    localStorage.setItem("admin_user", JSON.stringify(user));
    setCookie("admin_token", token);
    router.push("/admin/kyc");
  }

  const MINI_PARTICLES = [
    { left:"12%", dur:"13s", delay:"0s",   size:"2px", color:"#a855f7" },
    { left:"28%", dur:"17s", delay:"3s",   size:"3px", color:"#00f0ff" },
    { left:"48%", dur:"11s", delay:"1.5s", size:"2px", color:"#22c55e" },
    { left:"68%", dur:"15s", delay:"5s",   size:"2px", color:"#a855f7" },
    { left:"84%", dur:"12s", delay:"2s",   size:"3px", color:"#00f0ff" },
  ];

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden bg-radial-pulse">
      {MINI_PARTICLES.map((p, i) => (
        <div key={i} className="particle pointer-events-none"
          style={{left: p.left, bottom: 0, width: p.size, height: p.size, backgroundColor: p.color,
            ["--dur" as string]: p.dur, ["--delay" as string]: p.delay}} />
      ))}
      <div className="pointer-events-none absolute inset-0"
        style={{background:"radial-gradient(ellipse 80% 80% at 50% 50%, transparent 20%, #0a0a0f 100%)"}} />

      <div className="relative z-10 w-full max-w-sm">
        <Link href="/" className="mb-8 flex flex-col items-center gap-2 text-center">
          <Image src="/logo.png" alt="CryptVest" width={190} height={56} className="h-14 w-auto brightness-0 invert" priority />
          <span className="badge badge-purple">Admin Portal</span>
        </Link>

        <div className="glass p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-xl font-extrabold text-white">Admin Console</h1>
            <p className="mt-1 text-sm" style={{color:"rgba(226,232,240,0.5)"}}>Sign in to manage the platform</p>
          </div>

          {error && (
            <div className="alert-red text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{color:"rgba(226,232,240,0.4)"}}>Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-dark w-full px-4 py-3 text-sm outline-none" placeholder="admin@cryptvest.com" required />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{color:"rgba(226,232,240,0.4)"}}>Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-dark w-full px-4 py-3 text-sm outline-none" placeholder="••••••••" required />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{color:"rgba(226,232,240,0.4)"}}>2FA Code</label>
              <input type="text" inputMode="numeric" maxLength={6} value={code} onChange={(e) => setCode(e.target.value)}
                className="input-dark w-full px-4 py-3 text-sm font-mono tracking-widest outline-none" placeholder="000000" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm mt-2">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
