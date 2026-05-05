"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";

const SANS = "'Inter','Segoe UI',system-ui,-apple-system,sans-serif";

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(16px)",
  WebkitBackdropFilter: "blur(16px)",
  border: "1px solid rgba(167,139,250,0.2)",
  borderRadius: 20,
};

export default function CadastroPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("As senhas não coincidem.");
      return;
    }
    if (password.length < 6) {
      setError("A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    setLoading(true);
    const err = await signUp(email, password, name);
    setLoading(false);

    if (err) {
      // Traduz erros comuns do Supabase
      if (err.includes("already registered")) setError("Este e-mail já tem uma conta. Tente entrar.");
      else if (err.includes("invalid email"))  setError("E-mail inválido.");
      else setError(err);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/dashboard"), 2000);
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg,#0c0a1a 0%,#120d2a 50%,#0c0a1a 100%)",
      fontFamily: SANS,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
    }}>
      {/* Blob decorativo */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "-10%", left: "-5%",
          width: 500, height: 500, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(124,58,237,0.2) 0%,transparent 70%)",
        }} />
        <div style={{
          position: "absolute", bottom: "5%", right: "-5%",
          width: 400, height: 400, borderRadius: "50%",
          background: "radial-gradient(circle,rgba(37,99,235,0.12) 0%,transparent 70%)",
        }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 28 }}>🎮</span>
            <span style={{ fontFamily: "'Press Start 2P', cursive", fontSize: 9, color: "#a78bfa", letterSpacing: 1 }}>
              PAPAI PROFESSOR
            </span>
          </Link>
        </div>

        <div style={{ ...glass, padding: "40px 36px" }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🎉</div>
              <h2 style={{ fontFamily: SANS, fontSize: 22, fontWeight: 800, color: "#f1f5f9", marginBottom: 10 }}>
                Conta criada!
              </h2>
              <p style={{ fontFamily: SANS, fontSize: 15, color: "#94a3b8", lineHeight: 1.6 }}>
                Seja bem-vindo, <strong style={{ color: "#a78bfa" }}>{name}</strong>!<br />
                Redirecionando para o app...
              </p>
            </div>
          ) : (
            <>
              <h1 style={{ fontFamily: SANS, fontSize: 22, fontWeight: 800, color: "#f1f5f9", marginBottom: 6 }}>
                Criar sua conta
              </h1>
              <p style={{ fontFamily: SANS, fontSize: 14, color: "#64748b", marginBottom: 28 }}>
                Grátis. Sem cartão. Começa agora.
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {/* Nome */}
                <div>
                  <label style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 6 }}>
                    Seu nome
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {/* Email */}
                <div>
                  <label style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 6 }}>
                    E-mail
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {/* Senha */}
                <div>
                  <label style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 6 }}>
                    Senha
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {/* Confirmar senha */}
                <div>
                  <label style={{ fontFamily: SANS, fontSize: 13, fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: 6 }}>
                    Confirmar senha
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Repita a senha"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    style={inputStyle}
                  />
                </div>

                {/* Erro */}
                {error && (
                  <div style={{
                    background: "rgba(185,28,28,0.15)", border: "1px solid rgba(185,28,28,0.4)",
                    borderRadius: 10, padding: "10px 14px",
                    fontFamily: SANS, fontSize: 13, color: "#fca5a5",
                  }}>
                    {error}
                  </div>
                )}

                {/* Botão */}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    marginTop: 4,
                    background: loading ? "rgba(124,58,237,0.4)" : "linear-gradient(135deg,#7c3aed,#4f46e5)",
                    border: "none", borderRadius: 10,
                    color: "#fff", fontFamily: SANS, fontSize: 15, fontWeight: 700,
                    padding: "14px", cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: loading ? "none" : "0 4px 20px rgba(124,58,237,0.4)",
                    transition: "all 0.2s",
                  }}
                >
                  {loading ? "Criando conta..." : "Criar conta grátis →"}
                </button>
              </form>

              <p style={{ fontFamily: SANS, fontSize: 13, color: "#475569", textAlign: "center", marginTop: 24 }}>
                Já tem conta?{" "}
                <Link href="/entrar" style={{ color: "#a78bfa", textDecoration: "none", fontWeight: 600 }}>
                  Entrar
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(167,139,250,0.2)",
  borderRadius: 10,
  padding: "12px 14px",
  fontFamily: "'Inter','Segoe UI',system-ui,sans-serif",
  fontSize: 15,
  color: "#f1f5f9",
  outline: "none",
  boxSizing: "border-box",
};
