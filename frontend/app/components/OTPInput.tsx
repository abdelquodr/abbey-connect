"use client";

import React, { useRef, memo } from "react";
import Link from "next/link";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: string;
  length?: number;
}

const OTPInputComponent: React.FC<OTPInputProps> = ({
  value,
  onChange,
  onComplete,
  error,
  length = 4,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return;

    const newValue = value.split("");
    newValue[index] = char;
    const updatedValue = newValue.join("");

    onChange(updatedValue);

    // Auto-focus next input
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Call onComplete when all digits are entered
    if (updatedValue.length === length && onComplete) {
      onComplete(updatedValue);
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newValue = value.split("");
      newValue[index] = "";
      onChange(newValue.join(""));

      // Auto-focus previous input if empty
      if (!value[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text/plain");
    const numericText = pastedText.replace(/\D/g, "").slice(0, length);

    onChange(numericText);

    if (numericText.length === length && onComplete) {
      onComplete(numericText);
    }

    // Focus last input
    if (numericText.length > 0) {
      inputRefs.current[Math.min(numericText.length - 1, length - 1)]?.focus();
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-3 justify-center">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            maxLength={1}
            inputMode="numeric"
            value={value[index] || ""}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            aria-label={`OTP digit ${index + 1}`}
            className={`w-14 h-14 text-center text-2xl font-bold border-2 rounded-lg transition-all duration-200 focus:outline-none ${
              error
                ? "border-red-500 focus:ring-1 focus:ring-red-300"
                : "border-brand-light-grey focus:border-brand-orange focus:ring-1 focus:ring-brand-orange focus:ring-opacity-30"
            }`}
          />
        ))}
      </div>
      {error && (
        <div className="mt-2 text-center" role="alert">
          <p className="text-xs text-error">{error}</p>
          {error.includes("No authentication token found") ? (
            <Link
              href="/auth/signup"
              className="mt-1 inline-block text-xs font-semibold text-brand-orange hover:underline"
            >
              Register here
            </Link>
          ) : null}
        </div>
      )}
    </div>
  );
};

OTPInputComponent.displayName = "OTPInput";

export const OTPInput = memo(OTPInputComponent);
