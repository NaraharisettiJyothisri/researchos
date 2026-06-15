"use client";

import React, { useEffect, useState } from "react";
import { 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  Award, 
  FileText, 
  Database,
  Image as ImageIcon,
  CheckCircle,
  ExternalLink,
  Info
} from "lucide-react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import MarkdownRenderer from "./markdown-renderer";

interface StatsTableItem {
  metric: string;
  value: string;
  source: string;
  confidence: string;
  status: string;
}

interface ChartItem {
  type: string;
  title: string;
  description: string;
  xAxisKey: string;
  yAxisKey: string;
  data: any[];
}

interface ImageItem {
  url: string;
  caption: string;
  attribution: string;
}

interface SourceItem {
  id: string;
  title: string;
  url: string;
  snippet: string;
  reliabilityScore: number;
}

interface ReportViewProps {
  query: string;
  mode: string;
  plan: {
    steps: string[];
    metrics: string[];
    entities: string[];
    dateRange: string | null;
  } | null;
  report: {
    summary: string;
    keyFindings: string[];
    statsTable: StatsTableItem[];
    chartData: { charts: ChartItem[] };
    confidenceScore: number;
    outlierAnalysis: string | null;
    images: ImageItem[];
  } | null;
  sources: SourceItem[];
  facts: any[];
  onSourceClick: (source: SourceItem) => void;
}

export default function ReportView({
  query,
  mode,
  plan,
  report,
  sources,
  facts,
  onSourceClick
}: ReportViewProps) {
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<"report" | "sources" | "outliers">("report");

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!report) return null;

  const confidencePct = Math.round(report.confidenceScore * 100);
  const outlierFactsCount = facts.filter(f => f.isOutlier).length;

  // Render Recharts based on chart configuration
  const renderChart = (chart: ChartItem, idx: number) => {
    if (!isClient) return <div key={idx} className="h-64 bg-zinc-950/20 animate-pulse rounded-xl"></div>;

    const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f43f5e", "#10b981"];

    return (
      <div key={idx} className="p-4.5 rounded-xl border border-zinc-800/40 bg-zinc-900/30">
        <div className="mb-3.5">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">{chart.title}</h4>
          <span className="text-[10px] text-zinc-500 font-medium mt-0.5 block">{chart.description}</span>
        </div>
        
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chart.type === "bar" ? (
              <BarChart data={chart.data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(63, 63, 70, 0.15)" vertical={false} />
                <XAxis dataKey={chart.xAxisKey} stroke="#71717a" fontSize={9} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(9, 9, 11, 0.95)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "#fafafa"
                  }}
                />
                <Bar dataKey={chart.yAxisKey} fill="url(#barGradient)" radius={[4, 4, 0, 0]}>
                  {chart.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.85} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.25} />
                  </linearGradient>
                </defs>
              </BarChart>
            ) : chart.type === "line" ? (
              <LineChart data={chart.data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(63, 63, 70, 0.15)" vertical={false} />
                <XAxis dataKey={chart.xAxisKey} stroke="#71717a" fontSize={9} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={9} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: "rgba(9, 9, 11, 0.95)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "#fafafa"
                  }}
                />
                <Line
                  type="monotone"
                  dataKey={chart.yAxisKey}
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={{ r: 4, stroke: "#a78bfa", strokeWidth: 1.5, fill: "#0c0a09" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Pie
                  data={chart.data}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey={chart.yAxisKey}
                  nameKey={chart.xAxisKey}
                >
                  {chart.data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "rgba(9, 9, 11, 0.95)",
                    border: "1px solid rgba(139, 92, 246, 0.3)",
                    borderRadius: "8px",
                    fontSize: "11px",
                    color: "#fafafa"
                  }}
                />
              </PieChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const handleCitationClickInMarkdown = (index: number) => {
    // Sources are 1-indexed in markdown template, find array index
    const src = sources[index - 1];
    if (src) {
      onSourceClick(src);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden text-zinc-300">
      
      {/* Report Dashboard Header */}
      <div className="p-6 border-b border-zinc-800/20 bg-zinc-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded bg-purple-950/40 border border-purple-900/30 text-[9px] font-extrabold uppercase tracking-wider text-purple-400">
              {mode} Research
            </span>
            {plan?.dateRange && (
              <span className="text-[10px] text-zinc-500 font-semibold tracking-wide">
                Target Period: {plan.dateRange}
              </span>
            )}
          </div>
          <h2 className="text-xl md:text-2xl font-black text-white leading-tight truncate pr-4" title={query}>
            {query}
          </h2>
        </div>

        {/* Confidence gauge card */}
        <div className="flex items-center gap-4.5 bg-zinc-950/40 border border-zinc-800/40 p-3.5 rounded-xl flex-shrink-0">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-full border border-purple-500/15 bg-purple-950/10">
            <TrendingUp size={20} className="text-purple-400" />
            <svg className="absolute -inset-1 transform -rotate-90 w-14 h-14" viewBox="0 0 36 36">
              <path
                className="text-zinc-900"
                strokeWidth="1.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-purple-500"
                strokeWidth="2.0"
                strokeDasharray={`${confidencePct}, 100`}
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Consensus Confidence</span>
            <span className="text-xs text-purple-400 font-extrabold">{confidencePct}% Verified</span>
          </div>
        </div>
      </div>

      {/* Tabs Switch */}
      <div className="px-6 border-b border-zinc-800/20 bg-zinc-950/20 flex gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab("report")}
          className={`py-3 px-1 border-b-2 cursor-pointer transition-colors ${
            activeTab === "report" ? "border-purple-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Synthesis Report
        </button>
        <button
          onClick={() => setActiveTab("sources")}
          className={`py-3 px-1 border-b-2 cursor-pointer transition-colors ${
            activeTab === "sources" ? "border-purple-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Scraped Sources ({sources.length})
        </button>
        <button
          onClick={() => setActiveTab("outliers")}
          className={`py-3 px-1 border-b-2 cursor-pointer transition-colors ${
            activeTab === "outliers" ? "border-purple-500 text-white" : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Outlier Analysis {outlierFactsCount > 0 && <span className="bg-rose-950/60 text-rose-400 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-normal ml-1 border border-rose-900/30">{outlierFactsCount}</span>}
        </button>
      </div>

      {/* Report Dashboard Main View */}
      <div className="flex-1 overflow-y-auto p-6">
        
        {/* REPORT TAB */}
        {activeTab === "report" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            
            {/* Left: Summary and details */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Executive Summary */}
              <div className="glass-card rounded-2xl border border-zinc-850 p-6">
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="text-purple-400 w-4 h-4" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Synthesized Findings</span>
                </div>
                <MarkdownRenderer 
                  content={report.summary} 
                  onCitationClick={handleCitationClickInMarkdown} 
                />
              </div>

              {/* Comparative Stats Table */}
              {report.statsTable && report.statsTable.length > 0 && (
                <div className="glass-card rounded-2xl border border-zinc-850 p-6 overflow-hidden">
                  <div className="flex items-center gap-2 mb-4">
                    <Database className="text-purple-400 w-4 h-4" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Extracted Statistics Comparison</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                          <th className="py-2.5 px-3">Metric Target</th>
                          <th className="py-2.5 px-3">Extracted Value</th>
                          <th className="py-2.5 px-3">Document Source</th>
                          <th className="py-2.5 px-3">Weight</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-900">
                        {report.statsTable.map((row, idx) => (
                          <tr 
                            key={idx} 
                            className={`hover:bg-zinc-900/25 transition-colors ${
                              row.status.includes("Outlier") ? "opacity-45 bg-rose-950/5 text-rose-300" : ""
                            }`}
                          >
                            <td className="py-3 px-3 font-semibold text-zinc-300 max-w-[150px] truncate">{row.metric}</td>
                            <td className="py-3 px-3">
                              <span className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-bold text-white">
                                {row.value}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-zinc-400 truncate max-w-[150px]">{row.source}</td>
                            <td className="py-3 px-3">
                              <span className={`font-semibold ${
                                row.status.includes("Outlier") ? "text-rose-400" : "text-emerald-400"
                              }`}>
                                {row.confidence}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Charts and media gallery */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Visualizations Section */}
              {report.chartData?.charts && report.chartData.charts.length > 0 && (
                <div className="space-y-4">
                  {report.chartData.charts.map((c, idx) => renderChart(c, idx))}
                </div>
              )}

              {/* Supporting Images Gallery */}
              {report.images && report.images.length > 0 && (
                <div className="glass-card rounded-2xl border border-zinc-850 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon className="text-purple-400 w-4 h-4" />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Media Attachments</span>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {report.images.map((img, i) => (
                      <div key={i} className="group relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={img.url} 
                          alt={img.caption} 
                          className="w-full h-36 object-cover opacity-80 group-hover:opacity-100 group-hover:scale-102 transition-all duration-300"
                        />
                        <div className="p-3 bg-zinc-950/90 border-t border-zinc-900">
                          <p className="text-[11px] text-zinc-300 leading-normal mb-1">{img.caption}</p>
                          <span className="text-[9px] text-zinc-500 font-semibold">{img.attribution}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SOURCES TAB */}
        {activeTab === "sources" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sources.map((s, idx) => (
              <div
                key={s.id}
                onClick={() => onSourceClick(s)}
                className="glass-card rounded-2xl border border-zinc-850 p-5 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest font-mono">
                      Source [{idx + 1}]
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-purple-950/40 border border-purple-800/30 text-[9px] font-bold text-purple-400">
                      {Math.round(s.reliabilityScore * 100)}% reliability
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white mb-2 leading-snug group-hover:text-purple-400 line-clamp-2">
                    {s.title}
                  </h3>
                  <p className="text-[11px] text-zinc-400 line-clamp-3 leading-relaxed mb-4">
                    {s.snippet}
                  </p>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-900 pt-3 text-[10px] text-zinc-500 font-semibold">
                  <span className="truncate max-w-[180px]">{s.url}</span>
                  <span className="text-purple-400 group-hover:underline inline-flex items-center gap-0.5">
                    Inspect <ExternalLink size={10} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* OUTLIER ANALYSIS TAB */}
        {activeTab === "outliers" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-4 rounded-xl bg-amber-950/15 border border-amber-900/30 text-amber-400 flex items-start gap-3">
              <AlertTriangle className="flex-shrink-0 mt-0.5" size={16} />
              <div className="flex flex-col text-xs leading-relaxed">
                <span className="font-bold">Fact Alignment Notice</span>
                <span>Our cross-validation compares facts side-by-side using statistical deviation checks. Any figures that diverge by more than 35% from the median clustering or are hosted on low-reputation domains are flagged as outliers and excluded from main reporting charts.</span>
              </div>
            </div>

            <div className="glass-card rounded-2xl border border-zinc-850 p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Info className="text-purple-400" size={16} />
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Validation Logs</span>
              </div>
              
              <div className="text-xs md:text-sm leading-relaxed text-zinc-300 font-sans whitespace-pre-line bg-zinc-950/45 p-5 border border-zinc-900 rounded-xl">
                {report.outlierAnalysis || "No outliers were filtered during processing. All sources converged on consensus figures."}
              </div>
            </div>

            {/* List Outliers exactly */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">
                Analyzed Facts Breakdown
              </span>
              
              <div className="space-y-2.5">
                {facts.map((f, idx) => (
                  <div
                    key={f.id || idx}
                    className={`p-4 rounded-xl border flex items-center justify-between gap-4 text-xs ${
                      f.isOutlier
                        ? "border-rose-900/30 bg-rose-950/5 text-rose-300"
                        : "border-zinc-900 bg-zinc-950/30 text-zinc-400"
                    }`}
                  >
                    <div className="flex flex-col gap-1 min-w-0">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-purple-400">
                        {f.entity} &bull; {f.metric}
                      </span>
                      <span className="text-white font-semibold line-clamp-1">
                        Parsed Value: {f.value}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {f.isOutlier ? (
                        <span className="px-2.5 py-0.5 rounded-lg bg-rose-950 border border-rose-900/30 text-[9px] font-bold text-rose-400">
                          OUTLIER (Filtered)
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950 border border-emerald-900/30 text-[9px] font-bold text-emerald-400">
                          VALIDATED
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
