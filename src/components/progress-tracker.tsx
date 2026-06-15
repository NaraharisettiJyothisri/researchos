"use client";

import React from "react";
import { Loader2, CheckCircle2, Circle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export interface ResearchStep {
  step: number;
  name: string;
  status: "pending" | "running" | "completed" | "failed";
  message: string;
}

interface ProgressTrackerProps {
  steps: ResearchStep[];
  query: string;
}

export default function ProgressTracker({ steps, query }: ProgressTrackerProps) {
  // If steps array is empty, generate generic loading steps
  const displaySteps = steps.length > 0 ? steps : [
    { step: 1, name: "Query Analysis", status: "running", message: "Analyzing query structure and targets..." },
    { step: 2, name: "Web Searching", status: "pending", message: "Awaiting search initiation..." },
    { step: 3, name: "Fact Extraction", status: "pending", message: "Awaiting fact parsing..." },
    { step: 4, name: "Cross-Validation", status: "pending", message: "Awaiting clustering alignment..." },
    { step: 5, name: "Report Synthesis", status: "pending", message: "Awaiting markdown compiling..." },
    { step: 6, name: "Data Visualization", status: "pending", message: "Awaiting chart generation..." }
  ] as ResearchStep[];

  // Calculate percentage
  const completedCount = displaySteps.filter(s => s.status === "completed").length;
  const runningIdx = displaySteps.findIndex(s => s.status === "running");
  const percent = Math.round((completedCount / displaySteps.length) * 100) + (runningIdx !== -1 ? Math.round(50 / displaySteps.length) : 0);

  const getStepIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="text-emerald-400 w-5 h-5 flex-shrink-0" />;
      case "running":
        return <Loader2 className="text-purple-400 w-5 h-5 animate-spin flex-shrink-0" />;
      case "failed":
        return <AlertCircle className="text-rose-400 w-5 h-5 flex-shrink-0" />;
      default:
        return <Circle className="text-zinc-700 w-5 h-5 flex-shrink-0" />;
    }
  };

  return (
    <div className="w-full max-w-xl px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card rounded-2xl border border-zinc-800/50 p-6 relative overflow-hidden"
      >
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-[150px] h-[150px] rounded-full bg-purple-500/5 blur-[40px] pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/30 pb-4 mb-5">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-0.5">Autonomous Agent Loop</span>
            <span className="font-semibold text-zinc-300 text-xs truncate max-w-[280px]" title={query}>
              "{query}"
            </span>
          </div>
          <span className="font-bold text-white text-sm bg-purple-950/40 border border-purple-800/30 px-2 py-0.5 rounded-md">
            {percent}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1 bg-zinc-950 rounded-full mb-6 overflow-hidden border border-zinc-900">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.4 }}
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
          ></motion.div>
        </div>

        {/* Steps List */}
        <div className="space-y-4.5">
          {displaySteps.map((s) => {
            const isRunning = s.status === "running";
            const isCompleted = s.status === "completed";
            const isPending = s.status === "pending";
            
            return (
              <div
                key={s.step}
                className={`flex gap-3.5 transition-all duration-350 ${
                  isPending ? "opacity-35" : "opacity-100"
                }`}
              >
                <div className="mt-0.5">{getStepIcon(s.status)}</div>
                <div className="flex flex-col min-w-0">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    isRunning ? "text-purple-300" :
                    isCompleted ? "text-zinc-300" :
                    "text-zinc-500"
                  }`}>
                    {s.step}. {s.name}
                  </span>
                  <span className={`text-xs mt-1 leading-relaxed ${
                    isRunning ? "text-white font-medium animate-pulse" :
                    isCompleted ? "text-zinc-400 font-normal" :
                    "text-zinc-600"
                  }`}>
                    {s.message}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Terminal mock background footer info */}
        <div className="mt-6 pt-4 border-t border-zinc-800/20 flex items-center justify-between text-[9px] text-zinc-500 font-mono">
          <span>Engine version: v1.0.5-beta</span>
          <span>Target: context.dev api</span>
        </div>
      </motion.div>
    </div>
  );
}
