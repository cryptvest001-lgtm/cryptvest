"use client";

import { useEffect, useState } from "react";
import { apiGetAdmin, apiPostAdmin } from "@/lib/api";

interface Plan {
  id: string;
  name: string;
  type: string;
  dailyRatePercent: string;
  active: boolean;
}

const empty = {
  email: "",
  stakePlanId: "",
  asset: "BTC",
  amount: "",
  reason: "",
};

export default function AdminStakeUsersPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    const res = await apiGetAdmin("/admin/stakes/plans");
    if (res.ok) {
      const data = await res.json();
      setPlans(data.plans);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    const res = await apiPostAdmin("/admin/stakes/users", {
      email: form.email.trim(),
      stakePlanId: form.stakePlanId,
      asset: form.asset,
      amount: Number(form.amount),
      reason: form.reason || undefined,
    });
    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "Failed to stake for user");
      return;
    }

    setSuccess("Stake created for user.");
    setForm(empty);
    load();
  }

  const activePlans = plans.filter((plan) => plan.active);

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Stake Users</h1>
        <p
          className="mt-1 text-sm"
          style={{ color: "rgba(226,232,240,0.45)" }}
        >
          Create a stake for a user after confirming their request in support.
        </p>
      </div>

      <div className="glass p-6 space-y-4">
        <h2 className="text-base font-bold text-white">Create User Stake</h2>
        {error && <p className="alert-red text-sm">{error}</p>}
        {success && <p className="alert-green text-sm">{success}</p>}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "rgba(226,232,240,0.4)" }}
            >
              User Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              className="input-dark w-full px-3 py-2.5 text-sm outline-none"
              placeholder="user@example.com"
              required
            />
          </div>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "rgba(226,232,240,0.4)" }}
            >
              Plan
            </label>
            <select
              value={form.stakePlanId}
              onChange={(e) => update("stakePlanId", e.target.value)}
              className="select-dark w-full px-3 py-2.5 text-sm outline-none"
              required
            >
              <option value="">Select plan</option>
              {activePlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} ({Number(plan.dailyRatePercent).toFixed(4)}%/day)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "rgba(226,232,240,0.4)" }}
            >
              Asset
            </label>
            <select
              value={form.asset}
              onChange={(e) => update("asset", e.target.value)}
              className="select-dark w-full px-3 py-2.5 text-sm outline-none"
            >
              <option value="BTC">BTC</option>
              <option value="USDT">USDT</option>
            </select>
          </div>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "rgba(226,232,240,0.4)" }}
            >
              Amount
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={form.amount}
              onChange={(e) => update("amount", e.target.value)}
              className="input-dark w-full px-3 py-2.5 text-sm font-mono outline-none"
              placeholder="0.00000000"
              required
            />
          </div>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "rgba(226,232,240,0.4)" }}
            >
              Reason
            </label>
            <input
              value={form.reason}
              onChange={(e) => update("reason", e.target.value)}
              className="input-dark w-full px-3 py-2.5 text-sm outline-none"
              placeholder="Support chat request"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              disabled={submitting || loading}
              className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Stake"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
