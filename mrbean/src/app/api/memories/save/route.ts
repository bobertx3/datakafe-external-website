import OpenAI from "openai";
import { getSupabaseAdmin } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const openai = new OpenAI();
  const { content, type = "text", category = "Other", tags = [] } = await req.json();
  if (!content?.trim()) return new Response("Missing content", { status: 400 });

  // Generate embedding
  const embeddingRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: content,
  });
  const embedding = embeddingRes.data[0].embedding;

  // Save to Supabase
  const { data, error } = await getSupabaseAdmin()
    .from("memories")
    .insert({ content, type, category, tags, embedding })
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return new Response(error.message, { status: 500 });
  }

  return Response.json(data);
}
