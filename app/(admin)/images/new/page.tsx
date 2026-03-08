"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewImagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    url: "",
    image_description: "",
    is_public: false,
    is_common_use: false,
    additional_context: "",
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setForm((prev) => ({ ...prev, url: data.url }));
      } else {
        const err = await res.json();
        alert("Upload failed: " + (err.error || "Unknown error"));
      }
    } catch {
      alert("Upload failed");
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (res.ok) {
      router.push("/images");
    } else {
      alert("Failed to create image");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Add New Image</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:bg-orange-600 file:text-white file:cursor-pointer"
          />
          {uploading && (
            <p className="text-sm text-orange-400 mt-1">Uploading...</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Image URL
          </label>
          <input
            type="url"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
            placeholder="https://images.almostcrackd.ai/..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Upload a file above or paste a URL directly
          </p>
        </div>

        {form.url && (
          <div className="rounded-xl overflow-hidden border border-gray-800">
            <img src={form.url} alt="Preview" className="w-full max-h-64 object-cover" />
          </div>
        )}

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
            placeholder="Describe the image..."
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
            placeholder="Any additional context..."
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
            disabled={loading}
            className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
          >
            {loading ? "Creating..." : "Create Image"}
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
