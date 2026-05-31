"use client";
import { useEffect, useRef } from "react";
import type { Message } from "@/lib/hooks/useChat";

function GiriMascot({ status, size = 48 }: { status?: string; size?: number }) {
  const src =
    status === "over"    ? "/brand/giri-over.png"  :
    status === "danger"  ? "/brand/giri-boros.png" :
    status === "warning" ? "/brand/giri-boros.png" :
    "/brand/giri-hemat.png";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="Giri" width={size * 2} height={size * 2}
      style={{ width: size, height: size, objectFit: "contain", flexShrink: 0,
        imageRendering: "auto", display: "block" }}
    />
  );
}

export default function ChatWindow({ messages, isLoading, personality }: {
  messages: Message[]; isLoading: boolean; personality?: string;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  return (
    <div className="chat-messages px-4 py-3 space-y-4">
      {messages.map(m => <Bubble key={m.id} message={m} />)}
      {isLoading && <LoadingBubble />}
      <div ref={bottomRef} className="h-2" />
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className="flex items-end gap-2.5">
      <GiriMascot status="safe" size={44} />
      <div className="rounded-2xl rounded-bl-sm px-4 py-3"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}>
        <div className="flex gap-1.5 items-center">
          <span className="loading-dot w-2 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.4)" }} />
          <span className="loading-dot w-2 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.4)" }} />
          <span className="loading-dot w-2 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.4)" }} />
        </div>
      </div>
    </div>
  );
}

function Bubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const time = message.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  const budgetStatus = message.stats?.status;
  const mascotStatus = budgetStatus === "over" ? "over" : budgetStatus === "danger" ? "danger" : budgetStatus === "warning" ? "warning" : "safe";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%]">
          <div className="rounded-2xl rounded-br-sm px-4 py-3"
            style={{ background: "rgba(255,59,92,0.16)", border: "1px solid rgba(255,59,92,0.25)" }}>
            {/* Teks user — murni putih, TANPA emoji uang */}
            <p style={{ fontSize: "15px", lineHeight: "1.55", color: "#ffffff" }}>{message.content}</p>
          </div>
          <p className="text-right mt-1 mr-1" style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>{time}</p>
        </div>
      </div>
    );
  }

  // Sanitize + render markdown — teks putih
  const html = message.content
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#ffffff;font-weight:800">$1</strong>')
    .replace(/`(.*?)`/g, '<code style="background:rgba(255,59,92,0.18);padding:2px 7px;border-radius:6px;color:#FF8095;font-size:12px;font-family:monospace">$1</code>')
    .split("\n").map(line => {
      // Bullet points jadi merah
      if (line.trim().startsWith("•")) return line.replace("•", '<span style="color:#FF3B5C">•</span>');
      return line;
    }).join("<br/>");

  return (
    <div className="flex items-end gap-2.5">
      <GiriMascot status={mascotStatus} size={46} />
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl rounded-bl-sm px-4 py-3"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}>
          {/* Teks AI — putih */}
          <p style={{ fontSize: "14px", lineHeight: "1.7", color: "#ffffff" }}
            dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        <p className="mt-1 ml-1" style={{ fontSize: "11px", color: "rgba(255,255,255,0.25)" }}>{time}</p>
      </div>
    </div>
  );
}
