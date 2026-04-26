/**
 * questionLoader.ts
 * Carrega questões do banco estático JSON.
 * Retorna null se o tópico não existir (fallback para geração por IA).
 */

import type { Question } from './questions';

// Importa os bancos JSON de cada matéria
import matematicaBank from './questions/matematica.json';
import portuguesBank from './questions/portugues.json';
import cienciasBank from './questions/ciencias.json';
import historiaBank from './questions/historia.json';
import geografiaBank from './questions/geografia.json';

type QuestionBank = Record<string, Question[]>;

const BANKS: Record<string, QuestionBank> = {
  Matemática: matematicaBank as QuestionBank,
  Português: portuguesBank as QuestionBank,
  Ciências: cienciasBank as QuestionBank,
  História: historiaBank as QuestionBank,
  Geografia: geografiaBank as QuestionBank,
};

/**
 * Valida se uma questão é consistente.
 *
 * Questões de NEGAÇÃO ("Qual NÃO é X?") são válidas quando a explicação
 * confirma que a resposta marcada é o item que NÃO pertence ao grupo —
 * nesses casos "X não é Y" na explanation está CORRETO.
 *
 * Só rejeitamos quando a question NÃO é de negação mas a explanation
 * diz explicitamente que a resposta correta é incorreta E também fala
 * qual seria "a resposta correta" (sinal claro de confusão do modelo).
 */
function isConsistent(q: Question): boolean {
  // Campos obrigatórios
  if (
    !q.question ||
    !Array.isArray(q.options) ||
    q.options.length < 2 ||
    typeof q.correct !== 'number' ||
    q.correct < 0 ||
    q.correct >= q.options.length ||
    !q.explanation
  ) return false;

  const questionText  = q.question.toLowerCase();
  const explanation   = q.explanation.toLowerCase();
  const correctAnswer = (q.options[q.correct] ?? '').toLowerCase().trim();

  if (!correctAnswer) return false;

  // Questão de negação: a própria pergunta contém "não é", "não são", "não faz", etc.
  const isNegationQuestion =
    /\bnão\s+(é|são|faz|pertence|representa|indica|existe|está)\b/.test(questionText) ||
    /\bque\s+não\b/.test(questionText) ||
    /\bnão\s+é\s+um\b/.test(questionText);

  // Sinal inequívoco de confusão: "a resposta correta é X" onde X ≠ resposta marcada
  // Ex: "Trabalharão não é a resposta correta para a 2ª pessoa do plural, a resposta correta é 'Trabalhareis'"
  const claimsOtherCorrect = /a resposta correta é ['"]?(?!\s*$)/.test(explanation) &&
    !explanation.includes(`a resposta correta é ['"]?${correctAnswer}`);

  if (claimsOtherCorrect && !isNegationQuestion) return false;

  return true;
}

/**
 * Normaliza string para comparação fuzzy:
 * remove acentos, lowercase, trim
 */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Busca questões do banco estático.
 * Tenta match exato primeiro, depois match parcial (começa com / contém).
 *
 * @returns Array de questões aleatorizadas ou null se não encontrado
 */
export function getQuestionsFromBank(
  subject: string,
  topic: string,
  count: number
): Question[] | null {
  const bank = BANKS[subject];
  if (!bank) return null;

  const normTopic = normalize(topic);

  // 1. Match exato
  let questions: Question[] | undefined = bank[topic];

  // 2. Match normalizado
  if (!questions || questions.length === 0) {
    const key = Object.keys(bank).find((k) => normalize(k) === normTopic);
    if (key) questions = bank[key];
  }

  // 3. Match parcial (o tópico pedido começa com ou contém a chave do banco)
  if (!questions || questions.length === 0) {
    const key = Object.keys(bank).find(
      (k) => normTopic.startsWith(normalize(k)) || normalize(k).startsWith(normTopic)
    );
    if (key) questions = bank[key];
  }

  if (!questions || questions.length === 0) return null;

  // Filtrar questões inconsistentes (gabarito ≠ explicação)
  const valid = questions.filter(isConsistent);

  if (valid.length === 0) return null;

  // Aleatorizar e retornar quantidade pedida
  const shuffled = [...valid].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Retorna estatísticas do banco para debug/monitoramento.
 */
export function getBankStats(): Record<string, { topics: number; questions: number }> {
  const stats: Record<string, { topics: number; questions: number }> = {};
  for (const [subject, bank] of Object.entries(BANKS)) {
    const topics = Object.keys(bank).length;
    const questions = Object.values(bank).reduce((sum, qs) => sum + qs.length, 0);
    stats[subject] = { topics, questions };
  }
  return stats;
}
