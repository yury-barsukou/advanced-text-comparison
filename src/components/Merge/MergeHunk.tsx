import { forwardRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeftRight } from 'lucide-react';
import type { MergeHunkData, HunkResolution } from '../../types';

interface Props {
  hunk: MergeHunkData;
  isFocused?: boolean;
  onResolve: (resolution: HunkResolution) => void;
}

export const MergeHunk = forwardRef<HTMLDivElement, Props>(
  function MergeHunk({ hunk, isFocused = false, onResolve }, ref) {
    if (hunk.type === 'common') {
      return (
        <div className="border-b border-gray-100 bg-white px-4 py-1 font-mono text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
          {hunk.leftLines.split('\n').map((line, i) => (
            <div key={i} className="min-h-[1.375rem] whitespace-pre-wrap">
              {line}
            </div>
          ))}
        </div>
      );
    }

    const isResolved = hunk.resolution !== null;

    return (
      <div
        ref={ref}
        className={`border-b-2 transition-shadow ${
          isFocused
            ? 'ring-2 ring-inset ring-indigo-500 dark:ring-indigo-400'
            : ''
        } ${
          isResolved
            ? 'border-green-300 dark:border-green-700'
            : 'border-amber-300 dark:border-amber-700'
        }`}
      >
        <div
          className={`flex items-center justify-between px-4 py-1.5 ${
            isFocused
              ? 'bg-indigo-50 dark:bg-indigo-950/40'
              : 'bg-gray-100 dark:bg-gray-800'
          }`}
        >
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {isResolved
              ? `Resolved: ${hunk.resolution === 'both' ? 'Accept Both' : hunk.resolution === 'left' ? 'Accept Left' : 'Accept Right'}`
              : isFocused
                ? 'Conflict (focused)'
                : 'Conflict'}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onResolve('left')}
              className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                hunk.resolution === 'left'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                  : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              <ChevronLeft className="h-3 w-3" />
              Left
            </button>
            <button
              onClick={() => onResolve('both')}
              className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                hunk.resolution === 'both'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                  : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              <ChevronsLeftRight className="h-3 w-3" />
              Both
            </button>
            <button
              onClick={() => onResolve('right')}
              className={`inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition-colors ${
                hunk.resolution === 'right'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                  : 'text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              Right
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
          <div
            className={`font-mono text-sm ${
              hunk.resolution === 'right'
                ? 'bg-red-50/40 opacity-50 dark:bg-red-950/20'
                : 'bg-red-50 dark:bg-red-950/30'
            }`}
          >
            {hunk.leftLines ? (
              hunk.leftLines.split('\n').map((line, i) => (
                <div
                  key={i}
                  className="min-h-[1.375rem] whitespace-pre-wrap px-4 py-0.5 text-red-800 dark:text-red-300"
                >
                  <span className="mr-2 select-none text-red-400 dark:text-red-600">-</span>
                  {line}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-xs italic text-gray-400">(empty)</div>
            )}
          </div>

          <div
            className={`font-mono text-sm ${
              hunk.resolution === 'left'
                ? 'bg-green-50/40 opacity-50 dark:bg-green-950/20'
                : 'bg-green-50 dark:bg-green-950/30'
            }`}
          >
            {hunk.rightLines ? (
              hunk.rightLines.split('\n').map((line, i) => (
                <div
                  key={i}
                  className="min-h-[1.375rem] whitespace-pre-wrap px-4 py-0.5 text-green-800 dark:text-green-300"
                >
                  <span className="mr-2 select-none text-green-400 dark:text-green-600">+</span>
                  {line}
                </div>
              ))
            ) : (
              <div className="px-4 py-2 text-xs italic text-gray-400">(empty)</div>
            )}
          </div>
        </div>
      </div>
    );
  },
);
