import OpenAI from "openai";
import { getSupabaseAdmin } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const openai = new OpenAI();
  const { question } = await req.json();
  if (!question?.trim()) return new Response("Missing question", { status: 400 });

  // Embed the question
  const embeddingRes = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: question,
  });
  const embedding = embeddingRes.data[0].embedding;

  // Find semantically similar memories
  const { data: memories, error } = await getSupabaseAdmin().rpc("match_memories", {
    query_embedding: embedding,
    match_count: 8,
  });

  if (error) {
    console.error("match_memories error:", error);
    return new Response(error.message, { status: 500 });
  }

  // Build context from retrieved memories
  const context = memories?.length
    ? memories
        .map((m: any, i: number) => `[${i + 1}] (${m.category}) ${m.content}`)
        .join("\n")
    : "No memories found yet.";

  // Ask GPT-4o-mini to answer using those memories
  const chat = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are Mr. Bean, a helpful AI assistant that remembers everything about a baby named Julian.
Answer the parent's question using only the memories provided below.
Be warm, concise, and conversational — like a knowledgeable friend, not a doctor.
If the memories don't contain enough information to answer, say so kindly and suggest they add that memory.

Memories:
${context}`,
      },
      { role: "user", content: question },
    ],
    temperature: 0.4,
  });

  const answer = chat.choices[0].message.content ?? "I don't have that information yet.";
  return Response.json({ answer, memoriesUsed: memories?.length ?? 0 });
}
