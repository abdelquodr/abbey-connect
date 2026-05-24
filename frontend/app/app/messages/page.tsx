"use client";

import { useEffect, useMemo, useState } from "react";
import useSWR, { mutate } from "swr";
import {
  backendFetcher,
  backendRequest,
  backendUrl,
} from "@/app/lib/backend-api";
import { MessageComposer } from "./components/MessageComposer";

type AuthMeResponse = {
  user: {
    id: number;
  };
};

type ContactUser = {
  id: number;
  email: string;
  name?: string | null;
  headline?: string | null;
  avatarUrl?: string | null;
};

type ConnectionRow = {
  id: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  requester: ContactUser;
  recipient: ContactUser;
};

type MessageRow = {
  id: number;
  content: string;
  createdAt: string;
  sender: ContactUser;
};

type MessagesResponse = {
  results: MessageRow[];
};

export default function MessagesPage() {
  const authMeKey = backendUrl("/v1/auth/me");
  const connectionsKey = backendUrl("/v1/connections");
  const { data: authMeData, error: authMeError } = useSWR<AuthMeResponse>(
    authMeKey,
    backendFetcher,
  );
  const { data: connectionsData, error: connectionsError } = useSWR<
    ConnectionRow[]
  >(connectionsKey, backendFetcher);

  const [contactSearch, setContactSearch] = useState("");
  const [selectedConnectionId, setSelectedConnectionId] = useState<
    number | null
  >(null);
  const [draft, setDraft] = useState("");

  const statusMessage = authMeError
    ? "Sign in to view approved contacts and messages."
    : connectionsError
      ? "Messages are visible, but approved contacts could not be loaded right now."
      : null;

  const approvedContacts = useMemo(() => {
    if (!connectionsData || !authMeData?.user?.id) {
      return [] as Array<{ connectionId: number; contact: ContactUser }>;
    }

    const currentUserId = authMeData.user.id;

    return connectionsData
      .filter((row) => row.status === "ACCEPTED")
      .map((row) => ({
        connectionId: row.id,
        contact:
          row.requester.id === currentUserId ? row.recipient : row.requester,
      }));
  }, [connectionsData, authMeData?.user?.id]);

  const filteredContacts = useMemo(() => {
    const q = contactSearch.trim().toLowerCase();
    if (!q) {
      return approvedContacts;
    }

    return approvedContacts.filter(({ contact }) => {
      const searchable = `${contact.name ?? ""} ${contact.email}`.toLowerCase();
      return searchable.includes(q);
    });
  }, [approvedContacts, contactSearch]);

  const selectedConnection = useMemo(
    () =>
      approvedContacts.find(
        (entry) => entry.connectionId === selectedConnectionId,
      ) ?? null,
    [approvedContacts, selectedConnectionId],
  );

  const messagesKey =
    selectedConnectionId !== null
      ? backendUrl(`/v1/messages?connectionId=${selectedConnectionId}`)
      : null;

  const { data: messagesData, error: messagesError } = useSWR<MessagesResponse>(
    messagesKey,
    backendFetcher,
  );

  const selectedContact = selectedConnection?.contact ?? null;

  const selectedConnectionMessages = messagesData?.results ?? [];
  const messageListError = messagesError;
  const messagesLoading =
    Boolean(selectedContact) && !messagesData && !messageListError;

  useEffect(() => {
    if (!selectedConnectionId && approvedContacts.length > 0) {
      setSelectedConnectionId(approvedContacts[0].connectionId);
    }
  }, [approvedContacts, selectedConnectionId]);

  const sendMessage = async () => {
    if (!selectedConnectionId || !draft.trim()) {
      return;
    }

    await backendRequest("/v1/messages", {
      method: "POST",
      body: JSON.stringify({
        connectionId: selectedConnectionId,
        content: draft.trim(),
      }),
    });
    setDraft("");
    if (messagesKey) {
      mutate(messagesKey);
    }
  };

  return (
    <section className="space-y-4">
      {statusMessage ? (
        <div className="rounded-3xl border border-[#fcd9a5] bg-[#fff7eb] p-4 text-sm text-[#7c4a00] shadow-[0_12px_34px_rgba(17,24,39,0.06)]">
          {statusMessage}
        </div>
      ) : null}

      <div className="grid min-h-[calc(100vh-220px)] grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-3xl bg-white p-4 shadow-[0_12px_34px_rgba(17,24,39,0.06)]">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[#8a96a3]">
            connection
          </h2>

          <input
            type="search"
            value={contactSearch}
            onChange={(event) => setContactSearch(event.target.value)}
            placeholder="Search connected users"
            className="mt-3 h-10 w-full rounded-xl border border-[#e5e7eb] px-3 text-sm outline-none focus:border-[#f59e0b]"
          />

          <div className="mt-4 space-y-2">
            {filteredContacts.length === 0 ? (
              <p className="rounded-xl bg-[#f7f8fc] p-3 text-sm text-[#8a96a3]">
                No approved contacts yet. A user only appears here after the
                sent request is approved.
              </p>
            ) : (
              filteredContacts.map(({ connectionId, contact }) => (
                <button
                  key={connectionId}
                  type="button"
                  onClick={() => setSelectedConnectionId(connectionId)}
                  className={`w-full rounded-xl border px-3 py-2 text-left transition ${
                    selectedConnectionId === connectionId
                      ? "border-[#f59e0b] bg-[#fff7eb]"
                      : "border-[#eef2f7] bg-white hover:border-[#fcd9a5]"
                  }`}
                >
                  <p className="truncate text-sm font-semibold text-[#2b2f38]">
                    {contact.name || contact.email}
                  </p>
                  <p className="truncate text-xs text-[#8a96a3]">
                    {contact.email}
                  </p>
                </button>
              ))
            )}
          </div>
        </aside>

        <div className="flex flex-col rounded-3xl bg-white shadow-[0_12px_34px_rgba(17,24,39,0.06)]">
          <div className="border-b border-[#eef2f7] px-5 py-4">
            <p className="mt-1 text-sm text-[#2b2f38]">
              {selectedContact
                ? `Chatting with ${selectedContact.name || selectedContact.email}`
                : "Select an approved contact to start chatting."}
            </p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            {selectedContact ? (
              messagesLoading ? (
                <p className="text-sm text-[#8a96a3]">Loading messages...</p>
              ) : messageListError ? (
                <p className="text-sm text-[#8a96a3]">
                  Failed to load messages.
                </p>
              ) : selectedConnectionMessages.length > 0 ? (
                selectedConnectionMessages.map((message) => (
                  <div
                    key={message.id}
                    className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                      message.sender.id === authMeData?.user?.id
                        ? "ml-auto bg-[#fff1df] text-[#2b2f38]"
                        : "bg-[#f3f4f6] text-[#2b2f38]"
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="mt-1 text-[10px] text-[#8a96a3]">
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#8a96a3]">
                  No messages yet. Send the first message.
                </p>
              )
            ) : (
              <p className="text-sm text-[#8a96a3]">
                No approved contact selected yet. Once a request is approved,
                the contact appears here.
              </p>
            )}
          </div>

          <div className="border-t border-[#eef2f7] p-4">
            <MessageComposer
              value={draft}
              onChange={setDraft}
              onSubmit={sendMessage}
              disabled={!selectedContact || Boolean(authMeError)}
              onEmoji={(emoji) => setDraft((current) => `${current}${emoji}`)}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
