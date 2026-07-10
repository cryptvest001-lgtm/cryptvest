"use client";

import { useEffect, useState } from "react";
import { apiGetAdmin, apiPostAdmin } from "@/lib/api";

interface Plan {
  id: string;
  name: string;
  type: string;
  termDays: number | null;
  dailyRatePercent: string;
  earlyExitPenaltyPercent: string | null;
  active: boolean;
}

const empty = {
  name: "",
  type: "FLEXIBLE",
  termDays: "",
  dailyRatePercent: "",
  earlyExitPenaltyPercent: "",
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState(empty);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    const res = await apiGetAdmin("/admin/stakes/plans");
    if (res.ok) setPlans((await res.json()).plans);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  function update(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function planPayload() {
    const clearingValue = editingPlanId ? null : undefined;

    return {
      name: form.name,
      type: form.type,
      termDays:
        form.type === "LOCKED" && form.termDays
          ? Number(form.termDays)
          : clearingValue,
      dailyRatePercent: Number(form.dailyRatePercent),
      earlyExitPenaltyPercent:
        form.type === "LOCKED" && form.earlyExitPenaltyPercent
          ? Number(form.earlyExitPenaltyPercent)
          : clearingValue,
    };
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    const res = await apiPostAdmin(
      editingPlanId
        ? `/admin/stakes/plans/${editingPlanId}`
        : "/admin/stakes/plans",
      planPayload(),
    );
    setSubmitting(false);
    if (!res.ok) {
      const b = await res.json().catch(() => ({}));
      setError(b.error || "Failed");
      return;
    }
    setForm(empty);
    setEditingPlanId(null);
    setSuccess(editingPlanId ? "Plan updated." : "Plan created.");
    load();
  }

  function startEdit(plan: Plan) {
    setEditingPlanId(plan.id);
    setError("");
    setSuccess("");
    setForm({
      name: plan.name,
      type: plan.type,
      termDays: plan.termDays ? String(plan.termDays) : "",
      dailyRatePercent: String(plan.dailyRatePercent),
      earlyExitPenaltyPercent: plan.earlyExitPenaltyPercent
        ? String(plan.earlyExitPenaltyPercent)
        : "",
    });
  }

  function cancelEdit() {
    setEditingPlanId(null);
    setForm(empty);
    setError("");
  }

  async function toggleActive(plan: Plan) {
    await apiPostAdmin(`/admin/stakes/plans/${plan.id}`, {
      active: !plan.active,
    });
    load();
  }

  const inputCls = "input-dark w-full px-3 py-2.5 text-sm outline-none";
  const selectCls = "select-dark w-full px-3 py-2.5 text-sm outline-none";

  return (
    <main className="mx-auto max-w-5xl p-4 sm:p-6 space-y-6">
      <h1 className="text-2xl font-extrabold text-white">Stake Plans</h1>

      <div className="glass p-6 space-y-4">
        <h2 className="text-base font-bold text-white">
          {editingPlanId ? "Edit Plan" : "Create Plan"}
        </h2>
        {error && <p className="alert-red text-sm">{error}</p>}
        {success && <p className="alert-green text-sm">{success}</p>}
        <form
          onSubmit={handleSave}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <div className="sm:col-span-1">
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "rgba(226,232,240,0.4)" }}
            >
              Name
            </label>
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className={inputCls}
              required
            />
          </div>
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "rgba(226,232,240,0.4)" }}
            >
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              className={selectCls}
            >
              <option value="FLEXIBLE">Flexible</option>
              <option value="LOCKED">Locked</option>
            </select>
          </div>
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "rgba(226,232,240,0.4)" }}
            >
              Daily Rate %
            </label>
            <input
              type="number"
              step="any"
              min="0"
              value={form.dailyRatePercent}
              onChange={(e) => update("dailyRatePercent", e.target.value)}
              className={inputCls}
              required
            />
          </div>
          {form.type === "LOCKED" && (
            <>
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "rgba(226,232,240,0.4)" }}
                >
                  Term (days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.termDays}
                  onChange={(e) => update("termDays", e.target.value)}
                  className={inputCls}
                />
              </div>
              <div>
                <label
                  className="block text-xs font-semibold uppercase tracking-widest mb-2"
                  style={{ color: "rgba(226,232,240,0.4)" }}
                >
                  Early Exit Penalty %
                </label>
                <input
                  type="number"
                  step="any"
                  min="0"
                  max="100"
                  value={form.earlyExitPenaltyPercent}
                  onChange={(e) =>
                    update("earlyExitPenaltyPercent", e.target.value)
                  }
                  className={inputCls}
                />
              </div>
            </>
          )}
          <div className="sm:col-span-2">
            <button
              disabled={submitting}
              className="btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
            >
              {submitting
                ? editingPlanId
                  ? "Saving..."
                  : "Creating..."
                : editingPlanId
                  ? "Save Changes"
                  : "Create Plan"}
            </button>
            {editingPlanId && (
              <button
                type="button"
                onClick={cancelEdit}
                className="btn-outline ml-3 px-5 py-2.5 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="glass overflow-hidden">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h2 className="text-base font-bold text-white">All Plans</h2>
        </div>
        {loading ? (
          <div className="p-6">
            <div
              className="h-10 animate-pulse rounded-xl"
              style={{ background: "rgba(255,255,255,0.05)" }}
            />
          </div>
        ) : (
          <div>
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05] last:border-b-0"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">{plan.name}</p>
                    {plan.type === "LOCKED" && (
                      <span className="badge badge-amber">Locked</span>
                    )}
                  </div>
                  <p
                    className="font-mono text-xs tabular-nums"
                    style={{ color: "rgba(226,232,240,0.45)" }}
                  >
                    {Number(plan.dailyRatePercent).toFixed(4)}%/day
                    {plan.termDays ? ` · ${plan.termDays}d` : ""}
                    {plan.earlyExitPenaltyPercent
                      ? ` · ${plan.earlyExitPenaltyPercent}% penalty`
                      : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startEdit(plan)}
                    className="btn-outline px-3 py-1.5 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => toggleActive(plan)}
                    className="badge transition-all"
                    style={
                      plan.active
                        ? {
                            background: "rgba(34,197,94,0.12)",
                            color: "#22c55e",
                            border: "1px solid rgba(34,197,94,0.25)",
                          }
                        : {
                            background: "rgba(255,255,255,0.04)",
                            color: "rgba(226,232,240,0.45)",
                            border: "1px solid rgba(255,255,255,0.08)",
                          }
                    }
                  >
                    {plan.active ? "Active" : "Inactive"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
