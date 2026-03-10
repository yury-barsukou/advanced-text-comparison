import { create } from 'zustand';
import type {
  Theme,
  TabId,
  SupportedLanguage,
  TextStats,
  DiffStats,
  MergeHunkData,
  TokenCount,
  HunkResolution,
} from '../types';
import { computeTextStats, computeDiffStats } from '../utils/statistics';
import { computeMergeHunks, buildMergedText } from '../utils/diff';
import { countAllTokens } from '../utils/tokenizer';

interface ComparisonState {
  leftText: string;
  rightText: string;

  language: SupportedLanguage;
  theme: Theme;
  activeTab: TabId;

  leftStats: TextStats;
  rightStats: TextStats;
  diffStats: DiffStats;

  mergeHunks: MergeHunkData[];
  mergedText: string;

  tokenCounts: TokenCount[];
  tokenCountsLoading: boolean;

  hasCompared: boolean;

  setLeftText: (text: string) => void;
  setRightText: (text: string) => void;
  setLanguage: (language: SupportedLanguage) => void;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  setActiveTab: (tab: TabId) => void;

  compare: () => void;
  swap: () => void;
  clear: () => void;

  resolveHunk: (hunkId: number, resolution: HunkResolution) => void;
  resolveAllHunks: (resolution: 'left' | 'right') => void;

  loadTokenCounts: () => Promise<void>;
}

function getInitialTheme(): Theme {
  try {
    const stored = localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

export const useComparisonStore = create<ComparisonState>((set, get) => ({
  leftText: '',
  rightText: '',
  language: 'markdown',
  theme: getInitialTheme(),
  activeTab: 'diff',

  leftStats: computeTextStats(''),
  rightStats: computeTextStats(''),
  diffStats: { similarityPercent: 100, additions: 0, deletions: 0, changes: 0 },

  mergeHunks: [],
  mergedText: '',

  tokenCounts: [],
  tokenCountsLoading: false,

  hasCompared: false,

  setLeftText: (text) => set({ leftText: text }),
  setRightText: (text) => set({ rightText: text }),
  setLanguage: (language) => set({ language }),

  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('theme', newTheme);
    set({ theme: newTheme });
  },

  setActiveTab: (tab) => set({ activeTab: tab }),

  compare: () => {
    const { leftText, rightText } = get();
    const leftStats = computeTextStats(leftText);
    const rightStats = computeTextStats(rightText);
    const diffStats = computeDiffStats(leftText, rightText);
    const mergeHunks = computeMergeHunks(leftText, rightText);
    const mergedText = buildMergedText(mergeHunks);

    set({
      leftStats,
      rightStats,
      diffStats,
      mergeHunks,
      mergedText,
      hasCompared: true,
    });
  },

  swap: () => {
    const { leftText, rightText } = get();
    set({ leftText: rightText, rightText: leftText });
  },

  clear: () => {
    set({
      leftText: '',
      rightText: '',
      leftStats: computeTextStats(''),
      rightStats: computeTextStats(''),
      diffStats: { similarityPercent: 100, additions: 0, deletions: 0, changes: 0 },
      mergeHunks: [],
      mergedText: '',
      tokenCounts: [],
      hasCompared: false,
    });
  },

  resolveHunk: (hunkId, resolution) => {
    const hunks = get().mergeHunks.map((h) =>
      h.id === hunkId ? { ...h, resolution } : h,
    );
    set({ mergeHunks: hunks, mergedText: buildMergedText(hunks) });
  },

  resolveAllHunks: (resolution) => {
    const hunks = get().mergeHunks.map((h) =>
      h.type === 'conflict' ? { ...h, resolution } : h,
    );
    set({ mergeHunks: hunks, mergedText: buildMergedText(hunks) });
  },

  loadTokenCounts: async () => {
    set({ tokenCountsLoading: true });
    try {
      const { leftText, rightText } = get();
      const tokenCounts = await countAllTokens(leftText, rightText);
      set({ tokenCounts, tokenCountsLoading: false });
    } catch {
      set({ tokenCountsLoading: false });
    }
  },
}));
