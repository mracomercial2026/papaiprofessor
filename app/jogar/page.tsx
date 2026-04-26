"use client";

import Link from "next/link";
import { useState } from "react";

const MODES = [
  {
    href: "/aprender",
    icon: "🧠",
    label: "MODO PAI APRENDE",
    tagline: "Entenda antes de ensinar",
    desc: "Faça qualquer pergunta sobre a tarefa do seu filho. A IA explica o conteúdo em linguagem simples para você repassar com confiança.",
    examples: ["Como funciona fração?", "O que é análise sintática?", "Explique a Guerra do Paraguai"],
    color: "#a78bfa",
    bg: "rgba(124,58,237,0.15)",
    border: "rgba(167,139,250,0.4)",
    glow: "rgba(124,58,237,0.5)",
    btnClass: "pixel-btn pixel-btn-primary",
    btnLabel: "PERGUNTAR AGORA",
  },
  {
    href: "/trilha",
    icon: "⚔️",
    label: "TRILHA DO CONHECIMENTO",
    tagline: "Jogue com seu filho",
    desc: "Pai e filho enfrentam monstros respondendo perguntas. Matemática, Português, Ciências e mais — aprender vira aventura.",
    examples: ["Derrote o Dragão da Tabuada", "Enfrente o Mestre das Frações", "Vença o Boss de História"],
    color: "#34d399",
    bg: "rgba(5,150,105,0.15)",
    border: "rgba(52,211,153,0.4)",
    glow: "rgba(5,150,105,0.5)",
    btnClass: "pixel-btn pixel-btn-green",
    btnLabel: "JOGAR AGORA",
  },
  {
    href: "/analisar",
    icon: "📸",
    label: "FOTO DA TAREFA",
    tagline: "Tire foto, entenda na hora",
    desc: "Mande a foto da tarefa e a IA analisa cada questão — explicando o conceito e como ensinar seu filho sem dar a resposta direta.",
    examples: ["Foto de exercício de fração", "Redação para revisar", "Problema de geometria"],
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.12)",
    border: "rgba(245,158,11,0.4)",
    glow: "rgba(245,158,11,0.4)",
    btnClass: "pixel-btn pixel-btn-yellow",
    btnLabel: "ENVIAR FOTO",
  },
];

export default function JogarPage() {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <main className="min-h-screen stars-bg relative overflow-x-hidden">
      {/* Header minimal */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-purple-900/40">
        <Link href="/" className="flex items-center gap-2 font-pixel text-purple-400 text-[8px] hover:text-yellow-400 transition-colors">
          ← VOLTAR
        </Link>
        <span className="font-pixel text-yellow-400 text-[9px] glow-yellow hidden sm:block">🎮 PAPAI PROFESSOR</span>
        <div style={{ width: 60 }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Título */}
        <div className="text-center mb-14">
          <div className="text-5xl mb-4 animate-float inline-block">🎮</div>
          <h1 className="font-pixel text-yellow-400 glow-yellow text-sm mb-4 leading-relaxed">
            ESCOLHA SEU MODO
          </h1>
          <p className="font-retro text-purple-300 text-xl max-w-md mx-auto">
            Selecione como você quer aprender hoje!
          </p>
        </div>

        {/* Cards de modo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {MODES.map((mode, i) => (
            <Link
              key={i}
              href={mode.href}
              className="relative flex flex-col gap-5 p-7 transition-all duration-200 cursor-pointer"
              style={{
                background: hovered === i ? mode.bg : "rgba(30,16,64,0.8)",
                border: `2px solid ${hovered === i ? mode.border : "rgba(124,58,237,0.25)"}`,
                borderRadius: 16,
                boxShadow: hovered === i ? `0 0 32px ${mode.glow}, 0 8px 32px rgba(0,0,0,0.4)` : "0 4px 16px rgba(0,0,0,0.3)",
                transform: hovered === i ? "translateY(-6px)" : "translateY(0)",
                textDecoration: "none",
              }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* Ícone */}
              <div className="text-center">
                <div
                  className="text-6xl inline-block"
                  style={{
                    filter: hovered === i ? `drop-shadow(0 0 16px ${mode.color})` : "none",
                    animation: hovered === i ? "float 2s ease-in-out infinite" : "none",
                    transition: "filter 0.2s",
                  }}
                >
                  {mode.icon}
                </div>
              </div>

              {/* Textos */}
              <div>
                <div
                  className="font-pixel text-center leading-relaxed mb-1"
                  style={{ fontSize: 9, color: mode.color }}
                >
                  {mode.label}
                </div>
                <div className="font-retro text-center text-purple-400 text-base mb-3">
                  {mode.tagline}
                </div>
                <p className="font-retro text-purple-300 text-lg leading-relaxed text-center">
                  {mode.desc}
                </p>
              </div>

              {/* Exemplos */}
              <div className="flex flex-col gap-2">
                {mode.examples.map((ex, j) => (
                  <div
                    key={j}
                    className="font-retro text-base px-3 py-1 rounded"
                    style={{
                      background: `${mode.color}15`,
                      border: `1px solid ${mode.color}30`,
                      color: `${mode.color}cc`,
                    }}
                  >
                    "{ex}"
                  </div>
                ))}
              </div>

              {/* Botão */}
              <button className={`${mode.btnClass} w-full py-3 text-[9px] mt-auto`}>
                {mode.btnLabel} →
              </button>
            </Link>
          ))}
        </div>

        {/* Footer hint */}
        <p className="font-retro text-purple-600 text-lg text-center mt-10">
          Dica: comece pelo <span className="text-purple-400">Modo Pai Aprende</span> para entender o conteúdo,
          depois joguem a <span className="text-green-500">Trilha</span> juntos para fixar! 🏆
        </p>
      </div>
    </main>
  );
}
