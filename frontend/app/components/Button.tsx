"use client";

import React, { memo } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "md" | "sm" | "lg";
  fullWidth?: boolean;
  isLoading?: boolean;
  children: React.ReactNode;
}

const ButtonComponent = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;

    const baseClasses = [
      "inline-flex items-center justify-center rounded-md text-sm font-semibold transition-colors",
      fullWidth ? "w-full" : "w-auto",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-orange/30 focus-visible:ring-offset-2",
      size === "sm"
        ? "h-9 px-4 text-xs"
        : size === "lg"
          ? "h-10 px-8"
          : "h-10 px-4",
    ].join(" ");

    const variantClasses =
      variant === "primary"
        ? isDisabled
          ? "bg-[#e5e7eb] text-[#c4c9d1] cursor-not-allowed"
          : "bg-brand-orange text-white hover:bg-brand-orange/90"
        : isDisabled
          ? "border border-[#e5e7eb] bg-white text-[#c4c9d1] cursor-not-allowed"
          : "border border-[#e5e7eb] bg-white text-[#6b7280] hover:bg-[#fafafa]";

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={`${baseClasses} ${variantClasses}`}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  },
);

ButtonComponent.displayName = "Button";

export const Button = memo(ButtonComponent);
