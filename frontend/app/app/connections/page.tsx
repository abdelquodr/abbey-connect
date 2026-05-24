"use client";
import useSWR, { mutate } from "swr";
import {
  backendFetcher,
  backendRequest,
  backendUrl,
} from "@/app/lib/backend-api";

export default function ConnectionsPage() {
  const authMeKey = backendUrl("/v1/auth/me");
  const connectionsKey = backendUrl("/v1/connections");
  const { data: userData, error: userError } = useSWR(
    authMeKey,
    backendFetcher,
  );
  const { data, error } = useSWR(connectionsKey, backendFetcher);

  if (userError || error)
    return <div className="p-8">Unable to load connections.</div>;
  if (!data || !userData) return <div className="p-8">Loading...</div>;

  const patchStatus = async (id: number, status: string) => {
    await backendRequest(`/v1/connections/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    mutate(connectionsKey);
  };

  const remove = async (id: number) => {
    await backendRequest(`/v1/connections/${id}`, {
      method: "DELETE",
    });
    mutate(connectionsKey);
  };

  return (
    <section className="space-y-4">
      <div className="rounded-3xl bg-white p-6 shadow-[0_12px_34px_rgba(17,24,39,0.06)]">
        <h2 className="text-2xl font-bold tracking-[-0.04em] text-[#2b2f38]">
          Connections
        </h2>
        <p className="mt-1 text-sm text-[#8a96a3]">
          Review your pending, accepted, and rejected connections here.
        </p>
      </div>

      <div className="space-y-4">
        {data.map((c: any) => {
          const currentUserId = userData.user?.id;
          const isRequester = c.requester.id === currentUserId;
          const other = isRequester ? c.recipient : c.requester;
          return (
            <div
              key={c.id}
              className="flex flex-col gap-4 rounded-3xl bg-white p-5 shadow-[0_12px_34px_rgba(17,24,39,0.06)] sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="text-base font-semibold text-[#2b2f38]">
                  {other.name || other.email}
                </div>
                <div className="mt-1 text-sm text-[#8a96a3]">{c.note}</div>
                <div className="mt-2 text-xs font-medium uppercase tracking-wide text-[#8a96a3]">
                  Status: {c.status}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {c.status === "PENDING" && !isRequester && (
                  <>
                    <button
                      onClick={() => patchStatus(c.id, "ACCEPTED")}
                      className="rounded-2xl bg-brand-orange px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-orange/90"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => patchStatus(c.id, "REJECTED")}
                      className="rounded-2xl border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#4b505a] transition hover:border-[#fcd9a5] hover:text-brand-orange"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => remove(c.id)}
                  className="rounded-2xl bg-[#fff1df] px-4 py-2 text-sm font-semibold text-[#c97a12] transition hover:bg-[#ffe7c3] hover:text-brand-orange"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
