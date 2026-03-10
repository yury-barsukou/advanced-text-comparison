import type { TokenCount, LLMModel } from '../types';

export const LLM_MODELS: LLMModel[] = [
  { id: 'gpt-4', name: 'GPT-4 / GPT-4 Turbo', isEstimate: false },
  { id: 'gpt-4o', name: 'GPT-4o / GPT-4o Mini', isEstimate: false },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', isEstimate: false },
  { id: 'claude-3', name: 'Claude 3 / 3.5', isEstimate: true },
  { id: 'gemini', name: 'Gemini', isEstimate: true },
  { id: 'llama-3', name: 'Llama 3', isEstimate: true },
];

type EncoderCache = Map<string, { encode: (text: string) => number[] }>;
const encoderCache: EncoderCache = new Map();

async function getEncoder(modelId: string) {
  if (encoderCache.has(modelId)) return encoderCache.get(modelId)!;

  if (modelId === 'gpt-4' || modelId === 'gpt-3.5-turbo') {
    const { encodingForModel } = await import('js-tiktoken');
    const enc = encodingForModel('gpt-4');
    encoderCache.set(modelId, enc);
    return enc;
  }

  if (modelId === 'gpt-4o') {
    const { getEncoding } = await import('js-tiktoken');
    const enc = getEncoding('o200k_base');
    encoderCache.set(modelId, enc);
    return enc;
  }

  return null;
}

function estimateTokens(text: string, modelId: string): number {
  if (!text) return 0;
  switch (modelId) {
    case 'claude-3':
      return Math.ceil(text.length / 3.5);
    case 'gemini':
      return Math.ceil(text.length / 4);
    case 'llama-3':
      return Math.ceil(text.length / 3.8);
    default:
      return Math.ceil(text.length / 4);
  }
}

async function countTokensForModel(
  text: string,
  modelId: string,
): Promise<number> {
  if (!text) return 0;

  const model = LLM_MODELS.find((m) => m.id === modelId);
  if (model?.isEstimate) {
    return estimateTokens(text, modelId);
  }

  try {
    const encoder = await getEncoder(modelId);
    if (encoder) {
      return encoder.encode(text).length;
    }
  } catch {
    return estimateTokens(text, modelId);
  }

  return estimateTokens(text, modelId);
}

export async function countAllTokens(
  leftText: string,
  rightText: string,
): Promise<TokenCount[]> {
  const results: TokenCount[] = [];

  for (const model of LLM_MODELS) {
    try {
      const [leftCount, rightCount] = await Promise.all([
        countTokensForModel(leftText, model.id),
        countTokensForModel(rightText, model.id),
      ]);
      results.push({
        modelName: model.name,
        modelId: model.id,
        leftCount,
        rightCount,
        isEstimate: model.isEstimate,
      });
    } catch {
      results.push({
        modelName: model.name,
        modelId: model.id,
        leftCount: null,
        rightCount: null,
        isEstimate: model.isEstimate,
      });
    }
  }

  return results;
}
