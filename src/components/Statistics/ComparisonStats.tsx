import type { DiffStats } from '../../types';
import { Equal, Plus, Minus, RefreshCw } from 'lucide-react';

interface Props {
  stats: DiffStats;
}

export function ComparisonStatsDisplay({ stats }: Props) {
  const similarityColor =
    stats.similarityPercent >= 80
      ? 'text-green-600 dark:text-green-400'
      : stats.similarityPercent >= 50
        ? 'text-yellow-600 dark:text-yellow-400'
        : 'text-red-600 dark:text-red-400';

  return (
    <div>
      <h4 className="mb-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
        Comparison Overview
      </h4>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <Equal className={`h-8 w-8 ${similarityColor}`} />
          <div>
            <p className={`text-2xl font-bold ${similarityColor}`}>
              {stats.similarityPercent}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Similarity</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <Plus className="h-8 w-8 text-green-600 dark:text-green-400" />
          <div>
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {stats.additions}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Additions</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <Minus className="h-8 w-8 text-red-600 dark:text-red-400" />
          <div>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {stats.deletions}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Deletions</p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
          <RefreshCw className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <div>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {stats.changes}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Changes</p>
          </div>
        </div>
      </div>
    </div>
  );
}
