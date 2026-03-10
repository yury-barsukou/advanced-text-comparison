import type { LLMModel } from '../types';

export const LLM_MODELS: LLMModel[] = [
  { id: 'gpt-4o',       name: 'GPT-4o',       isEstimate: false },
  { id: 'gpt-4o-mini',  name: 'GPT-4o mini',  isEstimate: false },
  { id: 'o1',           name: 'o1',            isEstimate: false },
  { id: 'o1-mini',      name: 'o1-mini',       isEstimate: false },
  { id: 'o3-mini',      name: 'o3-mini',       isEstimate: false },
  { id: 'gpt-4-turbo',  name: 'GPT-4 Turbo',  isEstimate: false },
];

export const DEFAULT_MODEL_ID = 'gpt-4o';

// Encoding used per model
// o200k_base: GPT-4o family, o1 family, o3 family
// cl100k_base: GPT-4 / GPT-4 Turbo
const MODEL_ENCODING: Record<string, 'o200k_base' | 'cl100k_base'> = {
  'gpt-4o':      'o200k_base',
  'gpt-4o-mini': 'o200k_base',
  'o1':          'o200k_base',
  'o1-mini':     'o200k_base',
  'o3-mini':     'o200k_base',
  'gpt-4-turbo': 'cl100k_base',
};

type Encoder = { encode: (text: string) => ArrayLike<number> };
const encoderCache = new Map<string, Encoder>();

async function getEncoder(encoding: 'o200k_base' | 'cl100k_base'): Promise<Encoder> {
  if (encoderCache.has(encoding)) return encoderCache.get(encoding)!;
  const { getEncoding } = await import('js-tiktoken');
  const enc = getEncoding(encoding);
  encoderCache.set(encoding, enc);
  return enc;
}

export async function countTokensForModel(
  leftText: string,
  rightText: string,
  modelId: string,
): Promise<{ leftCount: number; rightCount: number }> {
  const encoding = MODEL_ENCODING[modelId] ?? 'o200k_base';
  const enc = await getEncoder(encoding);
  return {
    leftCount: enc.encode(leftText).length,
    rightCount: enc.encode(rightText).length,
  };
}
