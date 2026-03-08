"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function GenericDeleteButton({
  table,
  id,
}: {
  table: string;
  id: string;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    setDeleting(true);

    const res = await fetch(`/api/crud/${table}/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    } else {
      alert("Failed to delete record");
    }
    setDeleting(false);
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-xs bg-red-900/50 hover:bg-red-900 disabled:opacity-50 text-red-300 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
    >
      {deleting ? "..." : "Delete"}
    </button>
  );
}
