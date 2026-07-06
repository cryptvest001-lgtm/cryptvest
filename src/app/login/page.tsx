"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";
import { setCookie } from "@/lib/cookies";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await apiPost("/auth/login", { email, password });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Login failed");
      return;
    }
    const { token, user } = await res.json();
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    setCookie("token", token);
    router.push("/dashboard");
  }

  const MINI_PARTICLES = [
    { left:"8%",  dur:"12s", delay:"0s",   size:"2px", color:"#00f0ff" },
    { left:"20%", dur:"16s", delay:"3s",   size:"3px", color:"#a855f7" },
    { left:"35%", dur:"10s", delay:"1.5s", size:"2px", color:"#00f0ff" },
    { left:"55%", dur:"14s", delay:"5s",   size:"2px", color:"#22c55e" },
    { left:"70%", dur:"11s", delay:"2s",   size:"3px", color:"#a855f7" },
    { left:"85%", dur:"13s", delay:"4s",   size:"2px", color:"#00f0ff" },
    { left:"92%", dur:"15s", delay:"0.5s", size:"2px", color:"#22c55e" },
  ];

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4 overflow-hidden bg-radial-pulse">

      {/* Particles */}
      {MINI_PARTICLES.map((p, i) => (
        <div key={i} className="particle pointer-events-none"
          style={{
            left: p.left, bottom: 0,
            width: p.size, height: p.size,
            backgroundColor: p.color,
            ["--dur" as string]: p.dur,
            ["--delay" as string]: p.delay,
          }} />
      ))}

      {/* Vignette */}
      <div className="pointer-events-none absolute inset-0"
        style={{background:"radial-gradient(ellipse 80% 80% at 50% 50%, transparent 20%, #0a0a0f 100%)"}} />

      <div className="relative z-10 w-full max-w-sm">

        {/* Logo */}
        <Link href="/" className="mb-8 flex flex-col items-center gap-1 text-center">
          <Image src="/logo.png" alt="CryptVest" width={190} height={56} className="h-14 w-auto" priority />
          <span className="text-xs" style={{color:"rgba(226,232,240,0.4)"}}>Crypto Prop Trading</span>
        </Link>

        {/* Card */}
        <div className="glass p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-xl font-extrabold text-white">Welcome back</h1>
            <p className="mt-1 text-sm" style={{color:"rgba(226,232,240,0.5)"}}>Sign in to your account</p>
          </div>

          {error && (
            <div className="rounded-xl px-4 py-3 text-sm font-medium"
              style={{background:"rgba(239,68,68,0.08)", border:"1px solid rgba(239,68,68,0.25)", color:"#f87171"}}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{color:"rgba(226,232,240,0.4)"}}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition-all"
                style={{
                  background:"rgba(255,255,255,0.04)",
                  border:"1px solid rgba(255,255,255,0.08)",
                }}
                onFocus={e => (e.target.style.borderColor = "rgba(0,240,255,0.4)")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{color:"rgba(226,232,240,0.4)"}}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-gray-600 outline-none transition-all"
                style={{
                  background:"rgba(255,255,255,0.04)",
                  border:"1px solid rgba(255,255,255,0.08)",
                }}
                onFocus={e => (e.target.style.borderColor = "rgba(0,240,255,0.4)")}
                onBlur={e => (e.target.style.borderColor = "rgba(255,255,255,0.08)")}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-sm mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm" style={{color:"rgba(226,232,240,0.4)"}}>
          No account?{" "}
          <Link href="/register" className="font-semibold transition-colors" style={{color:"#00f0ff"}}
            onMouseEnter={e=>(e.currentTarget.style.color="#a855f7")}
            onMouseLeave={e=>(e.currentTarget.style.color="#00f0ff")}>
            Create one
          </Link>
        </p>
      </div>
    </main>
  );
}
