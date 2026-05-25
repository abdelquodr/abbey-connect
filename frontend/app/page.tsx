"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { backendFetcher, backendUrl } from "@/app/lib/backend-api";

type AuthMeResponse = {
  user?: {
    id?: number;
  };
};

export default function Page() {
  const router = useRouter();
  const { data, error } = useSWR<AuthMeResponse>(
    backendUrl("/v1/auth/me"),
    backendFetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  );

  useEffect(() => {
    if (data?.user) {
      router.replace("/app");
      return;
    }

    if (error) {
      router.replace("/auth/signin");
    }
  }, [data, error, router]);

  return <div className="p-8">Loading...</div>;
}
