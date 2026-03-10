import type { TextStats, DiffStats } from '../types';
import { diffWords } from 'diff';

export function computeTextStats(text: string): TextStats {
  if (!text.trim()) {
    return {
      characters: 0,
      words: 0,
      sentences: 0,
      paragraphs: 0,
      readingTimeSeconds: 0,
      avgWordLength: 0,
      uniqueWords: 0,
    };
  }

  const characters = text.length;
  const words = text.match(/\b\w+\b/g) ?? [];
  const wordCount = words.length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  const readingTimeSeconds = Math.ceil((wordCount / 200) * 60);
  const totalWordLength = words.reduce((sum, w) => sum + w.length, 0);
  const avgWordLength = wordCount > 0 ? totalWordLength / wordCount : 0;
  const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;

  return {
    characters,
    words: wordCount,
    sentences,
    paragraphs,
    readingTimeSeconds,
    avgWordLength: Math.round(avgWordLength * 10) / 10,
    uniqueWords,
  };
}

export function computeDiffStats(original: string, modified: string): DiffStats {
  if (!original && !modified) {
    return { similarityPercent: 100, additions: 0, deletions: 0, changes: 0 };
  }
  if (!original && modified) {
    return { similarityPercent: 0, additions: modified.split(/\s+/).filter(Boolean).length, deletions: 0, changes: 1 };
  }
  if (original && !modified) {
    return { similarityPercent: 0, additions: 0, deletions: original.split(/\s+/).filter(Boolean).length, changes: 1 };
  }

  const changes = diffWords(original, modified);
  let additions = 0;
  let deletions = 0;
  let changeCount = 0;
  let commonLength = 0;
  let totalLength = 0;

  for (const change of changes) {
    const len = change.value.length;
    totalLength += len;

    if (change.added) {
      additions += (change.value.match(/\b\w+\b/g) ?? []).length;
      changeCount++;
    } else if (change.removed) {
      deletions += (change.value.match(/\b\w+\b/g) ?? []).length;
      changeCount++;
      totalLength += len;
    } else {
      commonLength += len;
    }
  }

  const similarityPercent =
    totalLength > 0 ? Math.round((commonLength / totalLength) * 100) : 100;

  return {
    similarityPercent: Math.min(100, Math.max(0, similarityPercent)),
    additions,
    deletions,
    changes: Math.floor(changeCount / 2) || (changeCount > 0 ? changeCount : 0),
  };
}
