import { useEffect, useRef } from 'react';
import { Loader2, Info, RefreshCw } from 'lucide-react';
import { useComparisonStore } from '../../stores/comparisonStore';

export function TokenCounterPanel() {
  const tokenCounts = useComparisonStore((s) => s.tokenCounts);
  const loading = useComparisonStore((s) => s.tokenCountsLoading);
  const loadTokenCounts = useComparisonStore((s) => s.loadTokenCounts);
  const hasCompared = useComparisonStore((s) => s.hasCompared);
  const leftText = useComparisonStore((s) => s.leftText);
  const rightText = useComparisonStore((s) => s.rightText);

  const prevTextsRef = useRef({ left: '', right: '' });

  useEffect(() => {
    if (!hasCompared) return;

    const textsChanged =
      prevTextsRef.current.left !== leftText ||
      prevTextsRef.current.right !== rightText;

    if (tokenCounts.length === 0 || textsChanged) {
      prevTextsRef.current = { left: leftText, right: rightText };
      loadTokenCounts();
    }
  }, [hasCompared]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!hasCompared) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 dark:text-gray-500">
        <p>Click "Compare" to see token counts.</p>
      </div>
    );
  }

  if (loading && tokenCounts.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-gray-400 dark:text-gray-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        <p>Loading tokenizers...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-3 flex items-center gap-2">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Token Counts by LLM
        </h4>
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        ) : (
          <button
            onClick={loadTokenCounts}
            title="Recalculate token counts"
            className="rounded p-1 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50">
              <th className="px-4 py-2.5 text-left font-medium text-gray-600 dark:text-gray-400">
                Model
              </th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-600 dark:text-gray-400">
                Original
              </th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-600 dark:text-gray-400">
                Modified
              </th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-600 dark:text-gray-400">
                Diff
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {tokenCounts.map((tc) => {
              const diff =
                tc.leftCount != null && tc.rightCount != null
                  ? tc.rightCount - tc.leftCount
                  : null;
              return (
                <tr
                  key={tc.modelId}
                  className="bg-white transition-colors hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800/50"
                >
                  <td className="px-4 py-2.5 text-gray-900 dark:text-gray-100">
                    <div className="flex items-center gap-1.5">
                      {tc.modelName}
                      {tc.isEstimate && (
                        <span title="Estimate based on character heuristic">
                          <Info className="h-3.5 w-3.5 text-amber-500" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-700 dark:text-gray-300">
                    {tc.leftCount?.toLocaleString() ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono text-gray-700 dark:text-gray-300">
                    {tc.rightCount?.toLocaleString() ?? '—'}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono">
                    {diff != null ? (
                      <span
                        className={
                          diff > 0
                            ? 'text-green-600 dark:text-green-400'
                            : diff < 0
                              ? 'text-red-600 dark:text-red-400'
                              : 'text-gray-500 dark:text-gray-400'
                        }
                      >
                        {diff > 0 ? '+' : ''}
                        {diff.toLocaleString()}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
        <Info className="h-3 w-3" />
        Models marked with a warning icon use character-based estimates. Others use official tokenizers.
      </p>
    </div>
  );
}
