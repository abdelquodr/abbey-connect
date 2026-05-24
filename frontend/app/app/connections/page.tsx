"use client";
import { useState } from "react";
import useSWR, { mutate } from "swr";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((r) => r.json());

export default function ConnectionsPage() {
  const { data: userData, error: userError } = useSWR(
    `${API_BASE}/v1/auth/me`,
    fetcher,
  );
  const { data, error } = useSWR(`${API_BASE}/v1/connections`, fetcher);
  const [recipientId, setRecipientId] = useState("");
  const [note, setNote] = useState("");

  if (userError || error)
    return <div className="p-8">Unable to load connections.</div>;
  if (!data || !userData) return <div className="p-8">Loading...</div>;

  const submitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API_BASE}/v1/connections`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ recipientId: Number(recipientId), note }),
    });
    setRecipientId("");
    setNote("");
    mutate(`${API_BASE}/v1/connections`);
  };

  const patchStatus = async (id: number, status: string) => {
    await fetch(`${API_BASE}/v1/connections/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ status }),
    });
    mutate(`${API_BASE}/v1/connections`);
  };

  const remove = async (id: number) => {
    await fetch(`${API_BASE}/v1/connections/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    mutate(`${API_BASE}/v1/connections`);
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
