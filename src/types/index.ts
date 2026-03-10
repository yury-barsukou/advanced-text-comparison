import type { Change } from 'diff';

export type Theme = 'light' | 'dark';

export type TabId = 'diff' | 'merge' | 'statistics' | 'tokens';

export type SupportedLanguage =
  | 'markdown'
  | 'json'
  | 'xml'
  | 'java'
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'html'
  | 'css'
  | 'sql'
  | 'yaml'
  | 'plaintext';

export interface LanguageOption {
  id: SupportedLanguage;
  label: string;
}

export interface TextStats {
  characters: number;
  words: number;
  sentences: number;
  paragraphs: number;
  readingTimeSeconds: number;
  avgWordLength: number;
  uniqueWords: number;
}

export interface DiffStats {
  similarityPercent: number;
  additions: number;
  deletions: number;
  changes: number;
}

export type HunkResolution = 'left' | 'right' | 'both' | null;

export interface MergeHunkData {
  id: number;
  type: 'common' | 'conflict';
  leftLines: string;
  rightLines: string;
  resolution: HunkResolution;
}

export interface TokenCount {
  modelName: string;
  modelId: string;
  leftCount: number | null;
  rightCount: number | null;
  isEstimate: boolean;
}

export interface LLMModel {
  id: string;
  name: string;
  isEstimate: boolean;
}

export type { Change };
