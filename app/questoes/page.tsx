"use client";

import Link from "next/link";
import { useRef, useState } from "react";

// ── Paleta ─────────────────────────────────────────────────────────────────────
const bg   = "linear-gradient(160deg,#0f0c1e 0%,#1a1035 50%,#0f0c1e 100%)";
const SANS = "'Inter','Segoe UI',system-ui,-apple-system,sans-serif";
const PIXEL = "'Press Start 2P', cursive";

const card: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(236,72,153,0.2)",
  borderRadius: 16,
};

// ── Opções ─────────────────────────────────────────────────────────────────────
const SUBJECTS = ["Matemática","Português","Ciências","História","Geografia"];
const GRADES   = ["1º ano","2º ano","3º ano","4º ano","5º ano","6º ano","7º ano","8º ano","9º ano"];
const QTYS     = [5, 10, 15, 20];
const TYPES    = [
  { value: "multiple_choice", label: "Múltipla Escolha" },
  { value: "open",            label: "Questão Aberta"   },
  { value: "mixed",           label: "Mista"            },
];

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface Question {
  number: number;
  type: "multiple_choice" | "open";
  statement: string;
  options: string[];
  correct: number;
  explanation: string;
}
interface QuestionList {
  title: string;
  subtitle: string;
  subject: string;
  topic: string;
  grade: string;
  questions: Question[];
}

// ── Pill button ──────────────────────────────────────────────────────────────
function Pill({
  label, active, onClick, color = "#ec4899",
}: { label: string; active: boolean; onClick: () => void; color?: string }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: SANS, fontSize: 13, fontWeight: 600,
        padding: "8px 16px", borderRadius: 100, cursor: "pointer",
        border: `1.5px solid ${active ? color : "rgba(255,255,255,0.1)"}`,
        background: active ? `${color}22` : "transparent",
        color: active ? color : "#64748b",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function QuestoesPage() {
  const [subject,  setSubject]  = useState("Matemática");
  const [grade,    setGrade]    = useState("4º ano");
  const [topic,    setTopic]    = useState("");
  const [qty,      setQty]      = useState(10);
  const [type,     setType]     = useState("multiple_choice");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [result,   setResult]   = useState<QuestionList | null>(null);
  const [showKey,  setShowKey]  = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  async function generate() {
    setLoading(true);
    setError("");
    setResult(null);
    setShowKey(false);
    try {
      const res = await fetch("/api/questoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, grade, topic, quantity: qty, type }),
      });
      if (!res.ok) throw new Error("Erro ao gerar questões.");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      if (!data.questions?.length) throw new Error("Nenhuma questão gerada.");
      setResult(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  return (
    <main style={{ minHeight: "100vh", background: bg, fontFamily: SANS, overflowX: "hidden" }}>

      {/* Blob decorativo */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-10%", right: "-5%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(236,72,153,0.12) 0%,transparent 70%)",
        }} />
      </div>

      {/* ── HEADER ─────────────────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(15,12,30,0.9)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(236,72,153,0.15)",
      }}>
        <div style={{
          maxWidth: 860, margin: "0 auto", padding: "0 24px",
          height: 58, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Link href="/dashboard" style={{
            fontFamily: PIXEL, fontSize: 10, color: "#ec4899",
            textDecoration: "none", display: "flex", alignItems: "center", gap: 8,
          }}>
            ← VOLTAR
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 20 }}>📝</span>
            <span style={{ fontFamily: PIXEL, fontSize: 9, color: "#f1f5f9", letterSpacing: 1 }}>
              LISTA DE QUESTÕES
            </span>
          </div>
          {result && (
            <button
              onClick={handlePrint}
              style={{
                fontFamily: SANS, fontSize: 13, fontWeight: 700,
                padding: "7px 18px", borderRadius: 8, cursor: "pointer",
                background: "rgba(236,72,153,0.15)",
                border: "1.5px solid rgba(236,72,153,0.4)",
                color: "#ec4899",
              }}
            >
              🖨️ Imprimir
            </button>
          )}
        </div>
      </header>

      {/* ── CORPO ──────────────────────────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 860, margin: "0 auto", padding: "40px 24px 80px" }}>

        {/* Título */}
        <div style={{ marginBottom: 36 }}>
          <p style={{ fontFamily: PIXEL, fontSize: 10, color: "#ec4899", marginBottom: 8, letterSpacing: 1 }}>
            GERADOR DE LISTA
          </p>
          <h1 style={{
            fontFamily: SANS, fontSize: "clamp(24px,5vw,36px)", fontWeight: 800,
            color: "#f1f5f9", letterSpacing: "-0.5px", margin: 0,
          }}>
            Questões para estudar em casa 📋
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 15, color: "#64748b", marginTop: 8 }}>
            Configure, gere e imprima uma lista personalizada para o seu filho.
          </p>
        </div>

        {/* ── FORMULÁRIO ───────────────────────────────────────────────────────── */}
        <div style={{ ...card, padding: "28px 28px", marginBottom: 32 }}>

          {/* Matéria */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: "#94a3b8",
              textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: 12 }}>
              📚 Matéria
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {SUBJECTS.map(s => (
                <Pill key={s} label={s} active={subject === s} onClick={() => setSubject(s)} />
              ))}
            </div>
          </div>

          {/* Ano escolar */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: "#94a3b8",
              textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: 12 }}>
              🎓 Ano Escolar
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {GRADES.map(g => (
                <Pill key={g} label={g} active={grade === g} onClick={() => setGrade(g)} />
              ))}
            </div>
          </div>

          {/* Tema (opcional) */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: "#94a3b8",
              textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: 12 }}>
              🎯 Tema específico <span style={{ color: "#475569", fontWeight: 400, textTransform: "none" }}>(opcional)</span>
            </label>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder={`Ex: Frações, Fotossíntese, Segunda Guerra Mundial...`}
              style={{
                width: "100%", boxSizing: "border-box",
                background: "rgba(255,255,255,0.05)",
                border: "1.5px solid rgba(255,255,255,0.1)",
                borderRadius: 10, padding: "12px 16px",
                fontFamily: SANS, fontSize: 15, color: "#f1f5f9",
                outline: "none",
              }}
              onFocus={e => (e.target.style.borderColor = "rgba(236,72,153,0.5)")}
              onBlur={e  => (e.target.style.borderColor = "rgba(255,255,255,0.1)")}
            />
          </div>

          {/* Quantidade + Tipo */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 28 }}>
            <div>
              <label style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: "#94a3b8",
                textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: 12 }}>
                🔢 Quantidade
              </label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {QTYS.map(q => (
                  <Pill key={q} label={`${q}`} active={qty === q} onClick={() => setQty(q)} />
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: "#94a3b8",
                textTransform: "uppercase", letterSpacing: 1.2, display: "block", marginBottom: 12 }}>
                📄 Tipo de questão
              </label>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {TYPES.map(t => (
                  <Pill key={t.value} label={t.label} active={type === t.value} onClick={() => setType(t.value)} />
                ))}
              </div>
            </div>
          </div>

          {/* Botão gerar */}
          <button
            onClick={generate}
            disabled={loading}
            style={{
              width: "100%", padding: "16px",
              fontFamily: PIXEL, fontSize: 12, letterSpacing: 1,
              background: loading
                ? "rgba(236,72,153,0.15)"
                : "linear-gradient(135deg,#ec4899,#be185d)",
              border: "2px solid rgba(236,72,153,0.4)",
              borderRadius: 12, color: "#fff", cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 4px 20px rgba(236,72,153,0.3)",
              transition: "all 0.2s",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "⏳ GERANDO QUESTÕES..." : "✨ GERAR LISTA"}
          </button>

          {error && (
            <div style={{
              marginTop: 16, padding: "12px 16px", borderRadius: 10,
              background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)",
              fontFamily: SANS, fontSize: 14, color: "#fca5a5",
            }}>
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* ── RESULTADO ────────────────────────────────────────────────────────── */}
        {result && (
          <div ref={printRef}>

            {/* Cabeçalho da lista */}
            <div style={{
              ...card, padding: "24px 28px", marginBottom: 20,
              borderColor: "rgba(236,72,153,0.3)",
              background: "rgba(236,72,153,0.05)",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <h2 style={{ fontFamily: SANS, fontSize: 20, fontWeight: 800, color: "#f1f5f9", margin: "0 0 4px" }}>
                    {result.title}
                  </h2>
                  <p style={{ fontFamily: SANS, fontSize: 14, color: "#94a3b8", margin: 0 }}>
                    {result.subtitle} · {new Date().toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button
                    onClick={() => { setResult(null); setShowKey(false); }}
                    style={{
                      fontFamily: SANS, fontSize: 13, fontWeight: 600,
                      padding: "8px 16px", borderRadius: 8, cursor: "pointer",
                      background: "transparent", border: "1.5px solid rgba(255,255,255,0.1)",
                      color: "#64748b",
                    }}
                  >
                    🔄 Nova lista
                  </button>
                  <button
                    onClick={handlePrint}
                    style={{
                      fontFamily: SANS, fontSize: 13, fontWeight: 700,
                      padding: "8px 18px", borderRadius: 8, cursor: "pointer",
                      background: "rgba(236,72,153,0.15)",
                      border: "1.5px solid rgba(236,72,153,0.4)",
                      color: "#ec4899",
                    }}
                  >
                    🖨️ Imprimir / Salvar PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Linha nome + data (para impressão) */}
            <div style={{
              ...card, padding: "16px 28px", marginBottom: 20,
              display: "flex", gap: 32, flexWrap: "wrap",
            }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <span style={{ fontFamily: SANS, fontSize: 13, color: "#64748b" }}>Nome: </span>
                <span style={{
                  display: "inline-block", borderBottom: "1px solid rgba(255,255,255,0.15)",
                  minWidth: 200, marginLeft: 4,
                }}>&nbsp;</span>
              </div>
              <div>
                <span style={{ fontFamily: SANS, fontSize: 13, color: "#64748b" }}>Data: </span>
                <span style={{
                  display: "inline-block", borderBottom: "1px solid rgba(255,255,255,0.15)",
                  minWidth: 120, marginLeft: 4,
                }}>&nbsp;</span>
              </div>
              <div>
                <span style={{ fontFamily: SANS, fontSize: 13, color: "#64748b" }}>Nota: </span>
                <span style={{
                  display: "inline-block", borderBottom: "1px solid rgba(255,255,255,0.15)",
                  minWidth: 60, marginLeft: 4,
                }}>&nbsp;</span>
              </div>
            </div>

            {/* Questões */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 28 }}>
              {result.questions.map((q) => (
                <div key={q.number} style={{ ...card, padding: "22px 24px" }}>
                  {/* Número + enunciado */}
                  <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: "rgba(236,72,153,0.15)",
                      border: "1.5px solid rgba(236,72,153,0.3)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: PIXEL, fontSize: 11, color: "#ec4899",
                    }}>
                      {q.number}
                    </div>
                    <p style={{ fontFamily: SANS, fontSize: 16, color: "#f1f5f9", lineHeight: 1.6, margin: 0, flex: 1 }}>
                      {q.statement}
                    </p>
                  </div>

                  {/* Alternativas (múltipla escolha) */}
                  {q.type === "multiple_choice" && q.options.length > 0 && (
                    <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8, paddingLeft: 50 }}>
                      {q.options.map((opt, idx) => (
                        <div key={idx} style={{
                          display: "flex", alignItems: "center", gap: 12,
                          padding: "10px 14px", borderRadius: 8,
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(255,255,255,0.07)",
                        }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                            border: "1.5px solid rgba(255,255,255,0.15)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontFamily: SANS, fontSize: 13, fontWeight: 700, color: "#64748b",
                          }}>
                            {["A","B","C","D"][idx]}
                          </div>
                          <span style={{ fontFamily: SANS, fontSize: 15, color: "#e2e8f0" }}>
                            {opt.replace(/^[ABCD]\)\s*/i, "")}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Espaço para resposta aberta */}
                  {q.type === "open" && (
                    <div style={{ marginTop: 16, paddingLeft: 50 }}>
                      {[1,2,3].map(i => (
                        <div key={i} style={{
                          height: 1, background: "rgba(255,255,255,0.08)",
                          marginBottom: 28,
                        }} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Gabarito */}
            <div style={{ ...card, overflow: "hidden", borderColor: "rgba(245,158,11,0.2)" }}>
              <button
                onClick={() => setShowKey(!showKey)}
                style={{
                  width: "100%", padding: "18px 24px",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  background: "rgba(245,158,11,0.06)", border: "none", cursor: "pointer",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>🔑</span>
                  <span style={{ fontFamily: PIXEL, fontSize: 11, color: "#f59e0b", letterSpacing: 1 }}>
                    GABARITO
                  </span>
                </div>
                <span style={{ fontFamily: SANS, fontSize: 18, color: "#f59e0b" }}>
                  {showKey ? "▲" : "▼"}
                </span>
              </button>

              {showKey && (
                <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
                  {result.questions.map((q) => (
                    <div key={q.number} style={{
                      padding: "14px 18px", borderRadius: 10,
                      background: "rgba(245,158,11,0.06)",
                      border: "1px solid rgba(245,158,11,0.15)",
                    }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 6 }}>
                        <span style={{
                          fontFamily: PIXEL, fontSize: 10, color: "#f59e0b", flexShrink: 0,
                        }}>
                          Q{q.number}
                        </span>
                        <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: "#fbbf24" }}>
                          {q.type === "multiple_choice" && q.correct >= 0
                            ? `Alternativa ${["A","B","C","D"][q.correct]}`
                            : "Questão aberta"}
                        </span>
                      </div>
                      <p style={{ fontFamily: SANS, fontSize: 13, color: "#94a3b8", lineHeight: 1.5, margin: 0, paddingLeft: 38 }}>
                        {q.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>

      {/* ── CSS de impressão ─────────────────────────────────────────────────────── */}
      <style>{`
        @media print {
          header, .no-print { display: none !important; }
          main { background: white !important; }
          body { background: white; color: #000; }
          * { color: #000 !important; border-color: #ccc !important; background: white !important; box-shadow: none !important; }
          h1, h2 { color: #000 !important; }
          p, span, div { color: #222 !important; }
          [style*="border-radius"] { border-radius: 0 !important; }
        }
        @media (max-width: 600px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}
