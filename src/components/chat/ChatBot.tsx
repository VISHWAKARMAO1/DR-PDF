import React, { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  X,
  Send,
  Paperclip,
  Loader2,
  Bot,
  User,
  FileText,
  Trash2,
  ChevronDown,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

interface PdfContext {
  name: string;
  text: string;
  pages: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const MODEL = "meta/llama-4-maverick-17b-128e-instruct";
const API_KEY = import.meta.env.VITE_NVIDIA_API_KEY as string | undefined;
const MAX_PDF_CHARS = 12_000; // trim PDF context to avoid token overflow

const SYSTEM_PROMPT = `You are Dr. PDF Pro AI – a friendly, expert PDF assistant embedded in Dr. PDF Pro, a browser-based PDF toolkit.

Your job:
• Answer questions about PDF files, workflows, and document best practices.
• If the user uploads a PDF, analyze its text and answer questions about it.
• Guide users on how to use the tools available in Dr. PDF Pro:
  Editor, Merge, Split, Organize, Compress, Extract Pages, Delete Pages, 
  Rotate Pages, Fill & Sign, Create Forms, Watermark, Protect, Unlock, OCR, Add Page Numbers, Flatten PDF.
• Keep responses concise, well-formatted with markdown when useful.
• If no NVIDIA API key is configured, explain that the user needs to add VITE_NVIDIA_API_KEY to their .env file.`;

// ── PDF text extraction (pdfjs-dist already in deps) ─────────────────────────
async function extractPdfText(file: File): Promise<{ text: string; pages: number }> {
  // @ts-ignore – pdfjs global worker already set up by other pages
  const pdfjsLib = await import("pdfjs-dist/build/pdf.mjs");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const buf = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buf }).promise;
  const numPages = doc.numPages;
  const parts: string[] = [];

  const maxPages = Math.min(numPages, 30); // cap extraction to 30 pages for perf
  for (let i = 1; i <= maxPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    parts.push(content.items.map((item: { str: string }) => item.str).join(" "));
  }

  let text = parts.join("\n\n").replace(/\s{3,}/g, "  ").trim();
  if (text.length > MAX_PDF_CHARS) {
    text = text.slice(0, MAX_PDF_CHARS) + "\n\n[...content truncated for brevity...]";
  }
  return { text, pages: numPages };
}

// ── NVIDIA API call (SSE streaming) ──────────────────────────────────────────
async function* callNvidiaStream(
  messages: { role: string; content: string }[]
): AsyncGenerator<string> {
  if (!API_KEY) {
    yield "⚠️ **No API key configured.**\n\nTo enable the AI assistant, add your NVIDIA API key to the project's `.env` file:\n\n```\nVITE_NVIDIA_API_KEY=your_key_here\n```\n\nGet a free key at [build.nvidia.com](https://build.nvidia.com).";
    return;
  }

  const res = await fetch(NVIDIA_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      max_tokens: 1024,
      temperature: 0.7,
      top_p: 0.95,
      stream: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text().catch(() => res.statusText);
    yield `❌ API error ${res.status}: ${err}`;
    return;
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === "data: [DONE]") continue;
      if (!trimmed.startsWith("data: ")) continue;

      try {
        const json = JSON.parse(trimmed.slice(6));
        const delta = json?.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        // skip malformed chunks
      }
    }
  }
}

// ── Component ─────────────────────────────────────────────────────────────────
export function ChatBot() {
  const { user } = useAuth();

  // Only show chatbot for authenticated users
  if (!user) return null;

  return <ChatBotInner />;
}

function ChatBotInner() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [pdfContext, setPdfContext] = useState<PdfContext | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) {
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  // Build messages array for API (with system prompt + optional PDF context)
  const buildApiMessages = useCallback(
    (history: ChatMessage[]) => {
      const systemContent = pdfContext
        ? `${SYSTEM_PROMPT}\n\n---\n**Loaded PDF: ${pdfContext.name} (${pdfContext.pages} pages)**\n\nContent:\n${pdfContext.text}`
        : SYSTEM_PROMPT;

      return [
        { role: "system", content: systemContent },
        ...history
          .filter((m) => m.role !== "system")
          .slice(-20) // keep last 20 messages to manage context window
          .map((m) => ({ role: m.role, content: m.content })),
      ];
    },
    [pdfContext]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isStreaming) return;

      setInput("");
      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmed,
        timestamp: Date.now(),
      };

      const updatedHistory = [...messages, userMsg];
      setMessages(updatedHistory);
      setIsStreaming(true);

      const assistantId = crypto.randomUUID();
      setMessages((prev) => [
        ...prev,
        { id: assistantId, role: "assistant", content: "", timestamp: Date.now() },
      ]);

      try {
        const apiMessages = buildApiMessages(updatedHistory);
        let fullContent = "";

        for await (const chunk of callNvidiaStream(apiMessages)) {
          fullContent += chunk;
          setMessages((prev) =>
            prev.map((m) => (m.id === assistantId ? { ...m, content: fullContent } : m))
          );
        }
      } catch (e) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: "❌ Error connecting to AI. Please try again." }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
        if (!open) setHasUnread(true);
      }
    },
    [messages, isStreaming, buildApiMessages, open]
  );

  const handlePdfUpload = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".pdf")) return;
    setPdfLoading(true);
    try {
      const { text, pages } = await extractPdfText(file);
      setPdfContext({ name: file.name, text, pages });

      const notice: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `📄 I've loaded **${file.name}** (${pages} page${pages !== 1 ? "s" : ""}).\n\nYou can now ask me anything about this document — summarize it, find specific information, explain sections, and more.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, notice]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "❌ Failed to extract text from that PDF. It may be scanned or encrypted.",
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setPdfLoading(false);
    }
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
    setPdfContext(null);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  // Welcome message
  const isEmpty = messages.length === 0;

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Open AI assistant"
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300",
          "bg-gradient-to-br from-[hsl(155,100%,48%)] to-[hsl(200,100%,50%)]",
          "hover:scale-110 hover:shadow-xl active:scale-95",
          open ? "rotate-[360deg]" : ""
        )}
        style={{ boxShadow: "0 0 20px hsl(155 100% 48% / 0.5), 0 4px 24px rgba(0,0,0,0.4)" }}
      >
        {open ? (
          <ChevronDown className="h-6 w-6 text-black" />
        ) : (
          <MessageCircle className="h-6 w-6 text-black" />
        )}
        {hasUnread && !open && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
            •
          </span>
        )}
      </button>

      {/* Chat panel */}
      <div
        className={cn(
          "fixed bottom-24 right-6 z-50 flex flex-col w-[380px] max-w-[calc(100vw-3rem)] rounded-2xl border shadow-2xl transition-all duration-300 overflow-hidden",
          "bg-[hsl(212,55%,6%)] border-[hsl(205,35%,18%)]",
          open
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
        style={{ height: "520px", boxShadow: "0 0 40px hsl(155 100% 48% / 0.15), 0 20px 60px rgba(0,0,0,0.6)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-[hsl(205,35%,18%)] bg-[hsl(212,55%,7%)] px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ background: "linear-gradient(135deg, hsl(155,100%,48%), hsl(200,100%,50%))" }}
            >
              <Bot className="h-4 w-4 text-black" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-tight">Dr. PDF AI</p>
              <p className="text-[10px] text-[hsl(155,100%,48%)] leading-tight">
                {isStreaming ? "Thinking…" : "Online"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {pdfContext && (
              <Badge
                variant="outline"
                className="hidden sm:flex items-center gap-1 text-[10px] border-[hsl(200,100%,50%)/40] text-[hsl(200,100%,65%)] bg-[hsl(200,100%,50%)/10]"
              >
                <FileText className="h-2.5 w-2.5" />
                {pdfContext.name.length > 16 ? `${pdfContext.name.slice(0, 14)}…` : pdfContext.name}
              </Badge>
            )}
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                onClick={clearChat}
                aria-label="Clear chat"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => setOpen(false)}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
          {isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center text-center gap-3 py-6">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-2xl"
                style={{ background: "linear-gradient(135deg, hsl(155,100%,48%/0.15), hsl(200,100%,50%/0.15))", border: "1px solid hsl(155,100%,48%/0.3)" }}
              >
                <Bot className="h-8 w-8" style={{ color: "hsl(155,100%,48%)" }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Hi! I'm Dr. PDF AI</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-[260px]">
                  Ask me anything about PDFs, upload a document to chat about it, or get help with any tool.
                </p>
              </div>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {["How do I merge PDFs?", "What can OCR do?", "How to add a watermark?"].map((q) => (
                  <button
                    key={q}
                    onClick={() => void sendMessage(q)}
                    className="rounded-full border border-[hsl(205,35%,22%)] bg-[hsl(210,40%,10%)] px-3 py-1.5 text-[11px] text-muted-foreground hover:border-[hsl(155,100%,48%)/40] hover:text-white transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "flex gap-2.5",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                    msg.role === "user"
                      ? "bg-[hsl(200,100%,50%)/20] border border-[hsl(200,100%,50%)/30]"
                      : "bg-[hsl(155,100%,48%)/15] border border-[hsl(155,100%,48%)/30]"
                  )}
                >
                  {msg.role === "user" ? (
                    <User className="h-3 w-3 text-[hsl(200,100%,65%)]" />
                  ) : (
                    <Bot className="h-3 w-3" style={{ color: "hsl(155,100%,48%)" }} />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={cn(
                    "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed",
                    msg.role === "user"
                      ? "rounded-tr-sm bg-[hsl(200,100%,50%)/15] text-white border border-[hsl(200,100%,50%)/25]"
                      : "rounded-tl-sm bg-[hsl(210,40%,12%)] text-[hsl(185,15%,90%)] border border-[hsl(205,35%,20%)]"
                  )}
                >
                  {msg.content === "" && msg.role === "assistant" ? (
                    <span className="flex items-center gap-1.5 text-[hsl(155,100%,48%)]">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Thinking…
                    </span>
                  ) : (
                    <MarkdownMessage content={msg.content} streaming={isStreaming && msg.id === messages[messages.length - 1]?.id && msg.role === "assistant"} />
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* PDF loading indicator */}
        {pdfLoading && (
          <div className="flex items-center gap-2 border-t border-[hsl(205,35%,18%)] bg-[hsl(212,55%,7%)] px-4 py-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[hsl(155,100%,48%)]" />
            <span className="text-[11px] text-muted-foreground">Extracting PDF text…</span>
          </div>
        )}

        {/* Input row */}
        <div className="border-t border-[hsl(205,35%,18%)] bg-[hsl(212,55%,7%)] px-3 py-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handlePdfUpload(f);
              e.currentTarget.value = "";
            }}
          />
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-[hsl(200,100%,65%)] transition-colors"
              onClick={() => fileInputRef.current?.click()}
              disabled={pdfLoading}
              title="Upload PDF to chat about it"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={pdfContext ? `Ask about ${pdfContext.name}…` : "Ask anything about PDFs…"}
              disabled={isStreaming}
              className="h-8 flex-1 border-[hsl(205,35%,22%)] bg-[hsl(210,40%,10%)] text-[12.5px] text-white placeholder:text-muted-foreground/60 focus-visible:ring-[hsl(155,100%,48%)/50]"
            />

            <Button
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => void sendMessage(input)}
              disabled={!input.trim() || isStreaming}
              style={{
                background: input.trim() && !isStreaming
                  ? "linear-gradient(135deg, hsl(155,100%,48%), hsl(200,100%,50%))"
                  : undefined,
              }}
            >
              {isStreaming ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5 text-black" />
              )}
            </Button>
          </div>

          {pdfContext && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <FileText className="h-3 w-3 text-[hsl(200,100%,60%)]" />
              <span className="text-[10px] text-[hsl(200,100%,60%)]">{pdfContext.name}</span>
              <button
                onClick={() => setPdfContext(null)}
                className="ml-auto text-[10px] text-muted-foreground hover:text-red-400 transition-colors"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ── Minimal markdown renderer (bold, code, lists, line breaks) ────────────────
function MarkdownMessage({ content, streaming }: { content: string; streaming?: boolean }) {
  const lines = content.split("\n");

  return (
    <div>
      {lines.map((line, i) => {
        if (line.startsWith("# ")) {
          return <p key={i} className="font-bold text-sm mb-1">{renderInline(line.slice(2))}</p>;
        }
        if (line.startsWith("## ")) {
          return <p key={i} className="font-semibold mb-0.5">{renderInline(line.slice(3))}</p>;
        }
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return <p key={i} className="flex gap-1.5"><span className="mt-1 text-[hsl(155,100%,48%)] shrink-0">•</span><span>{renderInline(line.slice(2))}</span></p>;
        }
        if (line.startsWith("```")) {
          return null; // handled in block below
        }
        if (line.trim() === "") return <br key={i} />;
        return <p key={i}>{renderInline(line)}</p>;
      })}
      {streaming && <span className="typing-cursor" />}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="rounded px-1 py-0.5 text-[11px] bg-[hsl(210,40%,18%)] text-[hsl(155,100%,65%)] font-mono">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}
