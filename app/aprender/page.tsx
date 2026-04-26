"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface GameButton {
  materia: string;
  tema: string;
}

const SUBJECTS = [
  { icon: "➕", label: "Matemática", color: "#e8a000" },
  { icon: "📖", label: "Português", color: "#2d8a00" },
  { icon: "🌍", label: "Geografia", color: "#1a6ed8" },
  { icon: "🔬", label: "Ciências", color: "#9b59b6" },
  { icon: "📜", label: "História", color: "#c84a00" },
  { icon: "🎵", label: "Artes", color: "#e84040" },
];

const GRADE_LEVELS = [
  "1º ano", "2º ano", "3º ano", "4º ano", "5º ano",
  "6º ano", "7º ano", "8º ano", "9º ano",
];

const QUICK_QUESTIONS = [
  "Frações — meu filho não entende nada",
  "Tabuada de multiplicação",
  "Divisão de sílabas",
  "Fotossíntese",
  "Independência do Brasil",
  "Regiões do Brasil",
];

function parseGameButton(content: string): { text: string; game: GameButton | null } {
  const match = content.match(/\[JOGAR_AGORA:materia=([^,]+),tema=([^\]]+)\]/);
  if (!match) return { text: content, game: null };
  const text = content.replace(match[0], "").trimEnd();
  return { text, game: { materia: match[1].trim(), tema: match[2].trim() } };
}

function MarkdownText({ text }: { text: string }) {
  const lines = text.split("\n");
  const html = lines
    .map((line) => {
      if (/^#{1,3} /.test(line)) {
        const content = line.replace(/^#{1,3} /, "");
        return `<div class="md-heading">${content.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</div>`;
      }
      if (line.startsWith("**") && line.endsWith("**") && line.length > 4) {
        return `<div class="md-section-title">${line.slice(2, -2)}</div>`;
      }
      if (/^\*\*.*\*\*/.test(line)) {
        return `<div class="md-line">${line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</div>`;
      }
      if (line.startsWith("- ") || line.startsWith("• ")) {
        return `<div class="md-bullet">▸ ${line.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</div>`;
      }
      if (/^\d+\. /.test(line)) {
        return `<div class="md-numbered">${line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</div>`;
      }
      if (line.startsWith("> ")) {
        return `<div class="md-quote">${line.slice(2)}</div>`;
      }
      if (line === "---" || line === "***") {
        return `<div class="md-divider"></div>`;
      }
      if (line.trim() === "") return `<div class="md-spacer"></div>`;
      return `<div class="md-line">${line
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.*?)\*/g, "<em>$1</em>")}</div>`;
    })
    .join("");

  return <div className="md-content" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function AprenderPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [gameButtons, setGameButtons] = useState<Record<number, GameButton>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [coins, setCoins] = useState(0);
  const [coinPop, setCoinPop] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = text || input.trim();
      if (!content || loading) return;

      const userMsg: Message = { role: "user", content };
      const newMessages = [...messages, userMsg];
      setMessages(newMessages);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages, subject, gradeLevel }),
        });

        if (!res.ok) throw new Error("erro");

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let fullText = "";
        const aiIndex = newMessages.length;

        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value);
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: fullText };
            return updated;
          });
        }

        const { game } = parseGameButton(fullText);
        if (game) setGameButtons((prev) => ({ ...prev, [aiIndex]: game }));

        setCoins((prev) => prev + 5);
        setCoinPop(true);
        setTimeout(() => setCoinPop(false), 1500);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Algo deu errado. Tente novamente." },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, subject, gradeLevel]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const goToGame = (game: GameButton) => {
    router.push(
      `/trilha?subject=${encodeURIComponent(game.materia)}&topic=${encodeURIComponent(game.tema)}`
    );
  };

  return (
    <div className="mario-chat-root">
      <style>{`
        /* ===== ROOT & LAYOUT ===== */
        .mario-chat-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #1a6ed8;
          background-image:
            radial-gradient(circle at 15% 30%, rgba(255,255,255,0.08) 2px, transparent 2px),
            radial-gradient(circle at 45% 15%, rgba(255,255,255,0.06) 1px, transparent 1px),
            radial-gradient(circle at 75% 40%, rgba(255,255,255,0.05) 2px, transparent 2px),
            radial-gradient(circle at 90% 20%, rgba(255,255,255,0.07) 1px, transparent 1px),
            linear-gradient(180deg, #1a6ed8 0%, #0d47a1 100%);
          font-family: 'VT323', monospace;
        }

        /* ===== HEADER ===== */
        .mario-header {
          background: repeating-linear-gradient(
            90deg,
            #c84a00 0px, #c84a00 32px,
            #8b3200 32px, #8b3200 64px
          );
          border-bottom: 4px solid #5a1e00;
          padding: 0 16px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          position: relative;
          z-index: 10;
        }
        .mario-header::after {
          content: '';
          position: absolute;
          bottom: -8px;
          left: 0; right: 0;
          height: 4px;
          background: #3a1200;
        }

        .header-logo {
          font-family: 'Press Start 2P', cursive;
          font-size: 10px;
          color: #ffd700;
          text-shadow: 2px 2px 0 #8b6000, 0 0 20px rgba(255,215,0,0.4);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .header-back {
          font-family: 'Press Start 2P', cursive;
          font-size: 7px;
          color: #fff8dc;
          text-decoration: none;
          background: rgba(0,0,0,0.3);
          padding: 5px 10px;
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: 3px;
          transition: background 0.15s;
        }
        .header-back:hover { background: rgba(0,0,0,0.5); }

        .coin-counter {
          font-family: 'Press Start 2P', cursive;
          font-size: 9px;
          color: #ffd700;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(0,0,0,0.3);
          padding: 5px 12px;
          border: 2px solid rgba(255,215,0,0.3);
          border-radius: 3px;
          position: relative;
        }
        .coin-pop {
          position: absolute;
          top: -24px;
          right: 0;
          font-family: 'Press Start 2P', cursive;
          font-size: 7px;
          color: #ffd700;
          animation: coinPopAnim 1.5s ease forwards;
          pointer-events: none;
          white-space: nowrap;
        }
        @keyframes coinPopAnim {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-20px); }
        }

        /* ===== MAIN LAYOUT ===== */
        .mario-body {
          display: flex;
          flex: 1;
          overflow: hidden;
        }

        /* ===== SIDEBAR ===== */
        .mario-sidebar {
          width: 200px;
          background: linear-gradient(180deg, #1a5c00 0%, #0f3d00 100%);
          border-right: 4px solid #0a2800;
          display: flex;
          flex-direction: column;
          gap: 0;
          flex-shrink: 0;
          overflow-y: auto;
        }
        @media (max-width: 768px) { .mario-sidebar { display: none; } }

        .sidebar-pipe-top {
          height: 16px;
          background: #2d8a00;
          border-bottom: 3px solid #1a5c00;
          border-top: 3px solid #4aaa00;
        }
        .sidebar-section {
          padding: 12px;
        }
        .sidebar-label {
          font-family: 'Press Start 2P', cursive;
          font-size: 6px;
          color: #4aaa00;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }

        .subject-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          padding: 7px 10px;
          background: rgba(0,0,0,0.3);
          border: 1px solid rgba(74,170,0,0.3);
          border-radius: 4px;
          color: #a8e07a;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          margin-bottom: 4px;
          text-align: left;
          transition: all 0.15s;
        }
        .subject-btn:hover { background: rgba(45,138,0,0.4); border-color: #4aaa00; color: #fff; }
        .subject-btn.active { background: #2d8a00; border-color: #4aaa00; color: #ffd700; font-weight: 600; }

        .grade-btn {
          font-family: 'VT323', monospace;
          font-size: 16px;
          color: #6aaa40;
          background: rgba(0,0,0,0.2);
          border: 1px solid rgba(74,170,0,0.2);
          border-radius: 3px;
          padding: 2px 7px;
          cursor: pointer;
          margin: 2px;
          transition: all 0.15s;
        }
        .grade-btn:hover { color: #fff; border-color: #4aaa00; }
        .grade-btn.active { background: #2d8a00; color: #ffd700; border-color: #4aaa00; }

        .quick-btn {
          display: block;
          width: 100%;
          text-align: left;
          padding: 7px 10px;
          background: rgba(0,0,0,0.25);
          border: 1px solid rgba(74,170,0,0.25);
          border-left: 3px solid #2d8a00;
          border-radius: 0 4px 4px 0;
          color: #a8e07a;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 12px;
          cursor: pointer;
          margin-bottom: 4px;
          transition: all 0.15s;
          line-height: 1.3;
        }
        .quick-btn:hover { background: rgba(45,138,0,0.35); color: #fff; }

        .sidebar-divider {
          height: 3px;
          background: linear-gradient(90deg, #1a5c00, #2d8a00, #1a5c00);
          margin: 4px 0;
        }

        /* ===== CHAT AREA ===== */
        .mario-chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          position: relative;
        }

        .mario-messages {
          flex: 1;
          overflow-y: auto;
          padding: 20px 20px 8px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .mario-messages::-webkit-scrollbar { width: 6px; }
        .mario-messages::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        .mario-messages::-webkit-scrollbar-thumb { background: #2d8a00; border-radius: 3px; }

        /* Empty state */
        .mario-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 20px;
          padding: 20px;
        }
        .mario-empty-mascot {
          font-size: 64px;
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

        .mario-speech-bubble {
          background: white;
          border: 4px solid #333;
          border-radius: 12px;
          padding: 14px 18px;
          position: relative;
          max-width: 380px;
          text-align: center;
        }
        .mario-speech-bubble::before {
          content: '';
          position: absolute;
          top: -18px;
          left: 50%;
          transform: translateX(-50%);
          border: 9px solid transparent;
          border-bottom-color: #333;
        }
        .mario-speech-bubble::after {
          content: '';
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          border: 7px solid transparent;
          border-bottom-color: white;
        }
        .bubble-title {
          font-family: 'Press Start 2P', cursive;
          font-size: 8px;
          color: #2d8a00;
          margin-bottom: 10px;
        }
        .bubble-text {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 14px;
          color: #333;
          line-height: 1.55;
        }

        .mario-quick-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          width: 100%;
          max-width: 440px;
        }
        .mario-quick-item {
          background: rgba(0,0,0,0.3);
          border: 2px solid rgba(255,255,255,0.15);
          border-radius: 6px;
          padding: 10px 12px;
          color: #e0f0d0;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 13px;
          cursor: pointer;
          text-align: left;
          transition: all 0.15s;
          line-height: 1.4;
        }
        .mario-quick-item:hover { background: rgba(45,138,0,0.5); border-color: #4aaa00; color: #fff; }

        /* ===== MESSAGES ===== */
        .msg-row-user { display: flex; justify-content: flex-end; }
        .msg-row-ai { display: flex; flex-direction: column; }

        .msg-ai-label {
          font-family: 'Press Start 2P', cursive;
          font-size: 6px;
          color: #4aaa00;
          margin-bottom: 5px;
          padding-left: 2px;
          letter-spacing: 0.5px;
        }

        .msg-bubble-ai {
          background: rgba(8, 40, 8, 0.92);
          border: 2px solid #2d8a00;
          border-top: 3px solid #4aaa00;
          border-radius: 0 10px 10px 10px;
          padding: 16px 18px;
          max-width: 85%;
          backdrop-filter: blur(4px);
          box-shadow: 0 2px 12px rgba(0,0,0,0.3);
        }
        .msg-bubble-user {
          background: rgba(15, 35, 100, 0.88);
          border: 2px solid #4060c0;
          border-radius: 10px 0 10px 10px;
          padding: 10px 14px;
          max-width: 70%;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 14px;
          color: #dde6ff;
          line-height: 1.5;
        }

        /* Markdown inside AI bubble */
        .md-content { font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; font-size: 14px; color: #d0f0c0; line-height: 1.65; }
        .md-heading { color: #ffd700; font-family: 'Press Start 2P', cursive; font-size: 8px; margin: 14px 0 6px; line-height: 2.2; letter-spacing: 0.5px; }
        .md-section-title { color: #7defa7; font-family: system-ui, -apple-system, sans-serif; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin: 12px 0 4px; }
        .md-line { margin: 3px 0; color: #d0f0c0; }
        .md-line strong { color: #ffd700; font-weight: 600; }
        .md-bullet { margin: 5px 0 5px 12px; color: #b8e8a0; line-height: 1.6; }
        .md-bullet strong { color: #ffd700; font-weight: 600; }
        .md-numbered { margin: 5px 0 5px 12px; color: #b8e8a0; line-height: 1.6; }
        .md-numbered strong { color: #ffd700; font-weight: 600; }
        .md-quote {
          border-left: 4px solid #ffd700;
          padding: 8px 14px;
          margin: 10px 0;
          background: rgba(255,215,0,0.07);
          color: #fffacd;
          font-size: 14px;
          font-style: italic;
          border-radius: 0 6px 6px 0;
          line-height: 1.6;
        }
        .md-divider { border-top: 1px solid rgba(45,138,0,0.6); margin: 12px 0; }
        .md-spacer { height: 5px; }

        /* Typing indicator */
        .typing-indicator { display: flex; gap: 6px; align-items: center; padding: 4px 0; }
        .typing-block {
          width: 12px; height: 12px;
          background: #ffd700;
          border: 2px solid #8b6000;
          animation: blockPulse 1s ease-in-out infinite;
          font-family: 'Press Start 2P', cursive;
          font-size: 7px;
          display: flex; align-items: center; justify-content: center;
          color: #000;
        }
        .typing-block:nth-child(2) { animation-delay: 0.2s; }
        .typing-block:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blockPulse { 0%,80%,100% { opacity: 0.3; } 40% { opacity: 1; } }

        /* Game button */
        .game-cta {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: 14px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #e8a000, #c67c00);
          border: 4px solid #ffd700;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.15s;
          width: fit-content;
          box-shadow: 4px 4px 0 #7a5000;
          animation: blockGlow 2s ease-in-out infinite;
        }
        .game-cta:hover { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 #7a5000; }
        .game-cta:active { transform: translate(2px, 2px); box-shadow: 2px 2px 0 #7a5000; }
        @keyframes blockGlow {
          0%,100% { border-color: #ffd700; }
          50% { border-color: #fff; box-shadow: 4px 4px 0 #7a5000, 0 0 16px rgba(255,215,0,0.6); }
        }
        .game-cta-icon { font-size: 28px; }
        .game-cta-text { font-family: 'Press Start 2P', cursive; font-size: 8px; color: #1a0a00; line-height: 1.8; }
        .game-cta-sub { font-family: system-ui, -apple-system, sans-serif; font-size: 12px; color: #5a3500; margin-top: 3px; font-weight: 500; }

        /* ===== INPUT AREA ===== */
        .mario-input-area {
          background: repeating-linear-gradient(
            90deg,
            #8b4513 0px, #8b4513 32px,
            #6b3410 32px, #6b3410 64px
          );
          border-top: 4px solid #5a2d0c;
          padding: 12px 16px;
          flex-shrink: 0;
        }
        .mario-input-area::before {
          display: block;
          height: 3px;
          background: #a05520;
          margin-bottom: 12px;
          content: '';
        }

        .mobile-subjects {
          display: none;
          gap: 8px;
          margin-bottom: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        @media (max-width: 768px) { .mobile-subjects { display: flex; } }

        .mobile-sub-btn {
          flex-shrink: 0;
          font-family: 'Press Start 2P', cursive;
          font-size: 6px;
          padding: 5px 8px;
          background: rgba(0,0,0,0.4);
          border: 2px solid rgba(255,255,255,0.2);
          border-radius: 3px;
          color: #fff;
          cursor: pointer;
          white-space: nowrap;
        }
        .mobile-sub-btn.active { background: #2d8a00; border-color: #4aaa00; }

        .input-row { display: flex; gap: 10px; align-items: flex-end; }

        .mario-textarea {
          flex: 1;
          background: #fff8dc;
          border: 3px solid #8b6000;
          border-radius: 6px;
          padding: 10px 14px;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 15px;
          color: #2a1a00;
          resize: none;
          outline: none;
          min-height: 50px;
          box-shadow: inset 2px 2px 0 rgba(0,0,0,0.1);
          line-height: 1.5;
        }
        .mario-textarea:focus { border-color: #2d8a00; box-shadow: inset 2px 2px 0 rgba(0,0,0,0.1), 0 0 0 2px rgba(45,138,0,0.3); }
        .mario-textarea::placeholder { color: #a08040; font-style: italic; }
        .mario-textarea:disabled { opacity: 0.6; }

        .mario-send-btn {
          height: 50px;
          padding: 0 18px;
          background: linear-gradient(180deg, #e84040 0%, #b00000 100%);
          border: none;
          border-radius: 4px;
          border-bottom: 5px solid #7a0000;
          font-family: 'Press Start 2P', cursive;
          font-size: 8px;
          color: #fff;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.1s;
          box-shadow: 3px 3px 0 rgba(0,0,0,0.3);
        }
        .mario-send-btn:hover:not(:disabled) { background: linear-gradient(180deg, #ff5555 0%, #cc0000 100%); }
        .mario-send-btn:active:not(:disabled) { transform: translateY(3px); border-bottom-width: 2px; }
        .mario-send-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .input-hint {
          font-family: 'VT323', monospace;
          font-size: 14px;
          color: rgba(255,248,220,0.5);
          margin-top: 6px;
        }
      `}</style>

      {/* ===== HEADER ===== */}
      <header className="mario-header">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/" className="header-back">← VOLTAR</Link>
          <div className="header-logo">👨‍🏫 PAI PROFESSOR</div>
        </div>
        <div className="coin-counter">
          🪙 {coins}
          {coinPop && <span className="coin-pop">+5 🪙</span>}
        </div>
      </header>

      <div className="mario-body">
        {/* ===== SIDEBAR ===== */}
        <aside className="mario-sidebar">
          <div className="sidebar-pipe-top" />

          <div className="sidebar-section">
            <div className="sidebar-label">MATÉRIA</div>
            {SUBJECTS.map((s) => (
              <button
                key={s.label}
                onClick={() => setSubject(s.label === subject ? "" : s.label)}
                className={`subject-btn ${subject === s.label ? "active" : ""}`}
              >
                <span>{s.icon}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          <div className="sidebar-divider" />

          <div className="sidebar-section">
            <div className="sidebar-label">ANO ESCOLAR</div>
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              {GRADE_LEVELS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGradeLevel(g === gradeLevel ? "" : g)}
                  className={`grade-btn ${gradeLevel === g ? "active" : ""}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-divider" />

          <div className="sidebar-section">
            <div className="sidebar-label">ATALHOS</div>
            {QUICK_QUESTIONS.map((q) => (
              <button key={q} onClick={() => sendMessage(q)} className="quick-btn">
                {q}
              </button>
            ))}
          </div>
        </aside>

        {/* ===== CHAT ===== */}
        <div className="mario-chat-area">
          <div className="mario-messages">
            {messages.length === 0 ? (
              <div className="mario-empty">
                <div className="mario-empty-mascot">👨‍🏫</div>
                <div className="mario-speech-bubble">
                  <div className="bubble-title">PROFESSOR PIXEL</div>
                  <div className="bubble-text">
                    Qual é o tema da tarefa do seu filho?
                    Me diz o assunto — tabuada, frações, fotossíntese, o que for —
                    e eu te entrego o conteúdo completo e um roteiro para ensinar!
                  </div>
                </div>
                <div className="mario-quick-grid">
                  {QUICK_QUESTIONS.map((q) => (
                    <button key={q} onClick={() => sendMessage(q)} className="mario-quick-item">
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => {
                if (msg.role === "user") {
                  return (
                    <div key={i} className="msg-row-user">
                      <div className="msg-bubble-user">{msg.content}</div>
                    </div>
                  );
                }

                const { text, game } = parseGameButton(msg.content);
                const savedGame = gameButtons[i];
                const activeGame = game || savedGame;

                return (
                  <div key={i} className="msg-row-ai">
                    <div className="msg-ai-label">▸ PROFESSOR PIXEL</div>
                    <div className="msg-bubble-ai">
                      {msg.content ? (
                        <MarkdownText text={text} />
                      ) : (
                        <div className="typing-indicator">
                          <div className="typing-block">?</div>
                          <div className="typing-block">?</div>
                          <div className="typing-block">?</div>
                        </div>
                      )}
                    </div>
                    {activeGame && (
                      <button className="game-cta" onClick={() => goToGame(activeGame)}>
                        <span className="game-cta-icon">⭐</span>
                        <div>
                          <div className="game-cta-text">JOGAR AGORA!</div>
                          <div className="game-cta-sub">
                            {activeGame.tema} · {activeGame.materia}
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                );
              })
            )}
            <div ref={chatEndRef} />
          </div>

          {/* ===== INPUT ===== */}
          <div className="mario-input-area">
            <div className="mobile-subjects">
              {SUBJECTS.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setSubject(s.label === subject ? "" : s.label)}
                  className={`mobile-sub-btn ${subject === s.label ? "active" : ""}`}
                >
                  {s.icon} {s.label}
                </button>
              ))}
            </div>

            <div className="input-row">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Qual é o tema da tarefa do seu filho?"
                rows={2}
                className="mario-textarea"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                className="mario-send-btn"
              >
                {loading ? "..." : "ENVIAR"}
              </button>
            </div>
            <div className="input-hint">
              Enter para enviar · Shift+Enter nova linha
              {subject && ` · ${subject}`}
              {gradeLevel && ` · ${gradeLevel}`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
