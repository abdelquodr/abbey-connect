"use client";
import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((r) => r.json());

export default function ProfilePage() {
  const { data, error } = useSWR(`${API_BASE}/v1/auth/me`, fetcher);
  const [form, setForm] = useState({
    name: "",
    headline: "",
    bio: "",
    city: "",
    avatarUrl: "",
  });
  const [saving, setSaving] = useState(false);

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

  if (error) return <div className="p-8">Unable to load profile.</div>;
  if (!data) return <div className="p-8">Loading...</div>;

  const handleChange = (k: string, v: string) =>
    setForm((s) => ({ ...s, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`${API_BASE}/v1/users/me`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (res.ok) {
      const json = await res.json();
      // update SWR cache for /v1/auth/me and connections list
      mutate(`${API_BASE}/v1/auth/me`);
      alert("Profile updated");
    } else {
      const err = await res.text();
      alert(`Failed to save: ${err}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h2 className="text-2xl font-semibold mb-4">Edit profile</h2>
      <form onSubmit={save} className="space-y-4">
        <input
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
          placeholder="Full name"
          className="w-full p-2 border rounded"
        />
        <input
          value={form.headline}
          onChange={(e) => handleChange("headline", e.target.value)}
          placeholder="Headline"
          className="w-full p-2 border rounded"
        />
        <input
          value={form.city}
          onChange={(e) => handleChange("city", e.target.value)}
          placeholder="City"
          className="w-full p-2 border rounded"
        />
        <input
          value={form.avatarUrl}
          onChange={(e) => handleChange("avatarUrl", e.target.value)}
          placeholder="Avatar URL"
          className="w-full p-2 border rounded"
        />
        <textarea
          value={form.bio}
          onChange={(e) => handleChange("bio", e.target.value)}
          placeholder="Bio"
          className="w-full p-2 border rounded h-32"
        />
        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
