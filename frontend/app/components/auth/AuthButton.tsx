import type { ReactNode } from "react";

import Link from "next/link";

interface AuthButtonProps {
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  href?: string;
  onClick?: () => void;
}

export function AuthButton({
  icon,
  children,
  className,
  ariaLabel,
  href,
  onClick,
}: AuthButtonProps) {
  const baseClasses =
    "flex h-10 w-full items-center justify-center gap-2 rounded-md border border-[#e5e7eb] bg-white text-sm font-medium text-[#6b7280] transition hover:bg-[#fafafa] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#cbd5e1] focus-visible:ring-offset-2";
  const buttonClasses = [baseClasses, className].filter(Boolean).join(" ");

  if (href) {
    return (
      <Link href={href} className={buttonClasses}>
        {icon ? <span aria-hidden="true">{icon}</span> : null}
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={buttonClasses}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}
