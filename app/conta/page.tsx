"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";

const SANS = "'Inter','Segoe UI',system-ui,-apple-system,sans-serif";

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  border: "1px solid rgba(167,139,250,0.15)",
  borderRadius: 16,
};

export default function ContaPage() {
  const router = useRouter();
  const { user, profile, signOut, loading } = useAuth();

  // Redireciona se não estiver logado
  useEffect(() => {
    if (!loading && !user) router.replace("/entrar");
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen stars-bg flex items-center justify-center">
        <div className="font-pixel text-purple-400 text-xs animate-blink">CARREGANDO...</div>
      </div>
    );
  }

  const initials = profile?.name
    ? profile.name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
    : user.email?.[0]?.toUpperCase() ?? "?";

  const displayName = profile?.name ?? user.email ?? "Usuário";

  async function handleSignOut() {
    await signOut();
    router.push("/");
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#0c0a1a 0%,#120d2a 50%,#0c0a1a 100%)",
      fontFamily: SANS,
      color: "#f1f5f9",
    }}>
      {/* Blob decorativo */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-10%", left: "-5%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)",
        }} />
      </div>

      {/* Header */}
      <header style={{
        position: "sticky", top: 0, zIndex: 50,
        background: "rgba(12,10,26,0.85)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(167,139,250,0.12)",
      }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
          padding: "0 24px", height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 22 }}>🎮</span>
            <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: 8, color: "#a78bfa", letterSpacing: 1 }}>
              PAPAI PROFESSOR
            </span>
          </Link>
          <Link href="/jogar" style={{
            background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
            color: "#fff", borderRadius: 8, fontSize: 14, fontWeight: 600,
            padding: "8px 18px", textDecoration: "none",
          }}>
            Jogar →
          </Link>
        </div>
      </header>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", padding: "48px 24px" }}>

        {/* Avatar + nome */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 40 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: SANS, fontSize: 24, fontWeight: 800, color: "#fff",
            flexShrink: 0,
            boxShadow: "0 0 0 3px rgba(167,139,250,0.3)",
          }}>
            {initials}
          </div>
          <div>
            <h1 style={{ fontFamily: SANS, fontSize: 24, fontWeight: 800, color: "#f1f5f9", margin: 0 }}>
              {displayName}
            </h1>
            <p style={{ fontFamily: SANS, fontSize: 14, color: "#64748b", margin: "4px 0 0" }}>
              {user.email}
            </p>
          </div>
        </div>

        {/* XP Card */}
        <div style={{
          ...glass,
          padding: 28, marginBottom: 24,
          background: "linear-gradient(135deg,rgba(124,58,237,0.12),rgba(79,70,229,0.06))",
          borderColor: "rgba(124,58,237,0.3)",
        }}>
          <div style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 12 }}>
            Seu progresso
          </div>
          <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 34, fontWeight: 800, color: "#a78bfa" }}>
                ⭐ {profile?.xp ?? 0}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: "#64748b", marginTop: 4 }}>XP acumulado</div>
            </div>
            <div>
              <div style={{ fontFamily: SANS, fontSize: 34, fontWeight: 800, color: "#34d399" }}>
                {profile?.grade_level ?? "3º ano"}
              </div>
              <div style={{ fontFamily: SANS, fontSize: 13, color: "#64748b", marginTop: 4 }}>Ano escolar</div>
            </div>
          </div>
        </div>

        {/* Ações rápidas */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 32 }}>
          {[
            { icon: "🧠", label: "Modo Pai Aprende", href: "/aprender", color: "#a78bfa" },
            { icon: "🗺️", label: "Trilha do Conhecimento", href: "/trilha", color: "#34d399" },
            { icon: "📸", label: "Foto da Tarefa", href: "/analisar", color: "#f59e0b" },
          ].map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: "none" }}>
              <div style={{
                ...glass,
                padding: "20px 24px",
                display: "flex", alignItems: "center", gap: 14,
                cursor: "pointer",
                borderColor: `${item.color}30`,
                transition: "border-color 0.2s, transform 0.2s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${item.color}70`; (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = `${item.color}30`; (e.currentTarget as HTMLDivElement).style.transform = ""; }}
              >
                <span style={{ fontSize: 28 }}>{item.icon}</span>
                <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: item.color }}>
                  {item.label}
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Sair */}
        <div style={{ ...glass, padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>Sair da conta</div>
            <div style={{ fontFamily: SANS, fontSize: 13, color: "#64748b", marginTop: 2 }}>
              Você pode entrar de volta a qualquer momento.
            </div>
          </div>
          <button
            onClick={handleSignOut}
            style={{
              background: "rgba(185,28,28,0.12)",
              border: "1px solid rgba(185,28,28,0.3)",
              borderRadius: 8, padding: "9px 20px",
              fontFamily: SANS, fontSize: 14, fontWeight: 600,
              color: "#fca5a5", cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            Sair
          </button>
        </div>

      </div>
    </main>
  );
}
