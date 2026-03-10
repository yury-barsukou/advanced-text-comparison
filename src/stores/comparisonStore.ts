import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

function getSystemTheme(): Theme {
  if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
}

const emptyTextStats = computeTextStats('');
const emptyDiffStats: DiffStats = { similarityPercent: 100, additions: 0, deletions: 0, changes: 0 };

export const useComparisonStore = create<ComparisonState>()(
  persist(
    (set, get) => ({
      leftText: '',
      rightText: '',
      language: 'markdown',
      theme: getSystemTheme(),
      activeTab: 'diff',

      leftStats: emptyTextStats,
      rightStats: emptyTextStats,
      diffStats: emptyDiffStats,

      mergeHunks: [],
      mergedText: '',

      tokenCounts: [],
      tokenCountsLoading: false,

      hasCompared: false,

      setLeftText: (text) => set({ leftText: text }),
      setRightText: (text) => set({ rightText: text }),
      setLanguage: (language) => set({ language }),

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),

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
          leftStats: emptyTextStats,
          rightStats: emptyTextStats,
          diffStats: emptyDiffStats,
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
    }),
    {
      name: 'text-compare-session',
      // Only persist the fields that should survive a page refresh.
      // Derived/transient state (loading flags, token counts) is excluded.
      partialize: (s) => ({
        leftText: s.leftText,
        rightText: s.rightText,
        language: s.language,
        theme: s.theme,
        activeTab: s.activeTab,
        hasCompared: s.hasCompared,
        leftStats: s.leftStats,
        rightStats: s.rightStats,
        diffStats: s.diffStats,
        mergeHunks: s.mergeHunks,
        mergedText: s.mergedText,
      }),
    },
  ),
);
