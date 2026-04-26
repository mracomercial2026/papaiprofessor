"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import {
  getQuestionsForTopic,
  getMonsters,
  TOPICS_BY_SUBJECT,
  type Question,
  type Monster,
} from "../data/questions";

// ── 🔊 Sons 8-bit via Web Audio API (sem arquivos externos) ─────────────────
type SoundName = "correct" | "wrong" | "monsterDefeated" | "playerHit" | "gameover" | "worldclear" | "levelup";

function useGameSounds() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current || ctxRef.current.state === "closed") {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === "suspended") {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  // Toca uma sequência de notas: [{freq, dur, delay}]
  const playSeq = useCallback(
    (
      notes: { freq: number; dur: number; delay: number; vol?: number }[],
      wave: OscillatorType = "square",
      masterVol = 0.18
    ) => {
      try {
        const ctx = getCtx();
        const master = ctx.createGain();
        master.gain.setValueAtTime(masterVol, ctx.currentTime);
        master.connect(ctx.destination);

        for (const { freq, dur, delay, vol = 1 } of notes) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = wave;
          osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
          gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + dur);
          osc.connect(gain);
          gain.connect(master);
          osc.start(ctx.currentTime + delay);
          osc.stop(ctx.currentTime + delay + dur + 0.01);
        }
      } catch {
        // AudioContext bloqueado — silêncio
      }
    },
    [getCtx]
  );

  const play = useCallback(
    (name: SoundName) => {
      switch (name) {
        // ✅ Acerto — arpejo ascendente alegre (Dó-Mi-Sol-Dó)
        case "correct":
          playSeq(
            [
              { freq: 523.25, dur: 0.10, delay: 0.00 }, // C5
              { freq: 659.25, dur: 0.10, delay: 0.08 }, // E5
              { freq: 783.99, dur: 0.10, delay: 0.16 }, // G5
              { freq: 1046.5, dur: 0.18, delay: 0.24 }, // C6
            ],
            "square",
            0.16
          );
          break;

        // ❌ Erro — queda grave dissonante
        case "wrong":
          playSeq(
            [
              { freq: 220, dur: 0.12, delay: 0.00 },
              { freq: 180, dur: 0.12, delay: 0.10 },
              { freq: 140, dur: 0.20, delay: 0.20 },
            ],
            "sawtooth",
            0.20
          );
          break;

        // ⚔️ Monstro derrotado — fanfarra vitória curta
        case "monsterDefeated":
          playSeq(
            [
              { freq: 392, dur: 0.08, delay: 0.00 }, // G4
              { freq: 523, dur: 0.08, delay: 0.09 }, // C5
              { freq: 659, dur: 0.08, delay: 0.18 }, // E5
              { freq: 784, dur: 0.08, delay: 0.27 }, // G5
              { freq: 1047, dur: 0.25, delay: 0.36 }, // C6
            ],
            "square",
            0.18
          );
          break;

        // 💥 Dano no jogador — impacto grave
        case "playerHit":
          playSeq(
            [
              { freq: 160, dur: 0.08, delay: 0.00 },
              { freq: 100, dur: 0.15, delay: 0.07 },
            ],
            "sawtooth",
            0.22
          );
          break;

        // 💀 Game over — melodia descendente sombria
        case "gameover":
          playSeq(
            [
              { freq: 392, dur: 0.18, delay: 0.00 }, // G4
              { freq: 349, dur: 0.18, delay: 0.20 }, // F4
              { freq: 311, dur: 0.18, delay: 0.40 }, // Eb4
              { freq: 261, dur: 0.35, delay: 0.60 }, // C4
            ],
            "triangle",
            0.20
          );
          break;

        // 🏆 World clear — fanfarra épica SNES
        case "worldclear":
          playSeq(
            [
              { freq: 523, dur: 0.10, delay: 0.00 },  // C5
              { freq: 523, dur: 0.10, delay: 0.11 },  // C5
              { freq: 523, dur: 0.10, delay: 0.22 },  // C5
              { freq: 523, dur: 0.18, delay: 0.33 },  // C5
              { freq: 415, dur: 0.18, delay: 0.33 },  // Ab4 (harmonia)
              { freq: 659, dur: 0.22, delay: 0.54 },  // E5
              { freq: 523, dur: 0.22, delay: 0.54 },  // C5
              { freq: 784, dur: 0.40, delay: 0.80 },  // G5
              { freq: 622, dur: 0.40, delay: 0.80 },  // Eb5
            ],
            "square",
            0.16
          );
          break;

        // ⭐ Subiu de nível / próximo monstro
        case "levelup":
          playSeq(
            [
              { freq: 659, dur: 0.09, delay: 0.00 }, // E5
              { freq: 784, dur: 0.09, delay: 0.10 }, // G5
              { freq: 988, dur: 0.09, delay: 0.20 }, // B5
              { freq: 1319, dur: 0.22, delay: 0.30 }, // E6
            ],
            "square",
            0.16
          );
          break;
      }
    },
    [playSeq]
  );

  return play;
}

type Screen = "select-subject" | "select-topic" | "map" | "battle" | "victory" | "gameover" | "worldclear";

const SUBJECTS = Object.keys(TOPICS_BY_SUBJECT);

const SUBJECT_ICONS: Record<string, string> = {
  Matemática: "➕", Português: "📖", Ciências: "🔬", História: "📜", Geografia: "🌍",
};
const SUBJECT_COLORS: Record<string, string> = {
  Matemática: "#FFD700", Português: "#1E90FF", Ciências: "#FF8C00", História: "#DC143C", Geografia: "#00A86B",
};

function HpBar({ current, max, color }: { current: number; max: number; color: string }) {
  const pct = Math.max(0, (current / max) * 100);
  return (
    <div className="hp-bar flex-1">
      <div
        className="hp-bar-fill transition-all duration-500"
        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }}
      />
    </div>
  );
}

// Wrapper com Suspense — obrigatório no App Router quando useSearchParams é usado
export default function TrilhaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen stars-bg flex items-center justify-center">
        <div className="font-pixel text-purple-400 text-xs animate-blink">CARREGANDO...</div>
      </div>
    }>
      <TrilhaContent />
    </Suspense>
  );
}

function TrilhaContent() {
  const searchParams = useSearchParams();
  const playSound = useGameSounds();

  const [screen, setScreen] = useState<Screen>("select-subject");
  const [subject, setSubject] = useState<string | null>(null);
  const [topic, setTopic] = useState<string | null>(null);
  const [gradeLevel, setGradeLevel] = useState("3º ano");

  // Game state
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [clearedMonsters, setClearedMonsters] = useState<number[]>([]);
  const [currentMonsterIdx, setCurrentMonsterIdx] = useState(0);
  const [playerHp, setPlayerHp] = useState(6);
  const [monsterHp, setMonsterHp] = useState(0);
  const [totalXp, setTotalXp] = useState(0);

  // Questions
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  // usedIndices persists across all monsters in the same run — only reset in initGame
  const [usedIndices, setUsedIndices] = useState<Set<number>>(new Set());
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [phase, setPhase] = useState<"question" | "result">("question");
  const [lastCorrect, setLastCorrect] = useState(false);

  // Custom topic
  const [customInput, setCustomInput] = useState("");
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questionsError, setQuestionsError] = useState("");

  // Animation flags
  const [shakePlayer, setShakePlayer] = useState(false);
  const [shakeMonster, setShakeMonster] = useState(false);
  const [attackFlash, setAttackFlash] = useState<null | "hit" | "player-hit">(null);
  const [monsterEnter, setMonsterEnter] = useState(false);
  const [showEffect, setShowEffect] = useState<string | null>(null);

  const shakeT = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Read URL params from chat JOGAR button
  useEffect(() => {
    const urlSubject = searchParams.get("subject");
    const urlTopic = searchParams.get("topic");
    if (urlSubject) {
      setSubject(urlSubject);
      if (urlTopic) {
        // Check if topic exists in local bank
        const localTopics = TOPICS_BY_SUBJECT[urlSubject] ?? [];
        const localMatch = localTopics.find((t) => t.name === urlTopic);
        if (localMatch) {
          initGameLocal(urlSubject, urlTopic);
        } else {
          // Use AI to generate questions for this topic
          setTopic(urlTopic);
          setScreen("select-topic");
          loadAIQuestions(urlSubject, urlTopic);
        }
      } else {
        setScreen("select-topic");
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── QUESTION HELPERS ────────────────────────────────────────────────────────

  const pickQuestion = useCallback(
    (questions: Question[], used: Set<number>) => {
      const available = questions.map((_, i) => i).filter((i) => !used.has(i));
      if (available.length === 0) {
        // Pool exhausted — shuffle fresh (avoid last shown if possible)
        const fresh = Math.floor(Math.random() * questions.length);
        const newUsed = new Set<number>([fresh]);
        setUsedIndices(newUsed);
        setCurrentQ(questions[fresh]);
      } else {
        const pick = available[Math.floor(Math.random() * available.length)];
        setUsedIndices((prev) => new Set([...prev, pick]));
        setCurrentQ(questions[pick]);
      }
    },
    []
  );

  // ─── GAME INIT ───────────────────────────────────────────────────────────────

  function initGameLocal(subj: string, top: string) {
    const qs = getQuestionsForTopic(subj, top);
    const ms = getMonsters(subj);
    setSubject(subj);
    setTopic(top);
    setMonsters(ms);
    setAllQuestions(qs);
    setClearedMonsters([]);
    setPlayerHp(6);
    setTotalXp(0);
    setUsedIndices(new Set()); // reset only at game start
    setScreen("map");
  }

  async function loadAIQuestions(subj: string, top: string) {
    setLoadingQuestions(true);
    setQuestionsError("");
    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: subj, topic: top, gradeLevel, count: 15 }),
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) throw new Error(data.error ?? "Erro desconhecido");

      const ms = getMonsters(subj);
      setSubject(subj);
      setTopic(top);
      setMonsters(ms);
      setAllQuestions(data);
      setClearedMonsters([]);
      setPlayerHp(6);
      setTotalXp(0);
      setUsedIndices(new Set());
      setScreen("map");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setQuestionsError(`Erro ao gerar perguntas: ${msg}. Tente um tema diferente.`);
    } finally {
      setLoadingQuestions(false);
    }
  }

  // ─── BATTLE ──────────────────────────────────────────────────────────────────

  const startBattle = useCallback(
    (monsterIdx: number) => {
      const m = getMonsters(subject!)[monsterIdx];
      if (!m) return;
      setCurrentMonsterIdx(monsterIdx);
      setMonsterHp(m.hp);
      setSelectedAnswer(null);
      setPhase("question");
      setShakePlayer(false);
      setShakeMonster(false);
      setAttackFlash(null);
      setMonsterEnter(true);
      setScreen("battle");
      setTimeout(() => setMonsterEnter(false), 600);

      // KEY FIX: do NOT reset usedIndices here — keep them across all monsters in this run
      pickQuestion(allQuestions, usedIndices);
    },
    [subject, allQuestions, usedIndices, pickQuestion]
  );

  const triggerShake = useCallback((who: "player" | "monster") => {
    if (who === "player") {
      setShakePlayer(true);
      if (shakeT.current) clearTimeout(shakeT.current);
      shakeT.current = setTimeout(() => setShakePlayer(false), 600);
    } else {
      setShakeMonster(true);
      if (shakeT.current) clearTimeout(shakeT.current);
      shakeT.current = setTimeout(() => setShakeMonster(false), 600);
    }
  }, []);

  const handleAnswer = useCallback(
    (idx: number) => {
      if (selectedAnswer !== null || !currentQ) return;
      setSelectedAnswer(idx);
      const correct = idx === currentQ.correct;
      setLastCorrect(correct);
      setPhase("result");

      if (correct) {
        playSound("correct");
        setAttackFlash("hit");
        setShowEffect("⚔️");
        setTimeout(() => {
          setAttackFlash(null);
          setShowEffect(null);
          triggerShake("monster");
          setMonsterHp((p) => p - 1);
        }, 500);
      } else {
        playSound("wrong");
        setAttackFlash("player-hit");
        setShowEffect("💥");
        setTimeout(() => {
          setAttackFlash(null);
          setShowEffect(null);
          triggerShake("player");
          setPlayerHp((p) => Math.max(0, p - 1));
        }, 500);
      }
    },
    [selectedAnswer, currentQ, triggerShake, playSound]
  );

  useEffect(() => {
    if (screen !== "battle") return;
    if (monsterHp <= 0) {
      setAttackFlash("hit");
      setTimeout(() => {
        setAttackFlash(null);
        const xpGain = currentMonsterIdx === monsters.length - 1 ? 100 : 50;
        setTotalXp((p) => p + xpGain);
        setClearedMonsters((prev) => [...prev, currentMonsterIdx]);
        if (currentMonsterIdx === monsters.length - 1) {
          playSound("worldclear");
          setScreen("worldclear");
        } else {
          playSound("monsterDefeated");
          setScreen("victory");
        }
      }, 800);
    } else if (playerHp <= 0) {
      setTimeout(() => {
        playSound("gameover");
        setScreen("gameover");
      }, 800);
    }
  }, [monsterHp, playerHp, screen, currentMonsterIdx, monsters.length, playSound]);

  const nextQuestion = useCallback(() => {
    setSelectedAnswer(null);
    setPhase("question");
    pickQuestion(allQuestions, usedIndices);
  }, [allQuestions, usedIndices, pickQuestion]);

  // ─── DERIVED ─────────────────────────────────────────────────────────────────

  const nextMonsterIdx = [0, 1, 2, 3].find((i) => !clearedMonsters.includes(i)) ?? null;
  const subjectColor = subject ? (SUBJECT_COLORS[subject] ?? "#FFD700") : "#FFD700";
  const currentMonster = subject ? getMonsters(subject)[currentMonsterIdx] : null;
  const isBoss = currentMonsterIdx === monsters.length - 1;

  // ─── SELECT SUBJECT ──────────────────────────────────────────────────────────
  if (screen === "select-subject") return (
    <div className="min-h-screen stars-bg flex flex-col items-center justify-center p-6 gap-6">
      <Link href="/" className="font-pixel text-purple-400 text-[8px] hover:text-yellow-400 self-start">← VOLTAR</Link>
      <div className="text-6xl animate-float">⚔️</div>
      <h1 className="font-pixel text-yellow-400 text-lg glow-yellow text-center">AVENTURA DO CONHECIMENTO</h1>
      <p className="font-retro text-purple-200 text-xl text-center max-w-md">
        Derrote os monstros respondendo perguntas e salve o reino! Pai e filho juntos! 🏆
      </p>

      <div className="pixel-card p-4 w-full max-w-sm">
        <div className="font-pixel text-[8px] text-purple-400 mb-3">ANO ESCOLAR DO FILHO</div>
        <div className="grid grid-cols-3 gap-2">
          {["1º ano","2º ano","3º ano","4º ano","5º ano","6º ano"].map((g) => (
            <button key={g} onClick={() => setGradeLevel(g)}
              className={`pixel-card p-2 text-center cursor-pointer hover:scale-105 transition-all ${gradeLevel===g?"border-yellow-400":""}`}
              style={gradeLevel===g?{borderColor:"#FFD700"}:{}}>
              <span className="font-pixel text-[7px] text-purple-300">{g}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="font-pixel text-[8px] text-purple-400">1️⃣ ESCOLHA A DISCIPLINA</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl">
        {SUBJECTS.map((s) => (
          <button key={s}
            onClick={() => { setSubject(s); setScreen("select-topic"); setQuestionsError(""); }}
            className="pixel-card p-5 flex flex-col items-center gap-3 cursor-pointer hover:scale-110 transition-transform"
            style={{ borderColor: SUBJECT_COLORS[s] ?? "#FFD700", boxShadow: `4px 4px 0 ${(SUBJECT_COLORS[s] ?? "#FFD700")}44` }}>
            <span className="text-5xl animate-float">{SUBJECT_ICONS[s] ?? "📚"}</span>
            <span className="font-pixel text-[8px] text-center" style={{ color: SUBJECT_COLORS[s] ?? "#FFD700" }}>
              {s.toUpperCase()}
            </span>
          </button>
        ))}
      </div>
    </div>
  );

  // ─── SELECT TOPIC ────────────────────────────────────────────────────────────
  if (screen === "select-topic") {
    const localTopics = TOPICS_BY_SUBJECT[subject!] ?? [];
    return (
      <div className="min-h-screen stars-bg flex flex-col items-center justify-center p-6 gap-6">
        <button onClick={() => setScreen("select-subject")}
          className="font-pixel text-purple-400 text-[8px] hover:text-yellow-400 self-start">← VOLTAR</button>

        <div className="text-5xl animate-float">{SUBJECT_ICONS[subject!] ?? "📚"}</div>
        <h2 className="font-pixel text-lg text-center" style={{ color: subjectColor }}>
          {subject?.toUpperCase()}
        </h2>
        <p className="font-retro text-purple-200 text-xl text-center max-w-md">
          2️⃣ Qual é o <strong className="text-yellow-400">TEMA</strong> que seu filho está estudando?
        </p>

        {/* Local topics */}
        {localTopics.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
            {localTopics.map((t) => (
              <button key={t.name}
                onClick={() => initGameLocal(subject!, t.name)}
                className="pixel-card p-4 flex items-center gap-4 cursor-pointer hover:scale-105 transition-transform text-left"
                style={{ borderColor: subjectColor, boxShadow: `3px 3px 0 ${subjectColor}33` }}>
                <span className="text-3xl">{t.icon}</span>
                <div>
                  <div className="font-pixel text-[8px] mb-1" style={{ color: subjectColor }}>
                    {t.name.toUpperCase()}
                  </div>
                  <div className="font-retro text-purple-400 text-base">Toque para batalhar!</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Custom topic input */}
        <div className="pixel-card p-4 w-full max-w-lg" style={{ borderColor: "#a78bfa" }}>
          <div className="font-pixel text-[7px] text-purple-400 mb-3">
            📝 OU DIGITAR QUALQUER TEMA
          </div>
          <div className="font-retro text-purple-300 text-base mb-3">
            Ex: &quot;Sistema Solar&quot;, &quot;Ditadura Militar&quot;, &quot;Animais da Amazônia&quot;...
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && customInput.trim() && !loadingQuestions)
                  loadAIQuestions(subject!, customInput.trim());
              }}
              placeholder="Digite o tema aqui..."
              className="flex-1 pixel-card p-3 font-retro text-purple-100 text-lg bg-transparent focus:outline-none focus:border-yellow-400 placeholder:text-purple-700"
              disabled={loadingQuestions}
            />
            <button
              onClick={() => customInput.trim() && !loadingQuestions && loadAIQuestions(subject!, customInput.trim())}
              disabled={!customInput.trim() || loadingQuestions}
              className="pixel-btn pixel-btn-primary px-4 disabled:opacity-50 disabled:cursor-not-allowed shrink-0">
              {loadingQuestions ? "⏳" : "JOGAR →"}
            </button>
          </div>
          {loadingQuestions && (
            <div className="font-retro text-purple-400 text-lg mt-3 animate-pulse">
              🧠 Gerando perguntas com IA... pode levar alguns segundos...
            </div>
          )}
          {questionsError && (
            <div className="font-retro text-red-400 text-base mt-3">{questionsError}</div>
          )}
        </div>
      </div>
    );
  }

  // ─── MAP ─────────────────────────────────────────────────────────────────────
  if (screen === "map") {
    const mapMonsters = getMonsters(subject!);
    return (
      <div className="min-h-screen stars-bg flex flex-col">
        <header className="border-b border-purple-900/50 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setScreen("select-subject")}
              className="font-pixel text-purple-400 text-[8px] hover:text-yellow-400">← SAIR</button>
            <div>
              <div className="font-pixel text-[8px]" style={{ color: subjectColor }}>{subject}</div>
              <div className="font-retro text-purple-400 text-sm">{topic} · {gradeLevel}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-1">
              {Array.from({length:6}).map((_,h)=>(
                <span key={h} className="text-base transition-all" style={{opacity:h<playerHp?1:0.2}}>❤️</span>
              ))}
            </div>
            <span className="font-pixel text-yellow-400 text-[8px]">⭐{totalXp}</span>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 max-w-2xl mx-auto w-full">
          <div className="font-pixel text-[7px] text-purple-500 text-center mb-6">
            MAPA DA AVENTURA — {topic?.toUpperCase()}
          </div>

          <div className="flex flex-col gap-3">
            {mapMonsters.map((m, idx) => {
              const cleared = clearedMonsters.includes(idx);
              const isNext = idx === nextMonsterIdx;
              const boss = idx === mapMonsters.length - 1;
              return (
                <div key={idx} className="relative">
                  {idx > 0 && (
                    <div className="flex justify-center mb-0">
                      <div className="w-1 h-6 rounded-full"
                        style={{ background: clearedMonsters.includes(idx-1) ? "#059669" : "#4c1d95" }} />
                    </div>
                  )}
                  <div className={`flex items-center gap-4 pixel-card p-4 transition-all
                    ${isNext ? "scale-105" : ""}
                    ${!cleared && !isNext ? "opacity-50" : ""}
                    ${boss ? "border-red-500" : ""}`}
                    style={{
                      borderColor: cleared ? "#059669" : isNext ? m.color : "#4c1d95",
                      boxShadow: isNext ? `0 0 20px ${m.color}44` : undefined,
                    }}>
                    <div className="font-pixel text-[8px] text-purple-500 w-4 shrink-0">{idx+1}</div>
                    <div className={`text-4xl shrink-0 ${isNext?"animate-float":""}`}
                      style={{ filter: isNext ? `drop-shadow(0 0 8px ${m.color})` : undefined }}>
                      {cleared ? "✅" : isNext ? m.emoji : "🔒"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-pixel text-[7px] mb-1"
                        style={{ color: cleared?"#059669":isNext?m.color:"#4c1d95" }}>
                        {m.name}{boss?" 👑":""}
                      </div>
                      <div className="flex gap-1 mb-1">
                        {Array.from({length:m.hp}).map((_,i)=>(
                          <div key={i} className="w-3 h-3 rounded-sm"
                            style={{ background: cleared?"#059669":isNext?m.color:"#4c1d95" }} />
                        ))}
                        <span className="font-retro text-purple-500 text-xs ml-1">{m.hp} HP</span>
                      </div>
                      {isNext && <div className="font-retro text-purple-300 text-sm">Responda certo para atacar!</div>}
                      {cleared && <div className="font-retro text-green-400 text-sm">Derrotado! +{boss?100:50} XP</div>}
                    </div>
                    {isNext && !cleared && (
                      <button onClick={() => startBattle(idx)}
                        className="pixel-btn pixel-btn-primary shrink-0 text-[8px] px-3 py-2">
                        ⚔️ LUTAR
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 text-center">
            <Link href="/aprender" className="font-retro text-purple-500 text-lg hover:text-yellow-400">
              🧠 Ir ao Modo Pai Aprende →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── BATTLE ──────────────────────────────────────────────────────────────────
  if (screen === "battle" && currentMonster && currentQ) {
    const monsterPct = Math.max(0, (monsterHp / currentMonster.hp) * 100);
    const playerPct = Math.max(0, (playerHp / 6) * 100);
    void monsterPct; void playerPct;

    return (
      <div className="min-h-screen stars-bg flex flex-col overflow-hidden"
        style={{
          background: attackFlash === "hit"
            ? "linear-gradient(135deg, rgba(220,20,60,0.2), #16082e)"
            : attackFlash === "player-hit"
            ? "linear-gradient(135deg, rgba(30,30,120,0.3), #16082e)"
            : undefined,
          transition: "background 0.3s",
        }}>

        <div className="border-b border-purple-900/50 px-4 py-2 flex items-center justify-between shrink-0">
          <button onClick={() => setScreen("map")} className="font-pixel text-purple-400 text-[8px] hover:text-yellow-400">✕ FUGIR</button>
          <div className="text-center">
            <div className="font-pixel text-[7px]" style={{ color: subjectColor }}>{topic}</div>
            {isBoss && <div className="font-pixel text-[6px] text-red-400 animate-blink">⚠️ BOSS BATTLE!</div>}
          </div>
          <span className="font-pixel text-yellow-400 text-[8px]">⭐{totalXp}</span>
        </div>

        <div className="flex-1 flex flex-col p-3 gap-3 max-w-2xl mx-auto w-full">
          {/* HP bars */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-pixel text-[6px] text-green-400">PAI HERÓI</span>
                <span className="font-pixel text-[6px] text-green-400">{playerHp}/6</span>
              </div>
              <HpBar current={playerHp} max={6} color="#059669" />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-pixel text-[6px] truncate" style={{ color: currentMonster.color }}>
                  {currentMonster.name.split(":")[0]}
                </span>
                <span className="font-pixel text-[6px]" style={{ color: currentMonster.color }}>
                  {monsterHp}/{currentMonster.hp}
                </span>
              </div>
              <HpBar current={monsterHp} max={currentMonster.hp} color={currentMonster.color} />
            </div>
          </div>

          {/* Arena */}
          <div className="relative flex items-end justify-between px-4 py-4 overflow-hidden flex-shrink-0"
            style={{
              background: "linear-gradient(180deg, #0a0318 0%, #0f0720 50%, #1a0a2e 100%)",
              border: `3px solid ${isBoss ? "#dc2626" : "#4c1d95"}`,
              boxShadow: isBoss ? "0 0 30px rgba(220,20,60,0.3)" : undefined,
              minHeight: 160,
            }}>
            <div className="absolute bottom-0 left-0 right-0 h-4"
              style={{ background: "repeating-linear-gradient(90deg,#4c1d95 0,#4c1d95 8px,#2e1065 8px,#2e1065 16px)" }} />
            {[...Array(8)].map((_, i) => (
              <div key={i} className="absolute w-1 h-1 bg-white rounded-full animate-blink"
                style={{ left:`${10+i*12}%`, top:`${10+((i*17)%40)}%`, animationDelay:`${i*0.3}s`, opacity:0.4 }} />
            ))}

            <div className={`flex flex-col items-center gap-1 z-10 transition-transform duration-200 ${attackFlash==="hit"?"translate-x-6":""}`}>
              <div className={`text-5xl ${shakePlayer?"animate-shake":""}`}>👨‍🏫</div>
              <div className="font-pixel text-[5px] text-green-400">PAI HERÓI</div>
              <div className="flex gap-0.5">
                {Array.from({length:6}).map((_,i)=>(
                  <div key={i} className="w-1.5 h-1.5 rounded-sm" style={{background:i<playerHp?"#059669":"#1a0a2e"}} />
                ))}
              </div>
            </div>

            {showEffect && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl animate-pop-in z-20 pointer-events-none">
                {showEffect}
              </div>
            )}

            <div className="font-pixel text-[10px] text-red-400 animate-blink z-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">VS</div>

            <div className={`flex flex-col items-center gap-1 z-10 transition-all duration-500
              ${monsterEnter ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}
              ${attackFlash==="player-hit"?"-translate-x-6":""}`}>
              <div className={`${shakeMonster?"animate-shake":""} ${monsterHp<=0?"opacity-0 scale-0":"opacity-100 scale-100"} transition-all duration-300`}>
                <div style={{ fontSize:"clamp(48px,8vw,72px)", filter:`drop-shadow(0 0 12px ${currentMonster.color})` }}>
                  {currentMonster.emoji}
                </div>
              </div>
              <div className="font-pixel text-[5px] text-center" style={{ color: currentMonster.color }}>
                {currentMonster.name.replace("BOSS: ","")}
              </div>
              <div className="flex gap-0.5">
                {Array.from({length:currentMonster.hp}).map((_,i)=>(
                  <div key={i} className="w-1.5 h-1.5 rounded-sm transition-all"
                    style={{background:i<monsterHp?currentMonster.color:"#1a0a2e"}} />
                ))}
              </div>
            </div>
          </div>

          {/* Question */}
          {phase === "question" && (
            <div className="pixel-card p-4 animate-pop-in flex-1" style={{ borderColor: currentMonster.color }}>
              <div className="font-pixel text-[7px] mb-2" style={{ color: currentMonster.color }}>
                ❓ RESPONDA PARA ATACAR!
              </div>
              <div className="font-retro text-white text-xl leading-snug mb-4">{currentQ.question}</div>
              <div className="grid grid-cols-2 gap-2">
                {currentQ.options.map((opt, idx) => (
                  <button key={idx} onClick={() => handleAnswer(idx)}
                    className="pixel-card p-3 text-left hover:scale-105 transition-all cursor-pointer"
                    style={{ borderColor:"#4c1d95" }}>
                    <span className="font-pixel text-[6px] text-purple-400 mr-2">{["A","B","C","D"][idx]}</span>
                    <span className="font-retro text-purple-100 text-lg">{opt}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Result */}
          {phase === "result" && (
            <div className={`pixel-card p-4 animate-pop-in flex-1 ${lastCorrect?"pixel-border-green":"pixel-border-yellow"}`}>
              <div className="font-pixel text-[8px] mb-2" style={{ color: lastCorrect?"#10b981":"#FFD700" }}>
                {lastCorrect
                  ? `⚔️ ATAQUE CERTEIRO! ${currentMonster.name} perdeu 1 HP!`
                  : `${currentMonster.attackEmoji} O monstro atacou! Você perdeu 1 HP!`}
              </div>
              <div className="grid grid-cols-2 gap-1 mb-3">
                {currentQ.options.map((opt, idx) => (
                  <div key={idx} className="p-2 pixel-card font-retro text-sm"
                    style={{
                      borderColor: idx===currentQ.correct?"#059669":idx===selectedAnswer&&idx!==currentQ.correct?"#DC143C":"#4c1d95",
                      background: idx===currentQ.correct?"#0a2e1e":idx===selectedAnswer&&idx!==currentQ.correct?"#2d0a0a":undefined,
                    }}>
                    <span className="font-pixel text-[6px] text-purple-400 mr-1">{["A","B","C","D"][idx]}</span>
                    {opt}{idx===currentQ.correct?" ✅":""}{idx===selectedAnswer&&idx!==currentQ.correct?" ❌":""}
                  </div>
                ))}
              </div>
              <div className="font-retro text-purple-200 text-lg mb-3 leading-snug">{currentQ.explanation}</div>
              <button onClick={nextQuestion}
                className={`pixel-btn w-full py-3 ${lastCorrect?"pixel-btn-green":"pixel-btn-primary"}`}>
                {monsterHp<=1&&lastCorrect ? "🏆 DERROTA O MONSTRO!" : playerHp<=1&&!lastCorrect ? "💀 PERIGO!" : "PRÓXIMA PERGUNTA →"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── VICTORY ─────────────────────────────────────────────────────────────────
  if (screen === "victory") return (
    <div className="min-h-screen stars-bg flex flex-col items-center justify-center p-6 text-center gap-6">
      <div className="text-8xl animate-pop-in">🏆</div>
      <div className="font-pixel text-yellow-400 text-sm glow-yellow">MONSTRO DERROTADO!</div>
      <div className="font-retro text-purple-200 text-2xl max-w-sm">
        Você e seu filho dominaram mais uma fase de <strong className="text-yellow-400">{topic}</strong>!
      </div>
      <div className="font-pixel text-green-400 text-xs">+50 XP</div>
      <button onClick={() => { playSound("levelup"); setScreen("map"); }} className="pixel-btn pixel-btn-primary text-sm px-6 py-4">
        🗺️ PRÓXIMA BATALHA
      </button>
    </div>
  );

  // ─── WORLD CLEAR ─────────────────────────────────────────────────────────────
  if (screen === "worldclear") return (
    <div className="min-h-screen stars-bg flex flex-col items-center justify-center p-6 text-center gap-6">
      <div className="text-8xl animate-float">👑</div>
      <div className="font-pixel text-yellow-400 text-xl glow-yellow">MUNDO COMPLETO!</div>
      <div className="font-retro text-purple-200 text-2xl max-w-md">
        INCRÍVEL! Você e seu filho derrotaram TODOS os monstros de <strong className="text-yellow-400">{topic}</strong>!
      </div>
      <div className="pixel-card p-4 max-w-sm">
        <div className="font-pixel text-[8px] text-yellow-400 mb-2">RESULTADOS</div>
        <div className="font-retro text-purple-200 text-xl">⭐ XP Total: {totalXp + 100}</div>
        <div className="font-retro text-green-400 text-xl">❤️ HP Final: {playerHp}/6</div>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={() => setScreen("select-subject")} className="pixel-btn pixel-btn-yellow text-sm px-6 py-4">
          🗺️ NOVO TEMA
        </button>
        <Link href="/aprender" className="pixel-btn pixel-btn-green text-sm px-6 py-4 inline-block">
          🧠 MODO PAI APRENDE
        </Link>
      </div>
    </div>
  );

  // ─── GAME OVER ────────────────────────────────────────────────────────────────
  if (screen === "gameover") return (
    <div className="min-h-screen stars-bg flex flex-col items-center justify-center p-6 text-center gap-6">
      <div className="text-7xl animate-shake">💀</div>
      <div className="font-pixel text-red-400 text-sm animate-blink">GAME OVER!</div>
      <div className="font-retro text-purple-200 text-2xl max-w-sm">
        Não desanime! Revise <strong className="text-yellow-400">{topic}</strong> no Modo Pai Aprende e volte mais forte!
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={() => initGameLocal(subject!, topic!)} className="pixel-btn pixel-btn-primary text-sm px-6 py-4">
          🔄 TENTAR DE NOVO
        </button>
        <Link href="/aprender" className="pixel-btn pixel-btn-yellow text-sm px-6 py-4 inline-block">
          🧠 ESTUDAR PRIMEIRO
        </Link>
      </div>
    </div>
  );

  return null;
}
