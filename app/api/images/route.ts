import { createAdminClient } from "@/lib/supabase-admin";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("images")
    .insert({
      url: body.url,
      image_description: body.image_description || null,
      is_public: body.is_public ?? false,
      is_common_use: body.is_common_use ?? false,
      additional_context: body.additional_context || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
