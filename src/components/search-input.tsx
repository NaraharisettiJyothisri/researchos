"use client";

import React, { useState } from "react";
import { Search, Sparkles, ArrowRight, CornerDownLeft } from "lucide-react";
import { motion } from "framer-motion";

interface SearchInputProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
  researchMode: string;
}

export default function SearchInput({ onSubmit, isLoading, researchMode }: SearchInputProps) {
  const [query, setQuery] = useState("");

  const suggestions = [
    { text: "How many AirPods were sold this year?", label: "AirPods Sales" },
    { text: "Tesla global deliveries breakdown 2025", label: "Tesla EV Deliveries" },
    { text: "Global smart hearables market share insights", label: "Hearables Shares" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() === "" || isLoading) return;
    onSubmit(query.trim());
  };

  const handleSuggestionClick = (text: string) => {
    setQuery(text);
    onSubmit(text);
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-2xl w-full px-4 text-center">
      {/* Title / Heading */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/40 border border-purple-800/40 mb-3.5 shadow-sm">
          <Sparkles size={11} className="text-purple-400 animate-pulse" />
          <span className="text-[10px] font-bold text-purple-300 uppercase tracking-widest">
            Next-Gen Intelligence Engine
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-3">
          Research<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">OS</span>
        </h1>
        <p className="text-xs md:text-sm text-zinc-400 font-medium max-w-lg mx-auto leading-relaxed">
          Enter any research question. We will autonomously scrape web data, cross-validate facts, filter outliers, and write citation-backed reports.
        </p>
      </motion.div>

      {/* Main Search Input Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full relative group"
      >
        {/* Glow Ring behind Search Bar */}
        <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 blur-lg group-hover:opacity-35 transition duration-1000 group-focus-within:opacity-40"></div>

        <div className="relative flex items-center w-full rounded-2xl glass-card border border-zinc-800/40 p-1.5 focus-within:border-purple-500/50">
          <div className="pl-3.5 text-zinc-500">
            <Search size={18} />
          </div>
          
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isLoading}
            placeholder='Ask anything (e.g. "How many AirPods were sold this year?")...'
            className="w-full py-3.5 px-3 bg-transparent text-sm md:text-base text-white placeholder-zinc-500 focus:outline-none disabled:opacity-50"
          />

          <div className="flex items-center gap-2 pr-1.5">
            {/* active mode indicator badge */}
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-bold uppercase tracking-wider text-purple-400">
              {researchMode}
            </span>
            <button
              type="submit"
              disabled={query.trim() === "" || isLoading}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-40 disabled:hover:bg-purple-600 transition-all cursor-pointer active:scale-95"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </motion.form>

      {/* Suggested Template Queries */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mt-6 flex flex-wrap justify-center gap-2"
      >
        {suggestions.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSuggestionClick(s.text)}
            className="px-3 py-1.5 rounded-lg bg-zinc-950/60 border border-zinc-900 text-[10px] md:text-xs font-semibold text-zinc-400 hover:text-white hover:border-zinc-800 hover:bg-zinc-900/30 transition-all cursor-pointer active:scale-95"
          >
            {s.label}
          </button>
        ))}
      </motion.div>
    </div>
  );
}
