"use client";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR, { mutate } from "swr";
import {
  backendFetcher,
  backendRequest,
  backendUrl,
} from "@/app/lib/backend-api";

type ProfileUser = {
  id: number;
  email: string;
  name?: string | null;
  headline?: string | null;
  bio?: string | null;
  city?: string | null;
  avatarUrl?: string | null;
};

type AuthMeResponse = {
  user: ProfileUser;
};

const fieldClassName =
  "w-full rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#2b2f38] outline-none transition placeholder:text-[#a0aab5] focus:border-brand-orange focus:ring-1 focus:ring-brand-orange";

export default function ProfilePage() {
  const router = useRouter();
  const authMeKey = backendUrl("/v1/auth/me");
  const { data, error } = useSWR<AuthMeResponse>(authMeKey, backendFetcher);
  const [form, setForm] = useState({
    name: "",
    headline: "",
    bio: "",
    city: "",
    avatarUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (data?.user) {
      setForm({
        name: data.user.name ?? "",
        headline: data.user.headline ?? "",
        bio: data.user.bio ?? "",
        city: data.user.city ?? "",
        avatarUrl: data.user.avatarUrl ?? "",
      });
    }
  }, [data]);

  const previewName = useMemo(
    () => form.name.trim() || data?.user.name || "Your profile",
    [data?.user.name, form.name],
  );

  const previewHeadline = useMemo(
    () => form.headline.trim() || data?.user.headline || "Add a short headline",
    [data?.user.headline, form.headline],
  );

  if (error) return <div className="p-8">Unable to load profile.</div>;
  if (!data) return <div className="p-8">Loading...</div>;

  const handleChange = (k: keyof typeof form, v: string) =>
    setForm((s) => ({ ...s, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage(null);
    try {
      await backendRequest("/v1/users/me", {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      mutate(authMeKey);
      setStatusMessage("Profile updated successfully.");
    } catch (error) {
      const err = error instanceof Error ? error.message : "Failed to save";
      setStatusMessage(`Failed to save: ${err}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="rounded-3xl bg-white p-6 shadow-[0_12px_34px_rgba(17,24,39,0.06)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.04em] text-[#2b2f38]">
              Edit profile
            </h2>
            <p className="mt-1 text-sm text-[#8a96a3]">
              Keep your public details current so other members can recognize
              you.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/app/messages")}
            className="rounded-2xl border border-[#e5e7eb] px-4 py-2 text-sm font-semibold text-[#4b505a] transition hover:border-[#fcd9a5] hover:text-brand-orange"
          >
            Back to messages
          </button>
        </div>

        {statusMessage ? (
          <div className="mt-5 rounded-2xl border border-[#fcd9a5] bg-[#fff7eb] px-4 py-3 text-sm text-[#7c4a00]">
            {statusMessage}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.7fr)]">
        <form
          onSubmit={save}
          className="space-y-4 rounded-3xl bg-white p-6 shadow-[0_12px_34px_rgba(17,24,39,0.06)]"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#8a96a3]">
                Full name
              </span>
              <input
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Full name"
                className={fieldClassName}
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#8a96a3]">
                Headline
              </span>
              <input
                value={form.headline}
                onChange={(e) => handleChange("headline", e.target.value)}
                placeholder="Creative director, founder, designer..."
                className={fieldClassName}
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#8a96a3]">
                City
              </span>
              <input
                value={form.city}
                onChange={(e) => handleChange("city", e.target.value)}
                placeholder="City"
                className={fieldClassName}
              />
            </label>

            <label className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-[#8a96a3]">
                Avatar URL
              </span>
              <input
                value={form.avatarUrl}
                onChange={(e) => handleChange("avatarUrl", e.target.value)}
                placeholder="https://..."
                className={fieldClassName}
              />
            </label>
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-[#8a96a3]">
              Bio
            </span>
            <textarea
              value={form.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="Tell people a little about yourself"
              className={`${fieldClassName} min-h-40 resize-y py-4`}
            />
          </label>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              className="rounded-2xl bg-brand-orange px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(255,134,0,0.24)] transition hover:bg-brand-orange/90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/app/messages")}
              className="rounded-2xl border border-[#e5e7eb] px-5 py-3 text-sm font-semibold text-[#4b505a] transition hover:border-[#fcd9a5] hover:text-brand-orange"
            >
              Cancel
            </button>
          </div>
        </form>

        <aside className="rounded-3xl bg-white p-6 shadow-[0_12px_34px_rgba(17,24,39,0.06)]">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[#8a96a3]">
            Preview
          </h3>

          <div className="mt-4 rounded-[28px] bg-[#f7f8fc] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[#fff1df] text-lg font-bold text-brand-orange">
                {form.avatarUrl ? (
                  <img
                    src={form.avatarUrl}
                    alt={previewName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  previewName.slice(0, 1).toUpperCase()
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-[#2b2f38]">
                  {previewName}
                </p>
                <p className="truncate text-sm text-[#8a96a3]">
                  {previewHeadline}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-sm text-[#4b505a]">
              <div className="rounded-2xl bg-white px-4 py-3">
                <span className="block text-xs font-semibold uppercase tracking-wide text-[#8a96a3]">
                  Email
                </span>
                <span className="mt-1 block truncate">{data.user.email}</span>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3">
                <span className="block text-xs font-semibold uppercase tracking-wide text-[#8a96a3]">
                  City
                </span>
                <span className="mt-1 block truncate">
                  {form.city || "Not set"}
                </span>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3">
                <span className="block text-xs font-semibold uppercase tracking-wide text-[#8a96a3]">
                  Bio
                </span>
                <span className="mt-1 block leading-6 text-[#4b505a]">
                  {form.bio.trim() ||
                    "Write a short bio to show on your profile."}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
