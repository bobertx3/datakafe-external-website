"use client";

import { useState } from "react";
import { BottomNav } from "@/components/BottomNav";
import { HomeScreen } from "@/components/HomeScreen";
import { AskScreen } from "@/components/AskScreen";
import { AddScreen } from "@/components/AddScreen";
import { MemoriesScreen } from "@/components/MemoriesScreen";
import { SettingsScreen } from "@/components/SettingsScreen";

type Tab = "home" | "ask" | "add" | "memories" | "settings";
type AddMode = "choose" | "voice" | "text" | "photo";

export default function Page() {
  const [tab, setTab] = useState<Tab>("home");
  const [addMode, setAddMode] = useState<AddMode>("choose");

  function goAdd(mode: AddMode = "choose") {
    setAddMode(mode);
    setTab("add");
  }

  return (
    <div className="relative h-screen w-full max-w-lg mx-auto bg-white overflow-hidden">
      <main className="h-full">
        {tab === "home" && (
          <HomeScreen
            onAsk={() => setTab("ask")}
            onAdd={(mode) => goAdd(mode ?? "choose")}
          />
        )}
        {tab === "ask" && <AskScreen onBack={() => setTab("home")} />}
        {tab === "add" && (
          <AddScreen
            onBack={() => setTab("home")}
            initialMode={addMode}
          />
        )}
        {tab === "memories" && <MemoriesScreen />}
        {tab === "settings" && <SettingsScreen />}
      </main>
      {tab !== "ask" && (
        <BottomNav active={tab} onChange={(t) => t === "add" ? goAdd() : setTab(t)} />
      )}
    </div>
  );
}
