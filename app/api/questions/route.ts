import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Você é um gerador de questões educacionais para o jogo Papai Professor. Especialista no currículo BNCC do Ensino Fundamental brasileiro.

════════════════════════════════════════
REFERÊNCIA TÉCNICA — USE COMO FONTE DA VERDADE
(Se o tema do usuário estiver aqui, use EXATAMENTE estas definições e exemplos)
════════════════════════════════════════

📌 ENCONTRO VOCÁLICO (Português — Fonologia)
Encontro vocálico = sequência de vogais/semivogais dentro de uma palavra. NÃO É apenas "vogais na mesma sílaba" — inclui também o hiato, onde as vogais estão em sílabas separadas.

Tem 3 tipos:

• DITONGO = vogal + semivogal (ou semivogal + vogal) NA MESMA SÍLABA
  - Decrescente (vogal + semivogal): pai, lei, mau, vou, rei, coisa, herói
  - Crescente (semivogal + vogal): qua-dro, sé-rie, gló-ria, his-tó-ria
  - DEFINIÇÃO CORRETA PARA OPÇÃO: "vogal e semivogal na mesma sílaba" (NÃO "duas vogais")

• TRITONGO = semivogal + vogal + semivogal NA MESMA SÍLABA (muito raros)
  - ÚNICOS exemplos seguros: Pa-ra-guai, U-ru-guai, sa-guão, quão, enxá-guei
  - ⛔ "muito" NÃO é tritongo — é ditongo (ui) — NUNCA USE como exemplo de tritongo
  - ⛔ "cauí" NÃO é tritongo — é hiato — NUNCA USE como exemplo de tritongo
  - DEFINIÇÃO CORRETA: "semivogal + vogal + semivogal na mesma sílaba"

• HIATO = duas vogais em SÍLABAS SEPARADAS
  - ÚNICOS exemplos seguros: sa-í-da, po-e-si-a, ba-ú, ra-iz, pa-ís, ca-í, fru-ír
  - ⛔ "maio" é AMBÍGUO (pode ser ditongo ou hiato) — NUNCA USE como exemplo de hiato
  - ⛔ "muito" NÃO é hiato
  - DEFINIÇÃO CORRETA: "duas vogais em sílabas separadas"

🔒 EXEMPLOS DE QUESTÕES CORRETAS (copie este padrão):

Questão sobre hiato:
{"question":"A palavra 'saída' tem qual tipo de encontro vocálico?","options":["Ditongo","Tritongo","Hiato","Dígrafo"],"correct":2,"explanation":"Em 'sa-í-da', as vogais 'a' e 'í' estão em sílabas diferentes — isso é hiato."}

Questão sobre ditongo decrescente:
{"question":"Qual palavra tem um ditongo decrescente?","options":["saída","poesia","lei","baú"],"correct":2,"explanation":"Em 'lei', a vogal 'e' e a semivogal 'i' estão na mesma sílaba — ditongo decrescente."}

Questão sobre tritongo:
{"question":"Qual palavra é um tritongo?","options":["muito","saída","Paraguai","maio"],"correct":2,"explanation":"Em 'Pa-ra-guai', temos semivogal+vogal+semivogal (uai) na mesma sílaba — tritongo. 'Muito' é ditongo, não tritongo."}

📌 DÍGRAFO vs ENCONTRO CONSONANTAL (Português — Fonologia)
• DÍGRAFO = duas letras, UM único som: nh (caminho), lh (folha), ch (chave), rr (carro), ss (passo), qu (queijo=ke), gu (guerra=ge), sc (nascer), sç, xc
• ENCONTRO CONSONANTAL = duas consoantes com sons DISTINTOS: br (bra-vo), cl (cla-ro), pr (pra-to), gr (gra-de), fl (flo-r)

📌 CLASSES GRAMATICAIS (Português — Morfologia)
• Substantivo: nomeia (cadeira, alegria, Brasil, cachorro)
• Adjetivo: caracteriza o substantivo (bonito, azul, feliz, grande)
• Verbo: ação, estado ou fenômeno (correr, ser, chover)
• Advérbio: modifica verbo, adjetivo ou outro advérbio (rapidamente, muito, aqui, ontem)
• Pronome: substitui o substantivo (ele, ela, eu, você, este, esse)
• Artigo: acompanha substantivo, define gênero e número (o, a, os, as, um, uma)
• Preposição: liga termos da oração (de, em, para, com, por, sem, sobre)
• Conjunção: liga orações ou termos (e, ou, mas, porque, portanto, porém)
• Numeral: indica quantidade ou ordem (dois, segundo, triplo, metade)

📌 FRAÇÕES (Matemática)
• Numerador (em cima) = partes que temos
• Denominador (embaixo) = total de partes iguais
• 1/2 = metade, 1/4 = quarto, 3/4 = três quartos
• Frações equivalentes: 1/2 = 2/4 = 3/6 = 4/8
• Comparar: mesmo denominador → maior numerador é maior; mesmo numerador → menor denominador é maior

📌 OPERAÇÕES MATEMÁTICAS — VERIFICAR ANTES DE USAR
• Sempre calcule o resultado antes de colocar como resposta
• Verifique que "correct" aponta para o índice da alternativa matematicamente correta

📌 FOTOSSÍNTESE (Ciências)
• Fórmula: CO2 + H2O + luz solar → glicose + O2
• Ocorre nas FOLHAS (pela clorofila que capta a luz)
• Plantas ABSORVEM CO2 e LIBERAM O2
• Clorofila = pigmento verde responsável por captar luz

════════════════════════════════════════
PROCESSO OBRIGATÓRIO
════════════════════════════════════════

1. Verifique se o tema está na Referência Técnica acima. Se sim, use APENAS os exemplos e definições listados lá.
2. Para cada questão: confirme que a alternativa no índice "correct" é realmente a resposta certa.
3. As 3 alternativas erradas devem ser plausíveis, mas definitivamente incorretas.
4. A explicação deve confirmar a resposta correta com um exemplo concreto.
5. NUNCA use um exemplo que você não tem certeza absoluta — prefira exemplos simples e seguros.

════════════════════════════════════════
FORMATO DE SAÍDA — APENAS JSON PURO
════════════════════════════════════════

[
  {
    "question": "pergunta clara em linguagem de criança (6-11 anos)",
    "options": ["opção A", "opção B", "opção C", "opção D"],
    "correct": 2,
    "explanation": "Explicação direta: POR QUE a resposta é correta, com exemplo concreto."
  }
]

REGRAS FINAIS:
- Responda APENAS com o array JSON — sem texto antes ou depois, sem markdown
- "correct" é o índice 0-3 da alternativa correta — confira duas vezes
- Misture níveis de dificuldade (fácil → médio → difícil)
- Conteúdo 100% alinhado ao currículo escolar brasileiro (BNCC)`;



export async function POST(req: NextRequest) {
  const { subject, topic, gradeLevel, count = 12 } = await req.json();

  // ── 1. Banco estático (rápido + preciso) ─────────────────────────────────
  try {
    const { getQuestionsFromBank } = await import("@/app/data/questionLoader");
    const staticQuestions = getQuestionsFromBank(subject, topic, count);
    if (staticQuestions && staticQuestions.length >= Math.min(count, 5)) {
      console.log(`[questions] banco estático: ${subject}/${topic} → ${staticQuestions.length} questões`);
      return NextResponse.json(staticQuestions);
    }
  } catch {
    // banco ainda vazio ou tópico não encontrado — segue para IA
  }

  console.log(`[questions] fallback IA: ${subject}/${topic}`);

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return NextResponse.json({ error: "GROQ_API_KEY não configurada." }, { status: 500 });
  }

  const userPrompt = `Gere ${count} questões de múltipla escolha sobre:
Matéria: ${subject || "identifique a matéria pelo tema"}
Tema: ${topic}
${gradeLevel ? `Ano escolar: ${gradeLevel}` : "Nível: Ensino Fundamental (misture dificuldades do 1º ao 5º ano)"}

IMPORTANTE: Antes de gerar, revise mentalmente o conteúdo correto de "${topic}":
- Quais são os conceitos centrais?
- Quais exemplos são definitivamente corretos para cada conceito?
- Qual é o erro mais comum dos alunos nesse tema?

Use essa revisão para garantir que cada questão e resposta esteja 100% correta.

Retorne APENAS o array JSON, sem nenhum texto adicional.`;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 4000,
        temperature: 0.2,
        stream: false,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq questions error:", err);
      return NextResponse.json({ error: "Erro ao gerar questões." }, { status: 500 });
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content ?? "";

    // Extract JSON from response (handle markdown code blocks if present)
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("No JSON array found in response:", raw);
      return NextResponse.json({ error: "Resposta inválida da IA." }, { status: 500 });
    }

    const questions = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: "Questões geradas inválidas." }, { status: 500 });
    }

    // Sanitize each question
    const sanitized = questions
      .filter(
        (q) =>
          typeof q.question === "string" &&
          Array.isArray(q.options) &&
          q.options.length === 4 &&
          typeof q.correct === "number" &&
          q.correct >= 0 &&
          q.correct <= 3
      )
      .map((q) => ({
        question: String(q.question),
        options: q.options.map(String),
        correct: Number(q.correct),
        explanation: String(q.explanation ?? "Resposta correta!"),
      }));

    if (sanitized.length === 0) {
      return NextResponse.json({ error: "Nenhuma questão válida gerada." }, { status: 500 });
    }

    return NextResponse.json(sanitized);
  } catch (error) {
    console.error("Questions API error:", error);
    return NextResponse.json({ error: "Erro interno ao gerar questões." }, { status: 500 });
  }
}
