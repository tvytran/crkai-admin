import { createAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";
import { allowedTables } from "@/lib/entities";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ table: string }> }
) {
  const { table } = await params;

  if (!allowedTables.includes(table)) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Fetch one row to discover columns and their types
  const { data, error } = await supabase.from(table).select("*").limit(1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (data && data.length > 0) {
    const columns = Object.entries(data[0]).map(([key, value]) => ({
      name: key,
      type:
        typeof value === "boolean"
          ? "boolean"
          : typeof value === "number"
            ? "number"
            : "string",
      sample: value,
    }));
    return NextResponse.json({ columns });
  }

  // Empty table
  return NextResponse.json({ columns: [] });
}
