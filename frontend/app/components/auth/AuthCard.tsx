import type { ReactNode } from "react";
import Link from "next/link";

interface AuthCardProps {
  title: string;
  subtitle?: string;
  description?: string;
  children: ReactNode;
  footerLabel?: string;
  footerLinkLabel?: string;
  footerHref?: string;
}

export function AuthCard({
  title,
  subtitle,
  description,
  children,
  footerLabel = "Already have an account?",
  footerLinkLabel = "Sign in",
  footerHref = "/auth/signin",
}: AuthCardProps) {
  return (
    <div className="relative z-10 w-full max-w-md rounded-lg border border-[#e5e7eb] bg-white p-13 shadow-[0_16px_30px_rgba(15,23,42,0.06)]">
      <h1 className="text-2xl pb-2 font-bold text-[#2b2f38]">{title}</h1>
      {subtitle && (
        <p className="mt-0 text-[13px] leading-[1.45] text-[#8A96A3]">
          {subtitle}
        </p>
      )}
      {description ? (
        <p className="mt-2 text-xs leading-5 text-[#a0aab5]">{description}</p>
      ) : null}
      <div className="mt-5">{children}</div>

      <p className="mt-6 text-xs leading-5 text-[#a0aab5]">
        By clicking the button above, you agree to our{" "}
        <Link href="#" className="text-brand-orange hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="text-brand-orange hover:underline">
          Privacy Policy
        </Link>
        .
      </p>

      <div className="mt-16 flex items-left gap-1 text-xs">
        <span className="text-[#7b8494]">{footerLabel}</span>
        <Link href={footerHref} className="text-brand-orange hover:underline">
          {footerLinkLabel}
        </Link>
      </div>
    </div>
  );
}
