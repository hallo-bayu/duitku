"use client";
import { useEffect, useRef } from "react";
import type { Message } from "@/lib/hooks/useChat";

// Mascot Giri sesuai status budget / personality
function GiriMascot({ status, size = 52 }: { status?: string; size?: number }) {
  // Pilih gambar Giri sesuai kondisi
  const src =
    status === "over"    ? "/brand/giri-over.png"   :
    status === "warning" || status === "danger" ? "/brand/giri-boros.png" :
    status === "sultan"  ? "/brand/giri-sultan.png"  :
    "/brand/giri-hemat.png"; // default = hemat/safe

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt="Giri"
      style={{ width: size, height: size, objectFit: "contain", flexShrink: 0 }}
    />
  );
}

export default function ChatWindow({
  messages, isLoading, personality,
}: {
  messages: Message[];
  isLoading: boolean;
  personality?: string;
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
      <GiriMascot status="safe" size={40} />
      <div className="rounded-2xl rounded-bl-sm px-4 py-3"
        style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
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

  // Tentukan mood Giri dari stats
  const budgetStatus = message.stats?.status;
  const mascotStatus =
    budgetStatus === "over"    ? "over"    :
    budgetStatus === "danger"  ? "danger"  :
    budgetStatus === "warning" ? "warning" : "safe";

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%]">
          <div className="rounded-2xl rounded-br-sm px-4 py-3"
            style={{ background: "rgba(255,59,92,0.14)", border: "1px solid rgba(255,59,92,0.22)" }}>
            <p style={{ fontSize: "15px", lineHeight: "1.55", color: "#fff" }}>{message.content}</p>
          </div>
          <p className="text-[11px] text-right mt-1 mr-1" style={{ color: "#444" }}>{time}</p>
        </div>
      </div>
    );
  }

  // Sanitize markdown untuk AI bubble
  const html = message.content
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff;font-weight:700">$1</strong>')
    .replace(/`(.*?)`/g, '<code style="background:rgba(255,59,92,0.15);padding:2px 7px;border-radius:6px;color:#FF6B80;font-size:12px">$1</code>')
    .split("\n").join("<br/>");

  return (
    <div className="flex items-end gap-2.5">
      {/* Giri mascot muncul di setiap reply AI */}
      <GiriMascot status={mascotStatus} size={44} />
      <div className="flex-1 min-w-0">
        <div className="rounded-2xl rounded-bl-sm px-4 py-3 inline-block max-w-full"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", backdropFilter: "blur(20px)" }}>
          <p style={{ fontSize: "14px", lineHeight: "1.65", color: "#ddd" }}
            dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        <p className="text-[11px] mt-1 ml-1" style={{ color: "#444" }}>{time}</p>
      </div>
    </div>
  );
}
