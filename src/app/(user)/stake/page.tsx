"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";

interface Plan {
  id: string;
  name: string;
  type: string;
  termDays: number | null;
  dailyRatePercent: string;
  earlyExitPenaltyPercent: string | null;
}

interface Balance {
  asset: string;
  available: string;
}

interface Stake {
  id: string;
  asset: string;
  principal: string;
  accruedEarnings: string;
  status: string;
  maturityDate: string | null;
  stakePlan: { name: string };
  startDate: string;
}

export default function StakePage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [myStakes, setMyStakes] = useState<Stake[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [asset, setAsset] = useState("BTC");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    const [pRes, bRes, sRes] = await Promise.all([
      apiGet("/stakes/plans"),
      apiGet("/deposits/balances"),
      apiGet("/stakes/my"),
    ]);
    if (pRes.ok) setPlans((await pRes.json()).plans);
    if (bRes.ok) setBalances((await bRes.json()).balances);
    if (sRes.ok) setMyStakes((await sRes.json()).stakes);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const availableBalance = Number(balances.find((b) => b.asset === asset)?.available ?? 0);

  async function handleStake(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlan) return;
    setError(""); setSuccess(""); setSubmitting(true);
    const res = await apiPost("/stakes", {
      stakePlanId: selectedPlan.id,
      asset,
      amount: Number(amount),
    });
    setSubmitting(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Stake failed");
      return;
    }
    setSuccess("Staked successfully!");
    setAmount("");
    setSelectedPlan(null);
    load();
  }

  async function handleUnstake(stakeId: string) {
    if (!confirm("Unstake this position? Early exit penalties may apply.")) return;
    const res = await apiPost(`/stakes/${stakeId}/unstake`, {});
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      alert(body.error || "Unstake failed");
      return;
    }
    const data = await res.json();
    alert(`Unstaked. Returned: ${Number(data.returnAmount).toFixed(8)}, Penalty: ${Number(data.penalty).toFixed(8)}`);
    load();
  }

  const planColor = (type: string, selected: boolean) => {
    const isLocked = type === "LOCKED";
    const c = isLocked ? "#a855f7" : "#00f0ff";
    return selected
      ? { background: `${c}10`, border: `1px solid ${c}55`, color: c }
      : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(226,232,240,0.6)" };
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold text-white">Stake</h1>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl" style={{background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)"}} />)}
        </div>
      ) : (
        <>
          <div className="glass p-6 space-y-4">
            <h2 className="text-base font-bold text-white">Available Plans</h2>
            {plans.length === 0 ? (
              <p className="text-sm" style={{color:"rgba(226,232,240,0.45)"}}>No active plans available.</p>
            ) : (
              <div className="space-y-3">
                {plans.map((plan) => {
                  const isLocked = plan.type === "LOCKED";
                  const isSelected = selectedPlan?.id === plan.id;
                  const c = isLocked ? "#a855f7" : "#00f0ff";
                  return (
                    <button key={plan.id} onClick={() => setSelectedPlan(plan.id === selectedPlan?.id ? null : plan)}
                      className="w-full rounded-xl border p-4 text-left transition-all"
                      style={planColor(plan.type, isSelected)}
                      onMouseEnter={e => {
                        if (!isSelected) {
                          (e.currentTarget as HTMLElement).style.borderColor = `${c}40`;
                          (e.currentTarget as HTMLElement).style.background = `${c}08`;
                        }
                      }}
                      onMouseLeave={e => {
                        if (!isSelected) {
                          (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)";
                          (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.03)";
                        }
                      }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-white">{plan.name}</p>
                          {isLocked && <span className="badge badge-purple">Locked</span>}
                        </div>
                        <span className="font-mono font-semibold tabular-nums" style={{color: c}}>
                          {Number(plan.dailyRatePercent).toFixed(3)}%<span className="text-xs font-normal" style={{color:"rgba(226,232,240,0.45)"}}> / day</span>
                        </span>
                      </div>
                      <p className="text-xs mt-1" style={{color:"rgba(226,232,240,0.45)"}}>
                        {isLocked
                          ? `Locked ${plan.termDays} days${plan.earlyExitPenaltyPercent ? ` · ${plan.earlyExitPenaltyPercent}% early exit penalty` : ""}`
                          : "Flexible — unstake anytime"}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedPlan && (
              <form onSubmit={handleStake} className="border-t border-white/[0.06] pt-4 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{color:"rgba(226,232,240,0.4)"}}>Asset</label>
                    <select value={asset} onChange={(e) => setAsset(e.target.value)} className="select-dark w-full px-3 py-2.5 text-sm outline-none">
                      <option value="BTC">BTC</option>
                      <option value="USDT">USDT</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-widest mb-2" style={{color:"rgba(226,232,240,0.4)"}}>Amount</label>
                    <input type="number" step="any" min="0" max={availableBalance} value={amount} onChange={(e) => setAmount(e.target.value)}
                      className="input-dark w-full px-3 py-2.5 text-sm font-mono outline-none"
                      placeholder={`Max: ${availableBalance.toFixed(8)}`} required />
                  </div>
                </div>
                {error && <p className="alert-red text-sm">{error}</p>}
                {success && <p className="alert-green text-sm">{success}</p>}
                <button disabled={submitting} className="btn-primary w-full py-2.5 text-sm">
                  {submitting ? "Staking..." : `Stake with ${selectedPlan.name}`}
                </button>
              </form>
            )}
          </div>

          {myStakes.length > 0 && (
            <div className="glass overflow-hidden">
              <div className="px-5 py-4 border-b border-white/[0.06]">
                <h2 className="text-base font-bold text-white">My Stakes</h2>
              </div>
              <div>
                {myStakes.map((s) => (
                  <div key={s.id} className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05] last:border-b-0">
                    <div>
                      <p className="text-sm font-bold text-white">{s.stakePlan.name} · {s.asset}</p>
                      <p className="font-mono text-xs tabular-nums" style={{color:"rgba(226,232,240,0.45)"}}>
                        {Number(s.principal).toFixed(8)} principal
                        {s.maturityDate && ` · matures ${new Date(s.maturityDate).toLocaleDateString()}`}
                      </p>
                      <p className="font-mono text-xs tabular-nums" style={{color:"#22c55e"}}>+{Number(s.accruedEarnings).toFixed(8)} earned</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge ${
                        s.status === "ACTIVE" ? "badge-green" :
                        s.status === "MATURED" ? "badge-cyan" :
                        "badge-muted"
                      }`}>{s.status}</span>
                      {s.status === "ACTIVE" && (
                        <button onClick={() => handleUnstake(s.id)} className="text-xs font-semibold transition-colors"
                          style={{color:"#f87171"}}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = "#fca5a5"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = "#f87171"}>
                          Unstake
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
