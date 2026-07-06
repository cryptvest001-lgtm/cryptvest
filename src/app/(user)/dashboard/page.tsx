"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet } from "@/lib/api";
import { ArrowDownToLine, TrendingUp, ArrowUpFromLine } from "lucide-react";

interface Balance {
  asset: string;
  available: string;
  staked: string;
}

interface Stake {
  id: string;
  asset: string;
  principal: string;
  accruedEarnings: string;
  status: string;
  stakePlan: { name: string };
  startDate: string;
}

export default function DashboardPage() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [stakes, setStakes] = useState<Stake[]>([]);
  const [user, setUser] = useState<{ email: string; kycStatus: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) setUser(JSON.parse(stored));

    Promise.all([apiGet("/deposits/balances"), apiGet("/stakes/my")])
      .then(async ([bRes, sRes]) => {
        if (bRes.ok) setBalances((await bRes.json()).balances);
        if (sRes.ok) setStakes((await sRes.json()).stakes);
      })
      .finally(() => setLoading(false));
  }, []);

  const totals = balances.reduce(
    (acc, b) => ({
      available: acc.available + Number(b.available),
      staked: acc.staked + Number(b.staked),
    }),
    { available: 0, staked: 0 }
  );

  const totalEarnings = stakes.reduce((sum, s) => sum + Number(s.accruedEarnings), 0);
  const activeStakes = stakes.filter((s) => s.status === "ACTIVE");

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold text-white">Dashboard</h1>
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm" style={{color:"rgba(226,232,240,0.45)"}}>{user.email}</span>
            {user.kycStatus !== "APPROVED" && (
              <Link href="/kyc" className="badge badge-cyan">Complete KYC</Link>
            )}
          </div>
        )}
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <div className="glass p-5">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{color:"rgba(226,232,240,0.4)"}}>Available</p>
          {loading ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded-xl" style={{background:"rgba(255,255,255,0.05)"}} />
          ) : (
            <>
              <p className="mt-1 font-mono text-2xl font-extrabold tabular-nums" style={{color:"#00f0ff"}}>{totals.available.toFixed(8)}</p>
              <div className="mt-2 space-y-0.5">
                {balances.map((b) => (
                  <p key={b.asset} className="font-mono text-xs tabular-nums" style={{color:"rgba(226,232,240,0.45)"}}>
                    {b.asset}: {Number(b.available).toFixed(8)}
                  </p>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="glass p-5">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{color:"rgba(226,232,240,0.4)"}}>Staked</p>
          {loading ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded-xl" style={{background:"rgba(255,255,255,0.05)"}} />
          ) : (
            <>
              <p className="mt-1 font-mono text-2xl font-extrabold tabular-nums" style={{color:"#a855f7"}}>{totals.staked.toFixed(8)}</p>
              <p className="mt-2 text-xs" style={{color:"rgba(226,232,240,0.45)"}}>{activeStakes.length} active stake{activeStakes.length !== 1 ? "s" : ""}</p>
            </>
          )}
        </div>

        <div className="glass p-5">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{color:"rgba(226,232,240,0.4)"}}>Total Earnings</p>
          {loading ? (
            <div className="mt-2 h-8 w-24 animate-pulse rounded-xl" style={{background:"rgba(255,255,255,0.05)"}} />
          ) : (
            <p className="mt-1 font-mono text-2xl font-extrabold tabular-nums" style={{color:"#22c55e"}}>+{totalEarnings.toFixed(8)}</p>
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/deposit" className="group glass p-4 flex items-center gap-3 transition-all hover:-translate-y-0.5"
          style={{borderColor:"rgba(255,255,255,0.08)"}}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
            style={{background:"rgba(0,240,255,0.08)", border:"1px solid rgba(0,240,255,0.15)"}}>
            <ArrowDownToLine size={18} style={{color:"#00f0ff"}} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Deposit</p>
            <p className="text-xs" style={{color:"rgba(226,232,240,0.45)"}}>Fund your account</p>
          </div>
        </Link>
        <Link href="/stake" className="group glass p-4 flex items-center gap-3 transition-all hover:-translate-y-0.5"
          style={{borderColor:"rgba(255,255,255,0.08)"}}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
            style={{background:"rgba(168,85,247,0.08)", border:"1px solid rgba(168,85,247,0.15)"}}>
            <TrendingUp size={18} style={{color:"#a855f7"}} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Stake</p>
            <p className="text-xs" style={{color:"rgba(226,232,240,0.45)"}}>Earn daily yield</p>
          </div>
        </Link>
        <Link href="/withdraw" className="group glass p-4 flex items-center gap-3 transition-all hover:-translate-y-0.5"
          style={{borderColor:"rgba(255,255,255,0.08)"}}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0"
            style={{background:"rgba(34,197,94,0.08)", border:"1px solid rgba(34,197,94,0.15)"}}>
            <ArrowUpFromLine size={18} style={{color:"#22c55e"}} />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Withdraw</p>
            <p className="text-xs" style={{color:"rgba(226,232,240,0.45)"}}>Request a payout</p>
          </div>
        </Link>
      </div>

      {activeStakes.length > 0 && (
        <div className="glass overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-base font-bold text-white">Active Stakes</h2>
          </div>
          <div>
            {activeStakes.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05] last:border-b-0">
                <div>
                  <p className="text-sm font-bold text-white">{s.stakePlan.name}</p>
                  <p className="text-xs" style={{color:"rgba(226,232,240,0.45)"}}>{s.asset} · started {new Date(s.startDate).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-bold tabular-nums" style={{color:"rgba(226,232,240,0.75)"}}>{Number(s.principal).toFixed(8)}</p>
                  <p className="font-mono text-xs tabular-nums" style={{color:"#22c55e"}}>+{Number(s.accruedEarnings).toFixed(8)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
