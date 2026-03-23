import { createAdminClient } from "@/lib/supabase-admin";
import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";
import { allowedTables, getEntityByTable } from "@/lib/entities";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;

  if (!allowedTables.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const entity = getEntityByTable(table);

  let query = supabase.from(table).select("*");

  if (entity?.orderBy) {
    query = query.order(entity.orderBy, { ascending: false });
  }

  const { data, error } = await query.limit(entity?.limit ?? 200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;

  if (!allowedTables.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  const body = await request.json();
  const serverClient = await createClient();
  const { data: { user } } = await serverClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(table)
    .insert({
      ...body,
      created_by_user_id: user.id,
      modified_by_user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
