import OpenAI from "openai";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const openai = new OpenAI();
  const { text } = await req.json();
  if (!text?.trim()) return new Response("Missing text", { status: 400 });

  const speech = await openai.audio.speech.create({
    model: "tts-1-hd",
    voice: "nova", // warm, friendly
    input: text,
  });

  const buffer = Buffer.from(await speech.arrayBuffer());

  return new Response(buffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Content-Length": String(buffer.length),
    },
  });
}
