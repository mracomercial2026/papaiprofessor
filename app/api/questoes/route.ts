import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `Você é um especialista em educação brasileira (BNCC) que cria listas de exercícios personalizadas para crianças do Ensino Fundamental.

Sua tarefa é gerar uma lista de questões estruturada para o pai imprimir e deixar o filho estudar em casa.

## REGRAS OBRIGATÓRIAS

1. Siga EXATAMENTE o formato JSON abaixo — sem texto extra antes ou depois.
2. Adapte a dificuldade ao ano escolar informado.
3. As questões devem cobrir o tema de forma progressiva: do básico ao intermediário.
4. Para múltipla escolha: sempre 4 alternativas (A, B, C, D), apenas 1 correta.
5. Para questões abertas: deixe o campo "options" como array vazio e "correct" como -1.
6. Explicações devem ser curtas e didáticas (1-2 frases).
7. Linguagem simples, adequada à faixa etária.
8. Responda APENAS com o JSON, sem markdown, sem blocos de código.

## FORMATO DE SAÍDA (JSON puro)

{
  "title": "Lista de Exercícios — [Matéria]: [Tema]",
  "subtitle": "[Ano escolar] · [Quantidade] questões",
  "subject": "[Matéria]",
  "topic": "[Tema]",
  "grade": "[Ano escolar]",
  "questions": [
    {
      "number": 1,
      "type": "multiple_choice",
      "statement": "Enunciado da questão aqui.",
      "options": ["A) opção A", "B) opção B", "C) opção C", "D) opção D"],
      "correct": 0,
      "explanation": "Explicação curta da resposta correta."
    },
    {
      "number": 2,
      "type": "open",
      "statement": "Enunciado de questão aberta aqui.",
      "options": [],
      "correct": -1,
      "explanation": "Resposta esperada: ..."
    }
  ]
}`;

export async function POST(req: NextRequest) {
  const { subject, grade, topic, quantity, type } = await req.json();

  const groqKey = process.env.GROQ_API_KEY;
  if (!groqKey) {
    return NextResponse.json({ error: "GROQ_API_KEY não configurada." }, { status: 500 });
  }

  const typeLabel =
    type === "multiple_choice" ? "múltipla escolha" :
    type === "open"            ? "abertas (dissertativas)" :
    "mistas (metade múltipla escolha, metade abertas)";

  const userMessage = `Gere uma lista com ${quantity} questões de ${typeLabel} sobre:
- Matéria: ${subject}
- Ano escolar: ${grade}
- Tema: ${topic || subject + " — conteúdo geral do ano"}

Lembre-se: responda APENAS com o JSON, sem texto adicional.`;

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
          { role: "user",   content: userMessage },
        ],
        max_tokens: 4000,
        temperature: 0.5,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Groq API error:", err);
      return NextResponse.json({ error: "Erro ao gerar questões." }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "{}";

    try {
      const parsed = JSON.parse(content);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({ error: "Resposta inválida da IA." }, { status: 500 });
    }
  } catch (error) {
    console.error("Groq API error:", error);
    return NextResponse.json({ error: "Erro ao conectar com a IA." }, { status: 500 });
  }
}
