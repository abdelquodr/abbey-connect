"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/Button";
import Image from "next/image";
import { authApi } from "@/app/lib/auth-api";
import { useAuth } from "@/app/lib/auth-context";

export default function CheckMailPage() {
  const router = useRouter();
  const { email } = useAuth();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = async () => {
    if (!email) {
      setError("No email found for resend. Please register again.");
      return;
    }

    setIsResending(true);
    setError("");
    setSuccess("");

    try {
      const response = await authApi.resendVerificationEmail({ email });
      setSuccess(
        typeof response === "object" &&
          response !== null &&
          "message" in response
          ? String(
              (response as { message?: unknown }).message ??
                "Verification email sent.",
            )
          : "Verification email sent.",
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to resend email.",
      );
    } finally {
      setIsResending(false);
    }
  };

  return (
    <section className="relative flex w-full items-center justify-center bg-[#f7f8fc] px-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.04),transparent_60%)]" />
      <div className="relative z-10 w-full max-w-md rounded-lg border border-[#e5e7eb] bg-white p-13 shadow-[0_16px_30px_rgba(15,23,42,0.06)]">
        <div className="space-y-6 text-center">
          <div className="flex justify-center mb-0">
            <Image
              src="/icons/check-email.svg"
              alt="check-mail"
              width={64}
              height={64}
              className="h-20 w-20"
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-[-0.04em] text-[#2b2f38]">
              Check your mailbox !
            </h1>
            <p className="mx-auto max-w-60 text-xs leading-5 text-[#8a96a3]">
              We&apos;ve sent an email to{" "}
              <span className="font-semibold">{email}</span> with a 4-digit
              verification code. Check your inbox to activate your account.
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/auth/signup/verify")}
          >
            Confirm Email
          </Button>

          <p className="text-xs text-[#8a96a3]">
            Didn&apos;t get the mail?{" "}
            <button
              type="button"
              disabled={isResending}
              onClick={handleResendEmail}
              className="text-brand-orange font-semibold hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isResending ? "Resending..." : "Resend"}
            </button>
          </p>
          {success && (
            <p className="text-xs text-green-600" role="status">
              {success}
            </p>
          )}
          {error && (
            <div className="text-center" role="alert">
              <p className="text-xs text-red-500">{error}</p>
              <Link
                href="/auth/signup"
                className="mt-1 inline-block text-xs font-semibold text-brand-orange hover:underline"
              >
                Register here
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
