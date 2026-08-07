"use client";

import {
  Mic,
  Type,
  ImagePlus,
  ChevronRight,
  Clock,
  Stethoscope,
  Apple,
  Moon,
  Heart,
  Smile,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

type AddMode = "voice" | "text" | "photo";

const recentMemories = [
  {
    id: 1,
    content: "Dr. Smith said Julian's weight is in the 75th percentile. Start iron supplements.",
    time: "2h ago",
    category: "Medical",
    color: "bg-rose-100 text-rose-600",
  },
  {
    id: 2,
    content: "Julian showed a reaction to strawberries — small hives on cheeks. Avoid until 12 months.",
    time: "Yesterday",
    category: "Food & Diet",
    color: "bg-amber-100 text-amber-600",
  },
  {
    id: 3,
    content: "Bedtime routine: bath at 7pm, bottle 4oz, white noise, asleep by 7:45.",
    time: "3d ago",
    category: "Routines",
    color: "bg-pink-100 text-pink-600",
  },
];

interface HomeScreenProps {
  onAsk: () => void;
  onAdd: (mode?: AddMode) => void;
}

export function HomeScreen({ onAsk, onAdd }: HomeScreenProps) {
  return (
    <div className="flex flex-col h-full overflow-y-auto pb-24">
      {/* Header */}
      <div className="px-5 pt-14 pb-5">
        <p className="text-xs text-slate-400 font-semibold tracking-widest uppercase mb-1">Julian's</p>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Mr. Bean</h1>
      </div>

      {/* === ASK — hero card === */}
      <div className="px-5 mb-4">
        <button
          onClick={onAsk}
          className="w-full rounded-3xl bg-teal-500 p-6 text-left active:scale-[0.98] transition-transform shadow-xl shadow-teal-200 overflow-hidden relative"
        >
          {/* subtle background decoration */}
          <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full bg-teal-400/30" />
          <div className="absolute -right-2 -bottom-8 w-24 h-24 rounded-full bg-teal-400/20" />

          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-teal-100 tracking-widest uppercase">Ask Mr. Bean</span>
              <span className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                <Mic className="w-5 h-5 text-white" />
              </span>
            </div>
            <p className="text-white text-xl font-bold leading-snug mb-1">
              What is Julian<br />allergic to?
            </p>
            <p className="text-teal-100 text-sm">Ask anything — I remember it all.</p>
          </div>
        </button>
      </div>

      {/* === ADD MEMORY — hero card === */}
      <div className="px-5 mb-6">
        <div className="w-full rounded-3xl bg-slate-50 border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-semibold text-slate-400 tracking-widest uppercase">Add a Memory</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => onAdd("voice")}
              className="flex flex-col items-center gap-2.5 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm active:scale-95 transition-transform"
            >
              <span className="w-11 h-11 rounded-xl bg-teal-50 flex items-center justify-center">
                <Mic className="w-5 h-5 text-teal-500" strokeWidth={1.75} />
              </span>
              <span className="text-xs font-semibold text-slate-600">Voice</span>
            </button>
            <button
              onClick={() => onAdd("text")}
              className="flex flex-col items-center gap-2.5 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm active:scale-95 transition-transform"
            >
              <span className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Type className="w-5 h-5 text-indigo-500" strokeWidth={1.75} />
              </span>
              <span className="text-xs font-semibold text-slate-600">Note</span>
            </button>
            <button
              onClick={() => onAdd("photo")}
              className="flex flex-col items-center gap-2.5 bg-white rounded-2xl p-4 border border-slate-100 shadow-sm active:scale-95 transition-transform"
            >
              <span className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center">
                <ImagePlus className="w-5 h-5 text-amber-500" strokeWidth={1.75} />
              </span>
              <span className="text-xs font-semibold text-slate-600">Photo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent memories — secondary */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Recent</h2>
          <button className="text-teal-500 text-xs font-semibold flex items-center gap-0.5">
            See all <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex flex-col gap-2.5">
          {recentMemories.map((mem) => (
            <div
              key={mem.id}
              className="bg-white border border-slate-100 rounded-2xl px-4 py-3.5 shadow-sm active:bg-slate-50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 mt-0.5", mem.color)}>
                  {mem.category}
                </span>
                <p className="text-sm text-slate-700 leading-snug flex-1 line-clamp-2">{mem.content}</p>
              </div>
              <div className="flex items-center gap-1 mt-2 ml-0.5">
                <Clock className="w-3 h-3 text-slate-300" />
                <span className="text-[11px] text-slate-300">{mem.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
