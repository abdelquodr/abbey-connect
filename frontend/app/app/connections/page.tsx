"use client";
import { useState } from "react";
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
  const [recipientId, setRecipientId] = useState("");
  const [note, setNote] = useState("");

  if (userError || error)
    return <div className="p-8">Unable to load connections.</div>;
  if (!data || !userData) return <div className="p-8">Loading...</div>;

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    await backendRequest("/v1/connections", {
      method: "POST",
      body: JSON.stringify({ recipientId: Number(recipientId), note }),
    });
    setRecipientId("");
    setNote("");
    mutate(connectionsKey);
  };

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
    <div className="max-w-3xl mx-auto py-8">
      <h2 className="text-2xl font-semibold mb-4">Connections</h2>

      <form onSubmit={submitRequest} className="mb-6 grid grid-cols-3 gap-2">
        <input
          value={recipientId}
          onChange={(e) => setRecipientId(e.target.value)}
          placeholder="Recipient user id"
          className="p-2 border rounded col-span-1"
        />
        <input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Note (optional)"
          className="p-2 border rounded col-span-1"
        />
        <button className="col-span-1 bg-blue-600 text-white p-2 rounded">
          Send Request
        </button>
      </form>

      <div className="space-y-4">
        {data.map((c: any) => {
          const currentUserId = userData.user?.id;
          const isRequester = c.requester.id === currentUserId;
          const other = isRequester ? c.recipient : c.requester;
          return (
            <div
              key={c.id}
              className="p-4 bg-white rounded shadow flex justify-between items-center"
            >
              <div>
                <div className="font-semibold">{other.name || other.email}</div>
                <div className="text-sm text-gray-600">{c.note}</div>
                <div className="text-xs text-gray-500">Status: {c.status}</div>
              </div>
              <div className="flex gap-2">
                {c.status === "PENDING" && !isRequester && (
                  <>
                    <button
                      onClick={() => patchStatus(c.id, "ACCEPTED")}
                      className="px-3 py-1 bg-green-500 text-white rounded"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => patchStatus(c.id, "REJECTED")}
                      className="px-3 py-1 bg-yellow-500 text-white rounded"
                    >
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => remove(c.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded"
                >
                  Remove
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
