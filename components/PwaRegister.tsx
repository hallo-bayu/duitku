"use client";
import { useEffect, useState } from "react";

export default function PwaRegister() {
  const [prompt, setPrompt] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js")
        .then(reg => console.log("SW registered:", reg.scope))
        .catch(err => console.error("SW error:", err));
    }

    // Check if already installed (standalone mode)
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
      return;
    }

    // Listen for install prompt (Android Chrome)
    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setPrompt(null);
  }

  // Already installed or dismissed
  if (installed || dismissed || !prompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-lg mx-auto animate-[fadeUp_0.3s_ease-out]">
      <div
        className="flex items-center gap-3 p-4 rounded-2xl"
        style={{
          background: "rgba(14,14,14,0.97)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255,59,92,0.25)",
          boxShadow: "0 8px 32px rgba(255,59,92,0.20)",
        }}
      >
        <img src="/mascot.png" alt="Duitku" className="w-10 h-10 object-contain flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-black leading-tight">Install Duitku</p>
          <p className="text-[#666] text-xs mt-0.5">Tambah ke home screen</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setDismissed(true)}
            className="text-[#555] text-xs px-3 py-1.5 rounded-xl hover:text-[#888] transition-colors"
          >
            Nanti
          </button>
          <button
            onClick={handleInstall}
            className="text-white text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #FF3B5C, #CC2D48)",
              boxShadow: "0 2px 12px rgba(255,59,92,0.4)",
            }}
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}
