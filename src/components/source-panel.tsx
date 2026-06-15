"use client";

import React from "react";
import { X, ExternalLink, ShieldAlert, Award, FileText, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export interface SourceDetail {
  id: string;
  title: string;
  url: string;
  snippet: string;
  content?: string;
  reliabilityScore: number;
}

export interface FactDetail {
  id: string;
  sourceId: string | null;
  entity: string;
  metric: string;
  value: string;
  date: string | null;
  confidence: number;
  isOutlier: boolean;
}

interface SourcePanelProps {
  source: SourceDetail | null;
  facts: FactDetail[];
  onClose: () => void;
}

export default function SourcePanel({ source, facts, onClose }: SourcePanelProps) {
  if (!source) return null;

  // Filter facts belonging to this specific source
  const sourceFacts = facts.filter(f => f.sourceId === source.id);

  const getReliabilityColor = (score: number) => {
    if (score >= 0.9) return "text-emerald-400 border-emerald-950/40 bg-emerald-950/30";
    if (score >= 0.7) return "text-amber-400 border-amber-950/40 bg-amber-950/30";
    return "text-rose-400 border-rose-950/40 bg-rose-950/30";
  };

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0.8 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0.8 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed top-0 right-0 h-screen w-full max-w-md bg-zinc-950/95 border-l border-zinc-800/40 backdrop-blur-xl shadow-2xl z-40 flex flex-col"
    >
      {/* Panel Header */}
      <div className="p-5 border-b border-zinc-800/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="text-purple-400" size={16} />
          <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Document Inspector</span>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-white p-1 rounded hover:bg-zinc-900 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      {/* Panel Body Scroll Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Source Title and Link */}
        <div>
          <h2 className="text-base font-bold text-white leading-snug mb-2">{source.title}</h2>
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold group"
          >
            <span className="truncate max-w-[280px]">{source.url}</span>
            <ExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </div>

        {/* Reliability Score Card */}
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg border ${getReliabilityColor(source.reliabilityScore)}`}>
              <Award size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Source Reliability</span>
              <span className="text-xs text-zinc-500">Domain authority rating</span>
            </div>
          </div>
          <span className="text-xl font-black text-white">
            {Math.round(source.reliabilityScore * 100)}%
          </span>
        </div>

        {/* Extracted Facts Section */}
        {sourceFacts.length > 0 && (
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
              Extracted Facts ({sourceFacts.length})
            </span>
            <div className="space-y-2.5">
              {sourceFacts.map((f) => (
                <div
                  key={f.id}
                  className={`p-3 rounded-lg border text-xs ${
                    f.isOutlier
                      ? "border-rose-900/20 bg-rose-950/5 text-rose-300"
                      : "border-zinc-800 bg-zinc-950/40 text-zinc-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 font-bold uppercase tracking-wider text-[9px]">
                    <span className="text-purple-400">{f.entity}</span>
                    <span className={f.isOutlier ? "text-rose-400" : "text-zinc-500"}>
                      {f.isOutlier ? "OUTLIER" : "VALIDATED"}
                    </span>
                  </div>
                  <div className="font-semibold text-white mb-1">{f.metric}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold bg-zinc-900/60 border border-zinc-800 px-2 py-0.5 rounded text-white">
                      {f.value}
                    </span>
                    {f.date && (
                      <span className="text-[10px] text-zinc-500 font-medium">
                        Period: {f.date}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scraped Content text view */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
            Scraped Document Contents
          </span>
          <div className="p-4 rounded-xl border border-zinc-850 bg-zinc-900/10 font-sans text-xs leading-relaxed text-zinc-400 whitespace-pre-line max-h-[250px] overflow-y-auto">
            {source.content || "Document text is currently empty."}
          </div>
        </div>
      </div>

      {/* Footer stamp */}
      <div className="p-4 border-t border-zinc-800/20 bg-zinc-900/10 text-[9px] text-zinc-600 font-mono text-center">
        Fetched & Scraped via Context.dev
      </div>
    </motion.div>
  );
}
