import { getSupabaseAdmin } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await getSupabaseAdmin()
    .from("memories")
    .select("id, content, category, tags, type, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return new Response(error.message, { status: 500 });
  return Response.json(data);
}
