"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { apiPost } from "@/lib/api";

function VerifyContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("Verifying...");

  useEffect(() => {
    const token = params.get("token");
    if (!token) {
      setStatus("Missing verification token.");
      return;
    }
    apiPost("/auth/verify-email", { token })
      .then(async (res) => {
        if (res.ok) {
          setStatus("Email verified. Redirecting to login...");
          setTimeout(() => router.push("/login"), 1500);
        } else {
          const body = await res.json().catch(() => ({}));
          setStatus(body.error || "Verification failed.");
        }
      })
      .catch(() => setStatus("Network error. Please try again."));
  }, [params, router]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4" style={{backgroundColor:"#0a0a0f"}}>
      <div className="w-full max-w-md glass p-8 text-center">
        <h1 className="mb-4 text-2xl font-extrabold text-white">Email verification</h1>
        <p className="text-sm" style={{color:"rgba(226,232,240,0.55)"}}>{status}</p>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p className="p-6 text-center text-sm" style={{color:"rgba(226,232,240,0.45)"}}>Loading...</p>}>
      <VerifyContent />
    </Suspense>
  );
}
