import { createAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";
import { allowedTables } from "@/lib/entities";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ table: string; id: string }> }
) {
  const { table, id } = await params;

  if (!allowedTables.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ table: string; id: string }> }
) {
  const { table, id } = await params;

  if (!allowedTables.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  const body = await request.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from(table)
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ table: string; id: string }> }
) {
  const { table, id } = await params;

  if (!allowedTables.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from(table).delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
