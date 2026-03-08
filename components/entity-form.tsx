"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

interface EntityFormProps {
  title: string;
  table: string;
  entitySlug: string;
  isEdit?: boolean;
}

const READONLY_FIELDS = [
  "id",
  "created_datetime_utc",
  "created_at",
  "modified_datetime_utc",
  "updated_at",
];

function getInputType(
  key: string,
  value: unknown
): "checkbox" | "url" | "email" | "textarea" | "number" | "text" {
  if (typeof value === "boolean") return "checkbox";
  if (key.includes("url") || key.includes("link")) return "url";
  if (key.includes("email")) return "email";
  if (typeof value === "number") return "number";
  if (
    key.includes("description") ||
    key.includes("content") ||
    key.includes("context") ||
    key.includes("prompt") ||
    key.includes("response") ||
    key.includes("body") ||
    key.includes("text")
  )
    return "textarea";
  return "text";
}

export function EntityForm({ title, table, entitySlug, isEdit }: EntityFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = isEdit ? searchParams.get("id") : null;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [columns, setColumns] = useState<string[]>([]);

  useEffect(() => {
    if (isEdit && id) {
      fetch(`/api/crud/${table}/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            alert("Failed to load record: " + data.error);
            return;
          }
          setForm(data);
          setColumns(Object.keys(data));
          setLoading(false);
        });
    } else {
      // For create, discover columns from schema
      fetch(`/api/schema/${table}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.columns && data.columns.length > 0) {
            const cols = data.columns
              .map((c: { name: string }) => c.name)
              .filter((name: string) => !READONLY_FIELDS.includes(name));
            setColumns(cols);
            const defaultForm: Record<string, unknown> = {};
            data.columns.forEach(
              (c: { name: string; type: string }) => {
                if (!READONLY_FIELDS.includes(c.name)) {
                  defaultForm[c.name] =
                    c.type === "boolean" ? false : c.type === "number" ? 0 : "";
                }
              }
            );
            setForm(defaultForm);
          }
          setLoading(false);
        });
    }
  }, [isEdit, id, table]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(form)) {
      if (!READONLY_FIELDS.includes(key)) {
        payload[key] = value === "" ? null : value;
      }
    }

    const url = isEdit
      ? `/api/crud/${table}/${id}`
      : `/api/crud/${table}`;
    const method = isEdit ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push(`/${entitySlug}`);
    } else {
      const err = await res.json();
      alert(`Failed: ${err.error || "Unknown error"}`);
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="text-gray-400">Loading...</div>;
  }

  const editableColumns = columns.filter((col) =>
    isEdit
      ? !["id", "created_datetime_utc", "created_at"].includes(col)
      : !READONLY_FIELDS.includes(col)
  );

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">{title}</h1>
      {isEdit && id && (
        <p className="text-sm text-gray-400 font-mono mb-6">{id}</p>
      )}

      {editableColumns.length === 0 ? (
        <div className="text-gray-500 bg-gray-900 rounded-xl p-6 border border-gray-800">
          <p>Could not discover columns for this table.</p>
          <p className="mt-2">
            The table may be empty. Try adding a record directly in the database
            first.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {editableColumns.map((col) => {
            const value = form[col];
            const inputType = getInputType(col, value);

            return (
              <div key={col}>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {col}
                </label>
                {inputType === "checkbox" ? (
                  <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(e) =>
                      setForm({ ...form, [col]: e.target.checked })
                    }
                    className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-orange-500"
                  />
                ) : inputType === "textarea" ? (
                  <textarea
                    value={String(value ?? "")}
                    onChange={(e) =>
                      setForm({ ...form, [col]: e.target.value })
                    }
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
                    rows={4}
                  />
                ) : inputType === "number" ? (
                  <input
                    type="number"
                    value={String(value ?? "")}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [col]: e.target.value ? Number(e.target.value) : "",
                      })
                    }
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
                  />
                ) : (
                  <input
                    type={inputType}
                    value={String(value ?? "")}
                    onChange={(e) =>
                      setForm({ ...form, [col]: e.target.value })
                    }
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none"
                  />
                )}
              </div>
            );
          })}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              {saving ? "Saving..." : isEdit ? "Save Changes" : "Create"}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/${entitySlug}`)}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
