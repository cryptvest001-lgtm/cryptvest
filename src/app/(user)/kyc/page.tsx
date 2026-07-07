"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiPostUser } from "@/lib/api";

export default function KycPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    documentType: "PASSPORT",
    documentNumber: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function update(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    const res = await apiPostUser("/kyc/submit", form);
    setLoading(false);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error || "KYC submission failed");
      return;
    }
    setSuccess("Submitted for review. You will be notified once approved.");
    setTimeout(() => router.push("/dashboard"), 2000);
  }

  return (
    <main className="mx-auto max-w-2xl p-4 sm:p-6">
      <h1 className="text-2xl font-extrabold text-white mb-2">
        Identity verification
      </h1>
      <p className="mb-6 text-sm" style={{ color: "rgba(226,232,240,0.45)" }}>
        Complete KYC to unlock staking and withdrawals.
      </p>
      <div className="glass p-6 space-y-5">
        {error && <p className="alert-red text-sm">{error}</p>}
        {success && <p className="alert-green text-sm">{success}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "rgba(226,232,240,0.4)" }}
              >
                First name
              </label>
              <input
                value={form.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                className="input-dark w-full px-3 py-2.5 text-sm outline-none"
                required
              />
            </div>
            <div>
              <label
                className="block text-xs font-semibold uppercase tracking-widest mb-2"
                style={{ color: "rgba(226,232,240,0.4)" }}
              >
                Last name
              </label>
              <input
                value={form.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                className="input-dark w-full px-3 py-2.5 text-sm outline-none"
                required
              />
            </div>
          </div>
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "rgba(226,232,240,0.4)" }}
            >
              Date of birth
            </label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => update("dateOfBirth", e.target.value)}
              className="input-dark w-full px-3 py-2.5 text-sm outline-none"
              required
            />
          </div>
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "rgba(226,232,240,0.4)" }}
            >
              Document type
            </label>
            <select
              value={form.documentType}
              onChange={(e) => update("documentType", e.target.value)}
              className="select-dark w-full px-3 py-2.5 text-sm outline-none"
            >
              <option value="PASSPORT">Passport</option>
              <option value="DRIVERS_LICENSE">Driver's license</option>
              <option value="ID_CARD">ID card</option>
            </select>
          </div>
          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-widest mb-2"
              style={{ color: "rgba(226,232,240,0.4)" }}
            >
              Document number
            </label>
            <input
              value={form.documentNumber}
              onChange={(e) => update("documentNumber", e.target.value)}
              className="input-dark w-full px-3 py-2.5 text-sm outline-none"
              required
            />
          </div>
          <button
            disabled={loading}
            className="btn-primary w-full py-2.5 text-sm"
          >
            {loading ? "Submitting..." : "Submit KYC"}
          </button>
        </form>
      </div>
    </main>
  );
}
