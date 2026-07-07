"use client";

import { useEffect, useState } from "react";
import { apiGetAdmin } from "@/lib/api";

interface Report {
  userCount: number;
  totalDeposited: string;
  totalStaked: string;
  totalWithdrawn: string;
  pendingWithdrawals: number;
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color?: string;
}) {
  return (
    <div className="glass p-5">
      <p
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: "rgba(226,232,240,0.4)" }}
      >
        {label}
      </p>
      <p
        className="mt-1 font-mono text-2xl font-bold tabular-nums"
        style={{ color: color ?? "white" }}
      >
        {value}
      </p>
    </div>
  );
}

export default function AdminReportsPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetAdmin("/admin/reports").then(async (res) => {
      if (res.ok) setReport(await res.json());
      setLoading(false);
    });
  }, []);

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-extrabold text-white">Reports</h1>

      {loading ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-2xl"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            />
          ))}
        </div>
      ) : report ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Stat label="Total Users" value={report.userCount} color="#00f0ff" />
          <Stat
            label="Total Deposited"
            value={Number(report.totalDeposited).toFixed(4)}
            color="#22c55e"
          />
          <Stat
            label="Total Staked"
            value={Number(report.totalStaked).toFixed(4)}
            color="#a855f7"
          />
          <Stat
            label="Total Withdrawn (Paid)"
            value={Number(report.totalWithdrawn).toFixed(4)}
            color="rgba(226,232,240,0.85)"
          />
          <Stat
            label="Pending Withdrawals"
            value={report.pendingWithdrawals}
            color={
              report.pendingWithdrawals > 0
                ? "#00f0ff"
                : "rgba(226,232,240,0.85)"
            }
          />
          <div className="glass p-5">
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: "rgba(226,232,240,0.4)" }}
            >
              Liability (Staked − Withdrawn)
            </p>
            <p className="mt-1 font-mono text-2xl font-bold tabular-nums text-white">
              {(
                Number(report.totalStaked) - Number(report.totalWithdrawn)
              ).toFixed(4)}
            </p>
          </div>
        </div>
      ) : (
        <p className="text-sm" style={{ color: "rgba(226,232,240,0.45)" }}>
          Failed to load report.
        </p>
      )}
    </main>
  );
}
