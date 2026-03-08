import { createAdminClient } from "@/lib/supabase-admin";
import { getEntityBySlug } from "@/lib/entities";
import { notFound } from "next/navigation";
import { EntityTable } from "@/components/entity-table";

export const dynamic = "force-dynamic";

export default async function EntityPage({
  params,
}: {
  params: Promise<{ entity: string }>;
}) {
  const { entity: slug } = await params;
  const config = getEntityBySlug(slug);

  if (!config) return notFound();

  const supabase = createAdminClient();
  let query = supabase.from(config.table).select("*");

  if (config.orderBy) {
    query = query.order(config.orderBy, { ascending: false });
  }

  const { data, error } = await query.limit(config.limit ?? 200);

  return (
    <EntityTable
      title={config.label}
      data={data}
      error={error?.message}
      entitySlug={slug}
      tableName={config.table}
      canCreate={config.crud.includes("c")}
      canEdit={config.crud.includes("u")}
      canDelete={config.crud.includes("d")}
    />
  );
}
