type PageItem = number | 'gap';

/**
 * The page numbers to show: always the first and last page, and the pages
 * around the current one, with gaps in between. `pageRange(5, 10)` gives
 * `[1, 'gap', 4, 5, 6, 'gap', 10]`.
 */
export function pageRange(
  current: number,
  total: number,
  siblings = 1,
): PageItem[] {
  const pages = new Set([1, total]);
  for (let page = current - siblings; page <= current + siblings; page++) {
    if (page >= 1 && page <= total) pages.add(page);
  }
  const sorted = [...pages].filter((page) => page >= 1).sort((a, b) => a - b);

  const items: PageItem[] = [];
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && page - previous === 2) {
      items.push(previous + 1);
    } else if (previous !== undefined && page - previous > 2) {
      items.push('gap');
    }
    items.push(page);
  });
  return items;
}
