"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Button } from "@/app/components/Button";
import { authApi } from "@/app/lib/auth-api";
import { useAuth } from "@/app/lib/auth-context";
import { verifyOTPSchema } from "@/app/utils/validation";

const OTPInput = dynamic(() =>
  import("@/app/components/OTPInput").then((mod) => mod.OTPInput),
);

export default function VerifyPage() {
  const router = useRouter();
  const { email } = useAuth();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (code: string) => {
    const parsed = verifyOTPSchema.safeParse({ code });
    if (!parsed.success) {
      setError(parsed.error.flatten().fieldErrors.code?.[0] ?? "Invalid OTP.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      await authApi.verifyOtp({ otp: code });
      router.push("/auth/signup/verified");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Email verification failed. Please try again.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualVerify = async () => {
    if (otp.length !== 4) {
      setError("OTP must be exactly 4 digits");
      return;
    }

    await handleVerify(otp);
  };

  return (
    <section className="relative flex w-full items-center justify-center bg-[#f7f8fc] px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.04),transparent_60%)]" />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-[#e5e7eb] bg-white p-13 shadow-[0_16px_30px_rgba(15,23,42,0.06)]">
        <div className="space-y-6 text-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-[-0.04em] text-[#2b2f38]">
              Verify your email
            </h1>
            <p className="mx-auto max-w-64 text-xs leading-5 text-[#8a96a3]">
              Enter the 4-digit verification code we sent to
              <span className="text-brand-orange"> {email}</span>
            </p>
          </div>

          <OTPInput
            value={otp}
            onChange={setOtp}
            onComplete={handleVerify}
            error={error}
            length={4}
          />

          <Button
            variant="primary"
            size="lg"
            onClick={handleManualVerify}
            isLoading={isLoading}
            disabled={isLoading || otp.length !== 4}
          >
            {isLoading ? "Verifying..." : "Confirm code"}
          </Button>

          <p className="text-xs text-[#8a96a3]">
            Didn&apos;t get the mail?{" "}
            <button
              type="button"
              className="text-brand-orange font-semibold hover:underline"
              onClick={() => router.push("/auth/signup/check-mail")}
            >
              Resend
            </button>
          </p>

          {error && (
            <p className="text-xs text-red-500" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
