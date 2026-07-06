"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";
import { RefreshCw } from "lucide-react";

interface BtcWallet {
  address: string; network: string; userId: string;
  confirmedBtc: string; confirmedSats: string; unconfirmedSats: string;
}

interface Erc20Wallet {
  address: string; network: string; userId: string;
  ethBal: string; usdtBal: string;
}

export default function AdminWalletsPage() {
  const [btc, setBtc] = useState<BtcWallet[]>([]);
  const [erc20, setErc20] = useState<Erc20Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(showRefresh = false) {
    if (showRefresh) setRefreshing(true); else setLoading(true);
    const res = await apiGet("/admin/wallets");
    if (res.ok) {
      const data = await res.json();
      setBtc(data.btc ?? []);
      setErc20(data.erc20 ?? []);
    }
    setLoading(false); setRefreshing(false);
  }

  useEffect(() => { load(); }, []);

  const totalBtc = btc.reduce((s, w) => s + Number(w.confirmedBtc), 0);
  const totalUsdt = erc20.reduce((s, w) => s + Number(w.usdtBal), 0);

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-white">Hot Wallets</h1>
        <button onClick={() => load(true)} disabled={refreshing}
          className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold transition-all disabled:opacity-50"
          style={{background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", color:"rgba(226,232,240,0.7)"}}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.08)"}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"}>
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        <div className="glass p-5">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{color:"rgba(226,232,240,0.4)"}}>Total BTC On-Chain</p>
          <p className="mt-1 text-2xl font-bold font-mono tabular-nums" style={{color:"#f59e0b"}}>{loading ? "—" : `${totalBtc.toFixed(8)} BTC`}</p>
          <p className="text-xs mt-1" style={{color:"rgba(226,232,240,0.45)"}}>{btc.length} address{btc.length !== 1 ? "es" : ""}</p>
        </div>
        <div className="glass p-5">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{color:"rgba(226,232,240,0.4)"}}>Total USDT On-Chain (ERC-20)</p>
          <p className="mt-1 text-2xl font-bold font-mono tabular-nums" style={{color:"#22c55e"}}>{loading ? "—" : `${totalUsdt.toFixed(2)} USDT`}</p>
          <p className="text-xs mt-1" style={{color:"rgba(226,232,240,0.45)"}}>{erc20.length} address{erc20.length !== 1 ? "es" : ""}</p>
        </div>
      </div>

      {btc.length > 0 && (
        <div className="glass overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-base font-bold text-white">BTC Deposit Addresses</h2>
          </div>
          {loading ? (
            <div className="p-6 space-y-2">{[1,2].map(i => <div key={i} className="h-8 animate-pulse rounded-xl" style={{background:"rgba(255,255,255,0.05)"}} />)}</div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="text-left text-xs font-semibold uppercase tracking-widest" style={{color:"rgba(226,232,240,0.4)", background:"rgba(255,255,255,0.03)"}}>
                <tr>
                  <th className="px-5 py-3">Address</th>
                  <th className="px-5 py-3">Confirmed BTC</th>
                  <th className="px-5 py-3">Unconfirmed (sats)</th>
                </tr>
              </thead>
              <tbody className="table-dark">
                {btc.map((w) => (
                  <tr key={w.address}>
                    <td className="px-5 py-3 font-mono text-xs truncate max-w-xs" style={{color:"rgba(226,232,240,0.7)"}}>{w.address}</td>
                    <td className="px-5 py-3 font-bold" style={{color:"rgba(226,232,240,0.85)"}}>{w.confirmedBtc}</td>
                    <td className="px-5 py-3" style={{color:"rgba(226,232,240,0.45)"}}>{w.unconfirmedSats}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      )}

      {erc20.length > 0 && (
        <div className="glass overflow-hidden">
          <div className="px-5 py-4 border-b border-white/[0.06]">
            <h2 className="text-base font-bold text-white">ERC-20 Deposit Addresses</h2>
          </div>
          {loading ? (
            <div className="p-6 space-y-2">{[1,2].map(i => <div key={i} className="h-8 animate-pulse rounded-xl" style={{background:"rgba(255,255,255,0.05)"}} />)}</div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[560px]">
              <thead className="text-left text-xs font-semibold uppercase tracking-widest" style={{color:"rgba(226,232,240,0.4)", background:"rgba(255,255,255,0.03)"}}>
                <tr>
                  <th className="px-5 py-3">Address</th>
                  <th className="px-5 py-3">ETH Balance</th>
                  <th className="px-5 py-3">USDT Balance</th>
                </tr>
              </thead>
              <tbody className="table-dark">
                {erc20.map((w) => (
                  <tr key={w.address}>
                    <td className="px-5 py-3 font-mono text-xs truncate max-w-xs" style={{color:"rgba(226,232,240,0.7)"}}>{w.address}</td>
                    <td className="px-5 py-3" style={{color:"rgba(226,232,240,0.55)"}}>{Number(w.ethBal).toFixed(6)} ETH</td>
                    <td className="px-5 py-3 font-bold" style={{color:"rgba(226,232,240,0.85)"}}>{w.usdtBal} USDT</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      )}

      {!loading && btc.length === 0 && erc20.length === 0 && (
        <div className="glass p-8 text-center text-sm" style={{color:"rgba(226,232,240,0.45)"}}>
          No deposit addresses generated yet. Users must request a deposit address first.
        </div>
      )}
    </main>
  );
}
