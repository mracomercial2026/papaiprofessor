"use client";

import { useState, useEffect, useCallback, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

import {
  getMonsters,
  TOPICS_BY_SUBJECT,
  type Question,
  type Monster,
} from "../data/questions";
import { getQuestionsFromBank } from "../data/questionLoader";

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

  // ── Map 2D animation ────────────────────────────────────────────────────────
  const [walkFrame, setWalkFrame] = useState(0);
  const walkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (screen !== "map") return;
    walkIntervalRef.current = setInterval(() => setWalkFrame(f => (f + 1) % 2), 350);
    return () => { if (walkIntervalRef.current) clearInterval(walkIntervalRef.current); };
  }, [screen]);

  // Imersão extra
  const [combo, setCombo] = useState(0);
  const [feedbackOverlay, setFeedbackOverlay] = useState<null | "correct" | "wrong">(null);

  const shakePlayerT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeMonsterT = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Cleanup all pending timers on unmount
  useEffect(() => {
    return () => {
      if (shakePlayerT.current) clearTimeout(shakePlayerT.current);
      if (shakeMonsterT.current) clearTimeout(shakeMonsterT.current);
      feedbackTimers.current.forEach((t) => clearTimeout(t));
    };
  }, []);

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
    const qs = getQuestionsFromBank(subj, top, 100) ?? [];
    const ms = getMonsters(subj);
    setSubject(subj);
    setTopic(top);
    setMonsters(ms);
    setAllQuestions(qs);
    setClearedMonsters([]);
    setPlayerHp(6);
    setTotalXp(0);
    setCombo(0);
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
      if (shakePlayerT.current) clearTimeout(shakePlayerT.current);
      shakePlayerT.current = setTimeout(() => setShakePlayer(false), 600);
    } else {
      setShakeMonster(true);
      if (shakeMonsterT.current) clearTimeout(shakeMonsterT.current);
      shakeMonsterT.current = setTimeout(() => setShakeMonster(false), 600);
    }
  }, []);

  const handleAnswer = useCallback(
    (idx: number) => {
      if (selectedAnswer !== null || !currentQ || feedbackOverlay) return;
      setSelectedAnswer(idx);
      const correct = idx === currentQ.correct;
      setLastCorrect(correct);

      // Cancel any pending feedback timers before starting new ones
      feedbackTimers.current.forEach((t) => clearTimeout(t));
      feedbackTimers.current = [];

      if (correct) {
        setCombo((c) => c + 1);
        playSound("correct");
        setFeedbackOverlay("correct");
        const t1 = setTimeout(() => {
          setFeedbackOverlay(null);
          setPhase("result");
          setAttackFlash("hit");
          setShowEffect("⚔️");
          const t2 = setTimeout(() => {
            setAttackFlash(null);
            setShowEffect(null);
            triggerShake("monster");
            setMonsterHp((p) => p - 1);
          }, 400);
          feedbackTimers.current.push(t2);
        }, 1100);
        feedbackTimers.current.push(t1);
      } else {
        setCombo(0);
        playSound("wrong");
        setFeedbackOverlay("wrong");
        const t1 = setTimeout(() => {
          setFeedbackOverlay(null);
          setPhase("result");
          setAttackFlash("player-hit");
          setShowEffect("💥");
          const t2 = setTimeout(() => {
            setAttackFlash(null);
            setShowEffect(null);
            triggerShake("player");
            setPlayerHp((p) => Math.max(0, p - 1));
          }, 400);
          feedbackTimers.current.push(t2);
        }, 1100);
        feedbackTimers.current.push(t1);
      }
    },
    [selectedAnswer, currentQ, feedbackOverlay, triggerShake, playSound]
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
        setCombo(0);
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
      <Link href="/" className="font-pixel text-purple-400 text-[11px] hover:text-yellow-400 self-start">← VOLTAR</Link>
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
              <span className="font-pixel text-[10px] text-purple-300">{g}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="font-pixel text-[11px] text-purple-400">1️⃣ ESCOLHA A DISCIPLINA</div>
      <div className="grid grid-cols-3 gap-3 w-full max-w-lg">
        {SUBJECTS.map((s) => (
          <button key={s}
            onClick={() => { setSubject(s); setScreen("select-topic"); setQuestionsError(""); }}
            className="pixel-card p-3 flex flex-col items-center gap-2 cursor-pointer active:scale-95 hover:scale-105 transition-transform"
            style={{ borderColor: SUBJECT_COLORS[s] ?? "#FFD700", boxShadow: `3px 3px 0 ${(SUBJECT_COLORS[s] ?? "#FFD700")}44` }}>
            <span className="text-3xl animate-float">{SUBJECT_ICONS[s] ?? "📚"}</span>
            <span className="font-pixel text-center leading-tight" style={{ fontSize: 10, color: SUBJECT_COLORS[s] ?? "#FFD700" }}>
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

  // ─── MAP 2D ──────────────────────────────────────────────────────────────────
  if (screen === "map") {
    const mapMonsters = getMonsters(subject!);
    const N = mapMonsters.length;

    // World coordinates
    const WORLD_W    = 1900;
    const WORLD_H    = 230;
    const GROUND_H   = 52;
    const SEGMENT_W  = Math.floor((WORLD_W - 200) / N); // ~425px each for 4 monsters

    // Monster x positions (center of each segment)
    const MONSTER_X = mapMonsters.map((_, i) => 180 + i * SEGMENT_W + SEGMENT_W * 0.65);

    // Hero x: starts at 60, moves past each defeated monster
    const heroX = clearedMonsters.length === 0
      ? 60
      : clearedMonsters.length >= N
      ? MONSTER_X[N - 1] + 200
      : MONSTER_X[clearedMonsters.length - 1] + 110;

    // Camera offset: keep hero near left quarter of viewport
    const CAM_HERO_PX = 140; // hero appears this far from left edge
    const cameraX     = Math.max(0, heroX - CAM_HERO_PX);

    // Decorative positions
    const clouds = [
      { x: 120, y: 18, s: 1.4 }, { x: 420, y: 32, s: 1.0 },
      { x: 700, y: 12, s: 1.6 }, { x: 1000, y: 28, s: 0.9 },
      { x: 1300, y: 16, s: 1.3 }, { x: 1600, y: 36, s: 1.1 },
    ];
    const qBlocks = [
      { x: 200, y: 100 }, { x: 220, y: 100 }, { x: 490, y: 82 },
      { x: 750, y: 95 }, { x: 770, y: 95 }, { x: 1020, y: 86 },
      { x: 1300, y: 90 }, { x: 1320, y: 90 },
    ];
    const pipes = [
      { x: 340, h: 64 }, { x: 620, h: 48 }, { x: 900, h: 72 }, { x: 1180, h: 56 },
    ];
    const coins  = [{ x: 205, y: 68 }, { x: 755, y: 62 }, { x: 1305, y: 66 }];

    const nextIdx = nextMonsterIdx;

    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#1a1035", fontFamily: "system-ui,sans-serif" }}>

        {/* ── Estilos da cena ── */}
        <style>{`
          @keyframes heroWalk { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
          @keyframes monsterFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
          @keyframes coinSpin { 0% { transform: scaleX(1); } 50% { transform: scaleX(0.2); } 100% { transform: scaleX(1); } }
          @keyframes qPulse { 0%,100% { background: #e8a000; } 50% { background: #ffd700; } }
          @keyframes cloudDrift { 0% { transform: translateX(0); } 100% { transform: translateX(12px); } }
          @keyframes pathDot { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
          @keyframes bossGlow { 0%,100% { filter: drop-shadow(0 0 12px #dc2626); } 50% { filter: drop-shadow(0 0 28px #ff6060); } }
          @keyframes worldEnter { from { opacity:0; transform: scale(0.97); } to { opacity:1; transform: scale(1); } }
          .map-world { animation: worldEnter 0.4s ease-out; }
          .hero-walk { animation: heroWalk 0.35s ease-in-out infinite; }
          .monster-float { animation: monsterFloat 2.2s ease-in-out infinite; }
          .coin-spin { animation: coinSpin 1.2s ease-in-out infinite; }
          .q-pulse { animation: qPulse 1.8s ease-in-out infinite; }
          .cloud-drift { animation: cloudDrift 4s ease-in-out infinite alternate; }
          .boss-glow { animation: bossGlow 1.5s ease-in-out infinite; }
        `}</style>

        {/* ── HUD ── */}
        <header style={{
          background: "repeating-linear-gradient(90deg,#c84a00 0,#c84a00 32px,#8b3200 32px,#8b3200 64px)",
          borderBottom: "4px solid #5a1e00",
          padding: "0 16px", height: 52,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0, position: "relative", zIndex: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setScreen("select-subject")}
              style={{ fontFamily: "'Press Start 2P',cursive", fontSize: 10, color: "#fff8dc",
                background: "rgba(0,0,0,0.3)", border: "2px solid rgba(255,255,255,0.2)",
                borderRadius: 3, padding: "5px 10px", cursor: "pointer" }}
            >← SAIR</button>
            <div>
              <div style={{ fontFamily: "'Press Start 2P',cursive", fontSize: 10, color: subjectColor }}>{subject}</div>
              <div style={{ fontFamily: "system-ui,sans-serif", fontSize: 12, color: "#a78bfa", marginTop: 1 }}>{topic}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", gap: 3 }}>
              {Array.from({ length: 6 }).map((_, h) => (
                <span key={h} style={{ fontSize: 14, opacity: h < playerHp ? 1 : 0.2, transition: "opacity 0.3s" }}>❤️</span>
              ))}
            </div>
            <div style={{ fontFamily: "'Press Start 2P',cursive", fontSize: 11, color: "#ffd700",
              background: "rgba(0,0,0,0.3)", border: "2px solid rgba(255,215,0,0.3)",
              borderRadius: 3, padding: "5px 12px" }}>
              ⭐ {totalXp}
            </div>
          </div>
        </header>

        {/* ── Viewport 2D ── */}
        <div style={{ overflow: "hidden", height: WORLD_H, flexShrink: 0, position: "relative", background: "#87ceeb" }}>

          {/* World inner (scrolls with camera) */}
          <div
            className="map-world"
            style={{
              position: "relative",
              width: WORLD_W,
              height: WORLD_H,
              transform: `translateX(-${cameraX}px)`,
              transition: "transform 0.7s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            {/* Sky gradient */}
            <div style={{
              position: "absolute", inset: 0,
              background: "linear-gradient(180deg,#4ec3e0 0%,#87ceeb 55%,#b0e8f8 100%)",
            }} />

            {/* Clouds */}
            {clouds.map((c, i) => (
              <div key={i} className="cloud-drift"
                style={{ position: "absolute", left: c.x, top: c.y, fontSize: 28 * c.s,
                  animationDelay: `${i * 0.7}s`, animationDuration: `${3 + i * 0.5}s` }}>
                ☁️
              </div>
            ))}

            {/* Question blocks */}
            {qBlocks.map((b, i) => (
              <div key={i} className="q-pulse"
                style={{ position: "absolute", left: b.x, top: b.y,
                  width: 24, height: 24, borderRadius: 3,
                  background: "#e8a000", border: "3px solid #8b5e00",
                  boxShadow: "2px 2px 0 #5a3a00",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Press Start 2P',cursive", fontSize: 8, color: "#fff",
                  animationDelay: `${i * 0.2}s` }}>
                ?
              </div>
            ))}

            {/* Coins */}
            {coins.map((c, i) => (
              <div key={i} className="coin-spin"
                style={{ position: "absolute", left: c.x, top: c.y,
                  fontSize: 14, animationDelay: `${i * 0.4}s` }}>
                🪙
              </div>
            ))}

            {/* Pipes */}
            {pipes.map((p, i) => (
              <div key={i} style={{ position: "absolute", left: p.x, bottom: GROUND_H - 4 }}>
                {/* Pipe cap */}
                <div style={{ width: 36, height: 12, background: "#2d8a00",
                  border: "3px solid #1a5c00", borderRadius: "3px 3px 0 0",
                  marginLeft: -4, boxShadow: "inset 0 2px 0 #4aaa00" }} />
                {/* Pipe body */}
                <div style={{ width: 28, height: p.h, background: "#1a6600",
                  border: "3px solid #0f4000", borderLeft: "3px solid #0f4000",
                  margin: "0 auto", boxShadow: "inset 2px 0 0 #2d8a00" }} />
              </div>
            ))}

            {/* Path dots on ground */}
            {nextIdx !== null && Array.from({ length: 12 }).map((_, i) => {
              const startX = heroX + 30;
              const endX   = MONSTER_X[nextIdx] - 50;
              const dotX   = startX + ((endX - startX) / 12) * i;
              if (dotX <= startX || dotX >= endX) return null;
              return (
                <div key={i} className="pathDot"
                  style={{ position: "absolute", left: dotX, bottom: GROUND_H + 6,
                    width: 6, height: 6, borderRadius: "50%", background: "#ffd700",
                    opacity: 0.5, animationDelay: `${i * 0.12}s`,
                    animation: "pathDot 1s ease-in-out infinite" }} />
              );
            })}

            {/* Monsters */}
            {mapMonsters.map((m, idx) => {
              const cleared = clearedMonsters.includes(idx);
              const isNext  = idx === nextIdx;
              const isBoss  = idx === N - 1;
              const locked  = !cleared && !isNext;
              const mx      = MONSTER_X[idx];

              return (
                <div key={idx} style={{ position: "absolute", left: mx, bottom: GROUND_H,
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  {/* Monster emoji */}
                  <div
                    className={isNext ? (isBoss ? "boss-glow" : "monster-float") : ""}
                    style={{
                      fontSize: isBoss ? "clamp(40px,8vw,64px)" : "clamp(32px,7vw,52px)",
                      opacity: locked ? 0.35 : 1,
                      filter: cleared ? "grayscale(1) opacity(0.4)" : undefined,
                      transform: cleared ? "scaleY(-1)" : undefined,
                      transition: "all 0.4s",
                    }}
                  >
                    {cleared ? m.emoji : locked ? "🔒" : m.emoji}
                  </div>

                  {/* Monster name */}
                  <div style={{
                    fontFamily: "'Press Start 2P',cursive", fontSize: 9,
                    color: cleared ? "#059669" : locked ? "#4c1d95" : m.color,
                    textAlign: "center", maxWidth: 80, lineHeight: 1.4,
                    textShadow: isNext ? `0 0 8px ${m.color}` : undefined,
                  }}>
                    {cleared ? "✓ VENCIDO" : locked ? "???" : m.name.replace("BOSS: ", "")}
                    {isBoss && !cleared && !locked && " 👑"}
                  </div>

                  {/* HP pip indicators */}
                  {!cleared && !locked && (
                    <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
                      {Array.from({ length: m.hp }).map((_, i) => (
                        <div key={i} style={{
                          width: 8, height: 8, borderRadius: 2,
                          background: i < (idx === currentMonsterIdx ? monsterHp : m.hp) ? m.color : "#1a0a2e",
                          boxShadow: i < m.hp ? `0 0 3px ${m.color}` : undefined,
                        }} />
                      ))}
                    </div>
                  )}

                  {/* Ataque button above monster */}
                  {isNext && (
                    <button
                      onClick={() => { playSound("levelup"); startBattle(idx); }}
                      style={{
                        fontFamily: "'Press Start 2P',cursive", fontSize: 9,
                        marginTop: 6, padding: "6px 10px",
                        background: isBoss
                          ? "linear-gradient(135deg,#dc2626,#991b1b)"
                          : "linear-gradient(135deg,#e8a000,#c67c00)",
                        border: `3px solid ${isBoss ? "#fca5a5" : "#ffd700"}`,
                        borderRadius: 4, color: "#fff", cursor: "pointer",
                        boxShadow: `3px 3px 0 ${isBoss ? "#7a0000" : "#7a5000"}`,
                        animation: "qPulse 1.5s ease-in-out infinite",
                        whiteSpace: "nowrap",
                      }}
                    >
                      ⚔️ LUTAR
                    </button>
                  )}
                </div>
              );
            })}

            {/* Hero character */}
            <div style={{ position: "absolute", left: heroX, bottom: GROUND_H,
              display: "flex", flexDirection: "column", alignItems: "center",
              transition: "left 0.7s cubic-bezier(0.4,0,0.2,1)", zIndex: 5 }}>
              <div className="hero-walk"
                style={{ fontSize: "clamp(36px,8vw,52px)",
                  filter: "drop-shadow(0 4px 8px rgba(5,150,105,0.7))" }}>
                👨‍🏫
              </div>
              <div style={{ fontFamily: "'Press Start 2P',cursive", fontSize: 8,
                color: "#10b981", textShadow: "0 0 6px #059669" }}>
                PAI HERÓI
              </div>
            </div>

            {/* Ground */}
            <div style={{
              position: "absolute", bottom: 0, left: 0, width: WORLD_W, height: GROUND_H,
              background: "repeating-linear-gradient(90deg,#8b4513 0,#8b4513 31px,#6b3410 31px,#6b3410 32px)",
              borderTop: "4px solid #c97a3a",
            }}>
              {/* Ground top highlight row */}
              <div style={{ height: 6, background: "repeating-linear-gradient(90deg,#a05820 0,#a05820 31px,#8b4513 31px,#8b4513 32px)" }} />
            </div>

            {/* World end flag */}
            <div style={{ position: "absolute", right: 60, bottom: GROUND_H }}>
              <div style={{ width: 4, height: 80, background: "#888", margin: "0 auto" }} />
              <div style={{ width: 32, height: 20, background: "#e84040",
                position: "absolute", top: 0, left: 4,
                clipPath: "polygon(0 0, 100% 50%, 0 100%)" }} />
            </div>
          </div>
        </div>

        {/* ── Info panel abaixo do mundo ── */}
        <div style={{ background: "rgba(0,0,0,0.6)", borderTop: "3px solid #4c1d95",
          padding: "12px 16px", flexShrink: 0 }}>

          {nextIdx !== null ? (
            <div style={{ maxWidth: 640, margin: "0 auto", display: "flex",
              flexDirection: "column", gap: 10 }}>
              {/* Monster info */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 28 }}>{mapMonsters[nextIdx].emoji}</div>
                <div>
                  <div style={{ fontFamily: "'Press Start 2P',cursive", fontSize: 10,
                    color: mapMonsters[nextIdx].color, marginBottom: 3 }}>
                    {nextIdx === N - 1 ? "👑 CHEFE FINAL!" : "⚔️ PRÓXIMO INIMIGO"}
                  </div>
                  <div style={{ fontFamily: "system-ui,sans-serif", fontSize: 14,
                    color: "#e2e8f0", fontWeight: 700 }}>
                    {mapMonsters[nextIdx].name.replace("BOSS: ", "")}
                  </div>
                  <div style={{ fontFamily: "system-ui,sans-serif", fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                    Responda certo para atacar · {mapMonsters[nextIdx].hp} HP
                  </div>
                </div>
              </div>

              {/* Big fight button — full width */}
              <button
                onClick={() => { playSound("levelup"); startBattle(nextIdx); }}
                style={{
                  fontFamily: "'Press Start 2P',cursive", fontSize: 10,
                  padding: "16px", width: "100%",
                  background: nextIdx === N - 1
                    ? "linear-gradient(135deg,#dc2626,#991b1b)"
                    : "linear-gradient(135deg,#7c3aed,#4f46e5)",
                  border: `3px solid ${nextIdx === N - 1 ? "#fca5a5" : "#a78bfa"}`,
                  borderRadius: 8, color: "#fff", cursor: "pointer",
                  boxShadow: `4px 4px 0 ${nextIdx === N - 1 ? "#7a0000" : "#2d1a6e"}`,
                  letterSpacing: 1,
                }}
                onMouseDown={e  => (e.currentTarget.style.transform = "translate(2px,2px)")}
                onMouseUp={e    => (e.currentTarget.style.transform = "")}
                onTouchStart={e => (e.currentTarget.style.transform = "translate(2px,2px)")}
                onTouchEnd={e   => (e.currentTarget.style.transform = "")}
              >
                ⚔️ BATALHAR!
              </button>
            </div>
          ) : (
            <div style={{ textAlign: "center", color: "#10b981",
              fontFamily: "'Press Start 2P',cursive", fontSize: 11 }}>
              🏆 TODOS OS MONSTROS DERROTADOS!
            </div>
          )}
        </div>

        {/* ── Progress da trilha ── */}
        <div style={{ background: "rgba(0,0,0,0.4)", borderTop: "1px solid rgba(124,58,237,0.2)",
          padding: "10px 20px", flexShrink: 0 }}>
          <div style={{ maxWidth: 640, margin: "0 auto", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ fontFamily: "'Press Start 2P',cursive", fontSize: 9, color: "#6d28d9", minWidth: 60 }}>
              PROGRESSO
            </div>
            <div style={{ flex: 1, height: 10, background: "rgba(255,255,255,0.06)",
              border: "2px solid #4c1d95", borderRadius: 100, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 100,
                background: "linear-gradient(90deg,#7c3aed,#a78bfa)",
                width: `${(clearedMonsters.length / N) * 100}%`,
                transition: "width 0.6s ease", boxShadow: "0 0 8px rgba(167,139,250,0.5)",
              }} />
            </div>
            <div style={{ fontFamily: "'Press Start 2P',cursive", fontSize: 9, color: "#a78bfa", minWidth: 50 }}>
              {clearedMonsters.length}/{N}
            </div>
          </div>
        </div>

        {/* ── Quick links ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
          padding: "12px 20px", gap: 20, flexWrap: "wrap", flexShrink: 0 }}>
          <Link href="/aprender"
            style={{ fontFamily: "system-ui,sans-serif", fontSize: 14, color: "#94a3b8",
              textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
            🧠 Modo Pai Aprende →
          </Link>
          <button onClick={() => setScreen("select-subject")}
            style={{ fontFamily: "system-ui,sans-serif", fontSize: 14, color: "#64748b",
              background: "none", border: "none", cursor: "pointer" }}>
            🗺️ Trocar matéria
          </button>
        </div>
      </div>
    );
  }

  // ─── BATTLE ──────────────────────────────────────────────────────────────────
  if (screen === "battle" && currentMonster && currentQ) {
    const arenaColors: Record<string, string> = {
      "Matemática":  "linear-gradient(180deg,#0a0a2e 0%,#0f0f3a 60%,#1a1060 100%)",
      "Português":   "linear-gradient(180deg,#1a0a0a 0%,#2a0a1a 60%,#3a0f2e 100%)",
      "Ciências":    "linear-gradient(180deg,#001a0a 0%,#002a14 60%,#003320 100%)",
      "História":    "linear-gradient(180deg,#1a0a00 0%,#2a1400 60%,#3a1f00 100%)",
      "Geografia":   "linear-gradient(180deg,#001a1a 0%,#002020 60%,#003030 100%)",
    };
    const arenaBg = arenaColors[subject ?? ""] ?? "linear-gradient(180deg,#0a0318 0%,#0f0720 60%,#1a0a2e 100%)";

    return (
      <div
        className="min-h-screen flex flex-col overflow-hidden"
        style={{
          background: arenaBg,
          transition: "background 0.4s",
        }}
      >
        {/* ── Overlay de feedback (tela cheia) ─────────────────────────────── */}
        {feedbackOverlay && (
          <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none"
            style={{
              background: feedbackOverlay === "correct"
                ? "rgba(5,150,105,0.88)"
                : "rgba(185,28,28,0.88)",
              animation: "pop-in 0.15s ease-out",
            }}
          >
            <div style={{ fontSize: "clamp(64px,15vw,120px)", lineHeight: 1 }}>
              {feedbackOverlay === "correct" ? "⚔️" : "💥"}
            </div>
            <div
              className="font-pixel glow-yellow mt-4"
              style={{ fontSize: "clamp(18px,5vw,40px)", color: "#fff", letterSpacing: 2 }}
            >
              {feedbackOverlay === "correct" ? "CORRETO!" : "ERRADO!"}
            </div>
            {feedbackOverlay === "correct" && combo > 1 && (
              <div className="font-pixel text-yellow-400 mt-3" style={{ fontSize: "clamp(10px,3vw,20px)" }}>
                🔥 COMBO x{combo}!
              </div>
            )}
          </div>
        )}

        {/* ── HUD topo ──────────────────────────────────────────────────────── */}
        <div
          className="shrink-0 px-4 py-3 flex items-center justify-between gap-2"
          style={{ background: "rgba(0,0,0,0.5)", borderBottom: `2px solid ${isBoss ? "#dc2626" : "#4c1d95"}` }}
        >
          <button onClick={() => setScreen("map")} className="font-pixel text-purple-500 text-[7px] hover:text-red-400 transition-colors">
            ✕ FUGIR
          </button>
          <div className="text-center flex-1">
            <div className="font-pixel text-[7px]" style={{ color: subjectColor }}>{topic?.toUpperCase()}</div>
            {isBoss && (
              <div className="font-pixel text-[6px] text-red-400 animate-blink">⚠️ CHEFE FINAL!</div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {combo > 1 && (
              <span className="font-pixel text-orange-400 text-[7px] animate-blink">🔥x{combo}</span>
            )}
            <span className="font-pixel text-yellow-400 text-[8px]">⭐ {totalXp}</span>
          </div>
        </div>

        {/* ── Arena ─────────────────────────────────────────────────────────── */}
        <div
          className="relative flex items-end justify-between overflow-hidden shrink-0"
          style={{
            minHeight: "clamp(160px,35vh,260px)",
            borderBottom: `3px solid ${isBoss ? "#dc2626" : "#4c1d95"}`,
            boxShadow: isBoss
              ? `0 0 60px rgba(220,38,38,0.5), inset 0 -20px 60px rgba(220,38,38,0.15)`
              : `inset 0 -20px 60px rgba(124,58,237,0.1)`,
            padding: "0 5% 20px",
          }}
        >
          {/* Estrelas de fundo */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white animate-blink"
              style={{
                width: (i % 3) + 1,
                height: (i % 3) + 1,
                left: `${(i * 137) % 90 + 5}%`,
                top: `${(i * 73) % 60 + 5}%`,
                opacity: 0.3 + (i % 4) * 0.1,
                animationDelay: `${i * 0.4}s`,
              }}
            />
          ))}

          {/* Chão pixelado */}
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: 16,
              background: `repeating-linear-gradient(90deg, ${subjectColor}66 0, ${subjectColor}66 8px, ${subjectColor}33 8px, ${subjectColor}33 16px)`,
            }}
          />

          {/* Jogador */}
          <div
            className={`flex flex-col items-center gap-1 z-10 transition-transform duration-200 ${attackFlash === "hit" ? "translate-x-8" : ""}`}
          >
            <div style={{ position: "relative" }}>
              <div
                className={`${shakePlayer ? "animate-shake" : ""}`}
                style={{ fontSize: "clamp(48px,10vw,72px)", filter: `drop-shadow(0 4px 8px rgba(5,150,105,0.6))` }}
              >
                👨‍🏫
              </div>
              {attackFlash === "player-hit" && (
                <div className="absolute -top-2 -right-2 text-2xl animate-pop-in">💢</div>
              )}
            </div>
            <div className="font-pixel text-[5px] text-green-400">PAI HERÓI</div>
            <div className="flex gap-0.5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-sm transition-all duration-300"
                  style={{ background: i < playerHp ? "#059669" : "#1a0a2e", boxShadow: i < playerHp ? "0 0 4px #059669" : "none" }}
                />
              ))}
            </div>
          </div>

          {/* VS central */}
          <div className="font-pixel text-[11px] text-red-500 animate-blink z-10" style={{ textShadow: "0 0 12px rgba(220,38,38,0.8)" }}>VS</div>

          {/* Monstro */}
          <div
            className={`flex flex-col items-center gap-1 z-10 transition-all duration-500
              ${monsterEnter ? "translate-x-full opacity-0" : "translate-x-0 opacity-100"}
              ${attackFlash === "player-hit" ? "-translate-x-8" : ""}`}
          >
            <div
              className={`${shakeMonster ? "animate-shake" : ""} ${monsterHp <= 0 ? "opacity-0 scale-0" : "opacity-100 scale-100"} transition-all duration-300`}
              style={{
                fontSize: isBoss ? "clamp(64px,13vw,100px)" : "clamp(48px,10vw,80px)",
                filter: `drop-shadow(0 0 20px ${currentMonster.color}) drop-shadow(0 4px 8px rgba(0,0,0,0.5))`,
                animation: feedbackOverlay ? "none" : "float 2.5s ease-in-out infinite",
              }}
            >
              {currentMonster.emoji}
            </div>
            <div className="font-pixel text-[5px] text-center" style={{ color: currentMonster.color }}>
              {currentMonster.name.replace("BOSS: ", "")}
            </div>
            <div className="flex gap-0.5">
              {Array.from({ length: currentMonster.hp }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-sm transition-all duration-500"
                  style={{
                    background: i < monsterHp ? currentMonster.color : "#1a0a2e",
                    boxShadow: i < monsterHp ? `0 0 4px ${currentMonster.color}` : "none",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Efeito de ataque central */}
          {showEffect && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-6xl animate-pop-in z-20 pointer-events-none">
              {showEffect}
            </div>
          )}
        </div>

        {/* ── HP bars ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3 px-4 py-2 shrink-0" style={{ background: "rgba(0,0,0,0.4)" }}>
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
                {currentMonster.name.replace("BOSS: ", "")}
              </span>
              <span className="font-pixel text-[6px]" style={{ color: currentMonster.color }}>{monsterHp}/{currentMonster.hp}</span>
            </div>
            <HpBar current={monsterHp} max={currentMonster.hp} color={currentMonster.color} />
          </div>
        </div>

        {/* ── Área da pergunta / resultado ──────────────────────────────────── */}
        <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-4 gap-3 overflow-y-auto">

          {/* Pergunta */}
          {phase === "question" && (
            <div className="flex flex-col gap-4 animate-pop-in">
              {/* Card da pergunta */}
              <div
                className="p-5 rounded-xl"
                style={{
                  background: "rgba(0,0,0,0.5)",
                  border: `2px solid ${currentMonster.color}66`,
                  boxShadow: `0 0 20px ${currentMonster.color}22`,
                }}
              >
                <div className="font-pixel mb-3 text-center" style={{ fontSize: 10, color: currentMonster.color, letterSpacing: 1 }}>
                  ❓ RESPONDA PARA ATACAR
                </div>
                <p className="font-retro text-white leading-snug text-center" style={{ fontSize: "clamp(17px,3.5vw,22px)" }}>
                  {currentQ.question}
                </p>
              </div>

              {/* Botões de resposta — empilhados, grandes */}
              <div className="flex flex-col gap-2">
                {currentQ.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleAnswer(idx)}
                    disabled={!!feedbackOverlay}
                    className="flex items-center gap-4 text-left transition-all duration-150 cursor-pointer"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "2px solid rgba(124,58,237,0.35)",
                      borderRadius: 12,
                      padding: "14px 18px",
                      opacity: feedbackOverlay ? 0.5 : 1,
                    }}
                    onMouseEnter={e => {
                      if (!feedbackOverlay) {
                        (e.currentTarget as HTMLButtonElement).style.background = `${currentMonster.color}18`;
                        (e.currentTarget as HTMLButtonElement).style.borderColor = `${currentMonster.color}80`;
                        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
                      }
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(124,58,237,0.35)";
                      (e.currentTarget as HTMLButtonElement).style.transform = "";
                    }}
                  >
                    <span
                      className="font-pixel shrink-0 flex items-center justify-center rounded-md"
                      style={{
                        fontSize: 11, width: 32, height: 32,
                        background: `${currentMonster.color}22`,
                        border: `1px solid ${currentMonster.color}55`,
                        color: currentMonster.color,
                      }}
                    >
                      {["A", "B", "C", "D"][idx]}
                    </span>
                    <span className="font-retro text-purple-100" style={{ fontSize: "clamp(16px,3vw,20px)" }}>
                      {opt}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Resultado */}
          {phase === "result" && (
            <div className="flex flex-col gap-3 animate-pop-in">
              {/* Banner de resultado */}
              <div
                className="p-4 rounded-xl text-center"
                style={{
                  background: lastCorrect ? "rgba(5,150,105,0.2)" : "rgba(185,28,28,0.2)",
                  border: `2px solid ${lastCorrect ? "#059669" : "#dc2626"}`,
                  boxShadow: `0 0 24px ${lastCorrect ? "rgba(5,150,105,0.3)" : "rgba(185,28,28,0.3)"}`,
                }}
              >
                <div className="font-pixel mb-1" style={{ fontSize: 11, color: lastCorrect ? "#10b981" : "#f87171" }}>
                  {lastCorrect
                    ? `⚔️ ATAQUE CERTEIRO! ${currentMonster.name.replace("BOSS: ", "")} perdeu 1 HP!`
                    : `${currentMonster.attackEmoji} Monstro contra-atacou! Você perdeu 1 HP!`}
                </div>
                {lastCorrect && combo > 1 && (
                  <div className="font-pixel text-yellow-400 animate-blink" style={{ fontSize: 10 }}>🔥 COMBO x{combo}!</div>
                )}
              </div>

              {/* Gabarito */}
              <div className="flex flex-col gap-2">
                {currentQ.options.map((opt, idx) => {
                  const isCorrect = idx === currentQ.correct;
                  const isWrong   = idx === selectedAnswer && !isCorrect;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
                      style={{
                        background: isCorrect ? "rgba(5,150,105,0.2)" : isWrong ? "rgba(185,28,28,0.15)" : "rgba(0,0,0,0.2)",
                        border: `2px solid ${isCorrect ? "#059669" : isWrong ? "#dc2626" : "rgba(124,58,237,0.2)"}`,
                      }}
                    >
                      <span className="font-pixel shrink-0" style={{ fontSize: 10, color: isCorrect ? "#10b981" : isWrong ? "#f87171" : "#6d28d9" }}>
                        {["A","B","C","D"][idx]}
                      </span>
                      <span className="font-retro text-purple-100 flex-1" style={{ fontSize: "clamp(15px,2.8vw,19px)" }}>{opt}</span>
                      <span>{isCorrect ? "✅" : isWrong ? "❌" : ""}</span>
                    </div>
                  );
                })}
              </div>

              {/* Explicação */}
              <div
                className="p-4 rounded-xl"
                style={{ background: "rgba(0,0,0,0.35)", border: "1px solid rgba(124,58,237,0.2)" }}
              >
                <div className="font-pixel text-purple-400 mb-2" style={{ fontSize: 10 }}>💡 EXPLICAÇÃO</div>
                <p className="font-retro text-purple-200 leading-relaxed" style={{ fontSize: "clamp(15px,2.8vw,18px)" }}>
                  {currentQ.explanation}
                </p>
              </div>

              {/* Botão próxima */}
              <button
                onClick={nextQuestion}
                className={`pixel-btn w-full py-4 ${lastCorrect ? "pixel-btn-green" : "pixel-btn-primary"}`}
                style={{ fontSize: 10 }}
              >
                {monsterHp <= 1 && lastCorrect
                  ? "🏆 DERROTE O MONSTRO!"
                  : playerHp <= 1 && !lastCorrect
                  ? "💀 PERIGO! PRÓXIMA..."
                  : "PRÓXIMA PERGUNTA →"}
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
