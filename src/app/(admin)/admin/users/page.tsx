"use client";

import { useEffect, useState } from "react";
import { apiGetAdmin, apiPostAdmin } from "@/lib/api";
import {
  Mail,
  ShieldAlert,
  UserMinus,
  Trash2,
  ShieldCheck,
  MoreVertical,
  Wallet,
} from "lucide-react";

interface User {
  id: string;
  email: string;
  role: string;
  kycStatus: string;
  isBanned: boolean;
  isRestricted: boolean;
  emailVerified: boolean;
  createdAt: string;
}

const KYC_BADGES: Record<string, string> = {
  PENDING: "badge-cyan",
  APPROVED: "badge-green",
  REJECTED: "badge-red",
};

type BalanceAction = "CREDIT" | "DEBIT" | "EARNINGS";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filtered, setFiltered] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  // Email Modal State
  const [showEmailModal, setShowEmailModal] = useState<User | null>(null);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Balance Modal State
  const [showBalanceModal, setShowBalanceModal] = useState<User | null>(null);
  const [balanceAsset, setBalanceAsset] = useState("BTC");
  const [balanceAmount, setBalanceAmount] = useState("");
  const [balanceType, setBalanceType] = useState<BalanceAction>("CREDIT");
  const [balanceReason, setBalanceReason] = useState("");
  const [adjustingBalance, setAdjustingBalance] = useState(false);
  const [balanceError, setBalanceError] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const res = await apiGetAdmin("/admin/users");
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users);
      setFiltered(data.users);
    }
    setLoading(false);
  }

  async function handleAction(userId: string, action: string) {
    if (
      action === "DELETE" &&
      !confirm(
        "Are you sure you want to PERMANENTLY delete this user? This cannot be undone.",
      )
    )
      return;

    setActing(userId);
    const res = await apiPostAdmin(`/admin/users/${userId}/action`, { action });
    setActing(null);

    if (res.ok) {
      load();
    } else {
      const b = await res.json().catch(() => ({}));
      alert(b.error || "Action failed");
    }
  }

  async function handleSendEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!showEmailModal) return;

    setSendingEmail(true);
    const res = await apiPostAdmin(
      `/admin/users/${showEmailModal.id}/send-email`,
      {
        subject: emailSubject,
        message: emailMessage,
      },
    );
    setSendingEmail(false);

    if (res.ok) {
      setShowEmailModal(null);
      setEmailSubject("");
      setEmailMessage("");
      alert("Email sent successfully");
    } else {
      alert("Failed to send email");
    }
  }

  async function handleAdjustBalance(e: React.FormEvent) {
    e.preventDefault();
    if (!showBalanceModal) return;

    setBalanceError("");
    setAdjustingBalance(true);
    const res =
      balanceType === "EARNINGS"
        ? await apiPostAdmin(`/admin/users/${showBalanceModal.id}/earnings`, {
            asset: balanceAsset,
            amount: Number(balanceAmount),
            reason: balanceReason || undefined,
          })
        : await apiPostAdmin(`/admin/users/${showBalanceModal.id}/balance`, {
            asset: balanceAsset,
            amount: Number(balanceAmount),
            type: balanceType,
            reason: balanceReason || undefined,
          });
    setAdjustingBalance(false);

    if (res.ok) {
      setShowBalanceModal(null);
      setBalanceAmount("");
      setBalanceReason("");
      alert(
        balanceType === "EARNINGS"
          ? `Successfully added ${balanceAmount} ${balanceAsset} to user earnings`
          : `Successfully ${balanceType === "CREDIT" ? "credited" : "debited"} ${balanceAmount} ${balanceAsset}`,
      );
    } else {
      const b = await res.json().catch(() => ({}));
      setBalanceError(b.error || "Failed to adjust balance");
    }
  }

  function handleSearch(q: string) {
    setSearch(q);
    const lower = q.toLowerCase();
    setFiltered(
      users.filter(
        (u) => u.email.toLowerCase().includes(lower) || u.id.includes(lower),
      ),
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-extrabold text-white">Users</h1>

      <div className="flex items-center gap-3">
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by email or ID..."
          className="input-dark w-full max-w-sm px-3 py-2 text-sm outline-none"
        />
        <span
          className="font-mono text-sm tabular-nums"
          style={{ color: "rgba(226,232,240,0.45)" }}
        >
          {filtered.length} users
        </span>
      </div>

      <div className="glass overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 animate-pulse rounded-xl"
                style={{ background: "rgba(255,255,255,0.05)" }}
              />
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[640px]">
              <thead
                className="text-left text-xs font-semibold uppercase tracking-widest"
                style={{
                  color: "rgba(226,232,240,0.4)",
                  background: "rgba(255,255,255,0.03)",
                }}
              >
                <tr>
                  <th className="px-5 py-3">Email</th>
                  <th className="px-5 py-3">Role</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">KYC</th>
                  <th className="px-5 py-3">Joined</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="table-dark">
                {filtered.map((u) => (
                  <tr key={u.id} className={u.isBanned ? "opacity-50" : ""}>
                    <td className="px-5 py-3 font-medium text-white">
                      {u.email}
                      {u.isBanned && (
                        <span className="ml-2 text-[10px] text-red-500 uppercase font-bold">
                          [Banned]
                        </span>
                      )}
                      {u.isRestricted && (
                        <span className="ml-2 text-[10px] text-amber-500 uppercase font-bold">
                          [Restricted]
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`badge ${u.role === "ADMIN" ? "badge-purple" : "badge-muted"}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`badge ${u.isBanned ? "badge-red" : u.isRestricted ? "badge-amber" : "badge-green"}`}
                      >
                        {u.isBanned
                          ? "BANNED"
                          : u.isRestricted
                            ? "RESTRICTED"
                            : "ACTIVE"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`badge ${KYC_BADGES[u.kycStatus] ?? "badge-muted"}`}
                      >
                        {u.kycStatus}
                      </span>
                    </td>
                    <td
                      className="px-5 py-3"
                      style={{ color: "rgba(226,232,240,0.45)" }}
                    >
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setShowBalanceModal(u)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-purple-400 transition-all"
                          title="Fund, debit, or add earnings"
                        >
                          <Wallet size={16} />
                        </button>

                        <button
                          onClick={() => setShowEmailModal(u)}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-cyan transition-all"
                          title="Send Email"
                        >
                          <Mail size={16} />
                        </button>

                        {u.isBanned ? (
                          <button
                            onClick={() => handleAction(u.id, "UNBAN")}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-green-500 transition-all"
                            title="Unban User"
                          >
                            <ShieldCheck size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(u.id, "BAN")}
                            className="p-1.5 rounded-lg hover:bg-white/10 text-red-500 transition-all"
                            title="Ban User"
                          >
                            <ShieldAlert size={16} />
                          </button>
                        )}

                        <button
                          onClick={() =>
                            handleAction(
                              u.id,
                              u.isRestricted ? "UNRESTRICT" : "RESTRICT",
                            )
                          }
                          className={`p-1.5 rounded-lg hover:bg-white/10 transition-all ${u.isRestricted ? "text-green-500" : "text-amber-500"}`}
                          title={
                            u.isRestricted
                              ? "Remove Restriction"
                              : "Restrict User"
                          }
                        >
                          <UserMinus size={16} />
                        </button>

                        <button
                          onClick={() => handleAction(u.id, "DELETE")}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-500 hover:text-red-500 transition-all"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white text-wrap truncate">
                Message: {showEmailModal.email}
              </h2>
              <button
                onClick={() => setShowEmailModal(null)}
                className="text-gray-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2 text-gray-400">
                  Subject
                </label>
                <input
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="input-dark w-full px-3 py-2 text-sm outline-none"
                  placeholder="Support Update / Account Notice"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2 text-gray-400">
                  Message
                </label>
                <textarea
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  className="input-dark w-full px-3 py-2 text-sm outline-none min-h-[150px] resize-none"
                  placeholder="Type your message to the user..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailModal(null)}
                  className="btn-outline px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  disabled={sendingEmail}
                  className="btn-primary px-6 py-2 text-sm"
                >
                  {sendingEmail ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Balance Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass w-full max-w-lg p-6 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white text-wrap truncate">
                Fund / Debit / Earnings: {showBalanceModal.email}
              </h2>
              <button
                onClick={() => setShowBalanceModal(null)}
                className="text-gray-500 hover:text-white"
              >
                ✕
              </button>
            </div>
            {balanceError && (
              <p className="alert-red text-sm">{balanceError}</p>
            )}
            <form onSubmit={handleAdjustBalance} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2 text-gray-400">
                    Action
                  </label>
                  <select
                    value={balanceType}
                    onChange={(e) =>
                      setBalanceType(e.target.value as BalanceAction)
                    }
                    className="select-dark w-full px-3 py-2 text-sm outline-none"
                  >
                    <option value="CREDIT">Fund (Credit)</option>
                    <option value="DEBIT">Debit</option>
                    <option value="EARNINGS">Add Earnings</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-widest mb-2 text-gray-400">
                    Asset
                  </label>
                  <select
                    value={balanceAsset}
                    onChange={(e) => setBalanceAsset(e.target.value)}
                    className="select-dark w-full px-3 py-2 text-sm outline-none"
                  >
                    <option value="BTC">BTC</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2 text-gray-400">
                  Amount
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="input-dark w-full px-3 py-2 text-sm font-mono outline-none"
                  placeholder="0.00000000"
                  required
                />
                {balanceType === "EARNINGS" && (
                  <p className="mt-2 text-xs text-gray-500">
                    Earnings are added to the user&apos;s latest active stake for
                    the selected asset.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest mb-2 text-gray-400">
                  Reason (optional, for audit log)
                </label>
                <input
                  value={balanceReason}
                  onChange={(e) => setBalanceReason(e.target.value)}
                  className="input-dark w-full px-3 py-2 text-sm outline-none"
                  placeholder="e.g. Manual bank transfer credit"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBalanceModal(null)}
                  className="btn-outline px-4 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  disabled={adjustingBalance}
                  className="btn-primary px-6 py-2 text-sm"
                >
                  {adjustingBalance
                    ? "Processing..."
                    : balanceType === "CREDIT"
                      ? "Fund Account"
                      : balanceType === "DEBIT"
                        ? "Debit Account"
                        : "Add Earnings"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
