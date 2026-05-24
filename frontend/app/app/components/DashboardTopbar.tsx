"use client";

import { useMemo, useState } from "react";
import useSWR, { mutate } from "swr";
import { Plus } from "lucide-react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  backendFetcher,
  backendRequest,
  backendUrl,
} from "@/app/lib/backend-api";

type UserSummary = {
  id: number;
  email: string;
  name?: string | null;
  headline?: string | null;
};

type PeopleResponse = {
  results: UserSummary[];
};

type AuthMeResponse = {
  user: {
    id: number;
  };
};

type ConnectionRow = {
  id: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  note?: string | null;
  requester: { id: number };
  recipient: { id: number };
};

const titlesByPath: Record<string, string> = {
  "/app": "Dashboard",
  "/app/connections": "Connections",
  "/app/messages": "Messages",
  "/app/profile": "Profile",
};

const resolveTitle = (pathname: string) => {
  const direct = titlesByPath[pathname];
  if (direct) return direct;
  if (pathname.startsWith("/app/messages")) return "Messages";
  if (pathname.startsWith("/app/connections")) return "Connections";
  if (pathname.startsWith("/app/profile")) return "Profile";
  return "Dashboard";
};

export function DashboardTopbar() {
  const pathname = usePathname();
  const title = resolveTitle(pathname);
  const [search, setSearch] = useState("");
  const [feedback, setFeedback] = useState("");
  const [connectingUserId, setConnectingUserId] = useState<number | null>(null);
  const [sentRequestsOpen, setSentRequestsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const authMeKey = backendUrl("/v1/auth/me");
  const connectionsKey = backendUrl("/v1/connections");
  const peopleKey =
    search.trim().length >= 2
      ? backendUrl(
          `/v1/users/people?search=${encodeURIComponent(search.trim())}&limit=8`,
        )
      : null;

  const { data: authMe } = useSWR<AuthMeResponse>(authMeKey, backendFetcher);
  const { data: peopleData } = useSWR<PeopleResponse>(
    peopleKey,
    backendFetcher,
  );
  const { data: connections } = useSWR<ConnectionRow[]>(
    connectionsKey,
    backendFetcher,
  );

  const connectionStatusByUserId = useMemo(() => {
    const currentUserId = authMe?.user?.id;
    if (!currentUserId || !connections) {
      return new Map<number, ConnectionRow["status"]>();
    }

    const map = new Map<number, ConnectionRow["status"]>();
    for (const row of connections) {
      const otherId =
        row.requester.id === currentUserId
          ? row.recipient.id
          : row.requester.id;
      map.set(otherId, row.status);
    }
    return map;
  }, [authMe?.user?.id, connections]);

  const incomingRequests = useMemo(() => {
    const currentUserId = authMe?.user?.id;
    if (!currentUserId || !connections) {
      return [] as Array<ConnectionRow & { otherUser: UserSummary }>;
    }

    return connections
      .filter(
        (row) => row.status === "PENDING" && row.recipient.id === currentUserId,
      )
      .map((row) => ({
        ...row,
        otherUser: row.requester as UserSummary,
      }));
  }, [authMe?.user?.id, connections]);

  const outgoingRequests = useMemo(() => {
    const currentUserId = authMe?.user?.id;
    if (!currentUserId || !connections) {
      return [] as Array<ConnectionRow & { otherUser: UserSummary }>;
    }

    return connections
      .filter(
        (row) => row.status === "PENDING" && row.requester.id === currentUserId,
      )
      .map((row) => ({
        ...row,
        otherUser: row.recipient as UserSummary,
      }));
  }, [authMe?.user?.id, connections]);

  const visiblePeople = useMemo(() => {
    const meId = authMe?.user?.id;
    return (peopleData?.results ?? []).filter((person) => person.id !== meId);
  }, [authMe?.user?.id, peopleData?.results]);

  const handleConnect = async (recipientId: number) => {
    setConnectingUserId(recipientId);
    setFeedback("");
    try {
      await backendRequest("/v1/connections", {
        method: "POST",
        body: JSON.stringify({ recipientId }),
      });
      setFeedback("Connection request sent.");
      mutate(connectionsKey);
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Failed to send request.",
      );
    } finally {
      setConnectingUserId(null);
    }
  };

  const updateRequestStatus = async (
    connectionId: number,
    status: "ACCEPTED" | "REJECTED",
  ) => {
    setFeedback("");
    try {
      await backendRequest(`/v1/connections/${connectionId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      mutate(connectionsKey);
      if (status === "ACCEPTED") {
        setFeedback("Connection approved.");
      }
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Failed to update request.",
      );
    }
  };

  const revokeRequest = async (connectionId: number) => {
    setFeedback("");
    try {
      await backendRequest(`/v1/connections/${connectionId}`, {
        method: "DELETE",
      });
      mutate(connectionsKey);
      setFeedback("Request revoked.");
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Failed to revoke request.",
      );
    }
  };

  return (
    <header className="flex items-start pt-7 justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-[-0.04em] text-[#2b2f38]">
          {title}
        </h1>
      </div>

      <div className="relative flex items-center gap-3">
        <label className="relative hidden w-[30rem] items-center lg:flex">
          <Image
            src="/icons/search.svg"
            className="h-5 w-5 absolute left-3"
            alt="search"
            width={4}
            height="4"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search users by name"
            aria-label="Search users"
            className="h-11 w-full rounded-[18px] border border-transparent bg-white pl-11 pr-4 text-sm text-[#2b2f38] shadow-[0_10px_24px_rgba(17,24,39,0.06)] outline-none placeholder:text-[#a0aab5] focus:border-brand-orange focus:ring-1 focus:ring-brand-orange"
          />
        </label>

        {search.trim().length >= 2 ? (
          <div className="absolute right-0 top-14 z-20 hidden w-[30rem] rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-[0_14px_36px_rgba(17,24,39,0.12)] lg:block">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-[#8a96a3]">
              Navbar Search (DB Users)
            </p>
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {visiblePeople.length === 0 ? (
                <p className="px-2 py-3 text-sm text-[#8a96a3]">
                  No users found.
                </p>
              ) : (
                visiblePeople.map((person) => {
                  const status = connectionStatusByUserId.get(person.id);
                  const statusLabel =
                    status === "ACCEPTED"
                      ? "Connected"
                      : status === "PENDING"
                        ? "Pending"
                        : "Connect";
                  const disabled =
                    status === "ACCEPTED" || status === "PENDING";

                  const displayName = person.name || person.email;

                  return (
                    <div
                      key={person.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setSearch(person.name || person.email)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSearch(person.name || person.email);
                        }
                      }}
                      className="flex items-center justify-between rounded-xl border border-[#eef2f6] px-3 py-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#2b2f38]">
                          {displayName}
                        </p>
                        <p className="truncate text-xs text-[#8a96a3]">
                          {person.email}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleConnect(person.id);
                        }}
                        disabled={disabled || connectingUserId === person.id}
                        className="ml-3 rounded-full bg-[#fff1df] px-3 py-1 text-xs font-semibold text-brand-orange disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {connectingUserId === person.id
                          ? "Sending..."
                          : statusLabel}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
            {feedback ? (
              <p className="px-2 pt-2 text-xs text-[#8a96a3]" role="status">
                {feedback}
              </p>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          aria-label="Add new item"
          onClick={() => setSentRequestsOpen((open) => !open)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#2b2f38] shadow-[0_10px_24px_rgba(17,24,39,0.06)] transition hover:text-brand-orange"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
          {outgoingRequests.length > 0 ? (
            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          ) : null}
        </button>

        {sentRequestsOpen ? (
          <div className="absolute right-12 top-14 z-30 hidden w-[26rem] rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-[0_14px_36px_rgba(17,24,39,0.12)] lg:block">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-[#8a96a3]">
              Sent Requests
            </p>
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {outgoingRequests.length === 0 ? (
                <p className="px-2 py-3 text-sm text-[#8a96a3]">
                  No pending requests sent.
                </p>
              ) : (
                outgoingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-xl border border-[#eef2f6] px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#2b2f38]">
                        {request.otherUser.name || request.otherUser.email}
                      </p>
                      <p className="truncate text-xs text-[#8a96a3]">
                        {request.otherUser.email}
                      </p>
                      {request.note ? (
                        <p className="mt-1 text-xs text-[#8a96a3]">
                          {request.note}
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() => revokeRequest(request.id)}
                        className="rounded-full bg-[#f3f4f6] px-3 py-1 text-xs font-semibold text-[#2b2f38]"
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}

        <button
          type="button"
          aria-label="Notifications"
          onClick={() => setNotificationsOpen((open) => !open)}
          className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#2b2f38] shadow-[0_10px_24px_rgba(17,24,39,0.06)] transition hover:text-brand-orange"
        >
          <Image
            src="/icons/bell.svg"
            className="h-5 w-5"
            alt="bell"
            width={4}
            height="4"
          />
          {incomingRequests.length > 0 ? (
            <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          ) : null}
        </button>

        {notificationsOpen ? (
          <div className="absolute right-0 top-14 z-30 hidden w-[26rem] rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-[0_14px_36px_rgba(17,24,39,0.12)] lg:block">
            <p className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-[#8a96a3]">
              Connection Requests
            </p>
            <div className="max-h-72 space-y-2 overflow-y-auto">
              {incomingRequests.length === 0 ? (
                <p className="px-2 py-3 text-sm text-[#8a96a3]">
                  No pending requests.
                </p>
              ) : (
                incomingRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-xl border border-[#eef2f6] px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#2b2f38]">
                        {request.otherUser.name || request.otherUser.email}
                      </p>
                      <p className="truncate text-xs text-[#8a96a3]">
                        {request.otherUser.email}
                      </p>
                      {request.note ? (
                        <p className="mt-1 text-xs text-[#8a96a3]">
                          {request.note}
                        </p>
                      ) : null}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateRequestStatus(request.id, "ACCEPTED")
                        }
                        className="rounded-full bg-brand-orange px-3 py-1 text-xs font-semibold text-white"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateRequestStatus(request.id, "REJECTED")
                        }
                        className="rounded-full bg-[#f3f4f6] px-3 py-1 text-xs font-semibold text-[#2b2f38]"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}
