"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function EditImageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    url: "",
    image_description: "",
    is_public: false,
    is_common_use: false,
    additional_context: "",
  });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/images/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          url: data.url ?? "",
          image_description: data.image_description ?? "",
          is_public: data.is_public ?? false,
          is_common_use: data.is_common_use ?? false,
          additional_context: data.additional_context ?? "",
        });
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const res = await fetch(`/api/images/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/images");
    } else {
      alert("Failed to update image");
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="text-gray-400">Loading image...</div>;
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Edit Image</h1>
      <p className="text-sm text-gray-400 font-mono mb-6">{id}</p>

      {form.url && (
        <div className="mb-6 rounded-xl overflow-hidden border border-gray-800">
          <img src={form.url} alt="" className="w-full max-h-64 object-cover" />
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Image URL
          </label>
          <input
            type="url"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={form.image_description}
            onChange={(e) =>
              setForm({ ...form, image_description: e.target.value })
            }
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
            rows={3}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Additional Context
          </label>
          <textarea
            value={form.additional_context}
            onChange={(e) =>
              setForm({ ...form, additional_context: e.target.value })
            }
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
            rows={2}
          />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_public}
              onChange={(e) =>
                setForm({ ...form, is_public: e.target.checked })
              }
              className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-orange-500"
            />
            <span className="text-sm text-gray-300">Public</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_common_use}
              onChange={(e) =>
                setForm({ ...form, is_common_use: e.target.checked })
              }
              className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-orange-500"
            />
            <span className="text-sm text-gray-300">Common Use</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/images")}
            className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default function EditImagePage() {
  return (
    <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
      <EditImageContent />
    </Suspense>
  );
}
