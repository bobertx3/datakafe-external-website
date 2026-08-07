"use client";

import { useState, useEffect } from "react";
import {
  Stethoscope,
  Apple,
  Moon,
  Heart,
  Smile,
  Activity,
  Search,
  Clock,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Memory {
  id: string;
  content: string;
  category: string;
  tags: string[];
  type: string;
  created_at: string;
}

const CATEGORIES = ["All", "Medical", "Food & Diet", "Routines", "Milestones", "Vitals", "Sleep"];

const categoryMeta: Record<string, { icon: any; color: string }> = {
  Medical: { icon: Stethoscope, color: "bg-rose-100 text-rose-500" },
  "Food & Diet": { icon: Apple, color: "bg-amber-100 text-amber-500" },
  Sleep: { icon: Moon, color: "bg-indigo-100 text-indigo-500" },
  Routines: { icon: Heart, color: "bg-pink-100 text-pink-500" },
  Milestones: { icon: Smile, color: "bg-emerald-100 text-emerald-500" },
  Vitals: { icon: Activity, color: "bg-teal-100 text-teal-500" },
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = (now.getTime() - d.getTime()) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function MemoriesScreen() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/memories/list")
      .then((r) => r.json())
      .then((data) => { setMemories(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = memories.filter((m) => {
    const matchCat = activeCategory === "All" || m.category === activeCategory;
    const matchSearch =
      !search ||
      m.content.toLowerCase().includes(search.toLowerCase()) ||
      m.tags?.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 pt-14 pb-3 bg-white">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-4">Memories</h1>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 mb-4">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
            placeholder="Search memories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                "shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors",
                activeCategory === cat
                  ? "bg-teal-500 text-white border-teal-500"
                  : "bg-white text-slate-500 border-slate-200 active:bg-slate-50"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-28 pt-3 space-y-3">
        {loading && (
          <div className="flex items-center justify-center pt-20 gap-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Loading memories...</span>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-20 gap-2">
            <p className="text-slate-400 text-sm">
              {memories.length === 0 ? "No memories yet — add your first one!" : "No memories match."}
            </p>
          </div>
        )}

        {filtered.map((mem) => {
          const meta = categoryMeta[mem.category];
          const Icon = meta?.icon;
          return (
            <div
              key={mem.id}
              className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-start gap-3">
                {Icon && (
                  <span className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5", meta.color)}>
                    <Icon className="w-4 h-4" strokeWidth={1.75} />
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-medium text-slate-400">{mem.category}</span>
                    <span className="flex items-center gap-1 text-xs text-slate-300 shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatTime(mem.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{mem.content}</p>
                  {mem.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {mem.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
