import type { LLMModel } from '../types';

export const LLM_MODELS: LLMModel[] = [
  { id: 'claude-sonnet-4.6', name: 'Claude Sonnet 4.6', isEstimate: true },
  { id: 'claude-opus-4.6',   name: 'Claude Opus 4.6',   isEstimate: true },
  { id: 'gpt-5.3',           name: 'GPT-5.3',           isEstimate: true },
  { id: 'gpt-5-mini',        name: 'GPT-5-mini',        isEstimate: true },
  { id: 'gemini-3.1-pro',    name: 'Gemini 3.1 Pro',    isEstimate: true },
];

export const DEFAULT_MODEL_ID = 'claude-sonnet-4.6';

// Character-per-token ratios used for estimation.
// Anthropic, Google, and unreleased GPT-5 models don't publish tokenizer data.
const CHARS_PER_TOKEN: Record<string, number> = {
  'claude-sonnet-4.6': 3.5,
  'claude-opus-4.6':   3.5,
  'gpt-5.3':           3.8,
  'gpt-5-mini':        4.0,
  'gemini-3.1-pro':    4.0,
};

export function estimateTokenCount(text: string, modelId: string): number {
  if (!text) return 0;
  const ratio = CHARS_PER_TOKEN[modelId] ?? 4.0;
  return Math.ceil(text.length / ratio);
}

export function countTokensForModel(
  leftText: string,
  rightText: string,
  modelId: string,
): { leftCount: number; rightCount: number } {
  return {
    leftCount: estimateTokenCount(leftText, modelId),
    rightCount: estimateTokenCount(rightText, modelId),
  };
}
