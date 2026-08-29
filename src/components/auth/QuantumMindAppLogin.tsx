"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendAppLoginEmailOtp } from "@/features/auth/actions/sendAppLoginEmailOtp";
import { verifyAppLoginEmailOtp } from "@/features/auth/actions/verifyAppLoginEmailOtp";
import { checkAppAccess } from "@/features/masterclass-app/actions/checkAppAccess";

type Step = "email" | "otp";

// Quantum Mind App™ login — drop this into whichever page/route is the
// actual login entry point for app.mindurmind.org.in (no single existing
// "app login page" file was found in this codebase to wire it into
// directly). Two-step email OTP UI (no SMS/phone involved — see
// sendAppLoginEmailOtp.ts), then a paywall check before granting entry.
// Single-device enforcement already happened inside verifyAppLoginEmailOtp
// (signOut({ scope: 'others' })) — nothing more to do here for that.
export default function QuantumMindAppLogin(): React.JSX.Element {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSendOtp(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setPending(true);
    const result = await sendAppLoginEmailOtp({ email });
    setPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setStep("otp");
  }

  async function handleVerifyOtp(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    setPending(true);

    const verifyResult = await verifyAppLoginEmailOtp({ email, token: code });
    if (!verifyResult.success) {
      setPending(false);
      setError(verifyResult.error);
      return;
    }

    const accessResult = await checkAppAccess();
    setPending(false);

    if (accessResult.status === "unpaid") {
      setError("Your free practice window has ended. Purchase the ₹499 plan or join the 30-Day Quantum Speed Reading Live Masterclass to continue.");
      return;
    }

    router.push("/dashboard");
  }

  if (step === "email") {
    return (
      <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
          Email address
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="rounded-sm border border-line-strong bg-panel px-4 py-3 text-ink"
          />
        </label>
        {error !== null && <p className="text-sm text-rose">{error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-gold px-6 py-3 text-sm font-semibold text-[#1B1508] disabled:opacity-60"
        >
          {pending ? "Sending code…" : "Send OTP"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
      <p className="text-sm text-ink-dim">Enter the 6-digit code sent to {email}.</p>
      <label className="flex flex-col gap-1.5 text-sm font-medium text-ink">
        Verification code
        <input
          type="text"
          inputMode="numeric"
          required
          maxLength={6}
          value={code}
          onChange={(event) => setCode(event.target.value)}
          className="rounded-sm border border-line-strong bg-panel px-4 py-3 tracking-[0.3em] text-ink"
        />
      </label>
      {error !== null && <p className="text-sm text-rose">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-sm bg-gold px-6 py-3 text-sm font-semibold text-[#1B1508] disabled:opacity-60"
      >
        {pending ? "Verifying…" : "Verify & Continue"}
      </button>
    </form>
  );
}
