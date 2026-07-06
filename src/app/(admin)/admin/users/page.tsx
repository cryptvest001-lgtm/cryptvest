"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

interface User {
  id: string; email: string; role: string; kycStatus: string;
  emailVerified: boolean; createdAt: string;
}

const KYC_BADGES: Record<string, string> = {
  PENDING: "badge-cyan",
  APPROVED: "badge-green",
  REJECTED: "badge-red",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet("/admin/users").then(async (res) => {
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
        setFiltered(data.users);
      }
      setLoading(false);
    });
  }, []);

  function handleSearch(q: string) {
    setSearch(q);
    const lower = q.toLowerCase();
    setFiltered(users.filter((u) => u.email.toLowerCase().includes(lower) || u.id.includes(lower)));
  }

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-extrabold text-white">Users</h1>

      <div className="flex items-center gap-3">
        <input value={search} onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by email or ID..."
          className="input-dark w-full max-w-sm px-3 py-2 text-sm outline-none" />
        <span className="font-mono text-sm tabular-nums" style={{color:"rgba(226,232,240,0.45)"}}>{filtered.length} users</span>
      </div>

      <div className="glass overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3].map(i => <div key={i} className="h-10 animate-pulse rounded-xl" style={{background:"rgba(255,255,255,0.05)"}} />)}</div>
        ) : (
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="text-left text-xs font-semibold uppercase tracking-widest" style={{color:"rgba(226,232,240,0.4)", background:"rgba(255,255,255,0.03)"}}>
              <tr>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">KYC</th>
                <th className="px-5 py-3">Email Verified</th>
                <th className="px-5 py-3">Joined</th>
              </tr>
            </thead>
            <tbody className="table-dark">
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td className="px-5 py-3 font-medium text-white">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${u.role === "ADMIN" ? "badge-purple" : "badge-muted"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`badge ${KYC_BADGES[u.kycStatus] ?? "badge-muted"}`}>
                      {u.kycStatus}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span style={{color: u.emailVerified ? "#22c55e" : "rgba(226,232,240,0.45)"}}>
                      {u.emailVerified ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-5 py-3" style={{color:"rgba(226,232,240,0.45)"}}>{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </div>
    </main>
  );
}
