"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
];

const GRADE_LEVELS = [
  "1º ano", "2º ano", "3º ano", "4º ano", "5º ano",
  "6º ano", "7º ano", "8º ano", "9º ano",
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

export default function AnalisarPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [gameButton, setGameButton] = useState<GameButton | null>(null);
  const [coins, setCoins] = useState(0);
  const [coinPop, setCoinPop] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");

  // Scroll to result when it starts streaming
  useEffect(() => {
    if (loading && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [loading]);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Por favor, envie uma imagem (JPG, PNG, etc.)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Imagem muito grande. Máximo 10MB.");
      return;
    }
    setError("");
    setImageFile(file);
    setResult("");
    setGameButton(null);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const analyze = async () => {
    if (!imageFile || loading) return;

    setLoading(true);
    setResult("");
    setGameButton(null);
    setError("");

    try {
      // Convert file to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          // Remove "data:image/xxx;base64," prefix
          resolve(dataUrl.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      const res = await fetch("/api/analyze-homework", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: imageFile.type,
          subject,
          gradeLevel,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Erro ao analisar a tarefa");
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      while (true) {
        const { done, value } = reader.read ? await reader.read() : { done: true, value: undefined };
        if (done) break;
        fullText += decoder.decode(value);
        setResult(fullText);
      }

      const { game } = parseGameButton(fullText);
      if (game) setGameButton(game);

      setCoins((prev) => prev + 10);
      setCoinPop(true);
      setTimeout(() => setCoinPop(false), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Algo deu errado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const goToGame = (game: GameButton) => {
    router.push(`/trilha?subject=${encodeURIComponent(game.materia)}&topic=${encodeURIComponent(game.tema)}`);
  };

  const { text: resultText } = parseGameButton(result);

  return (
    <div className="analisar-root">
      <style>{`
        /* ===== ROOT ===== */
        .analisar-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #0f0a2e;
          background-image:
            radial-gradient(ellipse at 20% 20%, rgba(100,0,200,0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(0,100,200,0.1) 0%, transparent 50%);
          font-family: 'VT323', monospace;
          color: #e8d4ff;
        }

        /* ===== HEADER ===== */
        .analisar-header {
          background: repeating-linear-gradient(
            90deg,
            #2d006b 0px, #2d006b 32px,
            #1a0042 32px, #1a0042 64px
          );
          border-bottom: 4px solid #6600cc;
          padding: 0 16px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .header-logo {
          font-family: 'Press Start 2P', cursive;
          font-size: 9px;
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
          gap: 4px;
          position: relative;
        }
        .coin-pop {
          position: absolute;
          top: -24px;
          right: 0;
          font-size: 12px;
          color: #ffd700;
          animation: floatUp 1.5s ease-out forwards;
          pointer-events: none;
        }
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-30px); }
        }

        /* ===== MAIN CONTENT ===== */
        .analisar-main {
          flex: 1;
          max-width: 800px;
          width: 100%;
          margin: 0 auto;
          padding: 24px 16px 40px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        /* ===== PAGE TITLE ===== */
        .page-title {
          text-align: center;
          padding: 16px 0 8px;
        }
        .page-title h1 {
          font-family: 'Press Start 2P', cursive;
          font-size: clamp(11px, 2.5vw, 16px);
          color: #ffd700;
          text-shadow: 3px 3px 0 #8b6000, 0 0 30px rgba(255,215,0,0.4);
          margin-bottom: 12px;
        }
        .page-title p {
          font-size: 20px;
          color: #c8a8ff;
          max-width: 500px;
          margin: 0 auto;
          line-height: 1.4;
        }

        /* ===== UPLOAD ZONE ===== */
        .upload-section {
          background: rgba(255,255,255,0.04);
          border: 3px solid #4a2080;
          box-shadow: 4px 4px 0 #2a0060, inset 0 0 40px rgba(100,0,200,0.05);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .upload-zone {
          border: 3px dashed #6633cc;
          background: rgba(80,0,160,0.1);
          min-height: 180px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }
        .upload-zone:hover, .upload-zone.drag-over {
          border-color: #9966ff;
          background: rgba(120,0,200,0.2);
          transform: scale(1.01);
        }
        .upload-zone .upload-icon {
          font-size: 56px;
          line-height: 1;
          filter: drop-shadow(0 0 12px rgba(180,100,255,0.6));
        }
        .upload-zone .upload-hint {
          font-family: 'Press Start 2P', cursive;
          font-size: 8px;
          color: #9966ff;
          text-align: center;
          line-height: 1.8;
        }
        .upload-zone .upload-subhint {
          font-size: 16px;
          color: #6644aa;
          text-align: center;
        }

        /* ===== IMAGE PREVIEW ===== */
        .preview-container {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .preview-img {
          max-width: 100%;
          max-height: 320px;
          object-fit: contain;
          border: 3px solid #6633cc;
          box-shadow: 0 0 20px rgba(100,0,200,0.4);
        }
        .preview-change-btn {
          font-family: 'Press Start 2P', cursive;
          font-size: 7px;
          color: #c8a8ff;
          background: rgba(80,0,160,0.5);
          border: 2px solid #6633cc;
          padding: 6px 12px;
          cursor: pointer;
          transition: all 0.15s;
        }
        .preview-change-btn:hover {
          background: rgba(120,0,200,0.7);
          border-color: #9966ff;
        }

        /* ===== FILTERS ===== */
        .filters-row {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          min-width: 140px;
        }
        .filter-label {
          font-family: 'Press Start 2P', cursive;
          font-size: 7px;
          color: #9966ff;
        }
        .filter-select {
          background: rgba(40,0,80,0.8);
          border: 2px solid #4a2080;
          color: #e8d4ff;
          font-family: 'VT323', monospace;
          font-size: 18px;
          padding: 6px 10px;
          outline: none;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .filter-select:focus {
          border-color: #9966ff;
          box-shadow: 0 0 8px rgba(150,80,255,0.3);
        }

        /* ===== ANALYZE BUTTON ===== */
        .analyze-btn {
          font-family: 'Press Start 2P', cursive;
          font-size: 10px;
          background: linear-gradient(180deg, #8800ff 0%, #5500cc 100%);
          color: #ffd700;
          border: none;
          border-bottom: 4px solid #3300aa;
          padding: 14px 32px;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 1px;
          text-shadow: 1px 1px 0 #3300aa;
          box-shadow: 4px 4px 0 #220088;
          transition: all 0.1s;
          align-self: center;
          min-width: 220px;
        }
        .analyze-btn:hover:not(:disabled) {
          background: linear-gradient(180deg, #9900ff 0%, #6600dd 100%);
          transform: translateY(-2px);
          box-shadow: 6px 6px 0 #220088;
        }
        .analyze-btn:active:not(:disabled) {
          transform: translateY(2px);
          border-bottom-width: 2px;
          box-shadow: 2px 2px 0 #220088;
        }
        .analyze-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ===== ERROR ===== */
        .error-box {
          background: rgba(200,0,0,0.15);
          border: 2px solid #cc2200;
          padding: 12px 16px;
          color: #ff8888;
          font-size: 17px;
        }

        /* ===== LOADING ===== */
        .loading-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          padding: 24px;
          background: rgba(255,255,255,0.03);
          border: 2px solid #4a2080;
        }
        .loading-dots {
          display: flex;
          gap: 8px;
        }
        .loading-dot {
          width: 12px;
          height: 12px;
          background: #9966ff;
          animation: dotBounce 0.8s ease-in-out infinite;
        }
        .loading-dot:nth-child(2) { animation-delay: 0.15s; }
        .loading-dot:nth-child(3) { animation-delay: 0.3s; }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: scaleY(1); }
          40% { transform: scaleY(1.6); }
        }
        .loading-text {
          font-family: 'Press Start 2P', cursive;
          font-size: 8px;
          color: #9966ff;
          text-align: center;
          line-height: 1.8;
          animation: blink 1s step-end infinite;
        }
        @keyframes blink { 50% { opacity: 0.4; } }

        /* ===== RESULT BUBBLE ===== */
        .result-section {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .result-label {
          font-family: 'Press Start 2P', cursive;
          font-size: 8px;
          color: #9966ff;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .result-bubble {
          background: linear-gradient(135deg, rgba(40,0,80,0.95) 0%, rgba(20,0,60,0.9) 100%);
          border: 3px solid #6633cc;
          box-shadow: 4px 4px 0 #2a0060, inset 0 0 30px rgba(80,0,160,0.1);
          padding: 20px;
          position: relative;
        }
        .result-bubble::before {
          content: '📸';
          position: absolute;
          top: -18px;
          left: 16px;
          font-size: 24px;
          filter: drop-shadow(0 0 8px rgba(180,100,255,0.6));
        }

        /* ===== MARKDOWN STYLES ===== */
        .md-content { display: flex; flex-direction: column; gap: 4px; }
        .md-heading {
          font-family: 'Press Start 2P', cursive;
          font-size: 9px;
          color: #ffd700;
          text-shadow: 1px 1px 0 #8b6000;
          margin: 12px 0 6px;
          padding-bottom: 4px;
          border-bottom: 2px solid #4a2080;
        }
        .md-section-title {
          font-family: 'Press Start 2P', cursive;
          font-size: 8px;
          color: #c8a8ff;
          margin: 10px 0 4px;
        }
        .md-line { font-size: 19px; color: #e8d4ff; line-height: 1.4; }
        .md-bullet {
          font-size: 18px;
          color: #c8a8ff;
          padding-left: 12px;
          line-height: 1.4;
        }
        .md-numbered {
          font-size: 18px;
          color: #c8a8ff;
          padding-left: 8px;
          line-height: 1.4;
        }
        .md-quote {
          font-size: 17px;
          color: #a8d8ff;
          border-left: 3px solid #6633cc;
          padding-left: 12px;
          background: rgba(80,0,160,0.2);
          padding: 6px 12px;
          margin: 4px 0;
        }
        .md-divider {
          height: 2px;
          background: linear-gradient(90deg, transparent, #6633cc, transparent);
          margin: 8px 0;
        }
        .md-spacer { height: 6px; }
        .md-content strong { color: #ffd700; font-style: normal; }
        .md-content em { color: #a8d8ff; }

        /* ===== GAME BUTTON ===== */
        .game-cta {
          background: linear-gradient(135deg, rgba(0,60,0,0.9) 0%, rgba(0,40,0,0.8) 100%);
          border: 3px solid #00cc44;
          box-shadow: 4px 4px 0 #005522;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }
        .game-cta-text {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .game-cta-label {
          font-family: 'Press Start 2P', cursive;
          font-size: 7px;
          color: #00cc44;
        }
        .game-cta-topic {
          font-size: 20px;
          color: #a8ffb8;
        }
        .game-cta-btn {
          font-family: 'Press Start 2P', cursive;
          font-size: 8px;
          background: linear-gradient(180deg, #00cc44 0%, #008833 100%);
          color: #fff;
          border: none;
          border-bottom: 4px solid #005522;
          padding: 10px 20px;
          cursor: pointer;
          box-shadow: 3px 3px 0 #003311;
          white-space: nowrap;
          transition: all 0.1s;
        }
        .game-cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 5px 5px 0 #003311;
        }
        .game-cta-btn:active {
          transform: translateY(2px);
          border-bottom-width: 2px;
        }

        /* ===== NEW ANALYSIS ===== */
        .new-analysis-btn {
          font-family: 'Press Start 2P', cursive;
          font-size: 8px;
          background: transparent;
          color: #9966ff;
          border: 2px solid #6633cc;
          padding: 10px 20px;
          cursor: pointer;
          align-self: center;
          transition: all 0.15s;
        }
        .new-analysis-btn:hover {
          background: rgba(100,0,200,0.2);
          border-color: #9966ff;
        }

        @media (max-width: 500px) {
          .filters-row { flex-direction: column; }
          .analyze-btn { font-size: 8px; padding: 12px 20px; min-width: 180px; }
        }
      `}</style>

      {/* Header */}
      <header className="analisar-header">
        <Link href="/" className="header-back">← VOLTAR</Link>
        <div className="header-logo">
          <span>📸</span>
          <span>ANALISAR TAREFA</span>
        </div>
        <div className="coin-counter">
          🪙 {coins}
          {coinPop && <span className="coin-pop">+10</span>}
        </div>
      </header>

      {/* Main */}
      <main className="analisar-main">
        {/* Title */}
        <div className="page-title">
          <h1>📸 FOTO DA TAREFA</h1>
          <p>
            Tire uma foto da tarefa do seu filho e nossa IA explica tudo pra você — sem dar a resposta direta!
          </p>
        </div>

        {/* Upload Section */}
        {!result && (
          <div className="upload-section">
            {/* Drop zone or preview */}
            {!imagePreview ? (
              <div
                className={`upload-zone${dragOver ? " drag-over" : ""}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
              >
                <span className="upload-icon">📷</span>
                <span className="upload-hint">
                  CLIQUE PARA SELECIONAR<br />OU ARRASTE A FOTO AQUI
                </span>
                <span className="upload-subhint">JPG, PNG, WEBP — até 10MB</span>
              </div>
            ) : (
              <div className="preview-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imagePreview} alt="Tarefa enviada" className="preview-img" />
                <button
                  className="preview-change-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  🔄 TROCAR FOTO
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={handleInputChange}
            />

            {/* Optional filters */}
            <div className="filters-row">
              <div className="filter-group">
                <label className="filter-label">MATÉRIA (opcional)</label>
                <select
                  className="filter-select"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                >
                  <option value="">Detectar automaticamente</option>
                  {SUBJECTS.map((s) => (
                    <option key={s.label} value={s.label}>{s.icon} {s.label}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label className="filter-label">ANO ESCOLAR (opcional)</label>
                <select
                  className="filter-select"
                  value={gradeLevel}
                  onChange={(e) => setGradeLevel(e.target.value)}
                >
                  <option value="">Detectar automaticamente</option>
                  {GRADE_LEVELS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Error */}
            {error && <div className="error-box">⚠️ {error}</div>}

            {/* Analyze button */}
            <button
              className="analyze-btn"
              onClick={analyze}
              disabled={!imageFile || loading}
            >
              {loading ? "⏳ ANALISANDO..." : "🔍 ANALISAR TAREFA"}
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && !result && (
          <div className="loading-section" ref={resultRef}>
            <div className="loading-dots">
              <div className="loading-dot" />
              <div className="loading-dot" />
              <div className="loading-dot" />
            </div>
            <div className="loading-text">
              ANALISANDO A TAREFA...<br />
              PREPARANDO EXPLICAÇÃO PARA VOCÊ 📚
            </div>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="result-section" ref={resultRef}>
            <div className="result-label">
              <span>📋</span>
              <span>ANÁLISE COMPLETA</span>
              {loading && <span style={{ color: "#ffd700", animation: "blink 0.8s step-end infinite" }}>▋</span>}
            </div>

            <div className="result-bubble">
              <MarkdownText text={resultText} />
            </div>

            {/* Game CTA */}
            {gameButton && !loading && (
              <div className="game-cta">
                <div className="game-cta-text">
                  <span className="game-cta-label">🎮 PRATICAR NO JOGO</span>
                  <span className="game-cta-topic">
                    {gameButton.materia} → {gameButton.tema}
                  </span>
                </div>
                <button className="game-cta-btn" onClick={() => goToGame(gameButton)}>
                  ⚔️ JOGAR AGORA
                </button>
              </div>
            )}

            {/* New analysis */}
            {!loading && (
              <button
                className="new-analysis-btn"
                onClick={() => {
                  setResult("");
                  setGameButton(null);
                  setImagePreview("");
                  setImageFile(null);
                  setError("");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                📸 ANALISAR NOVA TAREFA
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
