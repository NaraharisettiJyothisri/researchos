"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/sidebar";
import SearchInput from "@/components/search-input";
import ProgressTracker, { ResearchStep } from "@/components/progress-tracker";
import ReportView from "@/components/report-view";
import SourcePanel from "@/components/source-panel";
import ChatWidget from "@/components/chat-widget";
import { AlertCircle, RefreshCw, Terminal, ArrowRight, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [researchMode, setResearchMode] = useState<string>("deep");
  const [projectStatus, setProjectStatus] = useState<string>("idle");
  const [steps, setSteps] = useState<ResearchStep[]>([]);
  const [query, setQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Loaded Report Data
  const [report, setReport] = useState<any>(null);
  const [plan, setPlan] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [facts, setFacts] = useState<any[]>([]);
  const [selectedSource, setSelectedSource] = useState<any | null>(null);

  // Status Polling Effect
  useEffect(() => {
    if (!currentProjectId) return;

    let pollInterval: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const res = await fetch(`/api/research/${currentProjectId}/status`);
        if (!res.ok) throw new Error("Failed to fetch project status");
        
        const data = await res.json();
        
        setQuery(data.query);
        setProjectStatus(data.status);
        setSteps(data.steps || []);
        
        if (data.status === "completed") {
          setReport(data.report);
          setPlan(data.plan);
          setSources(data.sources);
          setFacts(data.facts);
          setIsLoading(false);
          clearInterval(pollInterval);
        } else if (data.status === "failed") {
          let errMsg = "Deep research process halted due to engine discrepancy.";
          if (data.steps && data.steps.some((s: any) => s.status === "failed")) {
            const failedStep = data.steps.find((s: any) => s.status === "failed");
            errMsg = `Failed at Step ${failedStep.step} (${failedStep.name}): ${failedStep.message}`;
          }
          setErrorMsg(errMsg);
          setIsLoading(false);
          clearInterval(pollInterval);
        }
      } catch (err: any) {
        console.error("Polling error:", err);
        setErrorMsg(err.message || "Connection timed out.");
        setIsLoading(false);
        clearInterval(pollInterval);
      }
    };

    // Immediately check once
    checkStatus();

    // Poll every 1500ms
    pollInterval = setInterval(checkStatus, 1500);

    return () => clearInterval(pollInterval);
  }, [currentProjectId]);

  const handleStartResearch = async (searchQuery: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    setReport(null);
    setPlan(null);
    setSources([]);
    setFacts([]);
    setSelectedSource(null);
    setProjectStatus("pending");
    setSteps([]);
    setQuery(searchQuery);

    try {
      const res = await fetch("/api/research/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, mode: researchMode })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to initialize research session.");
      }

      const data = await res.json();
      setCurrentProjectId(data.projectId);
    } catch (err: any) {
      console.error("Failed starting research:", err);
      setErrorMsg(err.message || "Internal server connection failed.");
      setIsLoading(false);
      setProjectStatus("idle");
    }
  };

  const handleSelectProject = (projectId: string | null) => {
    setSelectedSource(null);
    setErrorMsg(null);
    if (!projectId) {
      handleNewResearch();
      return;
    }
    setCurrentProjectId(projectId);
    setIsLoading(true);
    setReport(null);
  };

  const handleNewResearch = () => {
    setCurrentProjectId(null);
    setProjectStatus("idle");
    setSteps([]);
    setQuery("");
    setReport(null);
    setPlan(null);
    setSources([]);
    setFacts([]);
    setSelectedSource(null);
    setErrorMsg(null);
    setIsLoading(false);
  };

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans antialiased text-zinc-300 relative">
      {/* Background Neon Orbs */}
      <div className="ambient-glow-1"></div>
      <div className="ambient-glow-2"></div>

      {/* Sidebar navigation */}
      <Sidebar
        currentProjectId={currentProjectId}
        onSelectProject={handleSelectProject}
        onNewResearch={handleNewResearch}
        researchMode={researchMode}
        setResearchMode={setResearchMode}
      />

      {/* Main Panel Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        <AnimatePresence mode="wait">
          {/* 1. IDLE SEARCH ENTRY VIEW */}
          {projectStatus === "idle" && (
            <motion.div
              key="search-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="flex-grow flex items-center justify-center p-6"
            >
              <SearchInput 
                onSubmit={handleStartResearch} 
                isLoading={isLoading} 
                researchMode={researchMode} 
              />
            </motion.div>
          )}

          {/* 2. PROGRESS TRACKER VIEW (LOADING) */}
          {(projectStatus === "pending" || 
            projectStatus === "planning" || 
            projectStatus === "searching" || 
            projectStatus === "extracting" || 
            projectStatus === "validating") && (
            <motion.div
              key="progress-view"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex-grow flex items-center justify-center p-6"
            >
              <ProgressTracker steps={steps} query={query} />
            </motion.div>
          )}

          {/* 3. GENERATED COMPLETED REPORT VIEW */}
          {projectStatus === "completed" && report && (
            <motion.div
              key="report-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col h-full overflow-hidden"
            >
              <div className="flex-1 overflow-hidden flex flex-col">
                <ReportView
                  query={query}
                  mode={researchMode}
                  plan={plan}
                  report={report}
                  sources={sources}
                  facts={facts}
                  onSourceClick={(s) => setSelectedSource(s)}
                />
                
                {/* Embedded Notion/Linear style follow-up Chat widget */}
                <ChatWidget projectId={currentProjectId!} />
              </div>
            </motion.div>
          )}

          {/* 4. ERROR/FAILED VIEW */}
          {projectStatus === "failed" && (
            <motion.div
              key="error-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-grow flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto"
            >
              <div className="p-4 rounded-full bg-rose-950/40 border border-rose-900/30 text-rose-400 mb-4 animate-bounce">
                <AlertCircle size={28} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Research Session Halted</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6">
                {errorMsg || "An unexpected error occurred during document extraction or validation."}
              </p>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={handleNewResearch}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-900 cursor-pointer transition-all active:scale-95"
                >
                  Back to Search
                </button>
                <button
                  onClick={() => handleStartResearch(query)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-purple-600 hover:bg-purple-500 cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 shadow-md shadow-purple-500/10"
                >
                  <RefreshCw size={13} />
                  <span>Retry Pipeline</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slide-over document inspector panel */}
      <AnimatePresence>
        {selectedSource && (
          <SourcePanel
            source={selectedSource}
            facts={facts}
            onClose={() => setSelectedSource(null)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
