"use client";

import React, { memo, useId, useState } from "react";
import { FaEye } from "react-icons/fa";
import Image from "next/image";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const InputComponent = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      icon,
      iconPosition = "right",
      id,
      placeholder,
      type,
      ...props
    },
    ref,
  ) => {
    const reactId = useId();
    const inputId = id || `input-${reactId}`;
    const isPasswordField = type === "password";
    const [showPassword, setShowPassword] = useState(false);
    const placeholderText = typeof placeholder === "string" ? placeholder : "";
    const floatingLabelEnabled = !label && placeholderText.length > 0;
    const leftIcon =
      icon ??
      (isPasswordField ? (
        <Image
          src="/icons/lock_open.svg"
          alt="password"
          width={16}
          height={16}
        />
      ) : null);
    const rightIcon = isPasswordField ? (
      showPassword ? (
        <FaEye className="h-4 w-4 text-[#B0BABF]" aria-hidden="true" />
      ) : (
        <Image
          src="/icons/lock-eye.svg"
          alt="hide password"
          width={16}
          height={16}
        />
      )
    ) : icon && iconPosition === "right" ? (
      icon
    ) : null;
    const inputType = isPasswordField
      ? showPassword
        ? "text"
        : "password"
      : type;
    const inputClasses = [
      "flex h-10 w-full rounded-md border bg-white px-4 text-xs text-[#2b2f38] shadow-[0_1px_2px_rgba(15,23,42,0.03)] outline-none transition",
      floatingLabelEnabled
        ? "placeholder-transparent"
        : "placeholder:text-[#a0aab5]",
      "focus:ring-0 focus:shadow-[0_0_0_0.5px_#FF8600]",
      error
        ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
        : "border-[#e5e7eb] focus:border-brand-orange",
      leftIcon ? "pl-10" : "",
      rightIcon ? "pr-10" : "",
      props.className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div className="w-full mt-7">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-xs font-medium text-[#B0BABF]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon ? (
            <div className="pointer-events-none absolute left-4 text-[#5b6871]">
              {leftIcon}
            </div>
          ) : null}
          <input
            ref={ref}
            id={inputId}
            className={`${inputClasses} peer`}
            type={inputType}
            placeholder={floatingLabelEnabled ? " " : placeholder}
            aria-label={
              !label && placeholderText ? placeholderText : props["aria-label"]
            }
            aria-describedby={error ? `${inputId}-error` : undefined}
            {...props}
          />
          {floatingLabelEnabled ? (
            <label
              htmlFor={inputId}
              className={`pointer-events-none absolute ${leftIcon ? "left-10" : "left-0"} top-1/2 -translate-y-1/2 bg-white px-1 pt-0 leading-none text-xs text-[#a0aab5] transition-all duration-200 peer-placeholder-shown:${leftIcon ? "left-10" : "left-0"} peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs peer-focus:left-0 peer-focus:-top-4 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-[#5b6871] peer-[:not(:placeholder-shown)]:left-0 peer-[:not(:placeholder-shown)]:-top-4 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[#5b6871]`}
            >
              {placeholderText}
            </label>
          ) : null}
          {rightIcon ? (
            isPasswordField ? (
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-4 text-[#5b6871] transition hover:text-[#2b2f38]"
              >
                {rightIcon}
              </button>
            ) : (
              <div className="pointer-events-none absolute right-4 text-[#5b6871]">
                {rightIcon}
              </div>
            )
          ) : null}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="mt-1 text-xs text-red-500"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

InputComponent.displayName = "Input";

export const Input = memo(InputComponent);
