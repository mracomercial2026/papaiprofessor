/**
 * generate-questions.mjs
 * Gera o banco de questões completo do Ensino Fundamental 1
 * Uso: node scripts/generate-questions.mjs [--subject=Português] [--topic=Sílabas] [--force]
 *
 * Por padrão, pula tópicos já gerados (idempotente).
 * Use --force para regenerar tópicos existentes.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const QUESTIONS_DIR = join(ROOT, 'app', 'data', 'questions');

// ── Carregar GROQ_API_KEY do .env.local ─────────────────────────────────────
function loadEnv() {
  const envPath = join(ROOT, '.env.local');
  if (!existsSync(envPath)) throw new Error('.env.local não encontrado');
  const raw = readFileSync(envPath, 'utf-8');
  for (const line of raw.split('\n')) {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
  }
}
loadEnv();

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY não encontrada no .env.local');

// ── Taxonomia completa do Ensino Fundamental 1 (BNCC) ───────────────────────
const TAXONOMY = {
  Matemática: [
    { topic: 'Numeração e Valor Posicional', years: '1-2º ano' },
    { topic: 'Adição e Subtração', years: '1-3º ano' },
    { topic: 'Multiplicação', years: '3º ano' },
    { topic: 'Divisão', years: '3-4º ano' },
    { topic: 'Tabuada', years: '3º ano' },
    { topic: 'Frações', years: '3-5º ano' },
    { topic: 'Números Decimais', years: '4-5º ano' },
    { topic: 'Porcentagem', years: '5º ano' },
    { topic: 'Geometria Plana', years: '3-5º ano' },
    { topic: 'Medidas de Comprimento', years: '2-4º ano' },
    { topic: 'Medidas de Massa e Capacidade', years: '3-4º ano' },
    { topic: 'Medidas de Tempo', years: '2-4º ano' },
    { topic: 'Área e Perímetro', years: '4-5º ano' },
    { topic: 'MMC e MDC', years: '5º ano' },
    { topic: 'Sistema Monetário', years: '2-4º ano' },
  ],
  Português: [
    { topic: 'Vogais e Consoantes', years: '1º ano' },
    { topic: 'Sílabas e Separação Silábica', years: '1-2º ano' },
    { topic: 'Ortografia', years: '2-3º ano' },
    { topic: 'Encontro Vocálico', years: '4-5º ano' },
    { topic: 'Dígrafo e Encontro Consonantal', years: '4-5º ano' },
    { topic: 'Substantivo', years: '3-4º ano' },
    { topic: 'Adjetivo', years: '3-4º ano' },
    { topic: 'Verbo', years: '3-5º ano' },
    { topic: 'Artigo e Pronome', years: '4-5º ano' },
    { topic: 'Pontuação', years: '3-5º ano' },
    { topic: 'Tipos de Texto', years: '3-5º ano' },
    { topic: 'Interpretação de Texto', years: '3-5º ano' },
    { topic: 'Acentuação', years: '4-5º ano' },
    { topic: 'Figuras de Linguagem', years: '5º ano' },
    { topic: 'Concordância Nominal e Verbal', years: '5º ano' },
  ],
  Ciências: [
    { topic: 'Corpo Humano Básico', years: '1-2º ano' },
    { topic: 'Saúde e Higiene', years: '2º ano' },
    { topic: 'Animais Vertebrados e Invertebrados', years: '2-4º ano' },
    { topic: 'Plantas e Fotossíntese', years: '3-4º ano' },
    { topic: 'Cadeia Alimentar', years: '4º ano' },
    { topic: 'Ecossistemas', years: '4-5º ano' },
    { topic: 'Sistema Solar', years: '4-5º ano' },
    { topic: 'Ciclo da Água', years: '3-4º ano' },
    { topic: 'Estados da Matéria', years: '3º ano' },
    { topic: 'Solos e Rochas', years: '4º ano' },
    { topic: 'Sistemas do Corpo Humano', years: '5º ano' },
    { topic: 'Meio Ambiente e Sustentabilidade', years: '4-5º ano' },
  ],
  História: [
    { topic: 'Família e Comunidade', years: '1-2º ano' },
    { topic: 'Noção de Tempo e Calendário', years: '1-2º ano' },
    { topic: 'Pré-história', years: '3-4º ano' },
    { topic: 'Povos Indígenas do Brasil', years: '3-4º ano' },
    { topic: 'Descobrimento e Colonização do Brasil', years: '3-4º ano' },
    { topic: 'Escravidão no Brasil', years: '4-5º ano' },
    { topic: 'Independência do Brasil', years: '4-5º ano' },
    { topic: 'Monarquia Brasileira', years: '4-5º ano' },
    { topic: 'República Brasileira', years: '5º ano' },
    { topic: 'Civilizações Antigas', years: '4-5º ano' },
    { topic: 'Imigração no Brasil', years: '4-5º ano' },
    { topic: 'Direitos e Cidadania', years: '5º ano' },
  ],
  Geografia: [
    { topic: 'Orientação e Rosa dos Ventos', years: '2-3º ano' },
    { topic: 'Mapas e Cartografia', years: '3-4º ano' },
    { topic: 'Regiões do Brasil', years: '4-5º ano' },
    { topic: 'Estados e Capitais do Brasil', years: '4-5º ano' },
    { topic: 'Biomas Brasileiros', years: '4-5º ano' },
    { topic: 'Clima e Relevo', years: '4-5º ano' },
    { topic: 'Rios do Brasil', years: '4-5º ano' },
    { topic: 'Espaço Urbano e Rural', years: '2-3º ano' },
    { topic: 'Recursos Naturais', years: '4-5º ano' },
    { topic: 'Brasil no Mundo', years: '5º ano' },
    { topic: 'Sustentabilidade Ambiental', years: '5º ano' },
    { topic: 'Fusos Horários', years: '5º ano' },
  ],
};

// ── Referências técnicas para tópicos sensíveis ──────────────────────────────
const TECHNICAL_REFS = {
  'Encontro Vocálico': `
REFERÊNCIA TÉCNICA — USE COMO ÚNICA FONTE DE VERDADE:
• DITONGO = vogal + semivogal (ou semivogal + vogal) NA MESMA SÍLABA
  Decrescente: pai, lei, mau, rei, coisa, herói
  Crescente: quadro, série, glória, história
• TRITONGO = semivogal + vogal + semivogal NA MESMA SÍLABA (muito raros)
  ÚNICOS exemplos seguros: Paraguai, Uruguai, saguão, quão, enxáguei
  ⛔ "muito" NÃO é tritongo (é ditongo "ui")
  ⛔ "cauí" NÃO é tritongo (é hiato)
• HIATO = duas vogais em SÍLABAS DIFERENTES
  Exemplos seguros: saída, poesia, baú, raiz, país, caiu
  ⛔ NUNCA use "maio" como exemplo (ambíguo)
EXEMPLOS DE QUESTÕES CORRETAS:
{"question":"A palavra 'saída' tem qual tipo de encontro vocálico?","options":["Ditongo","Tritongo","Hiato","Dígrafo"],"correct":2,"explanation":"Em 'sa-í-da', as vogais estão em sílabas separadas — hiato.","type":"aplicacao","difficulty":"medio"}
{"question":"Qual palavra contém um tritongo?","options":["muito","saída","Paraguai","maio"],"correct":2,"explanation":"Em 'Pa-ra-guai', temos semivogal+vogal+semivogal (uai) na mesma sílaba — tritongo. 'Muito' é ditongo.","type":"aplicacao","difficulty":"dificil"}`,

  'Dígrafo e Encontro Consonantal': `
REFERÊNCIA TÉCNICA:
• DÍGRAFO = duas letras que representam UM único fonema/som
  Exemplos: ch (chave), lh (palha), nh (ninho), ss (passo), rr (carro), qu (que), gu (guia)
• ENCONTRO CONSONANTAL = duas consoantes em que CADA UMA tem som próprio
  Exemplos: br (bravo), fl (flor), pr (prato), gr (grama), cl (claro)
• DÍGRAFO vs ENCONTRO: "ch" = dígrafo (ch = 1 som), "br" = encontro (b+r = 2 sons)`,

  'Frações': `
REFERÊNCIA TÉCNICA:
• Numerador (cima) = partes que temos
• Denominador (baixo) = total de partes iguais
• Frações equivalentes: 1/2 = 2/4 = 3/6 (mesma quantidade, divisões diferentes)
• Comparar: mesmo denominador → maior numerador = maior fração
  Denominadores diferentes: converter para o mesmo denominador primeiro
• 1/2 > 1/3 > 1/4 (quanto maior o denominador, menor cada parte)`,

  'Estados da Matéria': `
REFERÊNCIA TÉCNICA:
• SÓLIDO: forma e volume definidos (gelo, pedra)
• LÍQUIDO: volume definido, forma do recipiente (água, suco)
• GASOSO: sem forma nem volume definido (vapor, ar)
• Mudanças: fusão (sólido→líquido), solidificação (líquido→sólido), vaporização (líquido→gás), condensação (gás→líquido), sublimação (sólido→gás direto)`,

  'MMC e MDC': `
REFERÊNCIA TÉCNICA:
• MDC (Máximo Divisor Comum) = maior número que divide os dois sem resto
  MDC(12,8) = 4 porque 4 divide 12 (12÷4=3) e divide 8 (8÷4=2)
• MMC (Mínimo Múltiplo Comum) = menor número que é múltiplo dos dois
  MMC(4,6) = 12 porque 12 é divisível por 4 (12÷4=3) e por 6 (12÷6=2)
• Método: decompor em fatores primos
  MDC: produto dos fatores COMUNS com menor expoente
  MMC: produto de TODOS os fatores com maior expoente`,
};

// ── Prompt do sistema ────────────────────────────────────────────────────────
function buildSystemPrompt(subject, topic, years, techRef) {
  return `Você é um especialista em educação brasileira e criação de questões pedagógicas para o Ensino Fundamental 1.
Seu trabalho é gerar questões de múltipla escolha de ALTA QUALIDADE sobre conteúdos escolares.

TEMA: ${topic}
DISCIPLINA: ${subject}
ANO ESCOLAR: ${years}
${techRef ? `\n${techRef}\n` : ''}
REGRAS DE QUALIDADE — OBRIGATÓRIAS:
1. Questões devem ser claras, sem ambiguidade
2. Todas as alternativas erradas devem ser plausíveis (não óbvias demais)
3. A resposta correta deve ser inequivocamente correta
4. Explicações devem ser didáticas, em 1-2 frases
5. Linguagem adequada para crianças do EF1 (6-11 anos)
6. NUNCA repita questões — cada uma deve abordar um ângulo diferente

TIPOS DE QUESTÃO — gere EXATAMENTE 4 de cada (total = 20):

TIPO "definicao" — Teste se o aluno entende o conceito
- "O que é X?", "Como chamamos X?", "Qual é a definição de X?", "O que significa X?"

TIPO "aplicacao" — Situação real exige aplicar o conceito
- Contexto cotidiano + pergunta específica. Ex: "Maria comprou 3/4 de kg. João comprou 1/2. Quem comprou mais?"

TIPO "negacao" — Testar exceções e contra-exemplos
- "Qual NÃO é X?", "O que NÃO pertence ao grupo X?", "Qual afirmação sobre X é FALSA?"

TIPO "completar" — Completar padrão, lacuna ou sequência
- "Complete: ___", "2, 4, ___, 16. Qual número falta?", "A palavra ___ é um exemplo de X"

TIPO "raciocinio" — Raciocínio e causalidade
- "Por que X acontece?", "O que acontece quando X?", "Se X, então Y?", "Qual seria o resultado de X?"

DISTRIBUIÇÃO DE DIFICULDADE (total 20 questões):
- "facil": 7 questões (conceitos básicos, definições diretas)
- "medio": 8 questões (aplicações, comparações)
- "dificil": 5 questões (raciocínio, exceções, casos especiais)

FORMATO DE SAÍDA — responda SOMENTE com JSON válido:
[
  {
    "question": "texto da questão",
    "options": ["opção A", "opção B", "opção C", "opção D"],
    "correct": 0,
    "explanation": "explicação didática em 1-2 frases",
    "type": "definicao",
    "difficulty": "facil"
  }
]

NENHUM texto antes ou depois do JSON. SOMENTE o array JSON.`;
}

// ── Chamar a API do Groq (com retry + espera calculada do erro) ──────────────
async function callGroq(systemPrompt, userPrompt, retries = 8) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 4000,
        temperature: 0.3,
      }),
    });

    if (res.status === 429) {
      const errText = await res.text();
      // Extrai o tempo exato do erro (ex: "16.745s" ou "800ms")
      const secMatch = errText.match(/try again in (\d+(?:\.\d+)?)s/);
      const msMatch = errText.match(/try again in (\d+)ms/);
      let waitSec;
      if (secMatch) waitSec = Math.ceil(parseFloat(secMatch[1])) + 5;
      else if (msMatch) waitSec = Math.ceil(parseInt(msMatch[1]) / 1000) + 2;
      else waitSec = 35; // fallback conservador
      log(`  ⏳ Rate limit — aguardando ${waitSec}s (tentativa ${attempt}/${retries})...`);
      await sleep(waitSec * 1000);
      continue;
    }

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq API error ${res.status}: ${err.slice(0, 300)}`);
    }

    return await res.json();
  }
  throw new Error(`Rate limit persistente após ${retries} tentativas`);
}

async function generateQuestions(subject, topic, years, techRef) {
  const systemPrompt = buildSystemPrompt(subject, topic, years, techRef);
  const userPrompt = `Gere 20 questões sobre "${topic}" (${subject} — ${years}).`;

  const data = await callGroq(systemPrompt, userPrompt);
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error('Resposta vazia da API');

  // Extrair JSON mesmo se vier com texto em volta
  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error(`JSON não encontrado na resposta: ${content.slice(0, 200)}`);

  let questions;
  try {
    questions = JSON.parse(jsonMatch[0]);
  } catch {
    // Tentar reparar JSON truncado: encontrar o último objeto completo e fechar o array
    const raw = jsonMatch[0];
    const lastClose = raw.lastIndexOf('}');
    if (lastClose < 0) throw new Error('JSON irreparável: nenhum objeto completo encontrado');
    const repaired = raw.slice(0, lastClose + 1) + ']';
    try {
      questions = JSON.parse(repaired);
      log(`  🔧 JSON reparado — ${questions.length} questões recuperadas`);
    } catch {
      throw new Error(`JSON inválido mesmo após reparo: ${raw.slice(0, 200)}`);
    }
  }

  // Validação básica
  if (!Array.isArray(questions) || questions.length < 10) {
    throw new Error(`Apenas ${questions.length} questões geradas (mínimo 10)`);
  }

  // Filtrar questões com gabarito ≠ explicação
  // (questões de negação "Qual NÃO é X?" são válidas e não são filtradas)
  const valid = questions.filter((q) => {
    if (
      !Array.isArray(q.options) ||
      typeof q.correct !== 'number' ||
      q.correct < 0 ||
      q.correct >= q.options.length ||
      !q.explanation
    ) return false;

    const questionText  = (q.question ?? '').toLowerCase();
    const explanation   = q.explanation.toLowerCase();
    const correctAnswer = (q.options[q.correct] ?? '').toLowerCase().trim();

    // Questão de negação: legítima, não filtrar
    const isNegationQuestion =
      /\bnão\s+(é|são|faz|pertence|representa|indica|existe|está)\b/.test(questionText) ||
      /\bque\s+não\b/.test(questionText);

    // Sinal claro de confusão: explicação diz "a resposta correta é X" sendo X ≠ marcada
    const claimsOtherCorrect =
      /a resposta correta é ['"]?(?!\s*$)/.test(explanation) &&
      !explanation.includes(`a resposta correta é`) === false &&
      !explanation.includes(correctAnswer);

    if (claimsOtherCorrect && !isNegationQuestion) {
      log(`  ⚠️  Questão descartada (gabarito≠explicação): "${q.question?.slice(0, 60)}"`);
      return false;
    }
    return true;
  });

  if (valid.length < 10) {
    throw new Error(`Apenas ${valid.length} questões válidas após filtro (mínimo 10)`);
  }

  if (valid.length < questions.length) {
    log(`  ✂️  ${questions.length - valid.length} questão(ões) inconsistente(s) removida(s)`);
  }

  return valid;
}

// ── Carregar/salvar JSON do banco ────────────────────────────────────────────
function loadBank(subject) {
  const filePath = join(QUESTIONS_DIR, `${subject.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_')}.json`);
  if (!existsSync(filePath)) return {};
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  } catch {
    return {};
  }
}

function saveBank(subject, bank) {
  const fileName = subject.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_');
  const filePath = join(QUESTIONS_DIR, `${fileName}.json`);
  writeFileSync(filePath, JSON.stringify(bank, null, 2), 'utf-8');
}

// ── Utilitários ──────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function log(msg) {
  process.stdout.write(`${new Date().toISOString().slice(11, 19)} ${msg}\n`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const filterSubject = args.find((a) => a.startsWith('--subject='))?.split('=')[1];
  const filterTopic = args.find((a) => a.startsWith('--topic='))?.split('=')[1];
  const force = args.includes('--force');

  let total = 0;
  let skipped = 0;
  let errors = 0;

  for (const [subject, topics] of Object.entries(TAXONOMY)) {
    if (filterSubject && subject !== filterSubject) continue;

    const bank = loadBank(subject);
    let bankDirty = false;

    for (const { topic, years } of topics) {
      if (filterTopic && topic !== filterTopic) continue;

      if (!force && bank[topic] && bank[topic].length >= 10) {
        log(`⏭  [${subject}] ${topic} — já gerado (${bank[topic].length} questões)`);
        skipped++;
        continue;
      }

      log(`🔄 [${subject}] Gerando: ${topic} (${years})...`);

      try {
        const techRef = TECHNICAL_REFS[topic];
        const questions = await generateQuestions(subject, topic, years, techRef);
        bank[topic] = questions;
        bankDirty = true;
        total++;
        log(`✅ [${subject}] ${topic} — ${questions.length} questões geradas`);
      } catch (err) {
        errors++;
        log(`❌ [${subject}] ${topic} — ERRO: ${err.message}`);
      }

      // Salvar progressivamente (não perder dados se falhar no meio)
      if (bankDirty) {
        saveBank(subject, bank);
        bankDirty = false;
      }

      // 20k TPM (llama-3.1-8b-instant) ÷ ~3k tokens/chamada = 6.6 chamadas/min → 15s entre chamadas
      await sleep(15000);
    }

    if (bankDirty) saveBank(subject, bank);

    // Resumo do subject
    const generated = Object.keys(bank).length;
    log(`📦 [${subject}] Banco salvo — ${generated} tópicos no total\n`);
  }

  log(`\n🎯 CONCLUÍDO: ${total} tópicos gerados, ${skipped} pulados, ${errors} erros`);
}

main().catch((err) => {
  console.error('FATAL:', err);
  process.exit(1);
});
