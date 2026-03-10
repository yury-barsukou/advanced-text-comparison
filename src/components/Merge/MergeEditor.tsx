import { useCallback, useEffect, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { ChevronLeft, ChevronRight, Copy, Check, ArrowUp, ArrowDown } from 'lucide-react';
import { useComparisonStore } from '../../stores/comparisonStore';
import { MergeHunk } from './MergeHunk';
import type { HunkResolution } from '../../types';

export function MergeEditor() {
  const mergeHunks = useComparisonStore((s) => s.mergeHunks);
  const mergedText = useComparisonStore((s) => s.mergedText);
  const resolveHunk = useComparisonStore((s) => s.resolveHunk);
  const resolveAllHunks = useComparisonStore((s) => s.resolveAllHunks);
  const language = useComparisonStore((s) => s.language);
  const theme = useComparisonStore((s) => s.theme);
  const hasCompared = useComparisonStore((s) => s.hasCompared);

  const [copied, setCopied] = useState(false);
  const [focusedConflictIdx, setFocusedConflictIdx] = useState(0);

  // Ordered list of conflict hunk IDs (excludes 'common' hunks)
  const conflictIds = mergeHunks
    .filter((h) => h.type === 'conflict')
    .map((h) => h.id);

  const conflictCount = conflictIds.length;
  const resolvedCount = mergeHunks.filter(
    (h) => h.type === 'conflict' && h.resolution !== null,
  ).length;

  // Map hunkId → DOM ref for scrollIntoView
  const hunkRefs = useRef<Map<number, HTMLDivElement>>(new Map());

  const setHunkRef = useCallback((id: number) => (el: HTMLDivElement | null) => {
    if (el) {
      hunkRefs.current.set(id, el);
    } else {
      hunkRefs.current.delete(id);
    }
  }, []);

  // Clamp and scroll whenever the focused index changes
  const scrollToConflict = useCallback((idx: number) => {
    const id = conflictIds[idx];
    const el = hunkRefs.current.get(id);
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [conflictIds]);

  const goPrev = useCallback(() => {
    setFocusedConflictIdx((prev) => {
      const next = prev <= 0 ? conflictCount - 1 : prev - 1;
      scrollToConflict(next);
      return next;
    });
  }, [conflictCount, scrollToConflict]);

  const goNext = useCallback(() => {
    setFocusedConflictIdx((prev) => {
      const next = prev >= conflictCount - 1 ? 0 : prev + 1;
      scrollToConflict(next);
      return next;
    });
  }, [conflictCount, scrollToConflict]);

  // Reset focused index when hunks change (new compare)
  useEffect(() => {
    setFocusedConflictIdx(0);
  }, [mergeHunks]);

  // Keyboard navigation: Alt+Up / Alt+Down
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.altKey && e.key === 'ArrowUp') { e.preventDefault(); goPrev(); }
      if (e.altKey && e.key === 'ArrowDown') { e.preventDefault(); goNext(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goPrev, goNext]);

  const handleResolve = useCallback(
    (hunkId: number, resolution: HunkResolution) => {
      resolveHunk(hunkId, resolution);
    },
    [resolveHunk],
  );

  const handleCopy = async () => {
    await navigator.clipboard.writeText(mergedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const monacoTheme = theme === 'dark' ? 'vs-dark' : 'vs';

  if (!hasCompared) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 dark:text-gray-500">
        <p>Click "Compare" to see merge options.</p>
      </div>
    );
  }

  if (conflictCount === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 dark:text-gray-500">
        <p>Texts are identical. Nothing to merge.</p>
      </div>
    );
  }

  const focusedHunkId = conflictIds[focusedConflictIdx];

  return (
    <div className="flex flex-col lg:flex-row">
      <div className="flex-1 border-r border-gray-200 dark:border-gray-800">
        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-800 dark:bg-gray-900/50">
          {/* Left: badge + navigator */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Conflicts
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                resolvedCount === conflictCount
                  ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300'
              }`}
            >
              {resolvedCount}/{conflictCount} resolved
            </span>

            {/* Conflict navigator */}
            <div className="flex items-center rounded-md border border-gray-300 dark:border-gray-600">
              <button
                onClick={goPrev}
                title="Previous conflict (Alt+↑)"
                disabled={conflictCount <= 1}
                className="flex items-center rounded-l-md px-1.5 py-1 text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <span className="border-x border-gray-300 px-2 py-1 text-xs font-medium tabular-nums text-gray-600 dark:border-gray-600 dark:text-gray-400">
                {focusedConflictIdx + 1} / {conflictCount}
              </span>
              <button
                onClick={goNext}
                title="Next conflict (Alt+↓)"
                disabled={conflictCount <= 1}
                className="flex items-center rounded-r-md px-1.5 py-1 text-gray-500 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Right: bulk actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => resolveAllHunks('left')}
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              <ChevronLeft className="h-3 w-3" />
              All Left
            </button>
            <button
              onClick={() => resolveAllHunks('right')}
              className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
            >
              All Right
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="max-h-[500px] overflow-y-auto">
          {mergeHunks.map((hunk) => (
            <MergeHunk
              key={hunk.id}
              ref={hunk.type === 'conflict' ? setHunkRef(hunk.id) : undefined}
              hunk={hunk}
              isFocused={hunk.type === 'conflict' && hunk.id === focusedHunkId}
              onResolve={(resolution) => handleResolve(hunk.id, resolution)}
            />
          ))}
        </div>
      </div>

      {/* Merged result panel */}
      <div className="flex w-full flex-col lg:w-[45%]">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-800 dark:bg-gray-900/50">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Merged Result
          </span>
          <button
            onClick={handleCopy}
            className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3 text-green-500" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </button>
        </div>
        <div style={{ height: '500px' }}>
          <Editor
            height="100%"
            language={language}
            theme={monacoTheme}
            value={mergedText}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              lineNumbers: 'on',
            }}
          />
        </div>
      </div>
    </div>
  );
}
