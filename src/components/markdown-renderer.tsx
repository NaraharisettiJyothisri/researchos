import React from "react";

interface MarkdownRendererProps {
  content: string;
  onCitationClick?: (index: number) => void;
}

export default function MarkdownRenderer({ content, onCitationClick }: MarkdownRendererProps) {
  if (!content) return null;

  // Split into lines to parse block elements
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let currentListType: "ul" | "ol" | null = null;
  let inCodeBlock = false;
  let codeLines: string[] = [];

  const parseInlineStyles = (text: string) => {
    // 1. Matches citations like [1] or [2]
    const citationRegex = /\[(\d+)\]/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;

    // Apply basic bold formatting: **text**
    const applyBold = (txt: string): React.ReactNode[] => {
      const boldParts = txt.split(/\*\*(.*?)\*\*/g);
      return boldParts.map((part, i) => {
        if (i % 2 === 1) {
          return <strong key={`bold-${i}`} className="text-white font-semibold">{part}</strong>;
        }
        return part;
      });
    };

    while ((match = citationRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      const citationNumber = parseInt(match[1]);

      // Add text before citation
      if (matchIndex > lastIndex) {
        parts.push(...applyBold(text.substring(lastIndex, matchIndex)));
      }

      // Add interactive citation badge
      parts.push(
        <button
          key={`citation-${matchIndex}`}
          onClick={() => onCitationClick && onCitationClick(citationNumber)}
          className="inline-flex items-center justify-center w-5 h-5 mx-0.5 text-[10px] font-bold text-purple-400 bg-purple-950/60 border border-purple-800/40 rounded-full hover:bg-purple-800 hover:text-white transition-all transform active:scale-95 cursor-pointer shadow-sm align-middle"
          title={`View Source [${citationNumber}]`}
        >
          {citationNumber}
        </button>
      );

      lastIndex = citationRegex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(...applyBold(text.substring(lastIndex)));
    }

    return parts.length > 0 ? parts : applyBold(text);
  };

  const flushList = (key: string) => {
    if (currentList.length > 0) {
      if (currentListType === "ul") {
        elements.push(<ul key={`ul-${key}`} className="list-disc pl-6 mb-4 space-y-1.5 text-zinc-300">{...currentList}</ul>);
      } else {
        elements.push(<ol key={`ol-${key}`} className="list-decimal pl-6 mb-4 space-y-1.5 text-zinc-300">{...currentList}</ol>);
      }
      currentList = [];
      currentListType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Handle Code Blocks
    if (line.startsWith("```")) {
      if (inCodeBlock) {
        // End of code block
        elements.push(
          <pre key={`code-${i}`} className="bg-zinc-950/80 border border-zinc-800/50 p-4 rounded-lg overflow-x-auto mb-4 font-mono text-xs text-zinc-300">
            <code>{codeLines.join("\n")}</code>
          </pre>
        );
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(lines[i]); // Keep original line with spacing
      continue;
    }

    // Handle Headings
    if (line.startsWith("### ")) {
      flushList(String(i));
      elements.push(<h3 key={`h3-${i}`} className="text-lg font-bold text-white mt-5 mb-2.5 tracking-tight">{parseInlineStyles(line.slice(4))}</h3>);
    } else if (line.startsWith("## ")) {
      flushList(String(i));
      elements.push(<h2 key={`h2-${i}`} className="text-xl font-bold text-white mt-6 mb-3 border-b border-zinc-800/40 pb-1 tracking-tight">{parseInlineStyles(line.slice(3))}</h2>);
    } else if (line.startsWith("# ")) {
      flushList(String(i));
      elements.push(<h1 key={`h1-${i}`} className="text-2xl font-black text-white mt-8 mb-4 border-b border-zinc-850 pb-2 tracking-tight">{parseInlineStyles(line.slice(2))}</h1>);
    }
    // Handle Blockquotes
    else if (line.startsWith("> ")) {
      flushList(String(i));
      elements.push(
        <blockquote key={`quote-${i}`} className="border-l-2 border-purple-500/80 pl-4 py-1 italic text-zinc-400 my-4 bg-purple-950/5 rounded-r">
          {parseInlineStyles(line.slice(2))}
        </blockquote>
      );
    }
    // Handle Unordered Lists
    else if (line.startsWith("* ") || line.startsWith("- ")) {
      if (currentListType !== "ul") {
        flushList(String(i));
        currentListType = "ul";
      }
      currentList.push(<li key={`li-${i}`} className="leading-relaxed">{parseInlineStyles(line.slice(2))}</li>);
    }
    // Handle Ordered Lists
    else if (/^\d+\.\s/.test(line)) {
      if (currentListType !== "ol") {
        flushList(String(i));
        currentListType = "ol";
      }
      const match = line.match(/^\d+\.\s(.*)/);
      const content = match ? match[1] : line;
      currentList.push(<li key={`li-${i}`} className="leading-relaxed">{parseInlineStyles(content)}</li>);
    }
    // Empty Line
    else if (line === "") {
      flushList(String(i));
    }
    // Horizontal Rule
    else if (line === "---") {
      flushList(String(i));
      elements.push(<hr key={`hr-${i}`} className="border-zinc-800/40 my-6" />);
    }
    // Regular Paragraph
    else {
      flushList(String(i));
      elements.push(<p key={`p-${i}`} className="mb-4 text-zinc-300 leading-relaxed text-sm md:text-base font-normal">{parseInlineStyles(line)}</p>);
    }
  }

  // Flush any remaining list at the end
  flushList("end");

  return <div className="markdown-content tracking-normal selection:bg-purple-950/40">{elements}</div>;
}
