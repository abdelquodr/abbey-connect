"use client";
import useSWR from "swr";
import Link from "next/link";
import { backendFetcher, backendUrl } from "@/app/lib/backend-api";

type AuthMeResponse = {
  user: {
    name?: string | null;
    headline?: string | null;
  };
};

export default function AppPage() {
  const { data, error } = useSWR<AuthMeResponse>(
    backendUrl("/v1/auth/me"),
    backendFetcher,
  );

  if (error)
    return <div className="p-8">Unable to load. Are you logged in?</div>;
  if (!data) return <div className="p-8">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto py-12">
      <div className="flex items-center gap-4 mb-6">
        <div className="h-12 w-12 rounded-full bg-gray-200" />
        <div>
          <div className="text-lg font-semibold">{data.user.name}</div>
          <div className="text-sm text-gray-600">{data.user.headline}</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Link
          href="/app/people"
          className="col-span-1 p-4 bg-white rounded shadow text-center"
        >
          People
        </Link>
        <Link
          href="/app/connections"
          className="col-span-1 p-4 bg-white rounded shadow text-center"
        >
          Connections
        </Link>
        <Link
          href="/app/profile"
          className="col-span-1 p-4 bg-white rounded shadow text-center"
        >
          Edit profile
        </Link>
      </div>
    </div>
  );
}
