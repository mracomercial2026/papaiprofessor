"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";

// ── Tipos ─────────────────────────────────────────────────────────────────────
type NavId = "inicio" | "como-funciona" | "precos" | "faq";

// ── Dados ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: "🧠",
    title: "Modo Pai Aprende",
    accent: "#a78bfa",
    href: "/aprender",
    badge: "IA",
    desc: "Digita a dúvida do seu filho e a IA te explica em português simples — sem jargão de professor. Em 5 minutos você sabe o suficiente para ensinar com confiança.",
    cta: "Aprender agora",
  },
  {
    icon: "🗺️",
    title: "Trilha do Conhecimento",
    accent: "#34d399",
    href: "/trilha",
    badge: "Jogo",
    desc: "Depois de estudar, pai e filho jogam juntos uma trilha de batalhas com perguntas. A tarefa chata vira duelo de monstros — e o conteúdo gruda de verdade.",
    cta: "Jogar com meu filho",
  },
  {
    icon: "📸",
    title: "Foto da Tarefa",
    accent: "#f59e0b",
    href: "/analisar",
    badge: "Novo",
    desc: "Tira foto da tarefa e a IA analisa cada questão — explica o conceito e te diz como guiar seu filho sem dar a resposta. Ele aprende, você vira o professor.",
    cta: "Tirar foto agora",
  },
];

const STEPS = [
  {
    num: "1",
    icon: "😰",
    title: "Seu filho chega com a tarefa",
    desc: "São 19h. Tem exercício de fração, análise sintática ou \"o que é bioma\". Você quer ajudar — mas faz 20 anos que não vê esse conteúdo.",
  },
  {
    num: "2",
    icon: "🤙",
    title: "Você abre e pergunta",
    desc: "Digita a dúvida com suas palavras — \"como eu explico fração pra criança de 9 anos?\" — e a IA responde do seu jeito, em 3 minutos, sem parecer livro didático.",
  },
  {
    num: "3",
    icon: "🏆",
    title: "Você explica. Ele entende. Vocês comemoram.",
    desc: "Seu filho te olha como quem olha pra um herói. E no final ainda jogam a Trilha juntos pra fixar. A tarefa virou o momento mais divertido do dia.",
  },
];

const SUBJECTS = [
  { icon: "➕", label: "Matemática", color: "#f59e0b" },
  { icon: "📖", label: "Português",  color: "#60a5fa" },
  { icon: "🌍", label: "Geografia",  color: "#34d399" },
  { icon: "🔬", label: "Ciências",   color: "#fb923c" },
  { icon: "📜", label: "História",   color: "#f87171" },
];

const TESTIMONIALS = [
  {
    initials: "RS",
    name: "Roberto Souza",
    role: "Motorista de app · pai do Guilherme, 8 anos",
    city: "São Paulo – SP",
    text: "Meu filho trouxe tarefa de MMC e MDC. Eu nunca fui bom em matemática. Em 4 minutos o app me explicou tudo de um jeito que eu entendi de verdade. Ensinei meu filho e ele ficou me chamando de gênio o resto do dia.",
  },
  {
    initials: "MT",
    name: "Marcos Teixeira",
    role: "Técnico de informática · pai da Sofia, 10 anos",
    city: "Belo Horizonte – MG",
    text: "Tirei foto da tarefa de Português e a IA me disse exatamente como perguntar pra ela pensar sozinha, sem eu dar a resposta. Ela acertou tudo. Fiquei mais orgulhoso do que ela.",
  },
  {
    initials: "AT",
    name: "André Torres",
    role: "Vendedor · pai da Beatriz, 9 anos",
    city: "Fortaleza – CE",
    text: "Minha filha me via como alguém que não sabia de nada na escola dela. Hoje ela me pede ajuda. A Trilha virou ritual: todo dia depois da tarefa a gente batalha junto — e é o momento que eu mais espero no dia.",
  },
];

const FAQS = [
  {
    q: "E se meu filho perceber que aprendi pelo app antes de ensinar?",
    a: "Isso é ser um bom pai — você pesquisou, se preparou, e foi lá ensinar. Não existe diferença entre estudar no app ou em qualquer outro lugar. O que importa é que você estava lá.",
  },
  {
    q: "E se a explicação da IA for difícil de entender?",
    a: "A IA explica como se você tivesse 10 anos — sem julgamento e sem pressa. Se ainda ficou confuso, é só responder 'não entendi, explica mais simples' e ela tenta de outro jeito. Não tem limite de tentativas e ninguém vai te julgar.",
  },
  {
    q: "O app é só para pais? Mães e avós podem usar?",
    a: "Qualquer responsável que queira estar presente na vida escolar da criança é bem-vindo. O nome é Papai Professor porque nasceu de uma história de pai — mas mães, avós, tios e tutores usam e amam também.",
  },
  {
    q: "Precisa entender de tecnologia?",
    a: "Não. Se você sabe mandar mensagem no WhatsApp, sabe usar o Papai Professor. É só digitar a dúvida ou tirar uma foto — o resto é automático.",
  },
  {
    q: "Para qual faixa de idade é indicado?",
    a: "Todo o Ensino Fundamental 1 — do 1º ao 5º ano — com linguagem adaptada para cada série.",
  },
  {
    q: "Tenho 15 minutos por dia. Dá pra usar?",
    a: "É exatamente pra isso que foi feito. Você não precisa virar professor. Precisa de 5 minutos pra aprender o suficiente pra estar do lado do seu filho.",
  },
  {
    q: "O plano gratuito tem limite?",
    a: "O plano gratuito dá acesso completo ao Modo Pai Aprende e à Trilha, sem limite. O plano Pro desbloqueia análise de fotos ilimitada e respostas prioritárias da IA.",
  },
  {
    q: "Como funciona o pagamento?",
    a: "Em breve! Quem entrar na lista VIP agora ganha 1 mês grátis no lançamento do plano Pro.",
  },
];

// ── Estilos base reutilizáveis ─────────────────────────────────────────────────
const SANS = "'Inter','Segoe UI',system-ui,-apple-system,sans-serif";

// ── Paleta light ───────────────────────────────────────────────────────────────
const C = {
  bg:      "linear-gradient(160deg,#faf9ff 0%,#f0ebff 50%,#faf9ff 100%)",
  text:    "#0f172a",
  sub:     "#475569",
  muted:   "#94a3b8",
  accent:  "#7c3aed",
  accentL: "#a78bfa",
};

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.82)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(124,58,237,0.12)",
  borderRadius: 16,
  boxShadow: "0 2px 20px rgba(124,58,237,0.06)",
};

const glassStrong: React.CSSProperties = {
  background: "rgba(255,255,255,0.92)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(124,58,237,0.2)",
  borderRadius: 20,
  boxShadow: "0 4px 32px rgba(124,58,237,0.1)",
};

// ── Componente principal ───────────────────────────────────────────────────────
export default function Home() {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [mounted, setMounted]     = useState(false);
  const [activeNav, setActiveNav] = useState<NavId>("inicio");
  const [openFaq, setOpenFaq]     = useState<number | null>(null);
  const [menuOpen, setMenuOpen]   = useState(false);

  const heroRef    = useRef<HTMLElement>(null);
  const howRef     = useRef<HTMLElement>(null);
  const pricingRef = useRef<HTMLElement>(null);
  const faqRef     = useRef<HTMLElement>(null);

  useEffect(() => setMounted(true), []);

  // Usuário logado não vê a LP — vai direto pro app
  useEffect(() => {
    if (mounted && user) router.replace("/dashboard");
  }, [mounted, user, router]);

  // Seção ativa no scroll
  useEffect(() => {
    if (!mounted) return;
    const map: [NavId, React.RefObject<HTMLElement | null>][] = [
      ["inicio",        heroRef],
      ["como-funciona", howRef],
      ["precos",        pricingRef],
      ["faq",           faqRef],
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
    ["inicio",        "Início",         heroRef],
    ["como-funciona", "Como funciona",  howRef],
    ["precos",        "Preços",         pricingRef],
    ["faq",           "FAQ",            faqRef],
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: SANS,
        imageRendering: "auto",
        overflowX: "hidden",
        color: C.text,
      }}
    >
      {/* Blob de fundo decorativo */}
      {mounted && (
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          <div style={{
            position: "absolute", top: "-10%", left: "-5%",
            width: 600, height: 600, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(124,58,237,0.10) 0%,transparent 70%)",
          }} />
          <div style={{
            position: "absolute", bottom: "10%", right: "-5%",
            width: 500, height: 500, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(79,70,229,0.07) 0%,transparent 70%)",
          }} />
          <div style={{
            position: "absolute", top: "40%", left: "55%",
            width: 400, height: 400, borderRadius: "50%",
            background: "radial-gradient(circle,rgba(245,158,11,0.05) 0%,transparent 70%)",
          }} />
        </div>
      )}

      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(255,255,255,0.90)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(124,58,237,0.12)",
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
                  color: activeNav === id ? C.accent : C.sub,
                  transition: "color 0.2s",
                }}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Ações */}
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
            {user ? (
              /* Usuário logado — avatar com menu */
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Link href="/conta" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%",
                    background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontFamily: SANS, fontSize: 13, fontWeight: 700, color: "#fff",
                    boxShadow: "0 0 0 2px rgba(167,139,250,0.4)",
                    flexShrink: 0,
                  }}>
                    {profile?.name ? profile.name[0].toUpperCase() : user.email?.[0]?.toUpperCase()}
                  </div>
                  <span className="hidden-mobile" style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: "#a78bfa" }}>
                    {profile?.name?.split(" ")[0] ?? "Minha conta"}
                  </span>
                </Link>
                <button
                  onClick={() => signOut()}
                  className="hidden-mobile"
                  style={{
                    background: "none", border: "1px solid rgba(167,139,250,0.2)", borderRadius: 8,
                    color: C.sub, fontSize: 13, padding: "7px 14px", cursor: "pointer",
                    fontFamily: SANS, fontWeight: 500,
                  }}
                >
                  Sair
                </button>
              </div>
            ) : (
              /* Visitante — botões de entrar/cadastrar */
              <>
                <Link
                  href="/entrar"
                  style={{
                    background: "none", border: `1px solid rgba(124,58,237,0.25)`, borderRadius: 8,
                    color: C.sub, fontSize: 14, padding: "8px 18px",
                    fontFamily: SANS, fontWeight: 500, textDecoration: "none",
                  }}
                  className="hidden-mobile"
                >
                  Entrar
                </Link>
                <Link
                  href="/cadastro"
                  style={{
                    background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                    color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 600,
                    padding: "9px 20px", textDecoration: "none", fontFamily: SANS,
                    boxShadow: "0 4px 14px rgba(124,58,237,0.4)",
                  }}
                >
                  Criar conta
                </Link>
              </>
            )}
            {/* Hamburger */}
            <button
              onClick={() => setMenuOpen(v => !v)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: C.sub, lineHeight: 1 }}
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
            background: "rgba(255,255,255,0.98)",
            borderTop: "1px solid rgba(124,58,237,0.12)",
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
                  color: activeNav === id ? C.accent : C.text,
                  borderBottom: "1px solid rgba(124,58,237,0.08)",
                }}
              >
                {label}
              </button>
            ))}
            {user ? (
              <button
                onClick={() => { setMenuOpen(false); signOut(); }}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: SANS, fontSize: 16, fontWeight: 500,
                  padding: "12px 0", textAlign: "left", color: "#dc2626", marginTop: 4,
                }}
              >
                Sair da conta
              </button>
            ) : (
              <>
                <Link href="/entrar" onClick={() => setMenuOpen(false)} style={{
                  fontFamily: SANS, fontSize: 16, fontWeight: 500, textDecoration: "none",
                  padding: "12px 0", display: "block", color: C.sub, marginTop: 4,
                }}>
                  Entrar
                </Link>
                <Link href="/cadastro" onClick={() => setMenuOpen(false)} style={{
                  fontFamily: SANS, fontSize: 16, fontWeight: 700, textDecoration: "none",
                  padding: "12px 0", display: "block", color: "#a78bfa",
                }}>
                  Criar conta grátis →
                </Link>
              </>
            )}
          </div>
        )}
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        id="inicio"
        style={{ position: "relative", zIndex: 1, maxWidth: 820, margin: "0 auto", padding: "100px 24px 80px", textAlign: "center" }}
      >
        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.35)",
          borderRadius: 100, padding: "6px 16px", marginBottom: 32,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
          <span style={{ fontFamily: SANS, fontSize: 13, color: C.accent, fontWeight: 500 }}>
            Grátis para começar — sem cartão de crédito
          </span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: SANS,
          fontSize: "clamp(32px, 5.5vw, 62px)",
          fontWeight: 800,
          lineHeight: 1.12,
          marginBottom: 28,
          letterSpacing: "-1.5px",
        }}>
          <span style={{ color: C.text }}>
            Seu filho trouxe tarefa de fração.
          </span>
          <br />
          <span style={{
            background: "linear-gradient(135deg,#7c3aed 0%,#4f46e5 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}>
            Você foi reprovado em matemática.
          </span>
          <br />
          <span style={{ color: C.text }}>
            E agora? 🤔
          </span>
        </h1>

        <p style={{
          fontFamily: SANS, fontSize: "clamp(17px, 2.5vw, 21px)",
          color: C.sub, lineHeight: 1.7, maxWidth: 600, margin: "0 auto 48px",
        }}>
          O <strong style={{ color: C.accent }}>Papai Professor</strong> te ensina o conteúdo em 5 minutos —
          no seu jeito, sem jargão de livro — e depois transforma a revisão em um jogo
          que você e seu filho jogam juntos. 🎮
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", marginBottom: 64 }}>
          <Link
            href="/jogar"
            style={{
              background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
              color: "#fff", borderRadius: 10, fontSize: 16, fontWeight: 700,
              padding: "15px 36px", textDecoration: "none", fontFamily: SANS,
              boxShadow: "0 6px 24px rgba(124,58,237,0.5)",
              display: "inline-block",
            }}
          >
            Começar grátis agora
          </Link>
          <button
            onClick={() => scrollTo(howRef)}
            style={{
              background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)",
              color: C.accent, borderRadius: 10, fontSize: 16, fontWeight: 600,
              padding: "15px 32px", cursor: "pointer", fontFamily: SANS,
            }}
          >
            Ver como funciona →
          </button>
        </div>

        {/* Prova social rápida */}
        <div style={{
          display: "flex", justifyContent: "center", gap: 0, flexWrap: "wrap",
          padding: "28px 0",
          borderTop: "1px solid rgba(167,139,250,0.1)",
          borderBottom: "1px solid rgba(167,139,250,0.1)",
        }}>
          {[
            { num: "3 min", label: "pra aprender um conteúdo" },
            { num: "5", label: "matérias do EF1" },
            { num: "1.400+", label: "questões no banco" },
          ].map((s, i) => (
            <div key={i} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "12px 32px",
              borderRight: i < 2 ? "1px solid rgba(124,58,237,0.12)" : undefined,
            }}>
              <span style={{ fontFamily: SANS, fontSize: 28, fontWeight: 800, color: C.accent }}>{s.num}</span>
              <span style={{ fontFamily: SANS, fontSize: 13, color: C.sub, marginTop: 4, textAlign: "center", maxWidth: 120 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── A DOR REAL ─────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 800, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{
          ...glass,
          padding: "40px 40px",
          borderColor: "rgba(167,139,250,0.2)",
          background: "rgba(124,58,237,0.06)",
        }}>
          <div style={{ fontSize: 36, marginBottom: 16, textAlign: "center" }}>😓</div>
          <p style={{
            fontFamily: SANS, fontSize: "clamp(17px, 2.5vw, 20px)",
            color: C.text, lineHeight: 1.75, textAlign: "center", margin: 0,
            fontStyle: "italic",
          }}>
            &ldquo;Eu quero tanto estar presente na vida escolar do meu filho.
            Mas quando ele traz a tarefa e eu não sei explicar...
            dá uma vergonha que eu nem consigo descrever.&rdquo;
          </p>
          <p style={{
            fontFamily: SANS, fontSize: 14, color: "#64748b",
            textAlign: "center", marginTop: 20, fontWeight: 600,
          }}>
            — Rodrigo P., vendedor, pai do Felipe de 8 anos · usuário beta
          </p>
        </div>
      </section>

      {/* ── COMO FUNCIONA ─────────────────────────────────────────────────────── */}
      <section ref={howRef} id="como-funciona" style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
        <SectionLabel>Como vai ser sua noite</SectionLabel>
        <h2 style={{ fontFamily: SANS, fontSize: "clamp(24px,4vw,38px)", fontWeight: 800, color: C.text, textAlign: "center", marginBottom: 16, letterSpacing: "-0.5px" }}>
          De &ldquo;não sei explicar&rdquo; para<br />
          <span style={{ color: C.accent }}>&ldquo;Pai, você manja tudo!&rdquo;</span>
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 16, color: C.sub, textAlign: "center", marginBottom: 56 }}>
          Em menos de 10 minutos.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 24 }}>
          {STEPS.map((step, i) => (
            <div key={step.num} style={{ ...glass, padding: 32, display: "flex", flexDirection: "column", gap: 16, position: "relative" }}>
              {/* Conector */}
              {i < STEPS.length - 1 && (
                <div className="hidden-mobile" style={{
                  position: "absolute", right: -13, top: "50%", transform: "translateY(-50%)",
                  color: C.accentL, fontSize: 20, zIndex: 2,
                }}>→</div>
              )}
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: i === 2
                  ? "linear-gradient(135deg,#059669,#10b981)"
                  : "linear-gradient(135deg,#7c3aed,#4f46e5)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: SANS, fontSize: 16, fontWeight: 800, color: "#fff",
              }}>
                {step.num}
              </div>
              <div style={{ fontSize: 36 }}>{step.icon}</div>
              <h3 style={{ fontFamily: SANS, fontSize: 17, fontWeight: 700, color: C.text, margin: 0 }}>{step.title}</h3>
              <p style={{ fontFamily: SANS, fontSize: 14, color: C.sub, lineHeight: 1.75, margin: 0 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FUNCIONALIDADES ────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
        <SectionLabel>O que você vai usar</SectionLabel>
        <h2 style={{ fontFamily: SANS, fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: C.text, textAlign: "center", marginBottom: 12, letterSpacing: "-0.5px" }}>
          Três ferramentas. Uma missão.
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 16, color: C.sub, textAlign: "center", marginBottom: 52 }}>
          Estar do lado do seu filho quando ele mais precisa.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(290px,1fr))", gap: 24 }}>
          {FEATURES.map((f) => (
            <Link key={f.title} href={f.href} style={{ textDecoration: "none" }}>
              <div style={{
                ...glass,
                padding: 32, height: "100%", display: "flex", flexDirection: "column", gap: 20,
                cursor: "pointer", transition: "border-color 0.2s, transform 0.2s",
                borderColor: `${f.accent}30`,
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.borderColor = `${f.accent}70`; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = ""; (e.currentTarget as HTMLDivElement).style.borderColor = `${f.accent}30`; }}
              >
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
                  <h3 style={{ fontFamily: SANS, fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 10 }}>{f.title}</h3>
                  <p style={{ fontFamily: SANS, fontSize: 14, color: C.sub, lineHeight: 1.75, margin: 0 }}>{f.desc}</p>
                </div>

                <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 6, color: f.accent, fontFamily: SANS, fontSize: 14, fontWeight: 600 }}>
                  {f.cta} <span>→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Matérias */}
        <div style={{ marginTop: 56 }}>
          <p style={{ fontFamily: SANS, fontSize: 13, color: "#64748b", textAlign: "center", marginBottom: 20, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 600 }}>
            Matérias do Ensino Fundamental 1
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
      <section style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
        <SectionLabel>Pais reais, histórias reais</SectionLabel>
        <h2 style={{ fontFamily: SANS, fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: C.text, textAlign: "center", marginBottom: 56, letterSpacing: "-0.5px" }}>
          O que mudou em casa
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(270px,1fr))", gap: 24 }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} style={{ ...glass, padding: 28, display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", gap: 2 }}>
                {"★★★★★".split("").map((s, i) => (
                  <span key={i} style={{ color: "#f59e0b", fontSize: 16 }}>{s}</span>
                ))}
              </div>
              <p style={{ fontFamily: SANS, fontSize: 14, color: C.sub, lineHeight: 1.8, margin: 0, flex: 1 }}>
                &ldquo;{t.text}&rdquo;
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
                  <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: C.text }}>{t.name}</div>
                  <div style={{ fontFamily: SANS, fontSize: 12, color: C.sub, marginBottom: 2 }}>{t.role}</div>
                  <div style={{ fontFamily: SANS, fontSize: 12, color: C.muted }}>{t.city}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HISTÓRIA DO FUNDADOR ──────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "0 24px 80px" }}>
        <div style={{
          ...glass,
          padding: "48px 48px",
          borderColor: "rgba(167,139,250,0.2)",
          background: "rgba(124,58,237,0.05)",
        }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, textAlign: "center" }}>
            {/* Avatar do fundador */}
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
              border: "3px solid rgba(167,139,250,0.4)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 36, flexShrink: 0,
            }}>
              👨‍💻
            </div>

            <div>
              <SectionLabel>Por que eu criei o Papai Professor</SectionLabel>
              <p style={{
                fontFamily: SANS, fontSize: "clamp(15px, 2vw, 18px)",
                color: C.sub, lineHeight: 1.85, margin: "0 auto", maxWidth: 580,
              }}>
                Eu criei o Papai Professor na noite em que me peguei no banheiro — escondido —
                pesquisando &ldquo;como explicar fração pra criança&rdquo; no Google enquanto meu filho esperava
                na sala com o caderno aberto.
              </p>
              <p style={{
                fontFamily: SANS, fontSize: "clamp(15px, 2vw, 18px)",
                color: C.sub, lineHeight: 1.85, margin: "24px auto 0", maxWidth: 580,
              }}>
                Aquela vergonha — de não saber algo que parecia básico, de não conseguir estar
                presente do jeito que eu queria — foi o que me fez construir esse app.
                Porque nenhum pai deveria precisar se esconder pra ajudar o filho.
              </p>
              <p style={{
                fontFamily: SANS, fontSize: "clamp(15px, 2vw, 18px)",
                color: "#a78bfa", lineHeight: 1.85, margin: "24px auto 0", maxWidth: 580,
                fontWeight: 600,
              }}>
                Não existe pai que não sabe matemática. Existe pai que não tinha a ferramenta certa.
                Agora tem.
              </p>
            </div>

            <div style={{ borderTop: "1px solid rgba(167,139,250,0.15)", paddingTop: 24, width: "100%" }}>
              <p style={{ fontFamily: SANS, fontSize: 14, color: "#64748b", margin: 0 }}>
                — Fundador do Papai Professor
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PREÇOS ─────────────────────────────────────────────────────────────── */}
      <section ref={pricingRef} id="precos" style={{ position: "relative", zIndex: 1, maxWidth: 900, margin: "0 auto", padding: "40px 24px 80px" }}>
        <SectionLabel>Preços</SectionLabel>
        <h2 style={{ fontFamily: SANS, fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: C.text, textAlign: "center", marginBottom: 12, letterSpacing: "-0.5px" }}>
          Comece grátis — sem culpa.
        </h2>
        <p style={{ fontFamily: SANS, fontSize: 16, color: C.sub, textAlign: "center", marginBottom: 52 }}>
          Você não paga nada pra estar do lado do seu filho. O Pro é só pra quem quer mais.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24, alignItems: "start" }}>
          {/* Gratuito */}
          <div style={{ ...glass, padding: 36, display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>Gratuito</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <span style={{ fontFamily: SANS, fontSize: 42, fontWeight: 800, color: C.text }}>R$0</span>
                <span style={{ fontFamily: SANS, fontSize: 14, color: C.sub }}>/mês</span>
              </div>
              <p style={{ fontFamily: SANS, fontSize: 13, color: "#475569", marginTop: 8 }}>
                Já dá pra ser o herói da tarefa.
              </p>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                [true,  "Modo Pai Aprende (ilimitado)"],
                [true,  "Trilha do Conhecimento"],
                [true,  "5 matérias, 66 tópicos"],
                [true,  "1.400+ questões no banco"],
                [false, "Foto da Tarefa (análise por IA)"],
                [false, "Respostas prioritárias"],
              ].map(([ok, text], i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: ok ? "#059669" : C.muted, fontSize: 16, flexShrink: 0 }}>{ok ? "✓" : "○"}</span>
                  <span style={{ fontFamily: SANS, fontSize: 14, color: ok ? C.text : C.muted }}>{text as string}</span>
                </li>
              ))}
            </ul>
            <Link
              href="/jogar"
              style={{
                display: "block", textAlign: "center",
                border: "1px solid rgba(167,139,250,0.3)", borderRadius: 10,
                color: "#a78bfa", fontFamily: SANS, fontSize: 15, fontWeight: 600,
                padding: "13px", textDecoration: "none",
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
                <span style={{ fontFamily: SANS, fontSize: 42, fontWeight: 800, color: C.text }}>R$29</span>
                <span style={{ fontFamily: SANS, fontSize: 42, fontWeight: 800, color: C.text }}>,90</span>
                <span style={{ fontFamily: SANS, fontSize: 14, color: C.sub }}>/mês</span>
              </div>
              <p style={{ fontFamily: SANS, fontSize: 13, color: C.sub, margin: 0 }}>
                Uso ilimitado pra toda a família — menos de R$1 por dia.
              </p>
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Tudo do plano gratuito",
                "Foto da Tarefa ilimitada",
                "Respostas de IA prioritárias",
                "Histórico de aprendizado do filho",
                "Novos conteúdos em primeira mão",
                "Suporte por WhatsApp",
              ].map((text, i) => (
                <li key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: "#a78bfa", fontSize: 16, flexShrink: 0 }}>✓</span>
                  <span style={{ fontFamily: SANS, fontSize: 14, color: C.text }}>{text}</span>
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
          <h3 style={{ fontFamily: SANS, fontSize: 20, fontWeight: 700, color: C.text, marginBottom: 10 }}>
            1 mês de Pro grátis no lançamento
          </h3>
          <p style={{ fontFamily: SANS, fontSize: 14, color: C.sub, marginBottom: 28, lineHeight: 1.6 }}>
            Deixa seu e-mail e a gente avisa você antes de todo mundo — com 1 mês cortesia.
          </p>
          <VipForm />
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section ref={faqRef} id="faq" style={{ position: "relative", zIndex: 1, maxWidth: 680, margin: "0 auto", padding: "40px 24px 80px" }}>
        <SectionLabel>Perguntas que todo pai faz</SectionLabel>
        <h2 style={{ fontFamily: SANS, fontSize: "clamp(24px,4vw,36px)", fontWeight: 800, color: C.text, textAlign: "center", marginBottom: 48, letterSpacing: "-0.5px" }}>
          Tire sua dúvida antes de começar
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
                <span style={{ fontFamily: SANS, fontSize: 15, fontWeight: 600, color: C.text, lineHeight: 1.5 }}>{faq.q}</span>
                <span style={{
                  width: 24, height: 24, borderRadius: "50%",
                  background: openFaq === i ? "rgba(124,58,237,0.15)" : "rgba(124,58,237,0.06)",
                  border: "1px solid rgba(167,139,250,0.2)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#a78bfa", fontSize: 13, flexShrink: 0,
                }}>
                  {openFaq === i ? "−" : "+"}
                </span>
              </button>
              {openFaq === i && (
                <div style={{ padding: "0 24px 20px", fontFamily: SANS, fontSize: 14, color: C.sub, lineHeight: 1.8, borderTop: "1px solid rgba(167,139,250,0.1)" }}>
                  <div style={{ paddingTop: 16 }}>{faq.a}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────────────── */}
      <section style={{ position: "relative", zIndex: 1, maxWidth: 720, margin: "0 auto", padding: "20px 24px 100px" }}>
        <div style={{
          background: "linear-gradient(135deg,rgba(124,58,237,0.22),rgba(79,70,229,0.12))",
          border: "1px solid rgba(167,139,250,0.25)", borderRadius: 24,
          padding: "64px 40px", textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 20 }}>👨‍👦</div>
          <h2 style={{ fontFamily: SANS, fontSize: "clamp(22px,4vw,34px)", fontWeight: 800, color: C.text, marginBottom: 14, letterSpacing: "-0.5px" }}>
            A próxima tarefa chega hoje à noite.
          </h2>
          <p style={{ fontFamily: SANS, fontSize: 17, color: C.sub, marginBottom: 40, lineHeight: 1.7 }}>
            Em 5 minutos você vai saber explicar. E o seu filho vai olhar pra você diferente.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              href="/jogar"
              style={{
                background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
                color: "#fff", borderRadius: 10, fontSize: 16, fontWeight: 700,
                padding: "15px 36px", textDecoration: "none", fontFamily: SANS,
                boxShadow: "0 6px 24px rgba(124,58,237,0.5)", display: "inline-block",
              }}
            >
              Eu quero ser esse pai →
            </Link>
          </div>
          <p style={{ fontFamily: SANS, fontSize: 13, color: C.sub, marginTop: 20 }}>
            Grátis. Sem cadastro. Abre agora.
          </p>
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
                Nenhum pai deveria sentir vergonha de não saber uma matéria da escola do filho.
              </p>
            </div>

            {/* Navegação */}
            <div>
              <div style={{ fontFamily: SANS, fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>Navegar</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[["Como funciona", "#como-funciona"], ["Preços", "#precos"], ["FAQ", "#faq"]].map(([l, h]) => (
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
                  ["🗺️ Trilha do Conhecimento", "/trilha"],
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
              © 2025 Papai Professor — Feito com ❤️ para pais que querem estar presentes
            </p>
            {user ? (
              <Link href="/conta" style={{ fontFamily: SANS, fontSize: 13, color: "#64748b", textDecoration: "none" }}>
                Minha conta →
              </Link>
            ) : (
              <div style={{ display: "flex", gap: 16 }}>
                <Link href="/entrar" style={{ fontFamily: SANS, fontSize: 13, color: "#475569", textDecoration: "none" }}>Entrar</Link>
                <Link href="/cadastro" style={{ fontFamily: SANS, fontSize: 13, color: "#a78bfa", textDecoration: "none", fontWeight: 600 }}>Criar conta</Link>
              </div>
            )}
          </div>
        </div>
      </footer>

      {/* Overrides globais de CSS */}
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
        <p style={{ fontFamily: SANS, fontSize: 14, color: "#475569" }}>Avisaremos em <strong style={{ color: "#0f172a" }}>{email}</strong> quando o plano Pro abrir.</p>
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
          background: "rgba(255,255,255,0.7)", border: "1px solid rgba(124,58,237,0.25)",
          borderRadius: 10, color: "#0f172a", outline: "none",
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
        {loading ? "..." : "Quero entrar"}
      </button>
    </form>
  );
}
