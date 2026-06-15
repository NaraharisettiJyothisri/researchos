"use client";

import React, { useEffect, useState } from "react";
import { 
  Plus, 
  History, 
  Search, 
  Settings, 
  Database, 
  Sparkles, 
  Cpu, 
  Compass, 
  X,
  HelpCircle,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProjectHistoryItem {
  id: string;
  query: string;
  mode: string;
  status: string;
  createdAt: string;
}

interface SidebarProps {
  currentProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  onNewResearch: () => void;
  researchMode: string;
  setResearchMode: (mode: string) => void;
}

export default function Sidebar({
  currentProjectId,
  onSelectProject,
  onNewResearch,
  researchMode,
  setResearchMode
}: SidebarProps) {
  const [history, setHistory] = useState<ProjectHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // Local state for keys (read/write in local storage or visual only)
  const [openaiKey, setOpenaiKey] = useState("");
  const [contextKey, setContextKey] = useState("");

  const modes = [
    { id: "quick", label: "Quick Research", desc: "Fast answers from core indices" },
    { id: "deep", label: "Deep Research", desc: "Multi-step agent validation (Recommended)" },
    { id: "market", label: "Market Analysis", desc: "Focuses on market share & stats" },
    { id: "competitor", label: "Competitor Analysis", desc: "Compare product specs & players" },
    { id: "financial", label: "Financial Research", desc: "Analyses statements & stock numbers" },
    { id: "academic", label: "Academic Research", desc: "Prioritizes papers & citations" }
  ];

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/research/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (err) {
      console.error("Failed to load research history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
    // Poll history every 10 seconds to catch background updates
    const interval = setInterval(fetchHistory, 10000);
    return () => clearInterval(interval);
  }, [currentProjectId]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOpenaiKey(localStorage.getItem("RESEARCHOS_OPENAI_KEY") || "");
      setContextKey(localStorage.getItem("RESEARCHOS_CONTEXT_KEY") || "ctxt_secret_cd18446bad38476486b0fc27856fd28b");
    }
  }, []);

  const saveKeys = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("RESEARCHOS_OPENAI_KEY", openaiKey);
      localStorage.setItem("RESEARCHOS_CONTEXT_KEY", contextKey);
    }
    setShowSettings(false);
  };

  return (
    <>
      {/* Sidebar Container */}
      <motion.div
        animate={{ width: isCollapsed ? 64 : 280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative flex flex-col h-screen glass-panel border-r border-zinc-800/40 text-zinc-300 select-none z-30"
      >
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-4 -right-3 flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-purple-500/50 shadow-md cursor-pointer transition-all active:scale-90"
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>

        {/* Logo/Branding */}
        <div className="flex items-center gap-3 px-5 py-6 border-b border-zinc-800/20">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-md shadow-purple-500/10">
            <Cpu size={16} className="text-white" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-zinc-950 animate-pulse"></span>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-sm tracking-wider">RESEARCHOS</span>
              <span className="text-[10px] text-purple-400/80 font-bold uppercase tracking-widest">Deep Intelligence</span>
            </div>
          )}
        </div>

        {/* New Research Button */}
        <div className="p-3">
          <button
            onClick={onNewResearch}
            className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-600/90 to-purple-600/90 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold text-xs tracking-wider shadow-lg shadow-purple-500/10 cursor-pointer active:scale-95 transition-all duration-200 ${
              isCollapsed ? "px-0 justify-center" : "px-4"
            }`}
          >
            <Plus size={16} />
            {!isCollapsed && <span>NEW RESEARCH</span>}
          </button>
        </div>

        {/* Research Modes selection */}
        {!isCollapsed && (
          <div className="px-4 py-2">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-2">Research Mode</span>
            <div className="space-y-1 max-h-[160px] overflow-y-auto pr-1">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setResearchMode(m.id)}
                  className={`flex items-center gap-2.5 w-full text-left px-2.5 py-1.5 rounded-md text-xs transition-all duration-150 cursor-pointer ${
                    researchMode === m.id
                      ? "bg-purple-950/30 text-purple-300 border border-purple-800/30 font-semibold"
                      : "hover:bg-zinc-800/30 text-zinc-400 hover:text-zinc-200 border border-transparent"
                  }`}
                  title={m.desc}
                >
                  <Sparkles size={13} className={researchMode === m.id ? "text-purple-400 animate-pulse" : ""} />
                  <span className="truncate">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Divider */}
        {!isCollapsed && <div className="border-t border-zinc-800/20 my-2 mx-4"></div>}

        {/* Research History List */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden px-4 py-2">
          {!isCollapsed && (
            <div className="flex items-center gap-2 mb-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              <History size={11} />
              <span>Session History</span>
            </div>
          )}
          
          <div className="flex-grow overflow-y-auto space-y-1.5 pr-1">
            {loadingHistory ? (
              !isCollapsed && (
                <div className="flex flex-col gap-2 mt-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-9 w-full bg-zinc-900/50 rounded animate-pulse"></div>
                  ))}
                </div>
              )
            ) : history.length === 0 ? (
              !isCollapsed && (
                <div className="flex flex-col items-center justify-center text-center p-6 text-zinc-600">
                  <FileText size={24} className="mb-2 opacity-30" />
                  <span className="text-xs">No research history yet</span>
                </div>
              )
            ) : (
              <AnimatePresence initial={false}>
                {history.map((h) => {
                  const isActive = currentProjectId === h.id;
                  return (
                    <motion.button
                      key={h.id}
                      onClick={() => onSelectProject(h.id)}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex flex-col text-left w-full p-2.5 rounded-lg border text-xs transition-all duration-150 cursor-pointer ${
                        isActive
                          ? "bg-zinc-800/40 border-purple-500/40 shadow-sm"
                          : "bg-transparent border-zinc-900 hover:border-zinc-800/50 hover:bg-zinc-900/20"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase font-extrabold tracking-wider ${
                          h.status === "completed" ? "bg-emerald-950/50 text-emerald-400 border border-emerald-900/30" :
                          h.status === "failed" ? "bg-rose-950/50 text-rose-400 border border-rose-900/30" :
                          "bg-amber-950/50 text-amber-400 border border-amber-900/30 animate-pulse"
                        }`}>
                          {h.status}
                        </span>
                        {!isCollapsed && (
                          <span className="text-[9px] text-zinc-600 font-medium">
                            {new Date(h.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })}
                          </span>
                        )}
                      </div>
                      {!isCollapsed && (
                        <span className="font-semibold text-zinc-100 truncate w-full" title={h.query}>
                          {h.query}
                        </span>
                      )}
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Sidebar Footer / Settings Button */}
        <div className="p-3 border-t border-zinc-800/20">
          <button
            onClick={() => setShowSettings(true)}
            className={`flex items-center gap-3 w-full py-2.5 px-3 rounded-lg text-xs font-semibold text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/30 border border-transparent hover:border-zinc-800/30 transition-all cursor-pointer ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
          >
            <Settings size={16} />
            {!isCollapsed && <span>API CONFIGURATION</span>}
          </button>
        </div>
      </motion.div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass-card rounded-xl p-6 relative overflow-hidden"
            >
              {/* Glow background inside modal */}
              <div className="absolute top-[-50px] left-[-50px] w-[200px] h-[200px] rounded-full bg-purple-500/10 blur-[40px] pointer-events-none"></div>

              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <Database className="text-purple-400" size={18} />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">System Keys Config</h3>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                    Context.dev API Key
                  </label>
                  <input
                    type="password"
                    placeholder="Enter Context API Key"
                    value={contextKey}
                    onChange={(e) => setContextKey(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-800 bg-zinc-950/80 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
                  />
                  <span className="text-[9px] text-zinc-500 mt-1.5 block leading-normal">
                    Used for autonomous scraping and searching. A pre-configured key is active by default.
                  </span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1.5">
                    OpenAI API Key (Optional)
                  </label>
                  <input
                    type="password"
                    placeholder="sk-..."
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-zinc-800 bg-zinc-950/80 text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500/50"
                  />
                  <span className="text-[9px] text-zinc-500 mt-1.5 block leading-normal">
                    Used for parsing facts and report writing. If blank, ResearchOS uses the built-in regex parser and templates.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 mt-6">
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-900/40 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={saveKeys}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 cursor-pointer active:scale-95 shadow-md shadow-purple-500/10"
                >
                  Save Configuration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
