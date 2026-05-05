"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth-context";

const SANS = "'Inter','Segoe UI',system-ui,-apple-system,sans-serif";
const PIXEL = "'Press Start 2P', cursive";

// ── Paleta ────────────────────────────────────────────────────────────────────
const bg    = "linear-gradient(160deg,#0f0c1e 0%,#1a1035 50%,#0f0c1e 100%)";
const card  : React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(167,139,250,0.15)",
  borderRadius: 20,
};

// ── Features ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "🧠",
    label: "Pai Aprende",
    desc: "Entenda o conteúdo em 5 min e vá ensinar com confiança",
    href: "/aprender",
    accent: "#a78bfa",
    glow: "rgba(167,139,250,0.18)",
    badge: "IA",
    cta: "Aprender agora →",
  },
  {
    icon: "🗺️",
    label: "Trilha",
    desc: "Batalhe monstros junto com seu filho para fixar o conteúdo",
    href: "/trilha",
    accent: "#34d399",
    glow: "rgba(52,211,153,0.15)",
    badge: "JOGO",
    cta: "Jogar agora →",
  },
  {
    icon: "📸",
    label: "Foto da Tarefa",
    desc: "Tire foto da tarefa — a IA explica e te diz como guiar",
    href: "/analisar",
    accent: "#f59e0b",
    glow: "rgba(245,158,11,0.15)",
    badge: "NOVO",
    cta: "Tirar foto →",
  },
];

// ── Saudação por horário ──────────────────────────────────────────────────────
function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

// ── Histórico recente (localStorage) ─────────────────────────────────────────
interface HistoryItem { id: string; title: string; subject: string; date: string; }
function loadRecentHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem("pprofessor_history");
    if (!raw) return [];
    const list = JSON.parse(raw) as HistoryItem[];
    return list.slice(0, 3);
  } catch { return []; }
}

// ── Componente ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [recent, setRecent]   = useState<HistoryItem[]>([]);

  useEffect(() => {
    setMounted(true);
    setRecent(loadRecentHistory());
  }, []);

  // Protege a rota — visitante vai para LP
  useEffect(() => {
    if (mounted && !user) router.replace("/");
  }, [mounted, user, router]);

  if (!mounted || !user) return null;

  const firstName = profile?.name?.split(" ")[0] ?? user.email?.split("@")[0] ?? "Pai";
  const xp        = profile?.xp ?? 0;
  const initials  = profile?.name
    ? profile.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase()
    : (user.email?.[0]?.toUpperCase() ?? "P");

  return (
    <main style={{ minHeight: "100vh", background: bg, fontFamily: SANS, overflowX: "hidden" }}>

      {/* Blobs decorativos */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-5%", left: "-5%",
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "10%", right: "-5%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(52,211,153,0.08) 0%,transparent 70%)",
        }} />
      </div>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(15,12,30,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(167,139,250,0.1)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto", padding: "0 24px",
          height: 60, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🎮</span>
            <span style={{ fontFamily: PIXEL, fontSize: 8, color: "#a78bfa", letterSpacing: 1 }}>
              PAPAI PROFESSOR
            </span>
          </div>

          {/* XP + Avatar */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* XP */}
            <div style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)",
              borderRadius: 100, padding: "5px 14px",
            }}>
              <span style={{ fontSize: 14 }}>🪙</span>
              <span style={{ fontFamily: PIXEL, fontSize: 8, color: "#f59e0b" }}>{xp}</span>
            </div>

            {/* Avatar → conta */}
            <Link href="/conta" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: SANS, fontSize: 13, fontWeight: 700, color: "#fff",
                boxShadow: "0 0 0 2px rgba(167,139,250,0.35)",
              }}>
                {initials}
              </div>
              <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: "#a78bfa" }}
                    className="hidden-mobile">
                {firstName}
              </span>
            </Link>

            {/* Sair */}
            <button
              onClick={() => signOut()}
              className="hidden-mobile"
              style={{
                background: "none", border: "1px solid rgba(167,139,250,0.15)",
                borderRadius: 8, color: "#64748b", fontSize: 13, fontFamily: SANS,
                padding: "6px 14px", cursor: "pointer", fontWeight: 500,
              }}
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* ── CORPO ──────────────────────────────────────────────────────────── */}
      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "48px 24px 80px" }}>

        {/* Saudação */}
        <div style={{ marginBottom: 48 }}>
          <p style={{ fontFamily: PIXEL, fontSize: 10, color: "#a78bfa", marginBottom: 10, letterSpacing: 1 }}>
            {greeting()},
          </p>
          <h1 style={{
            fontFamily: SANS, fontSize: "clamp(28px,5vw,48px)", fontWeight: 800,
            color: "#f1f5f9", letterSpacing: "-1px", margin: 0,
          }}>
            {firstName}! 👋
          </h1>
          <p style={{ fontFamily: SANS, fontSize: 16, color: "#64748b", marginTop: 10 }}>
            Qual missão de hoje?
          </p>
        </div>

        {/* ── Cards de funcionalidades ─────────────────────────────────────── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 20,
          marginBottom: 48,
        }}>
          {FEATURES.map((f) => (
            <Link key={f.label} href={f.href} style={{ textDecoration: "none" }}>
              <div
                style={{
                  ...card,
                  padding: 32,
                  display: "flex", flexDirection: "column", gap: 18,
                  cursor: "pointer",
                  transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
                  borderColor: `${f.accent}25`,
                  height: "100%",
                }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = "translateY(-5px)";
                  el.style.borderColor = `${f.accent}55`;
                  el.style.boxShadow = `0 16px 48px ${f.glow}`;
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLDivElement;
                  el.style.transform = "";
                  el.style.borderColor = `${f.accent}25`;
                  el.style.boxShadow = "";
                }}
              >
                {/* Ícone + badge */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{
                    width: 60, height: 60, borderRadius: 16,
                    background: `${f.accent}18`, border: `1px solid ${f.accent}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 30,
                  }}>
                    {f.icon}
                  </div>
                  <span style={{
                    fontFamily: PIXEL, fontSize: 7,
                    background: `${f.accent}20`, color: f.accent,
                    border: `1px solid ${f.accent}40`,
                    borderRadius: 100, padding: "4px 10px",
                  }}>
                    {f.badge}
                  </span>
                </div>

                {/* Texto */}
                <div style={{ flex: 1 }}>
                  <h2 style={{ fontFamily: SANS, fontSize: 20, fontWeight: 800, color: "#f1f5f9", margin: "0 0 8px" }}>
                    {f.label}
                  </h2>
                  <p style={{ fontFamily: SANS, fontSize: 14, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>
                    {f.desc}
                  </p>
                </div>

                {/* CTA */}
                <div style={{
                  display: "flex", alignItems: "center", gap: 6,
                  fontFamily: SANS, fontSize: 14, fontWeight: 700, color: f.accent,
                }}>
                  {f.cta}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Histórico recente ─────────────────────────────────────────────── */}
        {recent.length > 0 && (
          <div style={{ marginBottom: 48 }}>
            <h2 style={{
              fontFamily: SANS, fontSize: 16, fontWeight: 700, color: "#94a3b8",
              textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16,
            }}>
              Conversas recentes
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recent.map((item) => (
                <Link key={item.id} href="/aprender" style={{ textDecoration: "none" }}>
                  <div style={{
                    ...card,
                    padding: "16px 20px",
                    display: "flex", alignItems: "center", gap: 14,
                    cursor: "pointer",
                    transition: "border-color 0.2s",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(167,139,250,0.4)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(167,139,250,0.15)"; }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: "rgba(167,139,250,0.12)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 18,
                    }}>
                      🧠
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: SANS, fontSize: 14, fontWeight: 600, color: "#e2e8f0",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}>
                        {item.title}
                      </div>
                      <div style={{ fontFamily: SANS, fontSize: 12, color: "#475569", marginTop: 2 }}>
                        {item.subject} · {item.date}
                      </div>
                    </div>
                    <span style={{ color: "#4c1d95", fontSize: 16, flexShrink: 0 }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── Dica do dia ──────────────────────────────────────────────────── */}
        <div style={{
          ...card,
          padding: "24px 28px",
          display: "flex", alignItems: "center", gap: 20,
          borderColor: "rgba(245,158,11,0.2)",
          background: "rgba(245,158,11,0.04)",
        }}>
          <span style={{ fontSize: 32, flexShrink: 0 }}>💡</span>
          <div>
            <p style={{ fontFamily: PIXEL, fontSize: 8, color: "#f59e0b", margin: "0 0 6px", letterSpacing: 0.5 }}>
              DICA DO DIA
            </p>
            <p style={{ fontFamily: SANS, fontSize: 14, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>
              Antes de explicar, use o <strong style={{ color: "#e2e8f0" }}>Pai Aprende</strong> por 5 minutos.
              Depois convide seu filho pra <strong style={{ color: "#e2e8f0" }}>Trilha</strong> — o conteúdo
              gruda quando vira jogo.
            </p>
          </div>
        </div>

      </div>

      {/* CSS mobile */}
      <style>{`
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } }
      `}</style>
    </main>
  );
}
