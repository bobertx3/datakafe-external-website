"use client";

import { useState, useRef } from "react";
import {
  Mic,
  MicOff,
  Type,
  ImagePlus,
  FileText,
  X,
  Check,
  ArrowLeft,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Mode = "choose" | "text" | "voice" | "photo";

interface AddScreenProps {
  onBack: () => void;
  initialMode?: Mode;
}

const addOptions = [
  {
    mode: "text" as Mode,
    icon: Type,
    label: "Text Note",
    description: "Type a note about Julian",
    color: "bg-indigo-50 text-indigo-500",
    border: "border-indigo-100",
  },
  {
    mode: "voice" as Mode,
    icon: Mic,
    label: "Voice Note",
    description: "Speak and I'll transcribe it",
    color: "bg-teal-50 text-teal-500",
    border: "border-teal-100",
  },
  {
    mode: "photo" as Mode,
    icon: ImagePlus,
    label: "Photo or Screenshot",
    description: "Upload an image or doc",
    color: "bg-amber-50 text-amber-500",
    border: "border-amber-100",
  },
];

export function AddScreen({ onBack, initialMode }: AddScreenProps) {
  const [mode, setMode] = useState<Mode>(initialMode ?? "choose");
  const [text, setText] = useState("");
  const [category, setCategory] = useState("Other");
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleSave(content?: string, type: string = mode) {
    const finalContent = content ?? (mode === "voice" ? transcript : text);
    if (!finalContent.trim()) return;
    setSaving(true);
    try {
      await fetch("/api/memories/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: finalContent, type, category }),
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setSaving(false);
        setMode("choose");
        setText("");
        setTranscript("");
        setCategory("Other");
      }, 1500);
    } catch {
      setSaving(false);
      alert("Failed to save. Try again.");
    }
  }

  function toggleVoice() {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice not supported in this browser.");
      return;
    }
    if (isListening) {
      setIsListening(false);
      return;
    }
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";
    recognition.start();
    setIsListening(true);
    let finalText = "";
    recognition.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalText += e.results[i][0].transcript + " ";
        else interim += e.results[i][0].transcript;
      }
      setTranscript(finalText + interim);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  }

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center shadow-lg shadow-teal-200">
          <Check className="w-8 h-8 text-white" strokeWidth={3} />
        </div>
        <p className="text-lg font-semibold text-slate-800">Memory saved</p>
        <p className="text-sm text-slate-400">Mr. Bean remembers.</p>
      </div>
    );
  }

  if (mode === "choose") {
    return (
      <div className="flex flex-col h-full px-5 pb-28">
        <div className="pt-14 pb-6">
          <button onClick={onBack} className="p-2 -ml-2 rounded-xl active:bg-slate-100 mb-3">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Add a Memory</h1>
          <p className="text-slate-400 text-sm mt-1">How do you want to add it?</p>
        </div>
        <div className="flex flex-col gap-3">
          {addOptions.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.mode}
                onClick={() => setMode(opt.mode)}
                className={cn(
                  "flex items-center gap-4 bg-white border rounded-2xl p-4 active:scale-98 transition-all shadow-sm text-left",
                  opt.border
                )}
              >
                <span className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", opt.color)}>
                  <Icon className="w-6 h-6" strokeWidth={1.75} />
                </span>
                <div>
                  <p className="font-semibold text-slate-800">{opt.label}</p>
                  <p className="text-sm text-slate-400">{opt.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  if (mode === "text") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-5 pt-14 pb-4 border-b border-slate-100">
          <button onClick={() => setMode("choose")} className="p-2 -ml-2 rounded-xl active:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="flex-1 text-lg font-bold text-slate-900">Text Note</h1>
          <button
            onClick={() => handleSave()}
            disabled={!text.trim() || saving}
            className="px-4 py-2 bg-teal-500 text-white text-sm font-semibold rounded-xl disabled:opacity-30 active:scale-95 transition-all"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
        <div className="flex-1 px-5 pt-4">
          <textarea
            autoFocus
            className="w-full h-48 text-slate-800 text-base placeholder:text-slate-300 outline-none resize-none leading-relaxed"
            placeholder="e.g. Dr. Kim said Julian's iron levels are normal. Next appointment in 3 months..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <div className="mt-4">
            <p className="text-xs text-slate-400 mb-2 font-medium uppercase tracking-wide">Category</p>
            <div className="flex flex-wrap gap-2">
              {["Medical", "Food & Diet", "Routines", "Milestones", "Vitals", "Sleep", "Other"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "text-xs px-3 py-1.5 rounded-full border transition-colors",
                    category === cat
                      ? "bg-teal-500 text-white border-teal-500"
                      : "border-slate-200 text-slate-600 active:bg-slate-100"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "voice") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-5 pt-14 pb-4 border-b border-slate-100">
          <button onClick={() => setMode("choose")} className="p-2 -ml-2 rounded-xl active:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="flex-1 text-lg font-bold text-slate-900">Voice Note</h1>
          {transcript && (
            <button
              onClick={() => handleSave()}
              className="px-4 py-2 bg-teal-500 text-white text-sm font-semibold rounded-xl active:scale-95 transition-all"
            >
              Save
            </button>
          )}
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-8 px-5">
          {/* Mic button */}
          <button
            onClick={toggleVoice}
            className={cn(
              "w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg",
              isListening
                ? "bg-rose-500 shadow-rose-200 scale-110 animate-pulse"
                : "bg-teal-500 shadow-teal-200 active:scale-95"
            )}
          >
            {isListening ? (
              <Square className="w-8 h-8 text-white fill-white" />
            ) : (
              <Mic className="w-10 h-10 text-white" />
            )}
          </button>

          <p className="text-sm text-slate-400">
            {isListening ? "Listening... tap to stop" : "Tap to start speaking"}
          </p>

          {/* Transcript */}
          {transcript && (
            <div className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4">
              <p className="text-sm text-slate-700 leading-relaxed">{transcript}</p>
              <button
                onClick={() => setTranscript("")}
                className="mt-2 text-xs text-slate-400 flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === "photo") {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-5 pt-14 pb-4 border-b border-slate-100">
          <button onClick={() => setMode("choose")} className="p-2 -ml-2 rounded-xl active:bg-slate-100">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="flex-1 text-lg font-bold text-slate-900">Photo or Screenshot</h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-5">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={() => handleSave(undefined, "image")} />
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center gap-3 active:border-teal-400 transition-colors"
          >
            <ImagePlus className="w-10 h-10 text-slate-300" />
            <p className="text-slate-500 font-medium">Tap to upload</p>
            <p className="text-xs text-slate-400 text-center">
              Photo, screenshot, lab result, prescription — I'll read it and remember it.
            </p>
          </button>
          <div className="flex gap-3 w-full">
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 rounded-xl py-3 text-sm text-slate-600 font-medium active:bg-slate-100"
            >
              <FileText className="w-4 h-4" /> Document
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex-1 flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 rounded-xl py-3 text-sm text-slate-600 font-medium active:bg-slate-100"
            >
              <ImagePlus className="w-4 h-4" /> Camera
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
