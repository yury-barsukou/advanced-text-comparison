import { useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { useState } from 'react';
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

  const conflictCount = mergeHunks.filter((h) => h.type === 'conflict').length;
  const resolvedCount = mergeHunks.filter(
    (h) => h.type === 'conflict' && h.resolution !== null,
  ).length;

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

  return (
    <div className="flex flex-col lg:flex-row">
      <div className="flex-1 border-r border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-800 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
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
          </div>
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
              hunk={hunk}
              onResolve={(resolution) => handleResolve(hunk.id, resolution)}
            />
          ))}
        </div>
      </div>

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
