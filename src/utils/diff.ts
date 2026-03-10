import { diffLines } from 'diff';
import type { MergeHunkData } from '../types';

export function computeMergeHunks(original: string, modified: string): MergeHunkData[] {
  const changes = diffLines(original, modified);
  const hunks: MergeHunkData[] = [];
  let id = 0;

  let i = 0;
  while (i < changes.length) {
    const change = changes[i];

    if (!change.added && !change.removed) {
      hunks.push({
        id: id++,
        type: 'common',
        leftLines: change.value,
        rightLines: change.value,
        resolution: null,
      });
      i++;
    } else {
      let leftLines = '';
      let rightLines = '';

      while (i < changes.length && (changes[i].added || changes[i].removed)) {
        if (changes[i].removed) {
          leftLines += changes[i].value;
        }
        if (changes[i].added) {
          rightLines += changes[i].value;
        }
        i++;
      }

      hunks.push({
        id: id++,
        type: 'conflict',
        leftLines,
        rightLines,
        resolution: null,
      });
    }
  }

  return hunks;
}

export function buildMergedText(hunks: MergeHunkData[]): string {
  return hunks
    .map((hunk) => {
      if (hunk.type === 'common') return hunk.leftLines;
      switch (hunk.resolution) {
        case 'left':
          return hunk.leftLines;
        case 'right':
          return hunk.rightLines;
        case 'both':
          return hunk.leftLines + hunk.rightLines;
        default:
          return `<<<<<<< LEFT\n${hunk.leftLines}=======\n${hunk.rightLines}>>>>>>> RIGHT\n`;
      }
    })
    .join('');
}
