"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowser } from "@/lib/supabase";
import {
  LogOut, UserPlus, Mail, CheckCircle, Loader2, Users, Crown, User
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Member {
  id: string;
  role: string;
  user_id: string | null;
  invited_email: string | null;
  joined_at: string;
}

export function SettingsScreen() {
  const [userEmail, setUserEmail] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteSent, setInviteSent] = useState(false);
  const [babyId, setBabyId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserEmail(user.email ?? "");

      // Get the baby this user belongs to
      const { data: membership } = await supabase
        .from("baby_members")
        .select("baby_id")
        .eq("user_id", user?.id)
        .limit(1)
        .single();

      if (membership) {
        setBabyId(membership.baby_id);
        const { data: allMembers } = await supabase
          .from("baby_members")
          .select("*")
          .eq("baby_id", membership.baby_id);
        setMembers(allMembers ?? []);
      }
    }
    load();
  }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim() || !babyId) return;
    setInviting(true);

    const res = await fetch("/api/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail, babyId }),
    });

    setInviting(false);
    if (res.ok) {
      setInviteSent(true);
      setInviteEmail("");
      setTimeout(() => setInviteSent(false), 3000);
    }
  }

  async function handleSignOut() {
    const supabase = createSupabaseBrowser();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto pb-28">
      <div className="px-5 pt-14 pb-6">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
      </div>

      {/* Current user */}
      <div className="px-5 mb-6">
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {userEmail.charAt(0).toUpperCase()}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{userEmail}</p>
            <p className="text-xs text-slate-400">Signed in</p>
          </div>
        </div>
      </div>

      {/* Members */}
      <div className="px-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-slate-400" />
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Julian's Team
          </h2>
        </div>
        <div className="flex flex-col gap-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="bg-white border border-slate-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm"
            >
              <span className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                {m.user_id ? (
                  <User className="w-4 h-4 text-slate-400" />
                ) : (
                  <Mail className="w-4 h-4 text-slate-300" />
                )}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 truncate">
                  {m.invited_email ?? "Member"}
                </p>
                <p className="text-xs text-slate-400">
                  {m.user_id ? "Active" : "Invite pending"}
                </p>
              </div>
              {m.role === "owner" && (
                <Crown className="w-4 h-4 text-amber-400 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Invite */}
      <div className="px-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <UserPlus className="w-4 h-4 text-slate-400" />
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Invite Someone
          </h2>
        </div>
        <form onSubmit={handleInvite} className="flex flex-col gap-3">
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3">
            <Mail className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="wife@example.com"
              className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
            />
          </div>
          <button
            type="submit"
            disabled={!inviteEmail.trim() || inviting || !babyId}
            className="w-full bg-teal-500 text-white font-semibold py-3.5 rounded-2xl disabled:opacity-30 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            {inviting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : inviteSent ? (
              <><CheckCircle className="w-4 h-4" /> Invite sent!</>
            ) : (
              "Send invite"
            )}
          </button>
          <p className="text-xs text-slate-400 text-center">
            They'll get a magic link — no app download needed.
          </p>
        </form>
      </div>

      {/* Sign out */}
      <div className="px-5">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 text-rose-500 text-sm font-medium py-4 border border-rose-100 rounded-2xl active:bg-rose-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
