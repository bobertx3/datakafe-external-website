import { getSupabaseAdmin } from "@/lib/supabase";
import { createSupabaseServer } from "@/lib/supabase-server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { email, babyId } = await req.json();
  if (!email || !babyId) return new Response("Missing fields", { status: 400 });

  // Check if already a member
  const { data: existing } = await getSupabaseAdmin()
    .from("baby_members")
    .select("id")
    .eq("baby_id", babyId)
    .eq("invited_email", email)
    .single();

  if (existing) return Response.json({ ok: true, alreadyInvited: true });

  // Check if user already exists with this email
  const { data: existingUser } = await getSupabaseAdmin()
    .from("auth.users")
    .select("id")
    .eq("email", email)
    .single();

  // Insert pending invite (user_id filled in if they already exist)
  await getSupabaseAdmin().from("baby_members").insert({
    baby_id: babyId,
    user_id: existingUser?.id ?? null,
    invited_email: email,
    role: "member",
  });

  // Send magic link so they can log in
  await getSupabaseAdmin().auth.admin.inviteUserByEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
  });

  return Response.json({ ok: true });
}
