import { Suspense } from "react";
import { EntityForm } from "@/components/entity-form";
import { getEntityBySlug } from "@/lib/entities";
import { notFound } from "next/navigation";

export default async function EditEntityPage({
  params,
}: {
  params: Promise<{ entity: string }>;
}) {
  const { entity: slug } = await params;
  const config = getEntityBySlug(slug);

  if (!config || !config.crud.includes("u")) return notFound();

  return (
    <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
      <EntityForm
        title={`Edit ${config.label.replace(/s$/, "")}`}
        table={config.table}
        entitySlug={slug}
        isEdit
      />
    </Suspense>
  );
}
