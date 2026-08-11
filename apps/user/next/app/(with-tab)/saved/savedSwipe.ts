export type SavedTab = 'saved' | 'board';

type Point = { x: number; y: number };

export function getSwipedTab(start: Point, end: Point): SavedTab | undefined {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;

  if (Math.abs(deltaX) < 48 || Math.abs(deltaX) <= Math.abs(deltaY)) return undefined;
  return deltaX < 0 ? 'board' : 'saved';
}
