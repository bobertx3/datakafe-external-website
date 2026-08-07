"use client";

import { Home, MessageCircle, Plus, BookOpen, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "home" | "ask" | "add" | "memories" | "settings";

interface BottomNavProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const tabs = [
  { id: "home" as Tab, icon: Home, label: "Home" },
  { id: "memories" as Tab, icon: BookOpen, label: "Memories" },
  { id: "add" as Tab, icon: Plus, label: "Add", primary: true },
  { id: "ask" as Tab, icon: MessageCircle, label: "Ask" },
  { id: "settings" as Tab, icon: Settings, label: "More" },
];

export function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-safe z-50">
      <div className="flex items-center justify-around px-2 pt-2 pb-1 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = active === tab.id;

          if (tab.primary) {
            return (
              <button
                key={tab.id}
                onClick={() => onChange(tab.id)}
                className="flex flex-col items-center -mt-6"
              >
                <span className="w-14 h-14 rounded-2xl bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-200 active:scale-95 transition-transform">
                  <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className="flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl active:bg-slate-50 transition-colors"
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-teal-500" : "text-slate-400"
                )}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-teal-500" : "text-slate-400"
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
