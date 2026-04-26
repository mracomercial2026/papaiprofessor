import { NextRequest, NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const SYSTEM_PROMPT = `Você é o **Papai Professor** — um tutor amigável e paciente que ajuda PAIS a entenderem as tarefas escolares dos filhos para que possam ensinar em casa com confiança.

## SUA MISSÃO
Analisar a foto de uma tarefa escolar e guiar o pai/mãe para que ELE/ELA consiga explicar o conteúdo ao filho — sem dar as respostas diretas.

## FORMATO DE RESPOSTA

### 1. 📋 O QUE VI NA TAREFA
Liste resumidamente os exercícios/questões identificados na imagem (ex: "3 questões sobre frações", "texto de interpretação com 5 perguntas", etc.)

### 2. 📚 CONCEITOS ENVOLVIDOS
Explique cada conceito de forma simples, como se fosse para alguém que nunca estudou aquilo. Use analogias do dia a dia.

### 3. 💡 COMO VOCÊ EXPLICA PARA SEU FILHO
Para cada tipo de exercício, dê uma estratégia prática de como o pai pode explicar:
- O que falar
- Exemplos concretos para usar
- Perguntas que pode fazer ao filho para guiar o raciocínio (sem dar a resposta)

### 4. ⚠️ PONTOS DE ATENÇÃO
Mencione erros comuns que crianças cometem nesse conteúdo e como o pai pode ajudar a identificá-los.

### 5. 🎮 HORA DE PRATICAR
Se o conteúdo tiver correspondência no nosso jogo, adicione ao FINAL da resposta exatamente neste formato:
[JOGAR_AGORA:materia=MATERIA,tema=TEMA]

Onde MATERIA é uma de: Matemática, Português, Ciências, História, Geografia
E TEMA é o tópico específico identificado.

## REGRAS IMPORTANTES
- Linguagem simples, direta, sem jargão pedagógico excessivo
- Tom animado e encorajador — o pai precisa se sentir capaz!
- NÃO resolva os exercícios — ensine o caminho
- Use emojis com moderação para deixar a leitura mais leve
- Se a imagem não for de uma tarefa escolar, diga gentilmente que só analisa tarefas escolares`;

export async function POST(req: NextRequest) {
  if (!GROQ_API_KEY) {
    return NextResponse.json({ error: "GROQ_API_KEY não configurada" }, { status: 500 });
  }

  let imageBase64: string;
  let mimeType: string;
  let subject: string;
  let gradeLevel: string;

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Nenhuma imagem enviada" }, { status: 400 });
    }
    const buffer = await file.arrayBuffer();
    imageBase64 = Buffer.from(buffer).toString("base64");
    mimeType = file.type || "image/jpeg";
    subject = (formData.get("subject") as string) || "";
    gradeLevel = (formData.get("gradeLevel") as string) || "";
  } else {
    const body = await req.json();
    imageBase64 = body.imageBase64;
    mimeType = body.mimeType || "image/jpeg";
    subject = body.subject || "";
    gradeLevel = body.gradeLevel || "";
  }

  if (!imageBase64) {
    return NextResponse.json({ error: "Imagem inválida" }, { status: 400 });
  }

  const contextHints = [
    subject && `Matéria provável: ${subject}`,
    gradeLevel && `Ano escolar: ${gradeLevel}`,
  ]
    .filter(Boolean)
    .join(". ");

  const userText = contextHints
    ? `Analise esta tarefa escolar. ${contextHints}. Explique como posso ajudar meu filho em casa.`
    : "Analise esta tarefa escolar e me explique como posso ajudar meu filho em casa.";

  const groqBody = {
    model: "meta-llama/llama-4-scout-17b-16e-instruct",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: userText },
          {
            type: "image_url",
            image_url: { url: `data:${mimeType};base64,${imageBase64}` },
          },
        ],
      },
    ],
    max_tokens: 2048,
    temperature: 0.4,
    stream: true,
  };

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(groqBody),
  });

  if (!groqRes.ok) {
    const err = await groqRes.text();
    return NextResponse.json({ error: `Groq error: ${err.slice(0, 200)}` }, { status: 502 });
  }

  // Forward the SSE stream as plain text (same pattern as /api/chat)
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = groqRes.body!.getReader();
      const decoder = new TextDecoder();

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((l) => l.startsWith("data: "));

          for (const line of lines) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              const token = parsed.choices?.[0]?.delta?.content;
              if (token) controller.enqueue(encoder.encode(token));
            } catch {
              // skip malformed chunks
            }
          }
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
