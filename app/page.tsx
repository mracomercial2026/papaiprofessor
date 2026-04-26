"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

// ── Tipos ─────────────────────────────────────────────────────────────────────
type NavId = "inicio" | "funcionalidades" | "precos" | "faq";

// ── Dados ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "🧠",
    title: "Modo Pai Aprende",
    accent: "#a78bfa",
    href: "/aprender",
    badge: "IA",
    desc: "Nossa inteligência artificial explica qualquer conteúdo do Fundamental 1 em linguagem simples. Você aprende em minutos e ensina com confiança.",
    cta: "Experimentar grátis",
  },
  {
    icon: "🗺️",
    title: "Trilha Interativa",
    accent: "#34d399",
    href: "/trilha",
    badge: "Jogo",
    desc: "Pai e filho jogam juntos em uma trilha de perguntas. Matemática, Português, Ciências, Geografia e História de forma divertida.",
    cta: "Jogar agora",
  },
  {
    icon: "📸",
    title: "Foto da Tarefa",
    accent: "#f59e0b",
    href: "/analisar",
    badge: "Novo",
    desc: "Tire foto da tarefa e a IA analisa cada questão — explicando o conceito e como você pode ensinar sem dar a resposta direta.",
    cta: "Tirar foto",
  },
];

const STEPS = [
  {
    num: "1",
    icon: "😅",
    title: "A tarefa chega",
    desc: "Seu filho traz uma tarefa de frações ou análise sintática e você não lembra mais como fazer.",
  },
  {
    num: "2",
    icon: "🤖",
    title: "A IA te ensina",
    desc: "Em 5 minutos o Papai Professor explica o conteúdo em linguagem simples — do seu jeito, para você repassar.",
  },
  {
    num: "3",
    icon: "🏆",
    title: "Vocês aprendem juntos",
    desc: "Pai e filho jogam a trilha para fixar o conteúdo. A tarefa vira diversão e a confiança volta.",
  },
];

const SUBJECTS = [
  { icon: "➕", label: "Matemática", color: "#f59e0b" },
  { icon: "📖", label: "Português",  color: "#60a5fa" },
  { icon: "🌍", label: "Geografia",  color: "#34d399" },
  { icon: "🔬", label: "Ciências",   color: "#fb923c" },
  { icon: "📜", label: "História",   color: "#f87171" },
  { icon: "🎨", label: "Artes",      color: "#c084fc" },
];

const TESTIMONIALS = [
  {
    initials: "RS",
    name: "Roberto S.",
    city: "São Paulo – SP",
    text: "Meu filho estava reprovando em matemática. Com o Papai Professor aprendi a explicar fração de um jeito que ele entendeu na hora!",
  },
  {
    initials: "CM",
    name: "Camila M.",
    city: "Belo Horizonte – MG",
    text: "A análise de foto é incrível. Tirei uma foto da tarefa, a IA me explicou o conteúdo e ainda sugeriu como ensinar sem fazer por ele.",
  },
  {
    initials: "AT",
    name: "André T.",
    city: "Fortaleza – CE",
    text: "Minha filha passou a pedir para estudar. A trilha é divertida — ela e eu ficamos disputando quem acerta mais!",
  },
];

const FAQS = [
  {
    q: "Preciso ter conhecimento em tecnologia?",
    a: "Não. O app foi pensado para qualquer pai ou mãe. Basta abrir, digitar a dúvida ou tirar uma foto e a IA cuida do resto.",
  },
  {
    q: "Para qual faixa de idade é indicado?",
    a: "Todo o Ensino Fundamental 1 — do 1º ao 5º ano — com linguagem adaptada para cada série.",
  },
  {
    q: "O plano gratuito tem limite?",
    a: "O plano gratuito dá acesso completo ao Modo Pai Aprende e à Trilha. O plano Pro desbloqueia a análise de fotos ilimitada e respostas prioritárias da IA.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "Em breve! Quem se cadastrar agora na lista VIP ganha 1 mês grátis no lançamento do plano Pro.",
  },
  {
    q: "Funciona no celular?",
    a: "Sim. O app é totalmente responsivo. No celular você ainda pode usar a câmera para analisar a tarefa na hora.",
  },
];

// ── Estilos base reutilizáveis ─────────────────────────────────────────────────
const SANS = "'Inter','Segoe UI',system-ui,-apple-system,sans-serif";

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(167,139,250,0.15)",
  borderRadius: 16,
};

const glassStrong: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(167,139,250,0.25)",
  borderRadius: 20,
};

// ── Componente principal ───────────────────────────────────────────────────────
export default function Home() {
  const [mounted, setMounted]     = useState(false);
  const [activeNav, setActiveNav] = useState<NavId>("inicio");
  const [openFaq, setOpenFaq]     = useState<number | null>(null);
  const [menuOpen, setMenuOpen]   = useState(false);

  const heroRef    = useRef<HTMLElement>(null);
  const featRef    = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);
  const faqRef     = useRef<HTMLElement>(null);

  useEffect(() => setMounted(true), []);

  // Seção ativa no scroll
  useEffect(() => {
    if (!mounted) return;
    const map: [NavId, React.RefObject<HTMLElement | null>][] = [
      ["inicio",          heroRef],
      ["funcionalidades", featRef],
      ["precos",          pricingRef],
      ["faq",             faqRef],
    ];
    const obs = map.map(([id, ref]) => {
      const o = new IntersectionObserver(
        ([e]) => { if (e.isIntersecting) setActiveNav(id); },
        { threshold: 0.25 }
      );
      if (ref.current) o.observe(ref.current);
      return o;
    });
    return () => obs.forEach((o) => o.disconnect());
  }, [mounted]);

  function scrollTo(ref: React.RefObject<HTMLElement | null>) {
    ref.current?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  }

  const navLinks: [NavId, string, React.RefObject<HTMLElement | null>][] = [
    ["inicio",          "Início",           heroRef],
    ["funcionalidades", "Funcionalidades",   featRef],
    ["precos",          "Preços",            pricingRef],
    ["faq",             "FAQ",               faqRef],
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg,#0c0a1a 0%,#120d2a 50%,#0c0a1a 100%)",
        fontFamily: SANS,
        imageRendering: "auto",
        overflowX: "hidden",
        color: "#f1f5f9",
      }}
    >
      {/* Blob de fundo decorativo */}
      {mounted && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: "-10%", left: "-5%",
            width: 600, height: 600, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)",
          }} />
          <div style={{
            position: "absolute", bottom: "10%", right: "-5%",
            width: 500, height: 500, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(37,99,235,0.12) 0%,transparent 70%)",
          }} />
          <div style={{
            position: "absolute", top: "40%", left: "55%",
            width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(245,158,11,0.07) 0%,transparent 70%)",
          }} />
        </div>
      )}

      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(12,10,26,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(167,139,250,0.12)",
      }}>
        <div style={{
          maxWidth: 1100, margin: "0 auto",
          padding: "0 24px",
          height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        }}>
          {/* Logo */}
          <button onClick={() => scrollTo(heroRef)} style={{ display: "flex", alignItems: "center", gap: 10, background: "none", border: "none", cursor: "pointer" }}>
            <span style={{ fontSize: 26 }}>🎮</span>
            <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: 9, color: "#a78bfa", letterSpacing: 1 }}>
              PAPAI PROFESSOR
            </span>
          </button>

          {/* Nav desktop */}
          <nav style={{ display: "flex", gap: 4, alignItems: "center" }} className="hidden-mobile">
            {navLinks.map(([id, label, ref]) => (
              <button
                key={id}
                onClick={() => scrollTo(ref)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: SANS, fontSize: 15, fontWeight: 500,
                  padding: "8px 16px", borderRadius: 8,
                  color: activeNav === id ? "#a78bfa" : "#94a3b8",
                  transition: "color 0.2s",
                }}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Ações */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
            <button
              onClick={() => alert("Em breve! Cadastre-se na lista VIP abaixo.")}
              style={{
                background: "none", border: "1px solid rgba(167,139,250,0.3)", borderRadius: 8,
                color: "#94a3b8", fontSize: 14, padding: "8px 18px", cursor: "pointer",
                fontFamily: SANS, fontWeight: 500, transition: "border-color 0.2s, color 0.2s",
              }}
              className="hidden-mobile"
            >
              Entrar
            </button>
            <Link
              href="/aprender"
              style={{
                background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 600,
                padding: "9px 20px", textDecoration: "none", fontFamily: SANS,
                boxShadow: "0 4px 14px rgba(124,58,237,0.4)",
                transition: "box-shadow 0.2s",
              }}
            >
              Jogar grátis
            </Link>
            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "#94a3b8", lineHeight: 1 }}
              className="show-mobile"
              aria-label="Menu"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Drawer mobile */}
        {menuOpen && (
          <div style={{
            background: "rgba(12,10,26,0.98)",
            borderTop: "1px solid rgba(167,139,250,0.12)",
            padding: "12px 24px 20px",
            display: "flex", flexDirection: "column", gap: 4,
          }}>
            {navLinks.map(([id, label, ref]) => (
              <button
                key={id}
                onClick={() => scrollTo(ref)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: SANS, fontSize: 16, fontWeight: 500,
                  padding: "12px 0", textAlign: "left",
                  color: activeNav === id ? "#a78bfa" : "#cbd5e1",
                  borderBottom: "1px solid rgba(167,139,250,0.08)",
                }}
              >
                {label}
              </button>
            ))}
            <button
              onClick={() => { setMenuOpen(false); alert("Em breve! Cadastre-se na lista VIP abaixo."); }}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: SANS, fontSize: 16, fontWeight: 500,
                padding: "12px 0", textAlign: "left", color: "#94a3b8", marginTop: 4,
              }}
            >
              Entrar / Criar conta
            </button>
          </div>
        )}
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        id="inicio"
        style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", padding: "100px 24px 80px", textAlign: "center" }}
      >
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.35)",
          borderRadius: 100, padding: "6px 16px", marginBottom: 32,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
          <span style={{ fontFamily: SANS, fontSize: 13, color: "#c4b5fd", fontWeight: 500 }}>
            Grátis para começar — sem cartão de crédito
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: SANS,
          fontSize: "clamp(36px, 6vw, 64px)",
          fontWeight: 800,
          lineHeight: 1.15,
          marginBottom: 24,
          letterSpacing: "-1px",
          background: "linear-gradient(135deg, #f8fafc 30%, #a78bfa 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          Acabe com o estresse<br />na hora da tarefa
        </h1>

        <p style={{
          fontFamily: SANS, fontSize: "clamp(16px, 2.5vw, 20px)",
          color: "#94a3b8", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 48px",
        }}>
          Inteligência artificial que explica o conteúdo escolar para você,
          e depois transforma a revisão em um jogo para fazer com seu filho. 🎮
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginBottom: 60 }}>
          <Link
            href="/aprender"
            style={{
              background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
              color: "#fff", borderRadius: 10, fontSize: 16, fontWeight: 700,
              padding: "14px 32px", textDecoration: "none", fontFamily: SANS,
              boxShadow: "0 6px 20px rgba(124,58,237,0.45)",
              display: "inline-block",
            }}
          >
            Começar grátis
          </Link>
          <button
            onClick={() => scrollTo(pricingRef)}
            style={{
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
              color: "#e2e8f0", borderRadius: 10, fontSize: 16, fontWeight: 600,
              padding: "14px 32px", cursor: "pointer", fontFamily: SANS,
            }}
          >
            Ver planos →
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", justifyContent: "center", gap: 0, flexWrap: "wrap" }}>
          {[
            { num: "5", label: "matérias" },
            { num: "66+", label: "tópicos" },
            { num: "1.400+", label: "questões" },
          ].map((s, i) => (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "16px 32px",
              borderRight: i < 2 ? "1px solid rgba(167,139,250,0.15)" : undefined,
            }}>
              <span style={{ fontFamily: SANS, fontSize: 28, fontWeight: 800, color: "#a78bfa" }}>{s.num}</span>
              <span style={{ fontFamily: SANS, fontSize: 13, color: "#64748b", marginTop: 4 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── COMO FUNCIONA ─────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "80px 24px" }}>
        <SectionLabel>Como funciona</SectionLabel>
        <h2 style={{ fontFamily: SANS, fontSize: "clamp(24px,4vw,36px)", fontWeight: 700, color: "#f1f5f9", textAlign: "center", marginBottom: 56, letterSpacing: "-0.5px" }}>
          Três passos para nunca mais travar na tarefa
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 24 }}>
          {STEPS.map((step) => (
            <div key={step.num} style={{ ...glass, padding: 32, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: SANS, fontSize: 16, fontWeight: 800, color: "#fff",
              }}>
                {step.num}
              </div>
              <div style={{ fontSize: 36 }}>{step.icon}</div>
              <h3 style={{ fontFamily: SANS, fontSize: 17, fontWeight: 700, color: "#f1f5f9", margin: 0 }}>{step.title}</h3>
              <p style={{ fontFamily: SANS, fontSize: 14, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FUNCIONALIDADES ────────────────────────────────────────────────────── */}
      <section ref={featRef} id="funcionalidades" style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "80px 24px" }}>
        <SectionLabel>Funcionalidades</SectionLabel>
        <h2 style={{ fontFamily: SANS, fontSize: "clamp(24px,4vw,36px)", fontWeight: 700, color: "#f1f5f9", textAlign: "center", marginBottom: 56, letterSpacing: "-0.5px" }}>
          Tudo que você precisa em um lugar só
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 24 }}>
          {FEATURES.map((f) => (
            <Link key={f.title} href={f.href} style={{ textDecoration: "none" }}>
              <div style={{
                ...glass,
                padding: 32, height: "100%", display: "flex", flexDirection: "column", gap: 20,
                cursor: "pointer", transition: "border-color 0.2s, transform 0.2s",
                borderColor: `${f.accent}30`,
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.borderColor = `${f.accent}60`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.borderColor = `${f.accent}30`; }}
              >
                {/* Icon + badge */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 14,
                    background: `${f.accent}18`,
                    border: `1px solid ${f.accent}30`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 28,
                  }}>
                    {f.icon}
                  </div>
                  <span style={{
                    fontFamily: SANS, fontSize: 11, fontWeight: 700, letterSpacing: 0.5,
                    background: `${f.accent}20`, color: f.accent,
                    border: `1px solid ${f.accent}40`,
                    borderRadius: 100, padding: "3px 10px",
                  }}>
                    {f.badge}
                  </span>
                </div>

                <div>
                  <h3 style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: "#f1f5f9", marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ fontFamily: SANS, fontSize: 14, color: "#94a3b8", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                </div>

                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 6, color: f.accent, fontFamily: SANS, fontSize: 14, fontWeight: 600 }}>
                  {f.cta} <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Matérias */}
        <div style={{ marginTop: 64 }}>
          <p style={{ fontFamily: SANS, fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 24, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>
            Matérias disponíveis
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            {SUBJECTS.map((s) => (
              <div key={s.label} style={{
                display: "flex", alignItems: "center", gap: 8,
                background: `${s.color}12`, border: `1px solid ${s.color}30`,
                borderRadius: 100, padding: "8px 18px",
              }}>
                <span style={{ fontSize: 18 }}>{s.icon}</span>
                <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: s.color }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEPOIMENTOS ────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "80px 24px" }}>
        <SectionLabel>Depoimentos</SectionLabel>
        <h2 style={{ fontFamily: SANS, fontSize: "clamp(24px,4vw,36px)", fontWeight: 700, color: "#f1f5f9", textAlign: "center", marginBottom: 56, letterSpacing: "-0.5px" }}>
          O que as famílias dizem
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 24 }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} style={{ ...glass, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {"★★★★★".split("").map((s, i) => (
                  <span key={i} style={{ color: "#f59e0b", fontSize: 16 }}>{s}</span>
                ))}
              </div>
              <p style={{ fontFamily: SANS, fontSize: 14, color: "#cbd5e1", lineHeight: 1.75, margin: 0, flex: 1 }}>
                "{t.text}"
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: SANS, fontSize: 13, fontWeight: 700, color: "#fff",
                  flexShrink: 0,
                }}>
                  {t.initials}
                </div>
                <div>
                  <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: "#f1f5f9" }}>{t.name}</div>
                  <div style={{ fontFamily: SANS, fontSize: 12, color: "#64748b" }}>{t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PREÇOS ─────────────────────────────────────────────────────────────── */}
      <section ref={pricingRef} id="precos" style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "80px 24px" }}>
        <SectionLabel>Preços</SectionLabel>
        <h2 style={{ fontFamily: SANS, fontSize: "clamp(24px,4vw,36px)", fontWeight: 700, color: "#f1f5f9", textAlign: "center", marginBottom: 12, letterSpacing: "-0.5px" }}>
          Comece grátis. Faça upgrade quando quiser.
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 16, color: "#64748b", textAlign: "center", marginBottom: 52 }}>
          Sem fidelidade. Cancele quando quiser.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24, alignItems: "start" }}>
          {/* Gratuito */}
          <div style={{ ...glass, padding: 36, display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>Gratuito</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontFamily: SANS, fontSize: 42, fontWeight: 800, color: "#f1f5f9" }}>R$0</span>
                <span style={{ fontFamily: SANS, fontSize: 14, color: "#64748b" }}>/mês</span>
              </div>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                [true, "Modo Pai Aprende (ilimitado)"],
                [true, "Trilha interativa"],
                [true, "5 matérias e 66 tópicos"],
                [true, "1.400+ questões no banco"],
                [false, "Análise de foto (5/dia)"],
                [false, "Suporte prioritário"],
              ].map(([ok, text], i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: ok ? "#34d399" : "#334155", fontSize: 16, flexShrink: 0 }}>{ok ? "✓" : "○"}</span>
                  <span style={{ fontFamily: SANS, fontSize: 14, color: ok ? "#cbd5e1" : "#475569" }}>{text as string}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/aprender"
              style={{
                display: "block", textAlign: "center",
                border: "1px solid rgba(167,139,250,0.3)", borderRadius: 10,
                color: "#a78bfa", fontFamily: SANS, fontSize: 15, fontWeight: 600,
                padding: "13px", textDecoration: "none",
                transition: "background 0.2s",
              }}
            >
              Começar grátis
            </Link>
          </div>

          {/* Pro */}
          <div style={{
            ...glassStrong,
            padding: 36, display: "flex", flexDirection: "column", gap: 20,
            border: "1px solid rgba(167,139,250,0.4)",
            boxShadow: "0 0 0 1px rgba(124,58,237,0.3), 0 20px 60px rgba(124,58,237,0.2)",
            position: "relative",
          }}>
            {/* Badge popular */}
            <div style={{
              position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
              background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
              borderRadius: 100, padding: "4px 16px",
              fontFamily: SANS, fontSize: 11, fontWeight: 700, color: "#fff",
              whiteSpace: "nowrap", letterSpacing: 0.5,
            }}>
              Mais popular
            </div>

            <div>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: "#a78bfa", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>Pro</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 4 }}>
                <span style={{ fontFamily: SANS, fontSize: 42, fontWeight: 800, color: "#f1f5f9" }}>R$29</span>
                <span style={{ fontFamily: SANS, fontSize: 42, fontWeight: 800, color: "#f1f5f9" }}>,90</span>
                <span style={{ fontFamily: SANS, fontSize: 14, color: "#64748b" }}>/mês</span>
              </div>
              <p style={{ fontFamily: SANS, fontSize: 13, color: "#64748b", margin: 0 }}>Uso ilimitado para toda a família</p>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Tudo do plano gratuito",
                "Análise de foto ilimitada",
                "Respostas de IA prioritárias",
                "Histórico de aprendizado",
                "Novos tópicos em primeira mão",
                "Suporte por WhatsApp",
              ].map((text, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#a78bfa", fontSize: 16, flexShrink: 0 }}>✓</span>
                  <span style={{ fontFamily: SANS, fontSize: 14, color: "#e2e8f0" }}>{text}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => alert("Em breve! Cadastre-se na lista VIP abaixo para ganhar 1 mês grátis.")}
              style={{
                display: "block", width: "100%",
                background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                border: "none", borderRadius: 10,
                color: "#fff", fontFamily: SANS, fontSize: 15, fontWeight: 700,
                padding: "13px", cursor: "pointer",
                boxShadow: "0 4px 20px rgba(124,58,237,0.4)",
              }}
            >
              Quero o Pro →
            </button>
          </div>
        </div>

        {/* Lista VIP */}
        <div style={{ marginTop: 64, ...glass, padding: 40, textAlign: "center", maxWidth: 560, margin: "64px auto 0" }}>
          <div style={{
            display: "inline-block",
            fontFamily: "'Press Start 2P', cursive", fontSize: 9,
            color: "#a78bfa", letterSpacing: 1,
            background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)",
            borderRadius: 100, padding: "6px 14px", marginBottom: 20,
          }}>
            🎁 LISTA VIP
          </div>
          <h3 style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, color: "#f1f5f9", marginBottom: 10 }}>
            Ganhe 1 mês grátis no lançamento
          </h3>
          <p style={{ fontFamily: SANS, fontSize: 14, color: "#94a3b8", marginBottom: 28, lineHeight: 1.6 }}>
            Cadastre seu e-mail e seja avisado assim que o plano Pro abrir — com 1 mês cortesia.
          </p>
          <VipForm />
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section ref={faqRef} id="faq" style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto", padding: "80px 24px" }}>
        <SectionLabel>FAQ</SectionLabel>
        <h2 style={{ fontFamily: SANS, fontSize: "clamp(24px,4vw,36px)", fontWeight: 700, color: "#f1f5f9", textAlign: "center", marginBottom: 48, letterSpacing: "-0.5px" }}>
          Dúvidas frequentes
        </h2>

        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {FAQS.map((faq, i) => (
            <div key={i} style={{ ...glass, overflow: "hidden", borderRadius: 12 }}>
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  gap: 16, padding: "20px 24px", background: "none", border: "none", cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: "#e2e8f0", lineHeight: 1.5 }}>{faq.q}</span>
                <span style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: openFaq === i ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(167,139,250,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#a78bfa", fontSize: 13, flexShrink: 0, transition: "background 0.2s",
                }}>
                  {openFaq === i ? "−" : "+"}
                </span>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 24px 20px", fontFamily: SANS, fontSize: 14, color: "#94a3b8", lineHeight: 1.75, borderTop: "1px solid rgba(167,139,250,0.1)" }}>
                  <div style={{ paddingTop: 16 }}>{faq.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", padding: "40px 24px 100px" }}>
        <div style={{
          background: "linear-gradient(135deg,rgba(124,58,237,0.25),rgba(79,70,229,0.15))",
          border: "1px solid rgba(167,139,250,0.25)", borderRadius: 24,
          padding: "60px 40px", textAlign: "center",
        }}>
          <h2 style={{ fontFamily: SANS, fontSize: "clamp(22px,4vw,32px)", fontWeight: 800, color: "#f1f5f9", marginBottom: 14, letterSpacing: "-0.5px" }}>
            Pronto para a próxima tarefa?
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 16, color: "#94a3b8", marginBottom: 36, lineHeight: 1.6 }}>
            Junte-se a famílias que transformaram o momento da tarefa em algo divertido — e gratuito para começar.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/aprender"
              style={{
                background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                color: "#fff", borderRadius: 10, fontSize: 16, fontWeight: 700,
                padding: "14px 32px", textDecoration: "none", fontFamily: SANS,
                boxShadow: "0 6px 20px rgba(124,58,237,0.45)", display: "inline-block",
              }}
            >
              Começar grátis
            </Link>
            <Link
              href="/trilha"
              style={{
                background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.3)",
                color: "#34d399", borderRadius: 10, fontSize: 16, fontWeight: 600,
                padding: "14px 32px", textDecoration: "none", fontFamily: SANS, display: "inline-block",
              }}
            >
              Ver a trilha →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────────── */}
      <footer style={{
        position: "relative", zIndex: 1,
        borderTop: "1px solid rgba(167,139,250,0.1)",
        padding: "48px 24px",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 40, marginBottom: 40 }}>
            {/* Brand */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 22 }}>🎮</span>
                <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: 8, color: "#a78bfa" }}>
                  PAPAI PROFESSOR
                </span>
              </div>
              <p style={{ fontFamily: SANS, fontSize: 13, color: "#475569", lineHeight: 1.6, margin: 0 }}>
                Aprender junto é a maior aventura que um pai pode ter com o filho.
              </p>
            </div>

            {/* Navegação */}
            <div>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>Navegar</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[["Funcionalidades", "#funcionalidades"], ["Preços", "#precos"], ["FAQ", "#faq"]].map(([l, h]) => (
                  <a key={l} href={h} style={{ fontFamily: SANS, fontSize: 14, color: "#64748b", textDecoration: "none" }}>{l}</a>
                ))}
              </div>
            </div>

            {/* Ferramentas */}
            <div>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>Ferramentas</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  ["🧠 Modo Pai Aprende", "/aprender"],
                  ["🗺️ Trilha Interativa", "/trilha"],
                  ["📸 Foto da Tarefa", "/analisar"],
                ].map(([l, h]) => (
                  <Link key={l as string} href={h as string} style={{ fontFamily: SANS, fontSize: 14, color: "#64748b", textDecoration: "none" }}>{l}</Link>
                ))}
              </div>
            </div>

            {/* Social */}
            <div>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>Redes sociais</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontFamily: SANS, fontSize: 14, color: "#64748b", textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}
                >
                  📷 Instagram
                </a>
              </div>
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(167,139,250,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <p style={{ fontFamily: SANS, fontSize: 13, color: "#334155", margin: 0 }}>
              © 2025 Papai Professor — Feito com ❤️ para famílias brasileiras
            </p>
            <button
              onClick={() => alert("Em breve! Cadastre-se na lista VIP acima.")}
              style={{ background: "none", border: "none", fontFamily: SANS, fontSize: 13, color: "#475569", cursor: "pointer" }}
            >
              Entrar / Criar conta
            </button>
          </div>
        </div>
      </footer>

      {/* Overrides globais de CSS que afetam só esta página */}
      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </main>
  );
}

// ── Sub-componentes ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{
      fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
      fontSize: 12, fontWeight: 700, letterSpacing: 2,
      textTransform: "uppercase", color: "#7c3aed",
      textAlign: "center", marginBottom: 16,
    }}>
      {children}
    </p>
  );
}

function VipForm() {
  const [email, setEmail]     = useState("");
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);
  const SANS = "'Inter','Segoe UI',system-ui,sans-serif";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      const existing = JSON.parse(localStorage.getItem("vip_leads") || "[]");
      existing.push({ email: email.trim(), at: new Date().toISOString() });
      localStorage.setItem("vip_leads", JSON.stringify(existing));
    } catch { /* ignore */ }
    await new Promise(r => setTimeout(r, 700));
    setLoading(false);
    setSent(true);
  }

  if (sent) {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🎉</div>
        <p style={{ fontFamily: SANS, fontSize: 16, fontWeight: 700, color: "#a78bfa", marginBottom: 6 }}>Você está na lista!</p>
        <p style={{ fontFamily: SANS, fontSize: 14, color: "#64748b" }}>Avisaremos em <strong style={{ color: "#e2e8f0" }}>{email}</strong> quando o plano Pro abrir.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="seu@email.com"
        style={{
          fontFamily: SANS, fontSize: 15,
          padding: "12px 18px", flex: "1 1 200px", minWidth: 0,
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(167,139,250,0.25)",
          borderRadius: 10, color: "#f1f5f9", outline: "none",
        }}
      />
      <button
        type="submit"
        disabled={loading}
        style={{
          background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
          border: "none", borderRadius: 10,
          color: "#fff", fontFamily: SANS, fontSize: 15, fontWeight: 700,
          padding: "12px 24px", cursor: "pointer", flexShrink: 0,
          boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "..." : "Entrar na lista"}
      </button>
    </form>
  );
}
