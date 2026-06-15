"use client";

import React, { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2, MessageSquare, ArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface MessageItem {
  id?: string;
  role: "user" | "assistant";
  content: string;
}

interface ChatWidgetProps {
  projectId: string;
}

export default function ChatWidget({ projectId }: ChatWidgetProps) {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    { text: "What outliers were filtered out?", label: "Outliers" },
    { text: "How is the confidence score calculated?", label: "Formula" },
    { text: "What are the primary sources?", label: "Sources" }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  // Load existing chat history if any
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content: "I've synthesized the research data. Ask me anything about the findings, the source credibility ratings, or the statistical outliers we filtered out!"
      }
    ]);
  }, [projectId]);

  const handleSendMessage = async (text: string) => {
    if (!text || text.trim() === "" || isSending) return;

    const userMsg: MessageItem = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsSending(true);

    try {
      const res = await fetch(`/api/research/${projectId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text })
      });

      if (res.ok) {
        const assistantChat = await res.json();
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: assistantChat.content }
        ]);
      } else {
        setMessages(prev => [
          ...prev,
          { role: "assistant", content: "Sorry, I encountered an error communicating with the chat server." }
        ]);
      }
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [
        ...prev,
        { role: "assistant", content: "Network error. Please try again." }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="border-t border-zinc-800/40 bg-zinc-900/10 p-4">
      {/* Expand/Collapse Toggle */}
      <div className="flex items-center justify-between mb-3.5">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest hover:text-white cursor-pointer transition-colors"
        >
          <MessageSquare size={13} className="text-purple-400" />
          <span>Follow-up Q&A Engine {messages.length > 1 ? `(${messages.length - 1})` : ""}</span>
        </button>

        {!isExpanded && (
          <span className="text-[10px] text-zinc-500 font-semibold italic">
            Click to chat with report
          </span>
        )}
      </div>

      {/* Expanded Chat Dialog box */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex flex-col min-h-0 overflow-hidden"
          >
            {/* Scrollable messages container */}
            <div className="max-h-60 overflow-y-auto space-y-3.5 mb-4 pr-1 scrollbar-thin">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 text-xs leading-relaxed ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.role === "assistant" && (
                    <div className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-800/30 flex items-center justify-center flex-shrink-0 text-purple-400">
                      <Bot size={14} />
                    </div>
                  )}

                  <div
                    className={`p-3 rounded-xl max-w-[85%] ${
                      m.role === "user"
                        ? "bg-purple-600 text-white rounded-tr-none font-semibold ml-8"
                        : "bg-zinc-950/50 border border-zinc-805 text-zinc-300 rounded-tl-none mr-8"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>

                  {m.role === "user" && (
                    <div className="w-7 h-7 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 text-zinc-400">
                      <User size={14} />
                    </div>
                  )}
                </div>
              ))}

              {isSending && (
                <div className="flex gap-3 text-xs leading-relaxed justify-start items-center">
                  <div className="w-7 h-7 rounded-lg bg-purple-950/60 border border-purple-800/30 flex items-center justify-center flex-shrink-0 text-purple-400 animate-spin">
                    <Loader2 size={14} />
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest animate-pulse">
                    Analyzing Report Context...
                  </span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick shortcuts */}
            <div className="flex flex-wrap gap-1.5 mb-3.5">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q.text)}
                  disabled={isSending}
                  className="px-2.5 py-1 rounded bg-zinc-950 border border-zinc-900 text-[10px] font-semibold text-zinc-400 hover:text-white hover:border-zinc-800 transition-colors cursor-pointer disabled:opacity-40"
                >
                  {q.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input container */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputValue);
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a follow-up question..."
          className="flex-grow text-xs p-2.5 rounded-lg border border-zinc-800 bg-zinc-950/70 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
          onFocus={() => setIsExpanded(true)}
        />
        <button
          type="submit"
          disabled={inputValue.trim() === "" || isSending}
          className="p-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-45 transition-colors cursor-pointer active:scale-95 flex items-center justify-center"
        >
          <Send size={13} />
        </button>
      </form>
    </div>
  );
}
