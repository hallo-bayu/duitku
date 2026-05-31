"use client";
import { useEffect, useRef } from "react";
import type { Message } from "@/lib/hooks/useChat";

export default function ChatWindow({ messages, isLoading }: { messages: Message[]; isLoading: boolean }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isLoading]);

  return (
    <div className="chat-messages px-4 py-3 space-y-3 relative z-10">
      <div className="flex items-center gap-1.5 px-1 mb-1">
        <span className="w-2 h-2 rounded-full bg-green-400" style={{ boxShadow: "0 0 6px rgba(74,222,128,0.6)" }} />
        <span className="text-[#555] text-xs">Online</span>
      </div>
      {messages.map(m => <Bubble key={m.id} message={m} />)}
      {isLoading && <LoadingBubble />}
      <div ref={bottomRef} className="h-1" />
    </div>
  );
}

function LoadingBubble() {
  return (
    <div className="flex items-end gap-2">
      {/* Hapus icon uang — langsung bubble saja */}
      <div className="rounded-2xl rounded-bl-sm px-4 py-3"
        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex gap-1.5 items-center">
          <span className="loading-dot w-1.5 h-1.5 rounded-full bg-white/30" />
          <span className="loading-dot w-1.5 h-1.5 rounded-full bg-white/30" />
          <span className="loading-dot w-1.5 h-1.5 rounded-full bg-white/30" />
        </div>
      </div>
    </div>
  );
}

function Bubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const time = message.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%]">
          <div className="rounded-2xl rounded-br-sm px-4 py-3"
            style={{ background: "rgba(255,59,92,0.15)", border: "1px solid rgba(255,59,92,0.25)", boxShadow: "0 2px 12px rgba(255,59,92,0.10)" }}>
            <p style={{ fontSize: "15px", lineHeight: "1.5", color: "#fff" }}>{message.content}</p>
          </div>
          <p className="text-[11px] text-right mt-1 mr-1" style={{ color: "#444" }}>{time}</p>
        </div>
      </div>
    );
  }

  // Parse markdown — NO icon prefix
  const html = message.content
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff">$1</strong>')
    .replace(/`(.*?)`/g, '<code style="background:rgba(255,59,92,0.15);padding:1px 6px;border-radius:6px;color:#FF3B5C;font-size:12px">$1</code>')
    .split("\n").join("<br/>");

  return (
    <div className="flex items-end gap-0 max-w-[82%]">
      {/* Hapus icon uang di sini — langsung bubble */}
      <div className="w-full">
        <div className="rounded-2xl rounded-bl-sm px-4 py-3"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>
          <p style={{ fontSize: "14px", lineHeight: "1.65", color: "#ddd" }}
            dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        <p className="text-[11px] mt-1 ml-1" style={{ color: "#444" }}>{time}</p>
      </div>
    </div>
  );
}
