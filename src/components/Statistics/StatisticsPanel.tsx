import { useComparisonStore } from '../../stores/comparisonStore';
import { ComparisonStatsDisplay } from './ComparisonStats';
import { TextStatsDisplay } from './TextStats';

export function StatisticsPanel() {
  const leftStats = useComparisonStore((s) => s.leftStats);
  const rightStats = useComparisonStore((s) => s.rightStats);
  const diffStats = useComparisonStore((s) => s.diffStats);
  const hasCompared = useComparisonStore((s) => s.hasCompared);

  if (!hasCompared) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-400 dark:text-gray-500">
        <p>Click "Compare" to see statistics.</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
    <div className="space-y-6 p-4">
      <ComparisonStatsDisplay stats={diffStats} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <TextStatsDisplay stats={leftStats} label="Original Text" />
        <TextStatsDisplay stats={rightStats} label="Modified Text" />
      </div>
    </div>
    </div>
  );
}
