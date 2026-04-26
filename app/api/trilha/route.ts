import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Serviço temporariamente indisponível." },
      { status: 503 }
    );
  }

  const client = new Anthropic({ apiKey });

  try {
    const { subject, topic, gradeLevel, type } = await req.json();

    let prompt = "";

    if (type === "quiz") {
      prompt = `Crie 5 perguntas de múltipla escolha sobre "${topic}" de ${subject} para o ${gradeLevel}.

IMPORTANTE: Retorne APENAS um JSON válido, sem texto extra, no seguinte formato:
{
  "questions": [
    {
      "question": "texto da pergunta",
      "options": ["opção A", "opção B", "opção C", "opção D"],
      "correct": 0,
      "explanation": "explicação simples de por que essa resposta é correta"
    }
  ]
}

As perguntas devem ser:
- Adequadas para a idade (${gradeLevel})
- Em português do Brasil
- Com linguagem simples e clara
- A explicação deve ser didática, para o pai poder ensinar ao filho`;
    } else if (type === "challenge") {
      prompt = `Crie um mini-desafio educativo sobre "${topic}" de ${subject} para ${gradeLevel}.

Retorne APENAS um JSON válido:
{
  "title": "título do desafio",
  "description": "descrição do que fazer",
  "hint": "dica para o pai",
  "example": "exemplo prático do dia a dia",
  "funFact": "curiosidade divertida sobre o tema",
  "teachTip": "como o pai pode ensinar isso ao filho de forma lúdica"
}`;
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON in response");
    }

    const data = JSON.parse(jsonMatch[0]);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Trilha API error:", error);
    return NextResponse.json(
      { error: "Erro ao gerar conteúdo da trilha" },
      { status: 500 }
    );
  }
}
