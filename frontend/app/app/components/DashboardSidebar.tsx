"use client";

import Link from "next/link";
import { Lexend } from "next/font/google";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import useSWR from "swr";
import { LogOut, Mail, UserCircle2 } from "lucide-react";
import { LuUsersRound } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { useAuth } from "@/app/lib/auth-context";
import {
  backendFetcher,
  backendRequest,
  backendUrl,
} from "@/app/lib/backend-api";

type AuthMeResponse = {
  user: {
    name?: string | null;
    headline?: string | null;
    avatarUrl?: string | null;
    email?: string | null;
  };
};

const lexend = Lexend({
  subsets: ["latin"],
  display: "swap",
});

const navItems = [
  { label: "Messages", icon: Mail, href: "/app/messages" },
  { label: "Connections", icon: LuUsersRound, href: "/app/connections" },
  { label: "Profile", icon: IoSettingsOutline, href: "/app/profile" },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { clear } = useAuth();
  const { data: authMeData } = useSWR<AuthMeResponse>(
    backendUrl("/v1/auth/me"),
    backendFetcher,
  );

  const displayName =
    authMeData?.user.name?.trim() || authMeData?.user.email || "Loading...";
  const displayHeadline = authMeData?.user.headline?.trim() || "";
  const avatarSrc = authMeData?.user.avatarUrl || "/img/base_user.png";

  const handleLogout = async () => {
    try {
      await backendRequest("/v1/auth/logout", { method: "POST" });
    } catch {
      // Clear the client session even if the server cookie cleanup fails.
    } finally {
      clear();
      router.replace("/auth/signin");
    }
  };

  return (
    <aside
      className={`${lexend.className} flex h-full flex-col rounded-[32px] bg-white px-4 py-5 shadow-[0_12px_34px_rgba(17,24,39,0.06)]`}
    >
      <div className="flex w-full flex-col items-center space-y-10">
        <Link
          href="/app"
          className="flex items-center justify-center gap-2 px-3 pt-1"
        >
          <Image
            src="/logo.svg"
            alt="Abbey"
            width={100}
            height={100}
            className="h-10 w-auto"
          />
          <span className="text-xl font-bold tracking-[-0.03em] text-[#2b2f38]">
            Abbey
          </span>
        </Link>

        <nav aria-label="Dashboard navigation" className="w-full space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href
              ? item.href === "/app"
                ? pathname === "/app"
                : pathname.startsWith(item.href)
              : false;

            const sharedClassName =
              "group relative flex w-full items-center gap-3 rounded-[18px] px-3 py-1.5 text-sm font-medium transition";
            const itemClassName = `relative flex w-full items-center gap-3 rounded-[18px] px-4 py-3.5 ${
              isActive
                ? "bg-[#fff7eb] text-brand-orange shadow-[0_12px_28px_rgba(17,24,39,0.06)]"
                : "text-[#8a96a3] hover:bg-[#f7f8fc] hover:text-[#4b505a]"
            }`;

            const content = (
              <>
                {isActive ? (
                  <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-brand-orange" />
                ) : null}
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </>
            );

            return item.href ? (
              <Link
                key={item.label}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={sharedClassName}
              >
                <span className={itemClassName}>{content}</span>
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                className={sharedClassName}
              >
                <span className={itemClassName}>{content}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto w-full px-2 pt-6">
        <div className="rounded-[26px] border border-[#eef2f7] bg-[#f7f8fc] p-4 shadow-[0_12px_28px_rgba(17,24,39,0.04)]">
          <div className="relative flex items-center gap-3 rounded-2xl bg-[#f7f8fc] px-3 py-3">
            {authMeData?.user.avatarUrl ? (
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full ring-4 ring-white shadow-[0_8px_18px_rgba(17,24,39,0.12)]">
                <Image
                  src={avatarSrc}
                  alt={displayName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#fff1df] text-brand-orange ring-4 ring-white shadow-[0_8px_18px_rgba(17,24,39,0.12)]">
                <UserCircle2 className="h-7 w-7" aria-hidden="true" />
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#2b2f38]">
                {displayName}
              </p>
              <p className="truncate text-xs text-[#8a96a3]">
                {displayHeadline || " "}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#c97a12] transition hover:bg-[#fff1df] hover:text-brand-orange"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
